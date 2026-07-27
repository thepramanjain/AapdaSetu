"""
AapdaSetu - Resource Allocation Agent
==========================================
Coordinates nearest emergency services, hospital triage selection, routing blockages,
and logcheck evacuations by querying live OSM and OSRM REST APIs.

Resource objects from the LLM can arrive in multiple formats:
  FORMAT A: [{"id":"...", "name":"...", "lat":0, "lon":0}]
  FORMAT B: ["Hospital A", "Hospital B"]
  FORMAT C: null
  FORMAT D: []
  FORMAT E: mixed list of dicts and strings

All formats are normalised before any field access so that
.get() is NEVER called on a non-dict object.
"""

from typing import List, Dict, Any, Optional
from backend.config import settings, app_logger
from tools.hospital_tool import find_nearby_hospitals
from tools.shelter_tool import find_nearby_shelters
from tools.maps_tool import get_safe_route
from agents.prompt_loader import load_prompt, parse_llm_response
import random
from services.context_optimizer import summarize_resources, summarize_routes
from services.llm_manager import llm_manager, LLMServiceError, parse_strict_json
from services.logging_service import execution_logger


# ---------------------------------------------------------------------------
# Normalisation helpers
# ---------------------------------------------------------------------------

def _normalize_resource(item: Any) -> Dict[str, Any]:
    """
    Normalise a single resource item into a canonical dict regardless of input format.

    Supported input formats:
      - dict  → kept as-is, missing keys filled with None
      - str   → {"name": item, "id": None, "lat": None, "lon": None, "verified": False}
      - None  → {"name": None, "id": None, "lat": None, "lon": None, "verified": False}
      - other → converted via str(), treated as a name
    """
    if isinstance(item, dict):
        return {
            "id":       item.get("id"),
            "name":     item.get("name") or item.get("hospital_name") or item.get("shelter_name"),
            "lat":      item.get("lat") or item.get("latitude"),
            "lon":      item.get("lon") or item.get("longitude"),
            "verified": bool(item.get("id")),
            # Preserve all original keys so downstream code can still use them
            **{k: v for k, v in item.items() if k not in ("id", "name", "lat", "lon", "verified")}
        }
    elif isinstance(item, str) and item.strip():
        return {"id": None, "name": item.strip(), "lat": None, "lon": None, "verified": False}
    else:
        return {"id": None, "name": str(item) if item is not None else None, "lat": None, "lon": None, "verified": False}


def _normalize_resource_list(raw: Any) -> List[Dict[str, Any]]:
    """
    Accept FORMAT A/B/C/D/E and always return a list of normalised dicts.
    """
    if raw is None:
        return []
    if isinstance(raw, str):
        # "Not Available" or similar sentinel strings
        if raw.strip().lower() in ("not available", "none", "null", ""):
            return []
        # A single name string → wrap it
        return [_normalize_resource(raw)]
    if isinstance(raw, dict):
        # Wrapped single object → list of one
        return [_normalize_resource(raw)]
    if isinstance(raw, list):
        normalized = []
        for item in raw:
            normalized.append(_normalize_resource(item))
        return normalized
    return []


def _safe_get(obj: Any, key: str, default: Any = None) -> Any:
    """
    Call .get() only when obj is a dict; otherwise return default.
    This completely eliminates AttributeError from non-dict access.
    """
    if isinstance(obj, dict):
        return obj.get(key, default)
    return default


# ---------------------------------------------------------------------------
# Required Resource Agent API Methods
# ---------------------------------------------------------------------------

def find_nearest_hospital(lat: float, lon: float, radius_km: float = 15.0) -> List[Dict[str, Any]]:
    """Query nearby live hospital list sorted by Haversine distance."""
    return find_nearby_hospitals(lat, lon, radius_km=radius_km)


def find_nearest_shelter(lat: float, lon: float, radius_km: float = 15.0) -> List[Dict[str, Any]]:
    """Query nearby designated shelters/community halls."""
    shelters = find_nearby_shelters(lat, lon, radius_km=radius_km)
    return [s for s in shelters if isinstance(s, dict) and
            s.get("type") in ["shelter", "community_centre", "social_facility", ""]]


def find_safe_route(src_lat: float, src_lon: float, dest_lat: float, dest_lon: float) -> Dict[str, Any]:
    """Calculate driving route and check for potential road blockages."""
    return get_safe_route(src_lat, src_lon, dest_lat, dest_lon)


def find_police_station(lat: float, lon: float, radius_km: float = 15.0) -> List[Dict[str, Any]]:
    """Filter nearby OSM facilities specifically for police stations."""
    shelters = find_nearby_shelters(lat, lon, radius_km=radius_km)
    return [s for s in shelters if isinstance(s, dict) and s.get("type") == "police"]


def find_fire_station(lat: float, lon: float, radius_km: float = 15.0) -> List[Dict[str, Any]]:
    """Filter nearby OSM facilities specifically for fire stations."""
    shelters = find_nearby_shelters(lat, lon, radius_km=radius_km)
    return [s for s in shelters if isinstance(s, dict) and s.get("type") == "fire_station"]


def find_relief_center(lat: float, lon: float, radius_km: float = 15.0) -> List[Dict[str, Any]]:
    """Identify schools, stadiums, or community centers converting into relief stations."""
    shelters = find_nearby_shelters(lat, lon, radius_km=radius_km)
    return [s for s in shelters if isinstance(s, dict) and s.get("type") in ["school", "community_centre"]]


# ---------------------------------------------------------------------------
# LangGraph Orchestration Pipeline
# ---------------------------------------------------------------------------

def allocate_resources(
    location: str,
    lat: float,
    lon: float,
    disaster_type: str,
    severity: float,
    verification_status: str = "LIVE",
    event_confirmed: bool = False,
) -> dict:
    """
    Runs the Resource Allocation Agent pipeline using the live tools.

    Returns:
        dict with keys:
          nearby_shelters, nearby_hospitals, safe_route,
          required_supplies, emergency_contacts,
          validated_hospitals, validated_shelters, validated_routes,
          resource_status, availability_summary, resource_confidence
    """
    # ------------------------------------------------------------------ #
    # Helper: enrich a normalised resource dict (always a dict at this
    # point, so .get() is safe)
    # ------------------------------------------------------------------ #
    def _enrich_resource(resource: dict, is_hospital: bool) -> dict:
        dist_raw = resource.get("distance_km", resource.get("dist", 5.0))
        try:
            dist = float(dist_raw)
        except (TypeError, ValueError):
            dist = 5.0
        score = max(10, 100 - int(dist * 5))
        eta   = int((dist / 30.0) * 60)

        resource["suitability_score"]   = score
        resource["eta_minutes"]         = max(5, eta)
        resource["capacity"]            = resource.get(
            "capacity",
            random.choice([50, 100, 200, 500]) if is_hospital else random.choice([100, 500, 1000])
        )
        resource["availability_status"] = "Open"
        return resource

    # ------------------------------------------------------------------ #
    # Helper: build a canonical validated resource record
    # ------------------------------------------------------------------ #
    def _validated(norm: dict) -> dict:
        return {
            "id":       norm.get("id"),
            "name":     norm.get("name"),
            "lat":      norm.get("lat"),
            "lon":      norm.get("lon"),
            "verified": bool(norm.get("id")),
        }

    app_logger.info(
        f"Resource Agent: Coordinating assets for lat={lat}, lon={lon} ({disaster_type})..."
    )
    execution_logger.log_agent_execution(
        "Resource Agent", "STARTING", "Allocating resources."
    )

    # ------------------------------------------------------------------
    # 1. Query nearby resources via live API helper interfaces
    # ------------------------------------------------------------------
    hospitals = find_nearest_hospital(lat, lon, radius_km=15.0)
    shelters  = find_nearest_shelter(lat, lon, radius_km=15.0)

    # Detect explicit API unavailability flags
    api_unavailable = False
    if hospitals and isinstance(hospitals[0], dict) and hospitals[0].get("error") == "API_UNAVAILABLE":
        api_unavailable = True
        hospitals = []
    if shelters and isinstance(shelters[0], dict) and shelters[0].get("error") == "API_UNAVAILABLE":
        api_unavailable = True
        shelters = []

    resource_status = "PARTIAL" if api_unavailable else "SUCCESS"

    # ------------------------------------------------------------------
    # 2. Get safe route from epicenter to primary shelter
    # ------------------------------------------------------------------
    routing_res: Dict[str, Any] = {}
    if shelters:
        primary_shelter = shelters[0]
        s_lat = primary_shelter.get("latitude") if isinstance(primary_shelter, dict) else None
        s_lon = primary_shelter.get("longitude") if isinstance(primary_shelter, dict) else None
        if s_lat is not None and s_lon is not None:
            routing_res = find_safe_route(lat, lon, s_lat, s_lon)
        else:
            routing_res = {"routing_advice": "Shelter coordinates unavailable.", "distance_km": 0.0, "blockages_flagged": []}
    else:
        routing_res = {
            "routing_advice": (
                "Unable to retrieve nearby shelters. Reason: Overpass API unavailable. "
                "Please verify with local authorities."
            ) if api_unavailable else "No shelters available within 15km.",
            "distance_km": 0.0,
            "blockages_flagged": []
        }

    # ------------------------------------------------------------------
    # 3. Compress context using Context Optimizer
    # ------------------------------------------------------------------
    res_summary   = summarize_resources(hospitals, shelters, max_items=3)
    route_summary = summarize_routes(routing_res, max_items=1)

    # ------------------------------------------------------------------
    # 4. Invoke LLM
    # ------------------------------------------------------------------
    resource_p  = load_prompt("resource_agent_prompt.md")
    evidence_block = f"Status: {verification_status}"

    user_context = (
        "## Current Task\n"
        f"{resource_p}\n\n"
        "## Compact State\n"
        f"Location: {location}\n"
        f"Disaster type: {disaster_type}\n"
        f"Severity score: {severity}\n"
        f"Hospitals ({res_summary['hospital_count']} total): {res_summary['hospitals_summary'][:200]}\n"
        f"Shelters ({res_summary['shelter_count']} total): {res_summary['shelters_summary'][:200]}\n"
        f"Routes: {route_summary['route_summary']}\n"
        f"Blocked Roads: {route_summary['blocked_count']}\n\n"
        "## Verified Evidence\n"
        f"{evidence_block}\n\n"
        "## Relevant RAG Context\n"
        "None (Handled by RAG Agent)\n\n"
        "Return ONLY valid JSON.\n"
        "Do NOT explain.\n"
        "Do NOT use markdown.\n"
        "Do NOT use code fences.\n"
        "Do NOT think aloud.\n"
        "The first character must be {\n"
        "The last character must be }\n"
    )

    # ------------------------------------------------------------------
    # 5. Parse LLM output with full crash-proofing
    # ------------------------------------------------------------------
    try:
        content = llm_manager.invoke(user_context, temperature=0.0, require_json=True)
        app_logger.debug(f"Resource Agent LLM Output:\n{content}")

        parsed = parse_strict_json(content)
        if not isinstance(parsed, dict):
            parsed = {}

        # -- Shelters --------------------------------------------------
        raw_shelters = (
            parsed.get("top_3_shelters")
            or parsed.get("nearby_shelters_selected")
            or parsed.get("nearest_shelter")
        )
        llm_shelters_norm = _normalize_resource_list(raw_shelters)

        final_shelters = []
        for norm_s in llm_shelters_norm:
            # norm_s is ALWAYS a dict from here on — safe to call .get()
            s_id   = norm_s.get("id")
            s_name = norm_s.get("name") or ""
            match  = None
            if s_id:
                match = next(
                    (item for item in shelters
                     if isinstance(item, dict) and item.get("id") == s_id),
                    None
                )
            if not match and s_name:
                match = next(
                    (item for item in shelters
                     if isinstance(item, dict)
                     and s_name.lower() in item.get("name", "").lower()),
                    None
                )
            if match:
                mc = dict(match)
                mc["selection_reason"] = (
                    norm_s.get("actionable_instruction")
                    or norm_s.get("reason")
                    or "Best available option based on proximity and safety."
                )
                final_shelters.append(_enrich_resource(mc, is_hospital=False))

        # Fallback to closest API result when LLM gave nothing useful
        if not final_shelters and res_summary["top_shelters_raw"]:
            fb = dict(res_summary["top_shelters_raw"][0])
            fb["selection_reason"] = "Default closest shelter."
            final_shelters = [_enrich_resource(fb, is_hospital=False)]

        # -- Hospitals -------------------------------------------------
        raw_hospitals = (
            parsed.get("top_3_hospitals")
            or parsed.get("nearby_hospitals_selected")
            or parsed.get("nearest_hospital")
        )
        llm_hospitals_norm = _normalize_resource_list(raw_hospitals)

        final_hospitals = []
        for norm_h in llm_hospitals_norm:
            h_id   = norm_h.get("id")
            h_name = norm_h.get("name") or ""
            match  = None
            if h_id:
                match = next(
                    (item for item in hospitals
                     if isinstance(item, dict) and item.get("id") == h_id),
                    None
                )
            if not match and h_name:
                match = next(
                    (item for item in hospitals
                     if isinstance(item, dict)
                     and h_name.lower() in item.get("name", "").lower()),
                    None
                )
            if match:
                mc = dict(match)
                mc["selection_reason"] = (
                    norm_h.get("actionable_instruction")
                    or norm_h.get("reason")
                    or "Closest equipped facility."
                )
                final_hospitals.append(_enrich_resource(mc, is_hospital=True))

        if not final_hospitals and res_summary["top_hospitals_raw"]:
            fb = dict(res_summary["top_hospitals_raw"][0])
            fb["selection_reason"] = "Default closest hospital."
            final_hospitals = [_enrich_resource(fb, is_hospital=True)]

        # -- Route -----------------------------------------------------
        safe_route_raw = (
            parsed.get("safe_route")
            or parsed.get("safe_route_summary")
            or _safe_get(routing_res, "routing_advice")
        )
        if isinstance(safe_route_raw, dict):
            safe_route_val = (
                safe_route_raw.get("summary")
                or safe_route_raw.get("instructions")
                or str(safe_route_raw)
            )
        else:
            safe_route_val = str(safe_route_raw) if safe_route_raw else "Not Available"

        # -- Misc fields -----------------------------------------------
        availability = parsed.get("availability", "Not Available") or "Not Available"
        confidence   = float(parsed.get("confidence", 0.0) or 0.0)

        emergency_contacts = parsed.get("emergency_contacts", {})
        if not isinstance(emergency_contacts, dict):
            emergency_contacts = {}
        emergency_contacts["_resource_availability"] = availability
        emergency_contacts["_resource_confidence"]   = confidence

        # -- Validated output schema -----------------------------------
        validated_hospitals = [_validated(n) for n in llm_hospitals_norm]
        validated_shelters  = [_validated(n) for n in llm_shelters_norm]
        validated_routes    = [{"route_summary": safe_route_val}]

        availability_summary = (
            f"Hospitals: {len(final_hospitals)}, Shelters: {len(final_shelters)}"
        )

        execution_logger.log_agent_execution(
            "Resource Agent", "COMPLETED",
            f"Hospitals: {len(final_hospitals)}, Shelters: {len(final_shelters)}"
        )

        return {
            # Legacy keys (Coordinator reads these)
            "nearby_shelters":    final_shelters,
            "nearby_hospitals":   final_hospitals,
            "safe_route":         safe_route_val,
            "required_supplies":  parsed.get("required_supplies", []) if isinstance(parsed.get("required_supplies"), list) else [],
            "emergency_contacts": emergency_contacts,
            # New validated output schema
            "resource_status":     resource_status,
            "validated_hospitals": validated_hospitals,
            "validated_shelters":  validated_shelters,
            "validated_routes":    validated_routes,
            "availability_summary": availability_summary,
            "resource_confidence": confidence,
        }

    except LLMServiceError as e:
        app_logger.error(f"Resource Agent: LLM failed: {e}", exc_info=True)
        return _fallback_response(
            hospitals, shelters, routing_res, disaster_type, resource_status="PARTIAL"
        )
    except Exception as e:
        app_logger.error(f"Resource Agent: Plan compilation failed: {e}", exc_info=True)
        return _fallback_response(
            hospitals, shelters, routing_res, disaster_type, resource_status="PARTIAL"
        )


# ---------------------------------------------------------------------------
# Fallback — never crashes
# ---------------------------------------------------------------------------

def _fallback_response(
    hospitals: list,
    shelters: list,
    routing_res: dict,
    disaster_type: str,
    resource_status: str = "PARTIAL",
) -> dict:
    """Return a safe, schema-compatible fallback when LLM or API fails."""
    fallback_supplies = ["Drinking Water", "First Aid Kit", "Emergency Lights"]
    if disaster_type == "flood":
        fallback_supplies.extend(["Life Vest", "Purification Tablets"])

    routing_advice = _safe_get(routing_res, "routing_advice", "Not Available")

    return {
        # Legacy keys
        "nearby_shelters":   shelters[:2] if shelters else [],
        "nearby_hospitals":  hospitals[:2] if hospitals else [],
        "safe_route":        routing_advice,
        "required_supplies": fallback_supplies,
        "emergency_contacts": {
            "NDRF":                       "011-23438019",
            "Police":                     "100",
            "Ambulance":                  "102",
            "Disaster Management Helpline": "1078",
            "_resource_availability":     "Not Available",
            "_resource_confidence":       0.0,
        },
        # New validated output schema
        "resource_status":     resource_status,
        "validated_hospitals": [],
        "validated_shelters":  [],
        "validated_routes":    [{"route_summary": routing_advice}],
        "availability_summary": "Resource allocation failed; using defaults.",
        "resource_confidence":  0.0,
    }
