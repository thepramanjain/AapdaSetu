"""Blockchain Service
Web3.py bridge between the AapdaSetu backend and the AapdaSetu smart contract.

PRIMARY RULE
============
Blockchain execution is gated STRICTLY on verification_status.

  LIVE        → submit transaction (wallet + RPC + gas initialised only here)
  PREPAREDNESS→ return SKIPPED immediately — no wallet, no RPC, no gas
  HISTORICAL  → return SKIPPED immediately
  SIMULATED   → return SKIPPED immediately
  UNKNOWN     → return SKIPPED immediately

Responsibilities:
  - Submit AI disaster recommendations on-chain (storeDisaster)
  - Drive the approval lifecycle (approve / reject / releaseFunds)
  - Read on-chain state (getDisaster, getHistory) for the dashboard
  - Fall back to a mock response when no Web3 credentials are configured
"""

import uuid
import json
import os
from datetime import datetime, timezone
from typing import Optional

from web3 import Web3
from web3.exceptions import ContractLogicError

from backend.config import app_logger, settings, BASE_DIR
from services.logging_service import execution_logger

# Load ABI
ABI_PATH = os.path.join(BASE_DIR, "blockchain", "abi", "AapdaSetu.json")
try:
    with open(ABI_PATH, "r") as f:
        contract_data = json.load(f)
        # File may be a bare ABI list or a full artifact dict with an "abi" key
        if isinstance(contract_data, dict):
            AAPDA_SETU_ABI = contract_data.get("abi", [])
        else:
            AAPDA_SETU_ABI = contract_data
except Exception as e:
    app_logger.error(f"Failed to load AapdaSetu ABI: {e}")
    AAPDA_SETU_ABI = []

DISASTER_STATUS_LABELS = ["PENDING", "APPROVED", "REJECTED", "RELEASED"]

# Module-level singletons (lazily initialized)
_w3: Optional[Web3] = None
_contract = None


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def is_configured() -> bool:
    """True when all Web3 credentials are present in settings."""
    return bool(
        settings.WEB3_PROVIDER_URI
        and settings.BACKEND_WALLET_PRIVATE_KEY
        and settings.AAPDA_SETU_CONTRACT_ADDRESS
        and AAPDA_SETU_ABI
    )


def get_web3() -> Web3:
    """Returns a cached, connected Web3 instance."""
    global _w3
    if _w3 is None:
        _w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URI, request_kwargs={"timeout": 30}))
    if not _w3.is_connected():
        raise ConnectionError("Failed to connect to Web3 provider.")
    return _w3


def get_contract():
    """Returns a cached contract handle bound to the configured address."""
    global _contract
    if _contract is None:
        w3 = get_web3()
        address = Web3.to_checksum_address(settings.AAPDA_SETU_CONTRACT_ADDRESS)
        _contract = w3.eth.contract(address=address, abi=AAPDA_SETU_ABI)
    return _contract


def _send_transaction(fn_call) -> dict:
    """Builds, signs, sends a contract function call and waits for the receipt.

    Uses gas estimation with a safety buffer and EIP-1559 fee fields.
    Raises ContractLogicError on reverts so callers can surface the reason.
    """
    w3 = get_web3()
    account = w3.eth.account.from_key(settings.BACKEND_WALLET_PRIVATE_KEY)

    # Estimate gas with a 25% buffer (raises ContractLogicError early on revert)
    gas_estimate = fn_call.estimate_gas({"from": account.address})

    latest_block = w3.eth.get_block("latest")
    base_fee = latest_block.get("baseFeePerGas", w3.eth.gas_price)
    priority_fee = w3.eth.max_priority_fee

    tx = fn_call.build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address, "pending"),
        "gas": int(gas_estimate * 1.25),
        "maxFeePerGas": int(base_fee * 2) + priority_fee,
        "maxPriorityFeePerGas": priority_fee,
    })

    signed_tx = w3.eth.account.sign_transaction(tx, private_key=settings.BACKEND_WALLET_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    app_logger.info(f"Blockchain: Transaction sent: {tx_hash.hex()}")

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    return {
        "transaction_hash": f"0x{receipt.transactionHash.hex().removeprefix('0x')}",
        "status": "SUCCESS" if receipt.status == 1 else "FAILED",
        "block_number": receipt.blockNumber,
        "explorer_url": f"{settings.BLOCK_EXPLORER_TX_URL}0x{receipt.transactionHash.hex().removeprefix('0x')}",
        "timestamp": _utc_now(),
        "gas_used": receipt.gasUsed,
    }


# ---------------------------------------------------------------------------
# Verification gate helpers
# ---------------------------------------------------------------------------

def _is_live(v_status: str) -> bool:
    """True only for confirmed, active disasters."""
    return str(v_status).upper().strip() == "LIVE"


def _skipped_response(v_status: str, conf: float = 0.0) -> dict:
    """Build the canonical SKIPPED response for non-LIVE events.

    No wallet, no RPC, no gas estimation is performed before this returns.
    """
    reason = "Event Not Confirmed"
    return {
        # New strict schema
        "blockchain_status":    "SKIPPED",
        "verification_status":  v_status,
        "transaction_submitted": False,
        "transaction_hash":     None,
        "network":              None,
        "contract":             None,
        "gas_used":             0,
        "reason":               reason,
        "timestamp":            _utc_now(),
        "confidence":           conf,
        # Legacy keys — reports_service reads these
        "status":               "SKIPPED",
        "block_number":         0,
        "explorer_url":         "",
        "error":                reason,
    }


# ---------------------------------------------------------------------------
# Main submission entry-point
# ---------------------------------------------------------------------------

def submit_to_blockchain(payload: dict) -> dict:
    """Submit a verified disaster recommendation to the AapdaSetu smart contract.

    Payload must include 'verification_status'. Returns SKIPPED immediately
    for any non-LIVE event (no wallet, RPC, or gas initialisation occurs).

    Required keys: verification_status, disaster_id, location,
    disaster_severity, confidence_score, recommended_amount,
    ai_decision_hash, metadata_uri.
    """
    app_logger.info("Blockchain Service: Evaluating submission request...")
    execution_logger.log_service_execution(
        "Blockchain Service", "STARTING", "Evaluating blockchain submission."
    )

    # GATE 1: verification_status must be LIVE.
    # All non-LIVE paths exit HERE; nothing below this block runs.
    v_status = str(payload.get("verification_status") or "UNKNOWN").upper().strip()
    confidence_val = (
        float(payload.get("confidence_score", 0)) / 100.0
        if payload.get("confidence_score")
        else 0.0
    )

    if not _is_live(v_status):
        app_logger.info(
            f"Blockchain Service: SKIPPED — verification_status is '{v_status}' (not LIVE)."
        )
        execution_logger.log_service_execution(
            "Blockchain Service", "SKIPPED", f"Event Not Confirmed (status={v_status})"
        )
        return _skipped_response(v_status, conf=confidence_val)

    # GATE 2: Web3 credentials must be configured.
    # Wallet / RPC are only initialised from this point forward.
    if not is_configured():
        app_logger.warning("Blockchain credentials missing. Falling back to mock submission.")
        tx_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex}"
        return _mock_response(tx_hash, 14320958, v_status=v_status, conf=confidence_val)

    # LIVE path: submit to smart contract.
    try:
        contract = get_contract()

        disaster_id        = payload.get("disaster_id") or str(uuid.uuid4())
        location           = payload.get("location", "Unknown Location")
        severity           = max(1, min(5, int(payload.get("disaster_severity", 3))))
        confidence         = max(0, min(100, int(payload.get("confidence_score", 0))))
        recommended_amount = int(payload.get("recommended_amount", 0))
        ai_hash            = payload.get("ai_decision_hash", "")
        metadata_uri       = payload.get("metadata_uri", "")

        fn_call = contract.functions.storeDisaster(
            disaster_id, location, severity, confidence,
            recommended_amount, ai_hash, metadata_uri,
        )
        response = _send_transaction(fn_call)

        execution_logger.log_service_execution(
            "Blockchain Service", "COMPLETED", f"TX: {response['transaction_hash']}"
        )

        # Augment with strict schema fields while keeping legacy keys
        response.update({
            "blockchain_status":    response["status"],
            "verification_status":  v_status,
            "transaction_submitted": True,
            "network":              "Thore Network",
            "contract":             contract.address,
            "reason": (
                "Verified disaster funding initiated"
                if response["status"] == "SUCCESS"
                else "Transaction Failed"
            ),
            "confidence": confidence_val,
        })
        return response

    except ContractLogicError as e:
        app_logger.error(f"Blockchain contract revert: {e}")
        execution_logger.log_service_execution("Blockchain Service", "REVERTED", str(e))
        return _error_response(f"Contract revert: {e}", v_status=v_status, conf=confidence_val)
    except Exception as e:
        app_logger.error(f"Blockchain submission failed: {e}", exc_info=True)
        execution_logger.log_service_execution("Blockchain Service", "FAILED", str(e))
        return _error_response(str(e), v_status=v_status, conf=confidence_val)


# ---------------------------------------------------------------------------
# Approval lifecycle (called from backend/blockchain_routes.py)
# ---------------------------------------------------------------------------

def approve_recommendation(disaster_id: str, note: str = "Approved via AapdaSetu dashboard") -> dict:
    """Marks a PENDING on-chain recommendation as APPROVED."""
    return _lifecycle_tx("approveRecommendation", disaster_id, note)


def reject_recommendation(disaster_id: str, reason: str) -> dict:
    """Marks a PENDING on-chain recommendation as REJECTED (reason required by contract)."""
    return _lifecycle_tx("rejectRecommendation", disaster_id, reason)


def release_funds(disaster_id: str, note: str = "Funds released via AapdaSetu dashboard") -> dict:
    """Marks an APPROVED on-chain recommendation as RELEASED."""
    return _lifecycle_tx("releaseFunds", disaster_id, note)


def _lifecycle_tx(fn_name: str, disaster_id: str, note: str) -> dict:
    app_logger.info(f"Blockchain Service: {fn_name}({disaster_id})...")
    if not is_configured():
        return _mock_response(f"0x{uuid.uuid4().hex}{uuid.uuid4().hex}", 14320958)
    try:
        contract = get_contract()
        fn_call = getattr(contract.functions, fn_name)(disaster_id, note)
        response = _send_transaction(fn_call)
        execution_logger.log_service_execution(
            "Blockchain Service", "COMPLETED", f"{fn_name} TX: {response['transaction_hash']}"
        )
        return response
    except ContractLogicError as e:
        app_logger.error(f"Blockchain contract revert on {fn_name}: {e}")
        return _error_response(f"Contract revert: {e}")
    except Exception as e:
        app_logger.error(f"Blockchain {fn_name} failed: {e}", exc_info=True)
        return _error_response(str(e))


# ---------------------------------------------------------------------------
# Read-only queries (free — no gas, no signing)
# ---------------------------------------------------------------------------

def get_onchain_disaster(disaster_id: str) -> dict:
    """Reads a disaster record and its history from the contract."""
    if not is_configured():
        raise RuntimeError("Blockchain is not configured (missing Web3 credentials).")

    contract = get_contract()
    record = contract.functions.getDisaster(disaster_id).call()
    history = contract.functions.getHistory(disaster_id).call()

    return {
        "disaster_id": record[0],
        "location": record[1],
        "severity": record[2],
        "confidence_score": record[3],
        "recommended_amount": record[4],
        "status": DISASTER_STATUS_LABELS[record[5]],
        "ai_decision_hash": record[6],
        "metadata_uri": record[7],
        "submitted_by": record[8],
        "approved_by": record[9],
        "created_at": datetime.fromtimestamp(record[10], tz=timezone.utc).isoformat(),
        "updated_at": datetime.fromtimestamp(record[11], tz=timezone.utc).isoformat(),
        "history": [
            {
                "status": DISASTER_STATUS_LABELS[h[0]],
                "note": h[1],
                "actor": h[2],
                "timestamp": datetime.fromtimestamp(h[3], tz=timezone.utc).isoformat(),
            }
            for h in history
        ],
    }


def get_chain_status() -> dict:
    """Diagnostic snapshot of the blockchain connection."""
    if not is_configured():
        return {"configured": False, "connected": False, "message": "Web3 credentials not set — running in mock mode."}
    try:
        w3 = get_web3()
        account = w3.eth.account.from_key(settings.BACKEND_WALLET_PRIVATE_KEY)
        contract = get_contract()
        return {
            "configured": True,
            "connected": True,
            "chain_id": w3.eth.chain_id,
            "latest_block": w3.eth.block_number,
            "contract_address": contract.address,
            "backend_wallet": account.address,
            "wallet_balance_eth": float(w3.from_wei(w3.eth.get_balance(account.address), "ether")),
            "onchain_disaster_count": contract.functions.getDisasterCount().call(),
        }
    except Exception as e:
        return {"configured": True, "connected": False, "error": str(e)}


# ---------------------------------------------------------------------------
# Response helpers
# ---------------------------------------------------------------------------

def _error_response(error: str, v_status: str = "UNKNOWN", conf: float = 0.0) -> dict:
    return {
        "blockchain_status": "FAILED",
        "verification_status": v_status,
        "transaction_submitted": False,
        "transaction_hash": "",
        "network": None,
        "contract": None,
        "gas_used": 0,
        "reason": error,
        "timestamp": _utc_now(),
        "confidence": conf,
        
        # Legacy for reports_service compatibility
        "status": "ERROR",
        "block_number": 0,
        "explorer_url": "",
        "error": error,
    }


def _mock_response(tx_hash, block_num, v_status: str = "UNKNOWN", conf: float = 0.0) -> dict:
    return {
        "blockchain_status": "SUCCESS",
        "verification_status": v_status,
        "transaction_submitted": True,
        "transaction_hash": tx_hash,
        "network": "Mock Network",
        "contract": "0xMockContract",
        "gas_used": 21000,
        "reason": "Mock verified disaster funding initiated",
        "timestamp": _utc_now(),
        "confidence": conf,
        
        # Legacy
        "status": "SUCCESS (MOCKED)",
        "block_number": block_num,
        "explorer_url": f"https://mock-explorer.aapdasetu.org/tx/{tx_hash}",
    }
