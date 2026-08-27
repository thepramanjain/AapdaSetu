"""
AapdaSetu - Pipeline SSE Streaming Endpoint
============================================
Exposes a Server-Sent Events (SSE) endpoint that executes the LangGraph
multi-agent pipeline node-by-node and streams live progress events to the
frontend as each agent completes.
"""

import json
import time
from uuid import uuid4
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from fastapi import Depends

from backend.config import app_logger
from backend.database import get_db
from backend.models import DisasterEvent
from agents.intent_parser import parse_intent
from agents.coordinator import (
    DEPENDENCY_ORDER,
    classify_and_geocode_node,
    analyze_flood_node,
    analyze_earthquake_node,
    allocate_resources_node,
    generate_advisory_node,
    assess_risk_node,
    plan_missions_node,
    calculate_budget_node,
    blockchain_node,
)
from services.optimization import StateSanitizer

router = APIRouter(tags=["Pipeline Streaming"])

# Map node names to their callable functions
NODE_FUNCTIONS = {
    "classify_and_geocode": classify_and_geocode_node,
    "analyze_flood": analyze_flood_node,
    "analyze_earthquake": analyze_earthquake_node,
    "allocate_resources": allocate_resources_node,
    "generate_advisory": generate_advisory_node,
    "assess_risk": assess_risk_node,
    "plan_missions": plan_missions_node,
    "calculate_budget": calculate_budget_node,
    "blockchain": blockchain_node,
}

# Human-readable display names for the frontend
NODE_DISPLAY_NAMES = {
    "classify_and_geocode": "Intent Parser & Geocoder",
    "analyze_flood": "Flood Intelligence Agent",
    "analyze_earthquake": "Earthquake Intelligence Agent",
    "allocate_resources": "Resource Allocation Agent",
    "generate_advisory": "RAG Advisory Agent",
    "assess_risk": "Risk Assessment Agent",
    "plan_missions": "Mission Planner Agent",
    "calculate_budget": "Budget Service",
    "blockchain": "Blockchain Oracle",
}


class StreamAnalyzeRequest(BaseModel):
    query: str = Field(..., description="Natural language disaster query")


def _make_sse(event_type: str, data: dict) -> str:
    """Format a single SSE message."""
    payload = json.dumps(data, default=str)
    return f"event: {event_type}\ndata: {payload}\n\n"


def _run_pipeline_streaming(query: str, db: Session):
    """
    Generator that executes the LangGraph pipeline node-by-node,
    yielding SSE events after each node completes.
    """
    # --- Step 1: Parse intent ---
    app_logger.info(f"[SSE] Parsing intent for query: {query}")
    parsed = parse_intent(query)

    location = parsed.get("location")
    disaster = parsed.get("disaster")

    if not location:
        yield _make_sse("error", {
            "error": "Missing Location",
            "message": "Could not detect a location. Please specify."
        })
        return

    if not disaster or disaster.lower() not in ["flood", "earthquake"]:
        yield _make_sse("error", {
            "error": "Missing/Unknown Disaster",
            "message": "Could not detect a supported disaster type (Flood or Earthquake). Please specify."
        })
        return

    disaster = disaster.lower()
    intents_list = parsed.get("intents", ["General"])

    # Determine required agents (same logic as execute_pipeline)
    required_agents = ["classify_and_geocode"]
    analysis_agent = f"analyze_{disaster}"

    for intent_str in intents_list:
        intent = intent_str.lower()
        if "resource" in intent:
            required_agents.extend([analysis_agent, "allocate_resources"])
        elif "risk" in intent:
            required_agents.extend([analysis_agent, "allocate_resources", "assess_risk"])
        elif "mission" in intent:
            required_agents.extend([analysis_agent, "allocate_resources", "assess_risk", "plan_missions"])
        elif "budget" in intent:
            required_agents.extend([analysis_agent, "allocate_resources", "assess_risk", "plan_missions", "calculate_budget"])
        elif "report" in intent:
            required_agents.extend([
                analysis_agent, "allocate_resources", "generate_advisory",
                "assess_risk", "plan_missions", "calculate_budget", "blockchain"
            ])
        else:
            required_agents.extend([
                analysis_agent, "allocate_resources", "generate_advisory",
                "assess_risk", "plan_missions", "calculate_budget", "blockchain"
            ])

    required_agents = list(dict.fromkeys(required_agents))  # deduplicate preserving order

    # Filter to only agents in DEPENDENCY_ORDER that are required
    execution_order = [a for a in DEPENDENCY_ORDER if a in required_agents]

    # --- Step 2: Send pipeline_start event ---
    yield _make_sse("pipeline_start", {
        "agents": [
            {"id": a, "display_name": NODE_DISPLAY_NAMES.get(a, a)}
            for a in execution_order
        ],
        "query": query,
        "disaster_type": disaster,
        "location": location,
    })

    # --- Step 3: Build initial state ---
    state = {
        "disaster_id": uuid4(),
        "query": query,
        "raw_location": location,
        "event_type": disaster,
        "intents": intents_list,
        "time_context": parsed.get("time_context", "Current"),
        "required_agents": required_agents,
        "completed_agents": [],
        "evidence_tracking": [],
    }

    # --- Step 4: Execute each node and stream progress ---
    for node_name in execution_order:
        node_fn = NODE_FUNCTIONS.get(node_name)
        if not node_fn:
            continue

        display = NODE_DISPLAY_NAMES.get(node_name, node_name)

        # Emit "running" event
        yield _make_sse("agent_status", {
            "agent": node_name,
            "display_name": display,
            "status": "running",
            "message": f"Executing {display}…",
        })

        # Execute the node
        start_time = time.time()
        try:
            state = node_fn(state)
            elapsed = round(time.time() - start_time, 2)

            # Build a summary message from the actual state changes
            summary = _build_node_summary(node_name, state, elapsed)

            # Emit "completed" event
            yield _make_sse("agent_status", {
                "agent": node_name,
                "display_name": display,
                "status": "completed",
                "message": summary,
                "elapsed_seconds": elapsed,
            })

        except Exception as e:
            app_logger.error(f"[SSE] Node {node_name} failed: {e}", exc_info=True)
            yield _make_sse("agent_status", {
                "agent": node_name,
                "display_name": display,
                "status": "error",
                "message": f"Error in {display}: {str(e)}",
            })
            # Continue pipeline — individual node failures shouldn't kill everything

    # --- Step 5: Build final response and send pipeline_complete ---
    try:
        final_response = {
            "disaster_id": str(state.get("disaster_id", "")),
            "event_type": state.get("event_type", ""),
            "location": state.get("raw_location", ""),
            "coordinates": {
                "latitude": state.get("latitude", 0.0),
                "longitude": state.get("longitude", 0.0),
            },
            "disaster_severity": state.get("severity", 0.0),
            "government_advisory": state.get("government_advisory", ""),
            "nearby_shelters": state.get("nearby_shelters", []),
            "nearby_hospitals": state.get("nearby_hospitals", []),
            "safe_route": state.get("safe_route", ""),
            "required_supplies": state.get("required_supplies", []),
            "emergency_contacts": state.get("emergency_contacts", {}),
            "risk_assessment": state.get("risk_assessment"),
            "missions": state.get("missions"),
            "budget": state.get("budget"),
            "blockchain": state.get("blockchain"),
            "verification_status": state.get("verification_status", "UNKNOWN"),
        }
        yield _make_sse("pipeline_complete", final_response)
        # --- Step 6: Save the results to the database ---
        try:
            from datetime import datetime, timezone
            from backend.models import DisasterEvent, FundRequest, BlockchainTransaction, SystemLog
            import uuid

            event_id = str(state.get("disaster_id", ""))
            v_status = state.get("verification_status", "UNKNOWN")
            status_val = "reported" if v_status == "LIVE" else "preparedness"

            # Determine severity string representation
            severity_num = state.get("severity", 0.0)
            if severity_num >= 9.0:
                severity_str_val = "critical"
            elif severity_num >= 7.0:
                severity_str_val = "high"
            elif severity_num >= 4.0:
                severity_str_val = "medium"
            else:
                severity_str_val = "low"

            event_record = DisasterEvent(
                id=event_id,
                name=f"{state.get('raw_location', 'Unknown')} Incident",
                event_type=state.get("event_type", ""),
                latitude=state.get("latitude", 0.0),
                longitude=state.get("longitude", 0.0),
                severity=severity_num,
                severity_str=severity_str_val,
                population=state.get("risk_assessment", {}).get("exposed_population", 120000) if state.get("risk_assessment") else 120000,
                state=state.get("raw_location", "").split(",")[-1].strip() if state.get("raw_location") else "Assam",
                status=status_val,
                verification_status=v_status,
                confidence=int(state.get("risk_assessment", {}).get("confidence", 0.9) * 100) if state.get("risk_assessment") else 90,
                risk_level=state.get("risk_assessment", {}).get("risk_level", "Medium") if state.get("risk_assessment") else "Medium",
                description=state.get("query", ""),
                relief_plan=final_response,
                report_markdown={
                    "government": f"# Government Incident Brief\n{state.get('government_advisory', '')}",
                    "ngo": f"# NGO Relief Instructions\n- **Required supplies:** {', '.join(state.get('required_supplies', []))}\n- **Risk assessment priority:** {state.get('risk_assessment', {}).get('priority', 'High') if state.get('risk_assessment') else 'High'}",
                    "public": f"# Public Safety Notice\n- **Safe Routes:** {state.get('safe_route', '')}\n- **Emergency Contacts:** {', '.join([f'{k}: {v}' for k, v in state.get('emergency_contacts', {}).items()])}"
                },
                mission_plan=[
                    {
                        "id": m.get("mission_id", f"m-{i}"),
                        "name": m.get("title", "Rescue Operation"),
                        "priority": m.get("priority", "Medium"),
                        "status": m.get("status", "Pending"),
                        "eta": m.get("estimated_duration", "N/A")
                    }
                    for i, m in enumerate(state.get("missions", []))
                ] if state.get("missions") else [],
                hospitals=[
                    {
                        "name": h.get("name", "Medical Clinic"),
                        "availability": f"Capacity: {h.get('capacity', 150) - h.get('occupied_beds', 0)} beds",
                        "distance": "Nearby",
                        "coordinates": [h.get("latitude", 0.0), h.get("longitude", 0.0)]
                    }
                    for h in state.get("nearby_hospitals", [])
                ] if state.get("nearby_hospitals") else [],
                shelters=[
                    {
                        "name": s.get("name", "Emergency Shelter"),
                        "availability": f"Slots open: {s.get('capacity', 200) - s.get('occupied', 0)}",
                        "distance": "Nearby",
                        "coordinates": [s.get("latitude", 0.0), s.get("longitude", 0.0)]
                    }
                    for s in state.get("nearby_shelters", [])
                ] if state.get("nearby_shelters") else [],
                reported_at=datetime.now(timezone.utc)
            )
            db.add(event_record)

            # Auto-initiate FundRequest if verification_status is LIVE and budget exists
            budget_data = state.get("budget")
            if v_status == "LIVE" and budget_data:
                amount = budget_data.get("recommended_budget", 0)
                if amount > 0:
                    fund_req = FundRequest(
                        id=f"req-{uuid.uuid4().hex[:8]}",
                        ngo="SEEDS Relief Organization",
                        amount=amount,
                        purpose=f"Execute evacuation and relief distribution in {state.get('raw_location', 'Assam')}.",
                        priority="High",
                        status="submitted",
                        required_resources=f"Trauma units, dry rations for {event_record.population} residents",
                        supporting_notes=f"Auto-generated from AI multi-agent budget recommendation: {budget_data.get('reasoning', '')}",
                        disaster_id=event_id,
                        disaster_name=event_record.name,
                        timestamp=datetime.now(timezone.utc)
                    )
                    db.add(fund_req)

            # Log BlockchainTransaction if hash exists
            blockchain_data = state.get("blockchain")
            if blockchain_data and blockchain_data.get("transaction_hash") and blockchain_data.get("transaction_hash") != "N/A":
                tx_hash = blockchain_data.get("transaction_hash")
                block_num = blockchain_data.get("block_number", 100000)
                bc_tx = BlockchainTransaction(
                    hash=tx_hash,
                    block=block_num,
                    timestamp=datetime.now(timezone.utc),
                    amount=budget_data.get("recommended_budget", 0) if budget_data else 0,
                    ngo="SEEDS Relief Organization",
                    purpose=f"On-chain signed relief fund commitment for {event_record.name}",
                    status="confirmed"
                )
                db.add(bc_tx)

            # Log system log
            log_entry = SystemLog(
                level="success",
                agent="System",
                message=f"Disaster incident {event_id} successfully parsed and stored in database."
            )
            db.add(log_entry)

            db.commit()
            app_logger.info(f"[SSE] Successfully saved DisasterEvent {event_id} and related requests to database.")

        except Exception as dberr:
            db.rollback()
            app_logger.error(f"[SSE] Failed to save DisasterEvent to database: {dberr}", exc_info=True)

        yield _make_sse("pipeline_complete", final_response)
    except Exception as e:
        app_logger.error(f"[SSE] Failed to serialize final state: {e}", exc_info=True)
        yield _make_sse("error", {"error": "Serialization Error", "message": str(e)})


def _build_node_summary(node_name: str, state: dict, elapsed: float) -> str:
    """Build a human-readable summary of what a node accomplished."""
    match node_name:
        case "classify_and_geocode":
            lat = state.get("latitude", 0)
            lon = state.get("longitude", 0)
            loc = state.get("raw_location", "Unknown")
            return f"Geocoded \"{loc}\" → ({lat:.4f}, {lon:.4f}) in {elapsed}s"

        case "analyze_flood":
            sev = state.get("severity", 0)
            verified = state.get("verification_status", "UNKNOWN")
            summary = state.get("analysis_summary", "")
            return f"Flood severity: {sev}/10 | Status: {verified} | {summary[:80]}"

        case "analyze_earthquake":
            sev = state.get("severity", 0)
            verified = state.get("verification_status", "UNKNOWN")
            summary = state.get("analysis_summary", "")
            return f"Earthquake severity: {sev}/10 | Status: {verified} | {summary[:80]}"

        case "allocate_resources":
            shelters = len(state.get("nearby_shelters", []))
            hospitals = len(state.get("nearby_hospitals", []))
            supplies = len(state.get("required_supplies", []))
            return f"Found {hospitals} hospitals, {shelters} shelters, {supplies} supply items"

        case "generate_advisory":
            adv = state.get("government_advisory", "")
            return f"RAG advisory generated ({len(adv)} chars) from NDMA/NDRF guidelines"

        case "assess_risk":
            risk = state.get("risk_assessment", {}) or {}
            level = risk.get("risk_level", "UNKNOWN")
            conf = risk.get("confidence", 0)
            return f"Risk level: {level} | Confidence: {conf}"

        case "plan_missions":
            missions = state.get("missions", [])
            mode = state.get("mission_mode", "UNKNOWN")
            return f"Planned {len(missions)} missions | Mode: {mode}"

        case "calculate_budget":
            budget = state.get("budget", {}) or {}
            amount = budget.get("recommended_budget", 0)
            return f"Recommended budget: ₹{amount:,.0f}"

        case "blockchain":
            bc = state.get("blockchain", {}) or {}
            status = bc.get("status", "UNKNOWN")
            tx = bc.get("transaction_hash", "N/A")
            if tx and tx != "N/A" and len(tx) > 15:
                tx = tx[:15] + "…"
            return f"Blockchain status: {status} | TX: {tx}"

        case _:
            return f"Completed in {elapsed}s"


@router.post("/analyze/stream")
async def stream_pipeline(payload: StreamAnalyzeRequest, db: Session = Depends(get_db)):
    """
    SSE streaming endpoint. Executes the LangGraph pipeline node-by-node
    and streams live progress events to the frontend.
    """
    app_logger.info(f"[SSE] Stream request received: '{payload.query}'")

    return StreamingResponse(
        _run_pipeline_streaming(payload.query, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
