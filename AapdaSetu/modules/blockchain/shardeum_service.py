"""
AapdaSetu — Shardeum Blockchain Service (Stub)
=================================================
Wraps all smart contract interactions behind a BlockchainService interface
so the rest of the app doesn't know it's talking to Shardeum specifically.

Phase 0: Interface defined.  Phase 2 implements the Shardeum provider.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
import logging

logger = logging.getLogger("aapdasetu.shardeum_service")


class BlockchainServiceInterface(ABC):
    """
    Abstract blockchain interface — any EVM-compatible chain can implement this.
    Decouples the application from a specific chain (Sepolia → Shardeum → mainnet).
    """

    @abstractmethod
    async def register_disaster(self, disaster_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Write a disaster record on-chain.  Returns tx receipt or error."""
        ...

    @abstractmethod
    async def update_funding_status(
        self, disaster_id: str, status: str, actor: str = ""
    ) -> Dict[str, Any]:
        """Update the funding lifecycle (PENDING → APPROVED → DISBURSED → VERIFIED)."""
        ...

    @abstractmethod
    async def log_shipment_stage(
        self, shipment_id: str, stage: str, metadata: Dict[str, Any] | None = None
    ) -> Dict[str, Any]:
        """Record a supply-chain stage transition on-chain."""
        ...

    @abstractmethod
    async def get_disaster_history(self, disaster_id: str) -> Dict[str, Any]:
        """Retrieve the full on-chain audit trail for a disaster."""
        ...


class ShardeumService(BlockchainServiceInterface):
    """
    Shardeum Testnet implementation of BlockchainServiceInterface.

    Phase 2 will:
      - Initialise Web3 with SHARDEUM_RPC_URL
      - Deploy/bind AapdaSetu contract ABI
      - Implement all abstract methods with actual contract calls
      - Add retry logic + async tx confirmation queue
    """

    def __init__(self) -> None:
        logger.info("ShardeumService initialised (stub mode — Phase 2).")

    async def register_disaster(self, disaster_payload: Dict[str, Any]) -> Dict[str, Any]:
        logger.info("STUB: register_disaster(%s)", disaster_payload.get("disaster_id", "?"))
        return {
            "status": "STUB",
            "message": "Shardeum integration coming in Phase 2.",
            "transaction_hash": None,
        }

    async def update_funding_status(
        self, disaster_id: str, status: str, actor: str = ""
    ) -> Dict[str, Any]:
        logger.info("STUB: update_funding_status(%s, %s)", disaster_id, status)
        return {"status": "STUB", "disaster_id": disaster_id}

    async def log_shipment_stage(
        self, shipment_id: str, stage: str, metadata: Dict[str, Any] | None = None
    ) -> Dict[str, Any]:
        logger.info("STUB: log_shipment_stage(%s, %s)", shipment_id, stage)
        return {"status": "STUB", "shipment_id": shipment_id, "stage": stage}

    async def get_disaster_history(self, disaster_id: str) -> Dict[str, Any]:
        logger.info("STUB: get_disaster_history(%s)", disaster_id)
        return {"status": "STUB", "disaster_id": disaster_id, "history": []}


# Module-level singleton
shardeum_service = ShardeumService()
