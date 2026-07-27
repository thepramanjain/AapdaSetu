"""
AapdaSetu — RWA Service
=========================
Business logic for the RWA module: society filtering, volunteer matching,
evacuation prioritization, and notification cascades.
"""

import logging
import math
from typing import Any, Dict, List
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from modules.rwa.rwa_models import Society, RWAVolunteer, CommunityResource

logger = logging.getLogger("aapdasetu.rwa_service")

# --- Helpers ---

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on Earth in km."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


class NotificationProvider:
    """Mock notification provider for SMS and Push notifications."""
    async def send_sms(self, phone: str, message: str) -> Dict[str, Any]:
        logger.info("SMS to %s — %s", phone, message)
        return {"status": "sent", "phone": phone}

    async def send_push(self, user_id: str, message: str) -> Dict[str, Any]:
        logger.info("Push to %s — %s", user_id, message)
        return {"status": "sent", "user_id": user_id}


class RWAService:
    """Core RWA business logic."""

    def __init__(self, notification_provider: NotificationProvider | None = None):
        self.notifier = notification_provider or NotificationProvider()

    def _get_db(self) -> Session:
        return SessionLocal()

    async def find_nearby_societies(
        self, lat: float, lng: float, radius_km: float = 25.0
    ) -> List[Dict[str, Any]]:
        """Query societies within geo-radius."""
        db = self._get_db()
        try:
            # Fetch all societies (in a real app, use spatial indexing like PostGIS or bounding box)
            all_societies = db.query(Society).all()
            nearby = []
            for soc in all_societies:
                dist = haversine_distance(lat, lng, soc.latitude, soc.longitude)
                if dist <= radius_km:
                    nearby.append({
                        "id": soc.id,
                        "name": soc.name,
                        "distance_km": round(dist, 2),
                        "president_name": soc.president_name,
                        "president_phone": soc.president_phone,
                        "total_population": soc.total_population
                    })
            # Sort by distance
            nearby.sort(key=lambda x: x["distance_km"])
            logger.info("Found %d societies within %.1f km of (%.4f, %.4f)", len(nearby), radius_km, lat, lng)
            return nearby
        finally:
            db.close()

    async def compute_evacuation_priority(self, society_id: str) -> Dict[str, Any]:
        """Generate an evacuation priority queue for a society."""
        db = self._get_db()
        try:
            soc = db.query(Society).filter(Society.id == society_id).first()
            if not soc:
                return {"society_id": society_id, "priority_queue": [], "error": "Not found"}

            queue = []
            if soc.senior_citizen_count > 0:
                queue.append({"category": "Seniors", "count": soc.senior_citizen_count, "priority": 1})
            if soc.pregnant_women_count > 0:
                queue.append({"category": "Pregnant Women", "count": soc.pregnant_women_count, "priority": 2})
            if soc.disabled_residents_count > 0:
                queue.append({"category": "Disabled", "count": soc.disabled_residents_count, "priority": 3})
            if soc.children_count > 0:
                queue.append({"category": "Children", "count": soc.children_count, "priority": 4})
            
            general_count = soc.total_population - (soc.senior_citizen_count + soc.pregnant_women_count + soc.disabled_residents_count + soc.children_count)
            if general_count > 0:
                queue.append({"category": "General", "count": general_count, "priority": 5})

            return {"society_id": society_id, "society_name": soc.name, "priority_queue": queue}
        finally:
            db.close()

    async def match_volunteers(
        self, disaster_type: str, society_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """Find volunteers in affected societies with relevant skills."""
        if not society_ids:
            return []

        db = self._get_db()
        try:
            # Map disaster to high-priority skills
            target_skills = ["FIRST_AID", "MEDICAL"]
            if disaster_type.lower() == "flood":
                target_skills.extend(["BOAT_OPERATOR", "SWIMMER"])
            elif disaster_type.lower() == "earthquake":
                target_skills.extend(["SEARCH_RESCUE", "ENGINEER"])

            volunteers = db.query(RWAVolunteer).filter(
                RWAVolunteer.society_id.in_(society_ids),
                RWAVolunteer.availability_status == "available"
            ).all()

            matched = []
            for v in volunteers:
                is_critical = v.skill in target_skills or v.is_doctor or v.is_nurse
                matched.append({
                    "id": v.id,
                    "name": v.name,
                    "phone": v.phone,
                    "skill": v.skill,
                    "society_id": v.society_id,
                    "is_critical": is_critical
                })
            
            # Sort so critical volunteers appear first
            matched.sort(key=lambda x: (not x["is_critical"], x["name"]))
            return matched
        finally:
            db.close()

    async def check_resource_gaps(
        self, society_ids: List[str], severity: float
    ) -> List[Dict[str, Any]]:
        """Identify shortages in community resources based on population."""
        if not society_ids:
            return []

        db = self._get_db()
        try:
            societies = db.query(Society).filter(Society.id.in_(society_ids)).all()
            resources = db.query(CommunityResource).filter(CommunityResource.society_id.in_(society_ids)).all()

            # Group resources by society
            res_by_soc = {s.id: [] for s in societies}
            for r in resources:
                res_by_soc[r.society_id].append(r)

            gaps = []
            for soc in societies:
                soc_res = res_by_soc[soc.id]
                
                # Heuristics based on severity (0-10)
                # Need 1 generator per 100 people if severity > 7
                if severity > 7:
                    needed_generators = math.ceil(soc.total_population / 100)
                    avail_generators = sum(r.quantity for r in soc_res if r.type == "GENERATOR") + soc.generator_count
                    if avail_generators < needed_generators:
                        gaps.append({
                            "society_id": soc.id,
                            "society_name": soc.name,
                            "resource": "GENERATOR",
                            "shortage": needed_generators - avail_generators
                        })

                # Need 2 liters of water per person per day
                needed_water = soc.total_population * 2
                avail_water = sum(r.quantity for r in soc_res if r.type == "WATER") + soc.water_tank_capacity_liters
                if avail_water < needed_water:
                    gaps.append({
                        "society_id": soc.id,
                        "society_name": soc.name,
                        "resource": "WATER",
                        "shortage": needed_water - avail_water
                    })

            return gaps
        finally:
            db.close()

    async def trigger_notification_cascade(
        self, society_id: str, risk_level: str
    ) -> List[Dict[str, Any]]:
        """Cascade alerts to president, then broadcast."""
        db = self._get_db()
        try:
            soc = db.query(Society).filter(Society.id == society_id).first()
            if not soc:
                return []
            
            logs = []
            # 1. Alert President
            if soc.president_phone:
                msg = f"URGENT: {risk_level} risk alert for {soc.name}. Activate community response protocols."
                res = await self.notifier.send_sms(soc.president_phone, msg)
                logs.append({"recipient": "President", "action": "SMS", "status": res["status"]})

            # 2. Alert Critical Volunteers
            vols = db.query(RWAVolunteer).filter(RWAVolunteer.society_id == society_id).all()
            for v in vols:
                if v.is_doctor or v.skill in ["FIRST_AID", "MEDICAL", "BOAT_OPERATOR"]:
                    msg = f"AapdaSetu: {soc.name} needs your {v.skill} skills immediately. Report to community hall."
                    if v.phone:
                        res = await self.notifier.send_sms(v.phone, msg)
                        logs.append({"recipient": f"Volunteer:{v.name}", "action": "SMS", "status": res["status"]})

            # 3. Broadcast Push
            msg = f"{soc.name} Residents: {risk_level} emergency. Follow evacuation priorities. Seniors/Disabled assisted first."
            res = await self.notifier.send_push(f"topic_soc_{soc.id}", msg)
            logs.append({"recipient": "All Residents", "action": "Push Topic", "status": res["status"]})

            return logs
        finally:
            db.close()

# Module-level singleton
rwa_service = RWAService()
