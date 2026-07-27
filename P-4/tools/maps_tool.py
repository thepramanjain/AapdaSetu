"""
AapdaSetu - Live Route Planning Tool
====================================
Queries the live public OSRM Routing Engine for transit metrics (distance, duration),
cross-referencing with local road network blockages from OpenStreetMap (Overpass).
"""

import json
import os
import httpx
from typing import Dict, Any, List
from backend.config import settings, app_logger
from tools.hospital_tool import haversine_distance
from tools.road_tool import get_roads_status
from tenacity import retry, stop_after_attempt, wait_exponential

OSRM_URL = "http://router.project-osrm.org/route/v1/driving/"


@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=1, min=2, max=6),
    reraise=True
)
def _query_osrm_route(lat_a: float, lon_a: float, lat_b: float, lon_b: float) -> dict:
    """Helper method to query the public OSRM API for route metrics."""
    # OSRM coordinates are specified as {longitude},{latitude}
    url = f"{OSRM_URL}{lon_a},{lat_a};{lon_b},{lat_b}"
    params = {"overview": "false", "steps": "true"}
    headers = {"User-Agent": "AapdaSetuSystem/1.0 (contact: team@aapdasetu.org)"}
    
    app_logger.info(f"Maps Tool: Querying OSRM route from ({lat_a}, {lon_a}) to ({lat_b}, {lon_b})...")
    response = httpx.get(url, params=params, headers=headers, timeout=8.0)
    response.raise_for_status()
    return response.json()


def get_safe_route(lat_a: float, lon_a: float, lat_b: float, lon_b: float) -> Dict[str, Any]:
    """
    Query live route coordinates A -> B and check for blockages.
    
    Args:
        lat_a: Source latitude.
        lon_a: Source longitude.
        lat_b: Destination latitude.
        lon_b: Destination longitude.
        
    Returns:
        Dict: Clean JSON payload containing route status and metrics.
    """
    cache_path = os.path.join(settings.CACHE_DIR, "roads_cache.json")
    
    # 1. Detect blockages near source or destination using road_tool
    blockages = []
    try:
        # Check roads around origin (A) and destination (B)
        for anchor_lat, anchor_lon, name in [(lat_a, lon_a, "Origin"), (lat_b, lon_b, "Destination")]:
            road_data = get_roads_status(anchor_lat, anchor_lon, radius_meters=1500)
            if road_data.get("status") == "success":
                for road in road_data.get("roads", []):
                    if road.get("status") in ["flooded", "blocked"]:
                        blockages.append({
                            "road_id": road["id"],
                            "name": road["name"],
                            "status": road["status"],
                            "message": f"Road segment '{road['name']}' near {name} is {road['status']}."
                        })
    except Exception as e:
        app_logger.warning(f"Maps Tool: Failed to assess local road blockages: {e}")

    # 2. Call OSRM live router
    try:
        data = _query_osrm_route(lat_a, lon_a, lat_b, lon_b)
        routes = data.get("routes", [])
        if routes:
            route = routes[0]
            distance_km = route.get("distance", 0.0) / 1000.0
            duration_mins = route.get("duration", 0.0) / 60.0
            
            if blockages:
                warning_text = "WARNING: Active blockages detected near route. " + ", ".join([b["message"] for b in blockages])
                routing_advice = f"{warning_text}. Evacuation vehicles must reroute and proceed with caution."
                route_status = "caution"
            else:
                routing_advice = "Route is clear. Transit via primary highway lines is open."
                route_status = "safe"
                
            result = {
                "status": "success",
                "route_status": route_status,
                "distance_km": round(distance_km, 2),
                "duration_minutes": round(duration_mins, 1),
                "routing_advice": routing_advice,
                "blockages_flagged": blockages,
                "source": "osrm_routing_api"
            }
            
            # Save cache
            try:
                os.makedirs(os.path.dirname(cache_path), exist_ok=True)
                with open(cache_path, "w", encoding="utf-8") as f:
                    json.dump(result, f, indent=2)
            except Exception as cache_err:
                app_logger.warning(f"Maps Tool: Failed to write cache: {cache_err}")
                
            return result
            
    except Exception as e:
        app_logger.warning(f"Maps Tool: OSRM engine failed ({e}). Loading fallback cache.")
        
        # Load from cache
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                cached_data["source"] = "local_cache"
                return cached_data
            except Exception as read_err:
                app_logger.error(f"Maps Tool: Failed to read cache: {read_err}")

        # Geometric estimate fallback
        geom_dist = haversine_distance(lat_a, lon_a, lat_b, lon_b)
        est_duration = (geom_dist / 30.0) * 60.0  # assume 30 km/h average transit speed
        
        if blockages:
            advice = f"Evacuation alert: Local roads are flagged as disrupted. Evacuate via secondary roads."
            status = "caution"
        else:
            advice = "Direct transit line estimated as open. No blockages reported near endpoints."
            status = "safe"
            
        return {
            "status": "success",
            "route_status": status,
            "distance_km": round(geom_dist * 1.25, 2),  # Winding factor 1.25
            "duration_minutes": round(est_duration, 1),
            "routing_advice": advice,
            "blockages_flagged": blockages,
            "source": "geometric_estimator_fallback"
        }
