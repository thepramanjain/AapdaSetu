"""
AapdaSetu — Shared Types
=========================
Pydantic models used across all modules (RWA, Blockchain, Heatwave).
These provide a single source of truth for common domain objects so that
every module speaks the same data language.

Phase 0 foundation — extend as modules are built.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class SeverityLevel(str, Enum):
    """Unified severity scale used in risk badges, maps, and notifications."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
    EXTREME = "EXTREME"


class DisasterType(str, Enum):
    """Supported disaster categories."""
    FLOOD = "flood"
    EARTHQUAKE = "earthquake"
    HEATWAVE = "heatwave"


class VerificationStatus(str, Enum):
    """Event verification lifecycle."""
    LIVE = "LIVE"
    PREPAREDNESS = "PREPAREDNESS"
    HISTORICAL = "HISTORICAL"
    SIMULATION = "SIMULATION"
    UNKNOWN = "UNKNOWN"


class VolunteerSkill(str, Enum):
    """Skills a volunteer can possess (used by RWA module)."""
    BOAT_OPERATOR = "BOAT_OPERATOR"
    MEDICAL = "MEDICAL"
    FIRST_AID = "FIRST_AID"
    DRIVER = "DRIVER"
    ELECTRICIAN = "ELECTRICIAN"
    GENERAL = "GENERAL"


class ResourceType(str, Enum):
    """Community resource categories (used by RWA module)."""
    FOOD = "FOOD"
    WATER = "WATER"
    MEDICINE = "MEDICINE"
    GENERATOR = "GENERATOR"
    FIRST_AID_KIT = "FIRST_AID_KIT"
    BOAT = "BOAT"
    LIFE_JACKET = "LIFE_JACKET"
    BLANKET = "BLANKET"
    TORCH = "TORCH"
    BATTERY = "BATTERY"


class ShipmentStage(str, Enum):
    """Supply-chain tracking stages (used by Blockchain module)."""
    WAREHOUSE = "WAREHOUSE"
    IN_TRANSIT = "IN_TRANSIT"
    CAMP = "CAMP"
    DELIVERED = "DELIVERED"


class FundingStatus(str, Enum):
    """On-chain funding lifecycle."""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    DISBURSED = "DISBURSED"
    VERIFIED = "VERIFIED"


# ---------------------------------------------------------------------------
# Shared Models
# ---------------------------------------------------------------------------

class Location(BaseModel):
    """Geo-location with optional administrative context."""
    lat: float
    lng: float
    district: Optional[str] = None
    state: Optional[str] = None
    raw_address: Optional[str] = None


class DisasterReport(BaseModel):
    """Compact disaster event summary passed between modules."""
    id: str
    event_type: DisasterType
    location: Location
    severity: float = Field(ge=0, le=10, description="0-10 severity score")
    severity_level: SeverityLevel = SeverityLevel.MEDIUM
    confidence: float = Field(ge=0, le=1, description="0.0-1.0 confidence")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    verification_status: VerificationStatus = VerificationStatus.UNKNOWN
    description: Optional[str] = None


class Resident(BaseModel):
    """A resident record within an RWA society."""
    id: Optional[str] = None
    name: str
    category: str = "general"  # senior, child, pregnant, disabled, general
    society_id: Optional[str] = None


class Volunteer(BaseModel):
    """A registered volunteer within an RWA society."""
    id: Optional[str] = None
    name: str
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    skill: VolunteerSkill = VolunteerSkill.GENERAL
    is_doctor: bool = False
    is_nurse: bool = False
    society_id: Optional[str] = None
    availability_status: str = "available"


class Resource(BaseModel):
    """A community resource item tracked by an RWA society."""
    id: Optional[str] = None
    type: ResourceType
    quantity: float = 0
    unit: str = "units"
    society_id: Optional[str] = None
    last_updated: Optional[str] = None


class ReliefShipment(BaseModel):
    """Supply-chain tracking record for blockchain module."""
    shipment_id: str
    disaster_id: str
    current_stage: ShipmentStage = ShipmentStage.WAREHOUSE
    quantity: float = 0
    resource_type: str = ""
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
