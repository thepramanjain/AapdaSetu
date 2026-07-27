"""
AapdaSetu — RWA Database Models (Stub)
========================================
SQLAlchemy ORM models for the RWA module: Society, Volunteer,
CommunityResource, EvacuationRecord.

Phase 0: Schema defined and ready.  Full CRUD to be built in Phase 1.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey,
)
from backend.database import Base


class Society(Base):
    """A registered Resident Welfare Association / housing society."""
    __tablename__ = "rwa_societies"

    id = Column(String(255), primary_key=True, default=lambda: f"soc-{uuid.uuid4().hex[:8]}")
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    president_name = Column(String(255), nullable=True)
    president_phone = Column(String(50), nullable=True)

    # Population breakdown
    total_population = Column(Integer, default=0)
    children_count = Column(Integer, default=0)
    senior_citizen_count = Column(Integer, default=0)
    pregnant_women_count = Column(Integer, default=0)
    disabled_residents_count = Column(Integer, default=0)
    pet_count = Column(Integer, default=0)

    # Infrastructure
    has_community_hall = Column(Boolean, default=False)
    generator_count = Column(Integer, default=0)
    boat_count = Column(Integer, default=0)
    water_tank_capacity_liters = Column(Float, default=0.0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class RWAVolunteer(Base):
    """A volunteer registered under a specific society."""
    __tablename__ = "rwa_volunteers"

    id = Column(String(255), primary_key=True, default=lambda: f"vol-{uuid.uuid4().hex[:8]}")
    society_id = Column(String(255), ForeignKey("rwa_societies.id"), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    blood_group = Column(String(10), nullable=True)
    skill = Column(String(50), default="GENERAL")  # VolunteerSkill enum value
    is_doctor = Column(Boolean, default=False)
    is_nurse = Column(Boolean, default=False)
    availability_status = Column(String(50), default="available")


class CommunityResource(Base):
    """A resource item tracked by a society."""
    __tablename__ = "rwa_community_resources"

    id = Column(String(255), primary_key=True, default=lambda: f"res-{uuid.uuid4().hex[:8]}")
    society_id = Column(String(255), ForeignKey("rwa_societies.id"), nullable=False)
    type = Column(String(50), nullable=False)  # ResourceType enum value
    quantity = Column(Float, default=0)
    unit = Column(String(50), default="units")
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class EvacuationRecord(Base):
    """Tracks evacuation progress per society during an active event."""
    __tablename__ = "rwa_evacuation_records"

    id = Column(String(255), primary_key=True, default=lambda: f"evac-{uuid.uuid4().hex[:8]}")
    society_id = Column(String(255), ForeignKey("rwa_societies.id"), nullable=False)
    resident_category = Column(String(50), nullable=False)  # senior, child, pregnant, etc.
    count_evacuated = Column(Integer, default=0)
    count_remaining = Column(Integer, default=0)
    shelter_id = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
