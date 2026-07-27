"""
AapdaSetu — Supply Chain Tracking (Stub)
==========================================
Tracks relief shipments through their lifecycle:
  WAREHOUSE → IN_TRANSIT → CAMP → DELIVERED

Each stage transition is recorded on-chain via ShardeumService.

Phase 0: Data structures defined.  Phase 2 implements on-chain logging.
"""

from typing import Any, Dict, List
import logging

logger = logging.getLogger("aapdasetu.supply_chain")


class SupplyChainTracker:
    """
    Manages relief shipment lifecycle and coordinates with the blockchain
    service for immutable stage logging.
    """

    def __init__(self) -> None:
        self._shipments: Dict[str, Dict[str, Any]] = {}  # In-memory cache
        logger.info("SupplyChainTracker initialised (stub mode — Phase 2).")

    async def create_shipment(
        self,
        shipment_id: str,
        disaster_id: str,
        resource_type: str,
        quantity: float,
    ) -> Dict[str, Any]:
        """Register a new relief shipment starting at WAREHOUSE stage."""
        logger.info("STUB: create_shipment(%s) for disaster %s", shipment_id, disaster_id)
        return {
            "status": "STUB",
            "shipment_id": shipment_id,
            "stage": "WAREHOUSE",
        }

    async def advance_stage(
        self, shipment_id: str, new_stage: str
    ) -> Dict[str, Any]:
        """Move a shipment to the next stage and log on-chain."""
        logger.info("STUB: advance_stage(%s → %s)", shipment_id, new_stage)
        return {
            "status": "STUB",
            "shipment_id": shipment_id,
            "new_stage": new_stage,
        }

    async def get_shipment_history(self, shipment_id: str) -> List[Dict[str, Any]]:
        """Return full stage history for a shipment."""
        logger.info("STUB: get_shipment_history(%s)", shipment_id)
        return []


# Module-level singleton
supply_chain_tracker = SupplyChainTracker()
