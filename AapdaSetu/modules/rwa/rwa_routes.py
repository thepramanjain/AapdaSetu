"""
AapdaSetu — RWA API Routes
====================================
REST endpoints for the RWA module.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel

from backend.database import get_db
from modules.rwa.rwa_models import Society, RWAVolunteer, CommunityResource, EvacuationRecord
from modules.rwa.rwa_service import rwa_service

router = APIRouter(prefix="/api/rwa", tags=["RWA Module"])

# --- Schemas ---
class SocietyCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    president_name: str
    president_phone: str
    total_population: int
    children_count: int
    senior_citizen_count: int
    pregnant_women_count: int
    disabled_residents_count: int
    pet_count: int = 0
    has_community_hall: bool = False
    generator_count: int = 0
    boat_count: int = 0
    water_tank_capacity_liters: float = 0.0

class VolunteerCreate(BaseModel):
    name: str
    phone: str
    blood_group: str = ""
    skill: str
    is_doctor: bool = False
    is_nurse: bool = False

class ResourceCreate(BaseModel):
    type: str
    quantity: float
    unit: str = "units"


# --- Endpoints ---

@router.get("/status")
async def rwa_status():
    """Health check for the RWA module."""
    return {"module": "rwa", "status": "active", "phase": 1}


@router.post("/societies")
async def register_society(soc: SocietyCreate, db: Session = Depends(get_db)):
    db_soc = Society(**soc.model_dump())
    db.add(db_soc)
    db.commit()
    db.refresh(db_soc)
    return {"status": "success", "society_id": db_soc.id}


@router.get("/societies/{society_id}")
async def get_society(society_id: str, db: Session = Depends(get_db)):
    db_soc = db.query(Society).filter(Society.id == society_id).first()
    if not db_soc:
        raise HTTPException(status_code=404, detail="Society not found")
    
    volunteers = db.query(RWAVolunteer).filter(RWAVolunteer.society_id == society_id).all()
    resources = db.query(CommunityResource).filter(CommunityResource.society_id == society_id).all()
    
    return {
        "society": db_soc,
        "volunteers": volunteers,
        "resources": resources
    }


@router.get("/societies/search/nearby")
async def get_nearby_societies(lat: float, lng: float, radius_km: float = 25.0):
    nearby = await rwa_service.find_nearby_societies(lat, lng, radius_km)
    return {"nearby_societies": nearby}


@router.post("/societies/{society_id}/volunteers")
async def register_volunteer(society_id: str, vol: VolunteerCreate, db: Session = Depends(get_db)):
    db_soc = db.query(Society).filter(Society.id == society_id).first()
    if not db_soc:
        raise HTTPException(status_code=404, detail="Society not found")
    
    db_vol = RWAVolunteer(**vol.model_dump(), society_id=society_id)
    db.add(db_vol)
    db.commit()
    db.refresh(db_vol)
    return {"status": "success", "volunteer_id": db_vol.id}


@router.post("/societies/{society_id}/resources")
async def update_resources(society_id: str, res: ResourceCreate, db: Session = Depends(get_db)):
    db_soc = db.query(Society).filter(Society.id == society_id).first()
    if not db_soc:
        raise HTTPException(status_code=404, detail="Society not found")
    
    db_res = CommunityResource(**res.model_dump(), society_id=society_id)
    db.add(db_res)
    db.commit()
    db.refresh(db_res)
    return {"status": "success", "resource_id": db_res.id}


@router.get("/societies/{society_id}/evacuation-priority")
async def get_evacuation_priority(society_id: str):
    return await rwa_service.compute_evacuation_priority(society_id)


@router.post("/notify")
async def trigger_notification(society_id: str, risk_level: str):
    logs = await rwa_service.trigger_notification_cascade(society_id, risk_level)
    return {"status": "success", "notifications_sent": len(logs), "logs": logs}
