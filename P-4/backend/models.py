"""
AapdaSetu - Database Models Mapping
========================================
Declares ORM schemas for SQLite persistence using SQLAlchemy.
Includes DisasterEvent logs and ChatSession history trails.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Text, Integer, JSON
from backend.database import Base


class DisasterEvent(Base):
    """
    ORM Model representing an analyzed and verified disaster incident report.
    """
    __tablename__ = "disaster_events"

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=True)
    event_type = Column(String(50), nullable=False)  # 'flood' or 'earthquake'
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    severity = Column(Float, nullable=False)  # scale 0-10
    severity_str = Column(String(50), nullable=True) # 'low', 'medium', 'high', 'critical'
    population = Column(Integer, nullable=True)
    state = Column(String(100), nullable=True)
    status = Column(String(50), default="reported") # 'reported', 'analyzing', 'preparedness', 'published'
    verification_status = Column(String(50), default="Pending") # 'Pending', 'Verified'
    confidence = Column(Integer, default=0)
    risk_level = Column(String(50), default="Medium") # 'Low', 'Medium', 'High', 'Critical'
    description = Column(Text, nullable=True)
    reported_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    relief_plan = Column(JSON, nullable=True)  # Store compiled LangGraph relief plans as JSON objects
    report_markdown = Column(JSON, nullable=True) # {government: "", ngo: "", public: ""}
    mission_plan = Column(JSON, nullable=True)
    hospitals = Column(JSON, nullable=True)
    shelters = Column(JSON, nullable=True)


class ChatSession(Base):
    """
    ORM Model storing conversation message logs.
    """
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(255), index=True, nullable=False)
    user_message = Column(Text, nullable=False)
    agent_response = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class FundRequest(Base):
    """
    ORM Model representing an NGO fund request for disaster relief.
    """
    __tablename__ = "fund_requests"

    id = Column(String(255), primary_key=True, default=lambda: f"req-{uuid.uuid4().hex[:8]}")
    ngo = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    purpose = Column(Text, nullable=False)
    priority = Column(String(50), nullable=False) # 'High', 'Medium', 'Low'
    status = Column(String(50), default="submitted") # 'submitted', 'review', 'approved', 'blockchain_completed', 'rejected'
    reason = Column(Text, nullable=True)
    required_resources = Column(Text, nullable=True)
    supporting_notes = Column(Text, nullable=True)
    disaster_id = Column(String(255), nullable=False)
    disaster_name = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    tx_hash = Column(String(255), nullable=True)


class BlockchainTransaction(Base):
    """
    ORM Model logging verified on-chain transactions.
    """
    __tablename__ = "blockchain_transactions"

    hash = Column(String(255), primary_key=True)
    block = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    amount = Column(Float, nullable=False)
    ngo = Column(String(255), nullable=False)
    purpose = Column(Text, nullable=False)
    status = Column(String(50), default="confirmed") # 'confirmed', 'pending'


class SystemLog(Base):
    """
    ORM Model storing central system logs.
    """
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    level = Column(String(50), nullable=False) # 'info', 'success', 'warn', 'error'
    agent = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)

