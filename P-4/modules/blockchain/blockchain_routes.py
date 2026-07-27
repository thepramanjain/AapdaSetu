"""
AapdaSetu — Blockchain Transparency Routes (Stub)
====================================================
Public-facing API for the transparency/verification page.
No login required — citizens, journalists, auditors can browse.

Phase 0: Stub endpoints.  Phase 2 implements actual on-chain queries.
"""

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/blockchain", tags=["Blockchain Transparency"])


@router.get("/status")
async def blockchain_module_status():
    """Health check for the blockchain module."""
    return {"module": "blockchain_shardeum", "status": "scaffolded", "phase": 0}


@router.get("/disasters")
async def list_on_chain_disasters():
    """List all disasters recorded on-chain (public, no auth)."""
    raise HTTPException(status_code=501, detail="On-chain disaster listing — coming in Phase 2.")


@router.get("/disasters/{disaster_id}")
async def get_disaster_on_chain(disaster_id: str):
    """Get full on-chain audit trail for a specific disaster."""
    raise HTTPException(status_code=501, detail="On-chain disaster detail — coming in Phase 2.")


@router.get("/disasters/{disaster_id}/funding")
async def get_funding_status(disaster_id: str):
    """Get funding lifecycle status (Pending → Approved → Disbursed → Verified)."""
    raise HTTPException(status_code=501, detail="Funding status tracking — coming in Phase 2.")


@router.get("/shipments/{shipment_id}")
async def get_shipment_tracking(shipment_id: str):
    """Get supply-chain tracking history for a relief shipment."""
    raise HTTPException(status_code=501, detail="Shipment tracking — coming in Phase 2.")


@router.get("/verify/{tx_hash}")
async def verify_transaction(tx_hash: str):
    """Verify a specific transaction and return block explorer link."""
    raise HTTPException(status_code=501, detail="Transaction verification — coming in Phase 2.")
