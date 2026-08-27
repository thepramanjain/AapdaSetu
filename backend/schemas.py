"""
AapdaSetu - Core Data Validation & Pydantic Schemas
==================================================
Defines Pydantic models for validation of coordinate boundaries, disaster reports,
API requests, and structured outputs for our Multi-Agent disaster response.
"""

from datetime import datetime, timezone
from typing import Any, List, Optional, Dict
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, field_validator


class CoordinateModel(BaseModel):
    """Base model validating geographic coordinates."""
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: float) -> float:
        if not -90.0 <= v <= 90.0:
            raise ValueError("Latitude must be between -90.0 and 90.0")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: float) -> float:
        if not -180.0 <= v <= 180.0:
            raise ValueError("Longitude must be between -180.0 and 180.0")
        return v


class HospitalRecord(CoordinateModel):
    """Validation schema for hospital resources."""
    id: str = Field(..., description="Hospital official unique ID")
    name: str = Field(..., description="Hospital official name")
    capacity: int = Field(..., ge=0, description="Total bed capacity")
    occupied_beds: int = Field(..., ge=0, description="Number of occupied beds")
    specialties: List[str] = Field(default_factory=list, description="Medical specialties (e.g. ICU, trauma)")
    active: bool = Field(default=True, description="Is operational")


class ShelterRecord(CoordinateModel):
    """Validation schema for relief shelters."""
    id: str = Field(..., description="Shelter unique ID")
    name: str = Field(..., description="Shelter reference name")
    capacity: int = Field(..., ge=0, description="Total accommodation capacity")
    occupied: int = Field(..., ge=0, description="Current number of occupants")
    has_supplies: bool = Field(default=True, description="Does it have basic supplies")
    active: bool = Field(default=True, description="Is shelter operational and open")


class RoadRecord(BaseModel):
    """Validation schema for road connection link status."""
    id: str = Field(..., description="Road segment identifier")
    source_latitude: float = Field(..., ge=-90.0, le=90.0)
    source_longitude: float = Field(..., ge=-180.0, le=180.0)
    dest_latitude: float = Field(..., ge=-90.0, le=90.0)
    dest_longitude: float = Field(..., ge=-180.0, le=180.0)
    status: str = Field(default="open", description="Road state: open, blocked, flooded")
    average_speed_kmh: float = Field(default=50.0, ge=0.0, description="Expected vehicle speed in km/h")


class DisasterRecord(CoordinateModel):
    """Validation schema for validated disaster ingestion reports."""
    id: UUID = Field(default_factory=uuid4, description="Disaster report primary tracking key")
    event_type: str = Field(..., description="Type of disaster: flood or earthquake")
    reported_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Report timestamp")
    severity: float = Field(default=0.0, ge=0.0, le=10.0, description="Severity score rating (0.0 - 10.0)")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="Verifier certainty factor (0.0 - 1.0)")
    description: str = Field("", description="Raw alert log or reporter description notes")

    @field_validator("event_type")
    @classmethod
    def validate_disaster_category(cls, v: str) -> str:
        valid_types = {"flood", "earthquake"}
        v_clean = v.strip().lower()
        if v_clean not in valid_types:
            raise ValueError(f"Event type must be one of: {list(valid_types)}")
        return v_clean


# API Request/Response Schemas

class AnalyzeRequest(BaseModel):
    """Input payload for disaster incident queries."""
    query: str = Field(..., description="Natural language disaster query (e.g. 'Flood in Assam')")


class ReliefPlanResponse(BaseModel):
    """Output structure of the generated relief recommendations."""
    disaster_id: UUID = Field(..., description="Unique tracking ID for the analyzed disaster")
    event_type: str = Field(..., description="Identified disaster: flood or earthquake")
    location: str = Field(..., description="Normalized location string")
    coordinates: CoordinateModel = Field(..., description="Geocoded coordinates of the disaster epicenter")
    disaster_severity: float = Field(..., description="Severity rating score from 0.0 to 10.0")
    government_advisory: str = Field(..., description="Grounded emergency advice based on official NDRF/NDMA SOPs")
    nearby_shelters: List[ShelterRecord] = Field(default_factory=list, description="Recommended operational shelters")
    nearby_hospitals: List[HospitalRecord] = Field(default_factory=list, description="Recommended nearby operational hospitals")
    safe_route: str = Field(..., description="Detailed instructions for safe routes and evacuation transport channels")
    required_supplies: List[str] = Field(default_factory=list, description="List of essential relief materials required")
    emergency_contacts: Dict[str, str] = Field(default_factory=dict, description="Consolidated emergency rescue contacts")
    
    # New Architecture Extensions
    risk_assessment: Optional[Dict[str, Any]] = Field(default=None, description="AI Risk Assessment")
    missions: Optional[List[Dict[str, Any]]] = Field(default=None, description="Generated Mission Queue")
    budget: Optional[Dict[str, Any]] = Field(default=None, description="Budget Recommendation")
    blockchain: Optional[Dict[str, Any]] = Field(default=None, description="Blockchain Transaction Status")
    verification_status: Optional[str] = Field(default="UNKNOWN", description="Deterministic event verification status")


class ChatRequest(BaseModel):
    """Payload to interact with the AapdaSetu assistant conversationally."""
    session_id: str = Field(..., description="Unique chat session tracking ID")
    message: str = Field(..., description="User chat query")
    location_context: Optional[str] = Field(default=None, description="Current user location context")


class ChatResponse(BaseModel):
    """Output structure for interactive conversation responses."""
    session_id: str = Field(..., description="Session identifier")
    response: str = Field(..., description="Assistant reply message")
    suggested_actions: List[str] = Field(default_factory=list, description="Suggested next actions or queries")


# Dashboard API Schemas

class RiskAssessmentModel(BaseModel):
    risk_level: str
    confidence: float
    priority: str
    reasoning: str


class MissionModel(BaseModel):
    mission_id: str
    title: str
    priority: str
    estimated_duration: str
    required_resources: List[str]
    status: str


class BudgetModel(BaseModel):
    recommended_budget: float
    medical_budget: float
    food_budget: float
    shelter_budget: float
    reasoning: str


class BlockchainResponseModel(BaseModel):
    transaction_hash: str
    status: str
    block_number: int
    explorer_url: str
    timestamp: str


class DashboardResponseModel(BaseModel):
    disaster_id: UUID
    event_type: str
    location: str
    risk_assessment: RiskAssessmentModel
    mission_queue: List[MissionModel]
    budget: BudgetModel
    blockchain: BlockchainResponseModel
    resources_summary: Dict[str, Any]
