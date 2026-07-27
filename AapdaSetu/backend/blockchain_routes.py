"""
AapdaSetu - Blockchain Router Definitions
==========================================
Exposes the on-chain approval lifecycle of the AapdaSetu smart contract:
reading records/history, approving, rejecting, and releasing funds.
All write endpoints sign with the backend wallet (must be a registered approver).
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.config import app_logger
from backend.database import get_db
from backend.models import DisasterEvent
from services import blockchain_service

router = APIRouter(prefix="/blockchain", tags=["Blockchain"])


class LifecycleActionRequest(BaseModel):
    note: Optional[str] = Field(default=None, description="Approval/release note appended to on-chain history")


class RejectRequest(BaseModel):
    reason: str = Field(min_length=1, description="Rejection reason (required by the smart contract)")


def _sync_local_status(db: Session, disaster_id: str, status: str, tx: dict) -> None:
    """Mirrors the on-chain status change into the SQLite relief plan record."""
    try:
        event = db.query(DisasterEvent).filter(DisasterEvent.id == disaster_id).first()
        if not event or not event.relief_plan:
            return
        plan = dict(event.relief_plan)
        chain = dict(plan.get("blockchain") or {})
        chain["lifecycle_status"] = status
        chain["last_lifecycle_tx"] = tx.get("transaction_hash", "N/A")
        plan["blockchain"] = chain
        event.relief_plan = plan
        db.commit()
    except Exception as e:
        db.rollback()
        app_logger.error(f"DB: Failed to sync blockchain status for {disaster_id}: {e}", exc_info=True)


@router.get("/status")
async def blockchain_status():
    """Diagnostic snapshot: connectivity, wallet balance, contract stats."""
    return blockchain_service.get_chain_status()


@router.get("/disaster/{disaster_id}")
async def get_onchain_disaster(disaster_id: str):
    """Reads the full on-chain record and status history for a disaster (free call)."""
    try:
        return blockchain_service.get_onchain_disaster(disaster_id)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        # Contract reverts with "Disaster not found" for unknown ids
        if "Disaster not found" in str(e):
            raise HTTPException(status_code=404, detail="Disaster not found on-chain")
        app_logger.error(f"Blockchain read failed for {disaster_id}: {e}", exc_info=True)
        raise HTTPException(status_code=502, detail=f"Blockchain read error: {e}")


@router.post("/approve/{disaster_id}")
async def approve_disaster(disaster_id: str, payload: LifecycleActionRequest, db: Session = Depends(get_db)):
    """Approves a PENDING on-chain recommendation (government approver action)."""
    tx = blockchain_service.approve_recommendation(
        disaster_id, payload.note or "Approved via AapdaSetu dashboard"
    )
    if tx.get("status") == "ERROR":
        raise HTTPException(status_code=502, detail=tx.get("error", "Blockchain approval failed"))
    _sync_local_status(db, disaster_id, "APPROVED", tx)
    return {"disaster_id": disaster_id, "action": "APPROVED", **tx}


@router.post("/reject/{disaster_id}")
async def reject_disaster(disaster_id: str, payload: RejectRequest, db: Session = Depends(get_db)):
    """Rejects a PENDING on-chain recommendation with a mandatory reason."""
    tx = blockchain_service.reject_recommendation(disaster_id, payload.reason)
    if tx.get("status") == "ERROR":
        raise HTTPException(status_code=502, detail=tx.get("error", "Blockchain rejection failed"))
    _sync_local_status(db, disaster_id, "REJECTED", tx)
    return {"disaster_id": disaster_id, "action": "REJECTED", **tx}


@router.post("/release/{disaster_id}")
async def release_funds(disaster_id: str, payload: LifecycleActionRequest, db: Session = Depends(get_db)):
    """Marks an APPROVED recommendation's funds as RELEASED."""
    tx = blockchain_service.release_funds(
        disaster_id, payload.note or "Funds released via AapdaSetu dashboard"
    )
    if tx.get("status") == "ERROR":
        raise HTTPException(status_code=502, detail=tx.get("error", "Blockchain fund release failed"))
    _sync_local_status(db, disaster_id, "RELEASED", tx)
    return {"disaster_id": disaster_id, "action": "RELEASED", **tx}
