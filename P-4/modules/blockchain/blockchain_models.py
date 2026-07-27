"""
AapdaSetu — Blockchain Module Database Models
================================================
SQLAlchemy ORM models for the blockchain transparency layer.
Stores on-chain disaster records and relief shipment tracking locally
for fast querying by the transparency API.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, JSON, Boolean
from backend.database import Base


class BlockchainDisasterRecord(Base):
    """
    Local mirror of on-chain disaster records for fast transparency API queries.
    """
    __tablename__ = "blockchain_disaster_records"

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    disaster_id = Column(String(255), nullable=False, index=True)
    location = Column(String(500), nullable=True)
    severity = Column(Integer, default=0)
    confidence = Column(Integer, default=0)
    budget_estimate = Column(Float, default=0.0)
    ai_analysis_hash = Column(String(255), nullable=True)
    funding_status = Column(String(50), default="PENDING")  # PENDING, APPROVED, DISBURSED, VERIFIED
    tx_hash = Column(String(255), nullable=True)
    block_number = Column(Integer, nullable=True)
    explorer_url = Column(String(500), nullable=True)
    network = Column(String(100), default="Shardeum Testnet")
    is_on_chain = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class ReliefShipment(Base):
    """
    Tracks relief supply shipments through the delivery lifecycle.
    WAREHOUSE → IN_TRANSIT → CAMP → DELIVERED
    """
    __tablename__ = "relief_shipments"

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    shipment_id = Column(String(255), nullable=False, unique=True, index=True)
    disaster_id = Column(String(255), nullable=False, index=True)
    resource_type = Column(String(100), nullable=False)
    quantity = Column(Float, default=0.0)
    unit = Column(String(50), default="units")
    current_stage = Column(String(50), default="WAREHOUSE")
    stage_history = Column(JSON, default=list)  # [{stage, timestamp, actor}]
    tx_hashes = Column(JSON, default=list)  # tx hashes for each stage transition
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
