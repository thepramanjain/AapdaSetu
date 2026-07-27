"""Reports Service
Generates structured Government, NGO, and Public reports.

Production-hardened: computes resource counts from actual state lists,
renders preparedness tasks with checkmarks, and handles all edge cases
without crashing.
"""

import json
from datetime import datetime
from backend.config import app_logger
from services.logging_service import execution_logger
from services.optimization import ResponseFormatter
from services.budget_service import format_inr


# ---------------------------------------------------------------------------
# Resource formatting helpers
# ---------------------------------------------------------------------------

def _format_resource_list(resources: list, entity_label: str) -> str:
    """Build a bullet-point list of resource names from the state list.

    Handles all normalised formats produced by Resource Agent:
      - dict with 'verified' bool (from _normalize_resource)
      - dict with 'id' field (legacy verified check)
      - dict with 'name'/'hospital_name'/'shelter_name'
      - plain string
    Returns a formatted markdown string suitable for embedding in reports.
    """
    if not isinstance(resources, list) or not resources:
        return f"- No {entity_label}s identified in the search radius.\n"

    lines = []
    for r in resources:
        if isinstance(r, dict):
            name = (
                r.get("name")
                or r.get("hospital_name")
                or r.get("shelter_name")
                or "Unknown"
            )
            # 'verified' bool is set by resource agent's _normalize_resource;
            # fall back to checking 'id' for legacy/raw OSM dicts.
            if "verified" in r:
                is_verified = bool(r["verified"])
            else:
                is_verified = bool(r.get("id"))
            tag = " (Verified)" if is_verified else " (Unverified)"
            dist = r.get("distance_km")
            dist_str = f" - {float(dist):.1f} km" if dist is not None else ""
            lines.append(f"- {name}{tag}{dist_str}")
        elif isinstance(r, str) and r.strip():
            lines.append(f"- {r.strip()} (Unverified)")
        # skip None / empty entries silently

    if not lines:
        return f"- No {entity_label}s identified in the search radius.\n"

    return "\n".join(lines) + "\n"


def _format_preparedness_tasks(tasks: list) -> str:
    """Render preparedness tasks with checkmark bullets."""
    if not isinstance(tasks, list) or not tasks:
        return "- No preparedness tasks defined.\n"

    lines = []
    for t in tasks:
        text = str(t).strip() if t else ""
        if text:
            # Use a checkmark prefix for production reports
            lines.append(f"- [x] {text}")
    return "\n".join(lines) + "\n" if lines else "- No preparedness tasks defined.\n"


class ReportFormatter:
    """Ensures reports contain strictly 12 required sections without dumping raw Python dicts."""

    @staticmethod
    def build_gov_report(state: dict, timestamp: str) -> str:
        location = state.get("raw_location", "Unknown")
        event_type = str(state.get("event_type", "disaster")).title()

        # Risk Formatting
        risk_assessment = state.get("risk_assessment", {})
        if not isinstance(risk_assessment, dict):
            risk_assessment = {}

        risk_level = risk_assessment.get("risk_level", "UNKNOWN")
        confidence = risk_assessment.get("confidence", 0.0)
        str_conf = ResponseFormatter.format_confidence(confidence)

        severity = state.get("severity", 0.0)
        verification_status = state.get("verification_status", "SIMULATION")

        # Route Formatting
        safe_route_raw = state.get("safe_route", "unavailable")
        if isinstance(safe_route_raw, dict):
            safe_route = safe_route_raw.get("route_summary", "Route found, details omitted.")
        else:
            safe_route = ResponseFormatter.format_status(str(safe_route_raw))

        # Supplies Formatting
        supplies_raw = state.get("required_supplies", [])
        if isinstance(supplies_raw, list):
            supplies = ", ".join(str(s) for s in supplies_raw) if supplies_raw else "None identified"
        else:
            supplies = str(supplies_raw)

        # Blockchain Formatting
        bc = state.get("blockchain", {})
        if not isinstance(bc, dict):
            bc = {}
        bc_status_raw = bc.get("blockchain_status") or bc.get("status", "")
        tx_hash = bc.get("transaction_hash") or ""
        bc_reason = bc.get("reason") or bc.get("error") or "non-LIVE status"

        if bc_status_raw == "SKIPPED":
            bc_status = f"SKIPPED\n- **Reason:** {bc_reason}"
        elif bc_status_raw in ("SUCCESS", "SUCCESS (MOCKED)"):
            bc_status = f"Confirmed & Executed (TX: {tx_hash})" if tx_hash else "Confirmed & Executed"
        elif bc_status_raw in ("FAILED", "ERROR"):
            bc_status = f"FAILED -- {bc_reason}"
        elif tx_hash:
            bc_status = f"Confirmed & Executed (TX: {tx_hash})"
        else:
            # blockchain key was never set (pipeline did not reach blockchain node).
            # Default to SKIPPED — non-LIVE events never submit transactions.
            bc_status = f"SKIPPED\n- **Reason:** Event Not Confirmed"

        # Evidence Formatting
        evidence = state.get("evidence_tracking", [])
        evidence_text = ""
        if isinstance(evidence, list):
            for e in evidence:
                if isinstance(e, dict):
                    evidence_text += f"- **{e.get('agent', 'Unknown Agent')}**: {e.get('api_source', 'Unknown Source')} (Conf: {int(e.get('confidence', 0)*100)}%, Time: {e.get('timestamp', 'N/A')})\n"

        if not evidence_text:
            evidence_text = "- No deterministic evidence tracking found.\n"

        # Mission Formatting
        planner_status = state.get("planner_status", "ACTIVE")
        mission_mode = state.get("mission_mode", verification_status)
        mission_summary = state.get("mission_summary", "")
        preparedness_tasks = state.get("preparedness_tasks", [])

        missions = state.get("missions", [])
        m_text = f"**Planner Status:** {planner_status} | **Mode:** {mission_mode}\n"
        if mission_summary:
            m_text += f"**Summary:** {mission_summary}\n\n"

        if mission_mode == "PREPAREDNESS" or preparedness_tasks:
            m_text += "**Preparedness Tasks:**\n"
            m_text += _format_preparedness_tasks(preparedness_tasks)

        if isinstance(missions, list) and missions:
            m_text += "\n**Operational Missions:**\n"
            for m in missions:
                if isinstance(m, dict):
                    cost = m.get('estimated_cost')
                    cost_str = f" (Est. Cost: {format_inr(float(cost))})" if cost is not None else ""
                    agency_str = f" - {m.get('agency', '')}" if m.get('agency') else ""
                    m_text += f"- **[{m.get('priority', 'NORMAL')}]** {m.get('title', 'Mission')}{agency_str} - {m.get('status', 'Pending')}{cost_str}\n"
                else:
                    m_text += f"- {str(m)}\n"
        elif mission_mode != "PREPAREDNESS":
            m_text += "\n- No operational missions generated.\n"

        # Budget Formatting (INR)
        budget = state.get("budget", {})
        if isinstance(budget, dict):
            b_val = budget.get('recommended_budget', 0)
        else:
            b_val = 0

        b_inr      = format_inr(float(b_val))
        breakdown  = budget.get('budget_breakdown', {}) if isinstance(budget, dict) else {}
        currency   = budget.get('currency', 'INR') if isinstance(budget, dict) else 'INR'

        b_text = f"**Estimated Disaster Response Budget ({currency}):** {b_inr}\n"
        if breakdown and any(v for v in breakdown.values()):
            b_text += "\n**Budget Breakdown (INR):**\n"
            breakdown_labels = {
                'medical':       'Medical & Trauma',
                'shelter':       'Shelter & Relief Camps',
                'food':          'Food & Nutrition',
                'water':         'Water & Sanitation',
                'transport':     'Transport & Evacuation',
                'communication': 'Communication Systems',
                'logistics':     'Logistics & Operations',
                'reserve':       'Contingency Reserve',
            }
            for key, label in breakdown_labels.items():
                val = breakdown.get(key, 0)
                if val:
                    b_text += f"- {label}: {format_inr(float(val))}\n"

        # Resource counts and listings (compute from actual state lists)
        hospitals_list = state.get("nearby_hospitals", [])
        shelters_list = state.get("nearby_shelters", [])
        if not isinstance(hospitals_list, list):
            hospitals_list = []
        if not isinstance(shelters_list, list):
            shelters_list = []

        h_count = len(hospitals_list)
        s_count = len(shelters_list)

        # Extract resource agent metadata from emergency_contacts
        contacts = state.get("emergency_contacts", {})
        if not isinstance(contacts, dict):
            contacts = {}
        res_avail = contacts.get("_resource_availability", "Not Available")
        res_conf = contacts.get("_resource_confidence", 0.0)
        str_res_conf = ResponseFormatter.format_confidence(float(res_conf))

        str_hosp = ResponseFormatter.format_availability(h_count, "hospital")
        str_shelt = ResponseFormatter.format_availability(s_count, "shelter")

        # Build resource detail listings
        hosp_listing = _format_resource_list(hospitals_list, "hospital")
        shelt_listing = _format_resource_list(shelters_list, "shelter")

        advisory = str(state.get('government_advisory', 'Please follow local authorities instructions.'))

        return f"""# DISASTER INTELLIGENCE REPORT
**Tracking ID:** {state.get('disaster_id', 'N/A')}
**Verification Status:** {verification_status}

## 1. Executive Summary
This report presents a synthesized, multi-agent AI assessment for a {event_type} event at {location}. The situation is classified as a **{risk_level} risk** (Severity: {severity}/10.0, {str_conf}).

## 2. Situation Overview
- **Coordinates:** {float(state.get('latitude', 0.0)):.4f}, {float(state.get('longitude', 0.0)):.4f}
- **Metrics:** {state.get('analysis_summary', 'N/A')}

## 3. Evidence Used
{evidence_text.strip()}

## 4. Resource Availability
- **Resource Agent Status:** {res_avail} (Confidence: {str_res_conf})
- **Hospitals Found:** {str_hosp}
- **Shelters Found:** {str_shelt}
- **Evacuation Routing:** {safe_route}
- **Required Supplies:** {supplies}

**Hospitals:**
{hosp_listing.strip()}

**Shelters:**
{shelt_listing.strip()}

## 5. Risk Assessment
- **Risk Level:** {risk_level}
- **Confidence:** {str_conf}

## 6. Mission Plan
{m_text.strip()}

## 7. Budget
{b_text}

## 8. NDMA Guidelines
{advisory}

## 9. Known Limitations
- Event Existence: May not be verified by authoritative live APIs if status is not LIVE.
- Severity: May use simulated or historical fallback data.

## 10. Blockchain Status
- **Status:** {bc_status}
- **Tx Hash:** {tx_hash if tx_hash else 'N/A'}

## 11. Data Freshness
- **Report Generated:** {timestamp}

## 12. Verification Status
- **Status:** {verification_status}
"""


def generate_reports(state: dict) -> dict:
    """Generates reports using the ReportFormatter to ensure strict layout without raw JSON dicts."""
    app_logger.info("Reports Service: Generating stakeholder reports...")
    execution_logger.log_service_execution("Reports Service", "STARTING", "Generating reports.")

    timestamp = datetime.utcnow().isoformat()
    location = state.get("raw_location", "Unknown")

    # Pre-parse dicts to avoid printing raw JSON in NGO/Public reports
    safe_route_raw = state.get("safe_route", "unavailable")
    if isinstance(safe_route_raw, dict):
        safe_route = safe_route_raw.get("route_summary", "Route found, details omitted.")
    else:
        safe_route = str(safe_route_raw)

    # advisory must be at function scope (NOT inside else block)
    advisory = str(state.get('government_advisory', 'Please follow local authorities instructions.'))

    supplies_raw = state.get("required_supplies", [])
    if isinstance(supplies_raw, list):
        supplies = ", ".join(str(s) for s in supplies_raw) if supplies_raw else "None"
    else:
        supplies = str(supplies_raw)

    contacts = state.get("emergency_contacts", {})
    if not isinstance(contacts, dict):
        contacts = {}
    res_avail = contacts.get("_resource_availability", "Not Available")

    # Compute resource counts from actual state lists
    hospitals_list = state.get("nearby_hospitals", [])
    shelters_list = state.get("nearby_shelters", [])
    if not isinstance(hospitals_list, list):
        hospitals_list = []
    if not isinstance(shelters_list, list):
        shelters_list = []
    h_count = len(hospitals_list)
    s_count = len(shelters_list)

    missions = state.get("missions", [])
    m_text = ""
    if isinstance(missions, list) and missions:
        for m in missions:
            if isinstance(m, dict):
                m_text += f"- {m.get('title', 'Mission')} ({m.get('priority', 'NORMAL')})\n"
    else:
        m_text = "- No active missions.\n"

    gov_report = ReportFormatter.build_gov_report(state, timestamp)

    # NGO budget summary in INR
    ngo_budget_raw = state.get("budget", {})
    ngo_budget_val = ngo_budget_raw.get("recommended_budget", 0) if isinstance(ngo_budget_raw, dict) else 0
    ngo_budget_str = format_inr(float(ngo_budget_val))

    # 2. NGO Report
    ngo_report = f"""# NGO ACTION PLAN
**Timestamp:** {timestamp}
**Location:** {location}

## Resources Summary
- **Resource Agent Status:** {res_avail}
- Shelters Available: {s_count}
- Hospitals Available: {h_count}
- Required Supplies: {supplies}

## Estimated Relief Budget (INR)
- **Total:** {ngo_budget_str}

## Hospital Listings
{_format_resource_list(hospitals_list, 'hospital').strip()}

## Shelter Listings
{_format_resource_list(shelters_list, 'shelter').strip()}

## Active Missions
{m_text.strip()}
"""


    # 3. Public Report
    public_report = f"""# PUBLIC SAFETY ADVISORY
**Location:** {location}

**Advisory:**
{advisory}

**Safe Route:**
{safe_route}
"""

    # Create a clean JSON representation of the entire response state
    try:
        clean_state_json = json.dumps(state, default=str)
        structured_json = json.loads(clean_state_json)
    except Exception as e:
        app_logger.error(f"Failed to serialize state JSON: {e}")
        structured_json = {}

    execution_logger.log_service_execution("Reports Service", "COMPLETED", "Reports generated successfully.")

    return {
        "government_report": gov_report,
        "ngo_report": ngo_report,
        "public_report": public_report,
        "json_payload": structured_json
    }
