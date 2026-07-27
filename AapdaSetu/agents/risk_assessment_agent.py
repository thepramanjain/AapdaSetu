"""Risk Assessment Agent
Reasons over collected disaster state to determine risk level and priority.

ARCHITECTURE
============
Risk is computed DETERMINISTICALLY using a fixed decision table keyed on:
  1. Verification Status  (highest priority)
  2. Disaster Severity    (0–10 scale)
  3. Evidence Confidence  (0–1 float)
  4. Weather              (heavy rain flag)
  5. ReliefWeb            (context only — never escalates risk on its own)

The LLM is invoked ONLY to produce human-readable reasoning that EXPLAINS
the already-computed decision. It can never override the deterministic score.
"""

from backend.config import app_logger
from services.llm_manager import llm_manager, LLMServiceError, parse_strict_json
from services.logging_service import execution_logger

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_VALID_RISK   = ["LOW", "MEDIUM", "HIGH", "EXTREME"]
_VALID_PRIO   = ["MONITOR", "WATCH", "URGENT", "IMMEDIATE_RESPONSE"]

# Canonical priority that maps from risk level
_RISK_TO_PRIO = {
    "LOW":     "MONITOR",
    "MEDIUM":  "WATCH",
    "HIGH":    "URGENT",
    "EXTREME": "IMMEDIATE_RESPONSE",
}

# Keywords that indicate heavy precipitation in weather fields
_HEAVY_RAIN_KEYWORDS = {"heavy", "storm", "flood", "cyclone", "monsoon", "extreme", "severe"}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _has_heavy_rain(state_data: dict) -> bool:
    """Return True when weather fields mention heavy precipitation."""
    candidates = [
        state_data.get("weather_summary", ""),
        state_data.get("weather_description", ""),
        state_data.get("analysis_summary", ""),
    ]
    combined = " ".join(str(c).lower() for c in candidates if c)
    return any(kw in combined for kw in _HEAVY_RAIN_KEYWORDS)


def _has_reliefweb(state_data: dict) -> bool:
    """True when ReliefWeb evidence is present (but NOT used to escalate risk)."""
    rw = state_data.get("reliefweb_evidence", state_data.get("reports", []))
    return bool(rw)


# ---------------------------------------------------------------------------
# Deterministic decision engine  ← SINGLE SOURCE OF TRUTH
# ---------------------------------------------------------------------------

def _compute_risk(state_data: dict) -> tuple[str, str, list[str]]:
    """
    Apply the decision table and return (risk_level, priority, reasoning_points).

    Decision table (evaluated top-to-bottom; first match wins):

    | Verification  | Severity  | Extra condition      | Risk    | Priority          |
    |---------------|-----------|----------------------|---------|-------------------|
    | PREPAREDNESS  | 0         | confidence > 0.8     | LOW     | MONITOR           |
    | PREPAREDNESS  | 0         | any                  | LOW     | MONITOR           |
    | PREPAREDNESS  | 2–4       | heavy rain           | MEDIUM  | WATCH             |
    | PREPAREDNESS  | any       | any                  | LOW     | MONITOR           |
    | HISTORICAL    | any       | any                  | LOW     | MONITOR           |
    | SIMULATED     | any       | any                  | LOW     | MONITOR           |
    | UNKNOWN       | any       | any                  | LOW     | MONITOR           |
    | LIVE          | >= 8.0    | any                  | EXTREME | IMMEDIATE_RESPONSE|
    | LIVE          | >= 5.0    | any                  | HIGH    | URGENT            |
    | LIVE          | >= 2.0    | any                  | MEDIUM  | WATCH             |
    | LIVE          | < 2.0     | any                  | LOW     | MONITOR           |

    ReliefWeb alone never increases risk — it may only be listed in reasoning.
    """
    v_status  = str(state_data.get("verification_status", "UNKNOWN")).upper()
    severity  = float(state_data.get("severity", 0.0) or 0.0)
    confidence = float(state_data.get("confidence", 0.0) or 0.0)
    heavy_rain = _has_heavy_rain(state_data)
    rw_present = _has_reliefweb(state_data)

    reasoning: list[str] = [f"Verification status is {v_status}."]

    # ---- Non-LIVE statuses → maximum cap is MEDIUM, default LOW ----------
    if v_status in ("PREPAREDNESS", "HISTORICAL", "SIMULATED", "UNKNOWN"):
        reasoning.append(f"No confirmed active disaster (status={v_status}).")

        if v_status == "PREPAREDNESS" and 2.0 <= severity <= 4.0 and heavy_rain:
            risk, prio = "MEDIUM", "WATCH"
            reasoning.append(
                f"Elevated preparedness: severity={severity:.1f} with heavy precipitation detected."
            )
        else:
            risk, prio = "LOW", "MONITOR"
            reasoning.append(
                f"Severity={severity:.1f} with no confirmed disaster → LOW risk."
            )

        if rw_present:
            reasoning.append(
                "ReliefWeb context present for situational awareness; not used to escalate risk."
            )

        return risk, prio, reasoning

    # ---- LIVE status → full severity-driven table -----------------------
    reasoning.append("Disaster is LIVE — applying severity-based decision table.")

    if severity >= 8.0:
        risk, prio = "EXTREME", "IMMEDIATE_RESPONSE"
        reasoning.append(f"Severity {severity:.1f} ≥ 8.0 → EXTREME / IMMEDIATE_RESPONSE.")
    elif severity >= 5.0:
        risk, prio = "HIGH", "URGENT"
        reasoning.append(f"Severity {severity:.1f} ≥ 5.0 → HIGH / URGENT.")
    elif severity >= 2.0:
        risk, prio = "MEDIUM", "WATCH"
        reasoning.append(f"Severity {severity:.1f} ≥ 2.0 → MEDIUM / WATCH.")
    else:
        risk, prio = "LOW", "MONITOR"
        reasoning.append(f"Severity {severity:.1f} < 2.0 → LOW / MONITOR.")

    if heavy_rain:
        reasoning.append("Heavy precipitation detected — reinforces current risk level.")
    if rw_present:
        reasoning.append("ReliefWeb evidence available for context; did not alter computed risk.")

    return risk, prio, reasoning


# ---------------------------------------------------------------------------
# Confidence computation (evidence-based, deterministic)
# ---------------------------------------------------------------------------

def _compute_confidence(state_data: dict) -> float:
    """Return a confidence score bounded strictly by evidence quality."""
    v_status = str(state_data.get("verification_status", "UNKNOWN")).upper()

    has_live_api   = bool(
        state_data.get("weather_summary")
        or float(state_data.get("severity", 0.0) or 0.0) > 0.0
    )
    has_historical = "historical_context" in state_data
    has_reliefweb  = _has_reliefweb(state_data)

    if v_status == "LIVE" and has_live_api:
        return 0.90
    if v_status == "PREPAREDNESS" and has_live_api:
        return 0.60
    if has_historical:
        return 0.50
    if has_reliefweb:
        return 0.40
    if v_status == "SIMULATED":
        return 0.30
    return 0.20     # UNKNOWN or no evidence


# ---------------------------------------------------------------------------
# LLM explanation (non-authoritative — explains only, never overrides)
# ---------------------------------------------------------------------------

_EXPLANATION_PROMPT = """\
You are an AI assistant that explains disaster risk assessments.

The risk assessment system has already made a deterministic decision:
  Risk Level       : {risk_level}
  Priority         : {priority}
  Verification     : {v_status}
  Severity Score   : {severity}
  Confidence       : {confidence:.0%}
  Decision Reasons : {reasons}

Your task: Write 2–4 concise bullet-point explanations of WHY this risk level was chosen.
You MUST NOT change the risk level, priority, or confidence.
You MUST NOT mention any risk level other than "{risk_level}".
Return ONLY a JSON array of strings. Example:
["Reason one.", "Reason two.", "Reason three."]
"""


def _get_llm_explanation(
    risk_level: str,
    priority: str,
    v_status: str,
    severity: float,
    confidence: float,
    deterministic_reasons: list[str],
) -> list[str]:
    """Ask the LLM to narrate the already-determined risk in plain language."""
    prompt = _EXPLANATION_PROMPT.format(
        risk_level=risk_level,
        priority=priority,
        v_status=v_status,
        severity=severity,
        confidence=confidence,
        reasons="; ".join(deterministic_reasons),
    )
    try:
        raw = llm_manager.invoke(prompt, temperature=0.0, require_json=True)
        parsed = parse_strict_json(raw)
        if isinstance(parsed, list) and all(isinstance(r, str) for r in parsed):
            return parsed
        # Some models wrap the array in a dict key
        if isinstance(parsed, dict):
            for v in parsed.values():
                if isinstance(v, list):
                    return [str(x) for x in v]
    except (LLMServiceError, Exception) as e:
        app_logger.warning(f"Risk Assessment: LLM explanation failed: {e}")
    # Graceful degradation — return the deterministic reasons verbatim
    return deterministic_reasons


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def assess_risk(state_data: dict) -> dict:
    """
    Runs the Risk Assessment Decision Engine.

    Returns:
        dict with strict schema:
          risk_level, priority, confidence, reasoning (list),
          verification_status, supporting_evidence, recommended_actions
    """
    app_logger.info("Risk Assessment Agent: Starting risk assessment...")
    execution_logger.log_agent_execution(
        "Risk Assessment Agent", "STARTING", "Assessing risk from aggregated data."
    )

    v_status  = str(state_data.get("verification_status", "UNKNOWN")).upper()
    severity  = float(state_data.get("severity", 0.0) or 0.0)

    # 1. Deterministic decision — always runs, never fails
    risk_level, priority, det_reasons = _compute_risk(state_data)

    # 2. Deterministic confidence
    confidence = _compute_confidence(state_data)

    # 3. LLM provides human-readable explanation (cannot change the decision)
    app_logger.info("Risk Assessment Agent: Requesting LLM explanation...")
    llm_reasons = _get_llm_explanation(
        risk_level, priority, v_status, severity, confidence, det_reasons
    )

    # 4. Build recommended actions from the deterministic result
    recommended_actions = _recommended_actions(risk_level, v_status)

    result = {
        "risk_level":          risk_level,
        "priority":            priority,
        "confidence":          round(confidence, 3),
        "reasoning":           llm_reasons,
        "verification_status": v_status,
        "supporting_evidence": [],   # populated by upstream coordinator
        "recommended_actions": recommended_actions,
    }

    execution_logger.log_agent_execution(
        "Risk Assessment Agent", "COMPLETED",
        f"Risk: {risk_level}, Priority: {priority}"
    )
    app_logger.info(
        f"Risk Assessment Agent: DETERMINISTIC result → {risk_level} / {priority} "
        f"(conf={confidence:.2f}, status={v_status}, severity={severity})"
    )
    return result


# ---------------------------------------------------------------------------
# Recommended actions lookup (deterministic)
# ---------------------------------------------------------------------------

def _recommended_actions(risk_level: str, v_status: str) -> list[str]:
    if v_status not in ("LIVE",) or risk_level == "LOW":
        return [
            "Monitor weather and official alerts.",
            "Keep emergency supplies ready.",
            "Review NDMA preparedness SOPs.",
        ]
    if risk_level == "MEDIUM":
        return [
            "Activate local emergency response teams.",
            "Prepare evacuation routes.",
            "Pre-position relief supplies.",
        ]
    if risk_level == "HIGH":
        return [
            "Initiate evacuation of at-risk populations.",
            "Deploy NDRF teams to affected area.",
            "Open emergency shelters immediately.",
            "Coordinate with hospitals for surge capacity.",
        ]
    # EXTREME
    return [
        "Issue immediate evacuation orders.",
        "Request national disaster response forces.",
        "Activate all emergency operations centres.",
        "Coordinate aerial rescue if ground routes blocked.",
        "Mobilise all available medical resources.",
    ]
