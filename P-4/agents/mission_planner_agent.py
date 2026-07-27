"""Mission Planner Agent
Generates actionable emergency missions and preparedness tasks based on
Disaster State, Risk Assessment, and Verification Status.

ARCHITECTURE
============
Task/mission generation is DETERMINISTIC per verification_status.
The LLM is called to enrich (title, summary, priority) but the canonical
task list for each mode is always seeded from a built-in registry, so the
mission section is NEVER empty.

Mode → Output
  LIVE        → Operational rescue missions (LLM-enriched)
  PREPAREDNESS→ Fixed 10-item preparedness task list (guaranteed non-empty)
  HISTORICAL  → Awareness recommendations
  SIMULATED   → Training tasks (marked "Simulation Only")
  UNKNOWN     → Preparedness tasks (safe fallback)
"""

from backend.config import app_logger
from services.llm_manager import llm_manager, LLMServiceError, parse_strict_json
from services.logging_service import execution_logger

# ---------------------------------------------------------------------------
# Deterministic task registries — always non-empty for each mode
# ---------------------------------------------------------------------------

_PREPAREDNESS_TASKS = [
    "Weather Monitoring — track rainfall, wind speed, and flood alerts every 2 hours.",
    "Shelter Inspection — verify structural integrity and capacity of all registered shelters.",
    "Hospital Readiness — confirm emergency ward capacity and trauma team availability.",
    "Medical Inventory Check — audit medicines, blood supply, and surgical kits.",
    "Rescue Equipment Inspection — test boats, generators, ropes, and safety gear.",
    "Volunteer Readiness — brief and deploy community volunteer teams to staging points.",
    "Communication System Check — test satellite phones, sirens, and radio networks.",
    "NDMA SOP Review — conduct tabletop exercise using latest NDMA standard procedures.",
    "Community Awareness — distribute early-warning leaflets to vulnerable localities.",
    "Early Warning Monitoring — ensure automated alert thresholds are active and calibrated.",
]

_HISTORICAL_TASKS = [
    "Document lessons learned from the disaster event.",
    "Share incident report with NDMA and state authorities.",
    "Conduct community debriefing sessions.",
    "Review infrastructure damage for long-term mitigation.",
    "Update risk maps and evacuation plans based on observed impact.",
]

_SIMULATION_TASKS = [
    "[SIMULATION] Tabletop disaster response exercise.",
    "[SIMULATION] Test inter-agency coordination protocols.",
    "[SIMULATION] Validate evacuation route timings.",
    "[SIMULATION] Stress-test emergency communication systems.",
    "[SIMULATION] Debrief and document drill findings.",
]

_LIVE_MISSION_TYPES = [
    "Search & Rescue",
    "Medical Response",
    "Evacuation",
    "Shelter Management",
    "Road Clearance",
    "Supply Distribution",
    "Communication Support",
    "Damage Assessment",
    "Volunteer Coordination",
    "Infrastructure Restoration",
]


# ---------------------------------------------------------------------------
# Mode resolver
# ---------------------------------------------------------------------------

def _resolve_mode(verification_status: str) -> str:
    v = str(verification_status).upper().strip()
    if v == "LIVE":
        return "LIVE"
    if v in ("PREPAREDNESS", "UNKNOWN", ""):
        return "PREPAREDNESS"
    if v == "HISTORICAL":
        return "HISTORICAL"
    if v in ("SIMULATED", "SIMULATION", "TRAINING"):
        return "SIMULATION"
    return "PREPAREDNESS"   # safe default — never empty


# ---------------------------------------------------------------------------
# LLM enrichment helpers
# ---------------------------------------------------------------------------

_LIVE_PROMPT = """\
You are a disaster operations planner. The disaster is VERIFIED and LIVE.
Event: {event_type} at {location}, severity {severity}/10, risk {risk_level}.
Available resources: hospitals={hospitals}, shelters={shelters}.

Generate 3-5 operational rescue missions strictly from the mission types below:
{mission_types}

Return ONLY a JSON object matching this schema exactly:
{{
  "planner_status": "SUCCESS",
  "mission_mode": "LIVE",
  "missions": [
    {{
      "mission_id": "MIS-001",
      "title": "...",
      "category": "...",
      "priority": "HIGH",
      "agency": "NDRF",
      "estimated_duration": "4 hours",
      "required_resources": ["..."],
      "status": "Pending",
      "reason": "..."
    }}
  ],
  "preparedness_tasks": [],
  "summary": "...",
  "confidence": 0.9
}}
Do NOT include markdown, code fences, or any text outside the JSON.
"""

_PREPAREDNESS_PROMPT = """\
You are a disaster preparedness advisor. No disaster is currently confirmed.
Event type being monitored: {event_type} at {location}.

Expand the following preparedness tasks with 1-sentence actionable details.
Keep all 10 tasks. Return them as a JSON array of strings.
Tasks:
{tasks}

Return ONLY a JSON object matching this schema exactly:
{{
  "planner_status": "SUCCESS",
  "mission_mode": "PREPAREDNESS",
  "missions": [],
  "preparedness_tasks": ["task 1", "task 2", ...],
  "summary": "...",
  "confidence": 0.8
}}
Do NOT include markdown, code fences, or any text outside the JSON.
"""

_HISTORICAL_PROMPT = """\
A {event_type} event at {location} has been recorded historically.
Generate 5 post-event awareness recommendations for community recovery.
Return ONLY this JSON schema:
{{
  "planner_status": "SUCCESS",
  "mission_mode": "HISTORICAL",
  "missions": [],
  "preparedness_tasks": ["recommendation 1", ...],
  "summary": "...",
  "confidence": 0.7
}}
"""

_SIMULATION_PROMPT = """\
This is a training exercise for a {event_type} scenario at {location}.
Generate 5 simulation training tasks. Mark every task with [SIMULATION].
Return ONLY this JSON schema:
{{
  "planner_status": "SUCCESS",
  "mission_mode": "SIMULATION",
  "missions": [],
  "preparedness_tasks": ["[SIMULATION] task 1", ...],
  "summary": "...",
  "confidence": 1.0
}}
"""


def _build_prompt(mode: str, state_data: dict, risk_assessment: dict) -> str:
    event_type = str(state_data.get("event_type", "disaster")).title()
    location   = str(state_data.get("raw_location", state_data.get("location", "Unknown")))
    severity   = float(state_data.get("severity", 0.0) or 0.0)
    risk_level = str(risk_assessment.get("risk_level", "UNKNOWN")) if isinstance(risk_assessment, dict) else "UNKNOWN"
    hospitals  = len(state_data.get("nearby_hospitals", []) or [])
    shelters   = len(state_data.get("nearby_shelters", []) or [])

    if mode == "LIVE":
        return _LIVE_PROMPT.format(
            event_type=event_type, location=location,
            severity=severity, risk_level=risk_level,
            hospitals=hospitals, shelters=shelters,
            mission_types="\n".join(f"- {t}" for t in _LIVE_MISSION_TYPES),
        )
    if mode == "PREPAREDNESS":
        return _PREPAREDNESS_PROMPT.format(
            event_type=event_type, location=location,
            tasks="\n".join(f"- {t}" for t in _PREPAREDNESS_TASKS),
        )
    if mode == "HISTORICAL":
        return _HISTORICAL_PROMPT.format(event_type=event_type, location=location)
    # SIMULATION
    return _SIMULATION_PROMPT.format(event_type=event_type, location=location)


# ---------------------------------------------------------------------------
# Fallback builders — guaranteed non-empty, no LLM required
# ---------------------------------------------------------------------------

def _fallback_for_mode(mode: str, event_type: str, location: str) -> dict:
    if mode == "LIVE":
        return {
            "planner_status":    "SUCCESS",
            "mission_mode":      "LIVE",
            "missions":          [],
            "preparedness_tasks": _PREPAREDNESS_TASKS[:3],
            "summary":           f"Live disaster planning for {event_type} at {location}. LLM enrichment unavailable.",
            "confidence":        0.5,
        }
    if mode == "HISTORICAL":
        return {
            "planner_status":    "SUCCESS",
            "mission_mode":      "HISTORICAL",
            "missions":          [],
            "preparedness_tasks": _HISTORICAL_TASKS,
            "summary":           f"Historical awareness recommendations for {event_type} at {location}.",
            "confidence":        0.7,
        }
    if mode == "SIMULATION":
        return {
            "planner_status":    "SUCCESS",
            "mission_mode":      "SIMULATION",
            "missions":          [],
            "preparedness_tasks": _SIMULATION_TASKS,
            "summary":           f"Training exercise tasks for {event_type} scenario at {location}.",
            "confidence":        1.0,
        }
    # PREPAREDNESS (default)
    return {
        "planner_status":    "SUCCESS",
        "mission_mode":      "PREPAREDNESS",
        "missions":          [],
        "preparedness_tasks": _PREPAREDNESS_TASKS,
        "summary":           f"Preparedness tasks for {event_type} monitoring at {location}.",
        "confidence":        0.8,
    }


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def _ensure_non_empty_tasks(parsed: dict, mode: str) -> dict:
    """
    Guarantee that either missions or preparedness_tasks is non-empty.
    Uses the built-in registries as guaranteed fallbacks.
    """
    missions = parsed.get("missions", [])
    tasks    = parsed.get("preparedness_tasks", [])

    if not isinstance(missions, list):
        missions = []
    if not isinstance(tasks, list):
        tasks = []

    # Strip out empty/whitespace strings
    tasks    = [str(t).strip() for t in tasks if str(t).strip()]
    missions = [m for m in missions if isinstance(m, dict) and m.get("title")]

    # Fallback if both empty
    if not missions and not tasks:
        app_logger.warning(
            f"Mission Planner: LLM returned empty tasks for mode={mode}. "
            "Using built-in registry."
        )
        if mode == "LIVE":
            tasks = _PREPAREDNESS_TASKS[:3]   # safe minimum while waiting for missions
        elif mode == "HISTORICAL":
            tasks = _HISTORICAL_TASKS
        elif mode == "SIMULATION":
            tasks = _SIMULATION_TASKS
        else:
            tasks = _PREPAREDNESS_TASKS

    parsed["missions"]           = missions
    parsed["preparedness_tasks"] = tasks
    return parsed


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def plan_missions(state_data: dict, risk_assessment: dict) -> dict:
    """
    Runs the Mission Planner Agent.

    Returns:
        dict: { "mission_queue": [...] }

    Always sets state_data keys:
        planner_status, mission_mode, preparedness_tasks, mission_summary
    so the Reports Service always has something to render.
    """
    app_logger.info("Mission Planner Agent: Generating missions...")
    execution_logger.log_agent_execution("Mission Planner Agent", "STARTING", "Planning missions.")

    v_status   = str(state_data.get("verification_status") or "PREPAREDNESS").upper()
    mode       = _resolve_mode(v_status)
    event_type = str(state_data.get("event_type", "disaster")).title()
    location   = str(state_data.get("raw_location", state_data.get("location", "Unknown")))

    # ------------------------------------------------------------------
    # 1. LLM enrichment (best-effort — failure handled gracefully)
    # ------------------------------------------------------------------
    parsed: dict = {}
    try:
        prompt  = _build_prompt(mode, state_data, risk_assessment)
        content = llm_manager.invoke(prompt, temperature=0.1, require_json=True)
        app_logger.debug(f"Mission Planner Agent LLM Raw Output:\n{content}")
        parsed  = parse_strict_json(content) or {}
        if not isinstance(parsed, dict):
            parsed = {}
    except (LLMServiceError, Exception) as e:
        app_logger.warning(f"Mission Planner Agent: LLM failed ({e}). Using built-in tasks.")
        parsed = {}

    # ------------------------------------------------------------------
    # 2. Validate + guarantee non-empty output
    # ------------------------------------------------------------------
    if parsed:
        parsed = _ensure_non_empty_tasks(parsed, mode)
    else:
        parsed = _fallback_for_mode(mode, event_type, location)

    # ------------------------------------------------------------------
    # 3. Mutate state_data so Reports Service can render without schema changes
    # ------------------------------------------------------------------
    state_data["planner_status"]     = parsed.get("planner_status", "SUCCESS")
    state_data["mission_mode"]       = parsed.get("mission_mode", mode)
    state_data["preparedness_tasks"] = parsed.get("preparedness_tasks", [])
    state_data["mission_summary"]    = parsed.get("summary", "")

    # Final safety net: NEVER return empty tasks for non-LIVE modes.
    # This is a deterministic guarantee \u2014 no LLM required.
    if not state_data["preparedness_tasks"]:
        if mode == "HISTORICAL":
            state_data["preparedness_tasks"] = _HISTORICAL_TASKS
        elif mode == "SIMULATION":
            state_data["preparedness_tasks"] = _SIMULATION_TASKS
        else:
            # PREPAREDNESS (default) or any unknown mode
            state_data["preparedness_tasks"] = _PREPAREDNESS_TASKS
        app_logger.info(
            f"Mission Planner: seeded {len(state_data['preparedness_tasks'])} built-in tasks "
            f"for mode={mode} (LLM returned empty list)."
        )

    mission_queue = parsed.get("missions", [])
    execution_logger.log_agent_execution(
        "Mission Planner Agent", "COMPLETED",
        f"Mode: {mode} | Missions: {len(mission_queue)} | Tasks: {len(state_data['preparedness_tasks'])}"
    )
    app_logger.info(
        f"Mission Planner: mode={mode}, missions={len(mission_queue)}, "
        f"tasks={len(state_data['preparedness_tasks'])}"
    )

    return {"mission_queue": mission_queue}

