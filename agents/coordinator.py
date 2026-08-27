"""
AapdaSetu - Central Coordinator Agent (LangGraph Workflow)
==============================================================
Builds and compiles the core multi-agent state machine. Defines node logic,
conditional classification edges, and coordinates the processing pipeline.
"""

from typing import TypedDict, List, Dict, Any, Optional
from uuid import UUID, uuid4
import json
from langgraph.graph import StateGraph, START, END
from web3 import Web3

from backend.config import app_logger
from tools.geocoder_tool import geocode_location
from agents.flood_agent import analyze_flood
from agents.earthquake_agent import analyze_earthquake
from agents.resource_agent import allocate_resources
from agents.rag_agent import generate_advisory
from agents.risk_assessment_agent import assess_risk
from agents.mission_planner_agent import plan_missions
from services.budget_service import calculate_budget
from services.blockchain_service import submit_to_blockchain
from agents.intent_parser import parse_intent
from services.optimization import StateSanitizer


class DisasterState(TypedDict, total=False):
    """Shared state dictionary representing variables compiled through the LangGraph pipeline."""
    disaster_id: UUID
    query: str
    intents: List[str]
    time_context: str
    required_agents: List[str]
    completed_agents: List[str]
    
    raw_location: str
    description: str
    event_type: str  # "flood" or "earthquake"
    latitude: float
    longitude: float
    
    # Analysis outputs
    severity: float
    analysis_summary: str
    
    # Logistics outputs
    hospital_count: int
    shelter_count: int
    safe_route_available: bool
    required_supplies: List[str]
    emergency_contacts: Dict[str, str]
    
    # Grounded compliance advisory
    government_advisory: str
    rag_evidence: list
    reliefweb_evidence: dict
    
    # New AI and Services Outputs
    risk_assessment: dict
    mission_count: int
    budget: dict
    blockchain: dict
    
    # Missing Resource Agent & Mission Planner keys required by LangGraph state
    nearby_hospitals: list
    nearby_shelters: list
    safe_route: str
    planner_status: str
    mission_mode: str
    preparedness_tasks: list
    mission_summary: str
    missions: list
    
    # Verification & Hallucination Prevention
    event_confirmed: bool
    verification_status: str
    evidence_tracking: list


# Node 1: Classification & Geocoding Node
def classify_and_geocode_node(state: DisasterState) -> DisasterState:
    app_logger.info("LangGraph Node: Starting Classify and Geocode Node...")
    # 1. Geocode location
    geo_res = geocode_location(state.get("raw_location", ""))
    lat = geo_res["latitude"]
    lon = geo_res["longitude"]
    
    completed = state.get("completed_agents", []) + ["classify_and_geocode"]
    
    return {
        **state,
        "latitude": lat,
        "longitude": lon,
        "completed_agents": completed
    }


# Node 2A: Flood Analysis Node
def analyze_flood_node(state: DisasterState) -> DisasterState:
    app_logger.info("LangGraph Node: Invoking Flood Agent Node...")
    res = analyze_flood(
        location=state.get("raw_location", ""),
        lat=state.get("latitude", 0.0),
        lon=state.get("longitude", 0.0),
        description=state.get("query", "")
    )
    completed = state.get("completed_agents", []) + ["analyze_flood"]
    
    evidence = state.get("evidence_tracking", [])
    evidence.append({
        "agent": "analyze_flood",
        "api_source": res.get("api_source", "unknown"),
        "timestamp": __import__('datetime').datetime.utcnow().isoformat(),
        "confidence": res.get("confidence", 0.0),
        "verification_status": res.get("verification_status", "SIMULATION")
    })
    
    return {
        **state,
        "severity": res.get("severity_score", 5.0),
        "analysis_summary": res.get("analysis_summary", "Flood assessment completed."),
        "event_confirmed": res.get("event_confirmed", False),
        "verification_status": res.get("verification_status", "SIMULATION"),
        "evidence_tracking": evidence,
        "completed_agents": completed
    }


# Node 2B: Earthquake Analysis Node
def analyze_earthquake_node(state: DisasterState) -> DisasterState:
    app_logger.info("LangGraph Node: Invoking Earthquake Agent Node...")
    res = analyze_earthquake(
        location=state.get("raw_location", ""),
        lat=state.get("latitude", 0.0),
        lon=state.get("longitude", 0.0),
        description=state.get("query", "")
    )
    completed = state.get("completed_agents", []) + ["analyze_earthquake"]
    
    evidence = state.get("evidence_tracking", [])
    evidence.append({
        "agent": "analyze_earthquake",
        "api_source": res.get("api_source", "unknown"),
        "timestamp": __import__('datetime').datetime.utcnow().isoformat(),
        "confidence": res.get("confidence", 0.0),
        "verification_status": res.get("verification_status", "SIMULATION")
    })
    
    return {
        **state,
        "severity": res.get("severity_score", 5.0),
        "analysis_summary": res.get("analysis_summary", "Seismic hazard assessment completed."),
        "event_confirmed": res.get("event_confirmed", False),
        "verification_status": res.get("verification_status", "SIMULATION"),
        "evidence_tracking": evidence,
        "completed_agents": completed
    }


# Node 3: Resource Allocation Node
def allocate_resources_node(state: DisasterState) -> DisasterState:
    app_logger.info("LangGraph Node: Invoking Resource Agent Node...")
    res = allocate_resources(
        location=state.get("raw_location", ""),
        lat=state.get("latitude", 0.0),
        lon=state.get("longitude", 0.0),
        disaster_type=state.get("event_type", "disaster"),
        severity=state.get("severity", 5.0),
        verification_status=state.get("verification_status", "LIVE"),
        event_confirmed=state.get("event_confirmed", False)
    )
    completed = state.get("completed_agents", []) + ["allocate_resources"]
    return {
        **state,
        "nearby_shelters": res.get("nearby_shelters", []),
        "nearby_hospitals": res.get("nearby_hospitals", []),
        "safe_route": res.get("safe_route", "Direct route open."),
        "required_supplies": res.get("required_supplies", []),
        "emergency_contacts": res.get("emergency_contacts", {}),
        "completed_agents": completed
    }


# Node 4: RAG Advisory Node
def generate_advisory_node(state: DisasterState) -> DisasterState:
    app_logger.info("LangGraph Node: Invoking RAG Agent Node...")
    advisory, rag_evidence = generate_advisory(
        location=state.get("raw_location", ""),
        disaster_type=state.get("event_type", ""),
        severity=state.get("severity", 5.0),
        description=state.get("query", ""),
        event_confirmed=state.get("event_confirmed", False),
        verification_status=state.get("verification_status", "LIVE")
    )
    completed = state.get("completed_agents", []) + ["generate_advisory"]
    return {
        **state,
        "government_advisory": advisory,
        "rag_evidence": rag_evidence,
        "completed_agents": completed
    }


from tools.reliefweb_tool import search_relief_reports

# Node 5: Risk Assessment Node
def assess_risk_node(state: DisasterState) -> DisasterState:
    app_logger.info("LangGraph Node: Invoking Risk Assessment Node...")
    
    # Fetch ReliefWeb reports before assessing risk
    query = state.get("event_type", "disaster")
    app_logger.info(f"LangGraph Node: Fetching ReliefWeb reports for '{query}'...")
    rw_reports = search_relief_reports(query=query, limit=1)
    state["reliefweb_evidence"] = rw_reports
    
    risk = assess_risk(state)
    completed = state.get("completed_agents", []) + ["assess_risk"]
    return {
        **state,
        "reliefweb_evidence": rw_reports,
        "risk_assessment": risk,
        "completed_agents": completed
    }


# Node 6: Mission Planner Node
def plan_missions_node(state: DisasterState) -> DisasterState:
    app_logger.info("LangGraph Node: Invoking Mission Planner Node...")
    # plan_missions mutates state (its first arg) in-place to write:
    #   planner_status, mission_mode, preparedness_tasks, mission_summary
    # We must propagate all of these explicitly in the returned state so
    # LangGraph correctly merges them into the shared state dict.
    missions = plan_missions(state, state.get("risk_assessment", {}))
    completed = state.get("completed_agents", []) + ["plan_missions"]
    return {
        **state,
        "missions":           missions.get("mission_queue", []),
        # Planner keys written by plan_missions() into state (in-place)
        "planner_status":     state.get("planner_status", "SUCCESS"),
        "mission_mode":       state.get("mission_mode", "PREPAREDNESS"),
        "preparedness_tasks": state.get("preparedness_tasks", []),
        "mission_summary":    state.get("mission_summary", ""),
        "completed_agents":   completed,
    }


# Node 7: Budget Recommendation Service Node
def calculate_budget_node(state: DisasterState) -> DisasterState:
    app_logger.info("LangGraph Node: Invoking Budget Service Node...")

    # Non-LIVE events have no authorized emergency expenditure.
    # Return a zero budget so the report is internally consistent:
    #   PREPAREDNESS → risk LOW → budget ₹0 → blockchain SKIPPED.
    verification_status = state.get("verification_status", "SIMULATION")
    if verification_status != "LIVE":
        app_logger.info(
            f"Budget Node: Zero budget returned for non-LIVE event (status={verification_status})."
        )
        completed = state.get("completed_agents", []) + ["calculate_budget"]
        return {
            **state,
            "budget": {
                "recommended_budget": 0,
                "confidence_score": 0,
                "budget_breakdown": {},
                "justification": (
                    f"No emergency budget allocated. Event verification status is "
                    f"'{verification_status}', not LIVE. Preparedness activities use "
                    f"existing operational budgets."
                ),
            },
            "completed_agents": completed,
        }

    risk_level = (state.get("risk_assessment") or {}).get("risk_level", "MEDIUM")
    severity = float(state.get("severity", 5.0))
    hospitals = len(state.get("nearby_hospitals", []))
    shelters = len(state.get("nearby_shelters", []))

    missions_count = len(state.get("missions", []))

    route_distance_km = 0.0
    safe_route = state.get("safe_route", {})
    if isinstance(safe_route, dict) and "distance_km" in safe_route:
        route_distance_km = safe_route.get("distance_km", 0.0)

    budget = calculate_budget(
        risk_level=risk_level,
        severity=severity,
        population=0,
        hospitals_count=hospitals,
        shelters_count=shelters,
        mission_count=missions_count,
        route_distance_km=route_distance_km
    )
    completed = state.get("completed_agents", []) + ["calculate_budget"]
    return {
        **state,
        "budget": budget,
        "completed_agents": completed
    }


# Node 8: Blockchain Interface Node
def blockchain_node(state: DisasterState) -> DisasterState:
    app_logger.info("LangGraph Node: Invoking Blockchain Node...")

    # Deterministic gate — bypass entirely for non-LIVE events.
    # Return the canonical SKIPPED schema so reports_service can render it.
    verification_status = state.get("verification_status", "SIMULATION")
    if verification_status != "LIVE":
        app_logger.info(
            f"Blockchain Node: SKIPPED — verification_status is '{verification_status}' (not LIVE)."
        )
        completed = state.get("completed_agents", []) + ["blockchain"]
        return {
            **state,
            "blockchain": {
                # Strict schema — reports_service checks blockchain_status first
                "blockchain_status":     "SKIPPED",
                "status":               "SKIPPED",
                "reason":               "Event Not Confirmed",
                "transaction_hash":     None,
                "gas_used":             0,
                "block_number":         0,
                "explorer_url":         "",
                "timestamp":            "",
                "error":                "Event Not Confirmed",
            },
            "completed_agents": completed
        }

    try:
        risk = state.get("risk_assessment", {}) or {}
        budget = state.get("budget", {}) or {}

        # Canonical AI decision payload — hashed for on-chain integrity verification.
        # Anyone can recompute keccak256(canonical_json) and compare with the chain.
        decision_record = {
            "disaster_id": str(state.get("disaster_id", "")),
            "event_type": state.get("event_type", ""),
            "risk_assessment": risk,
            "missions": state.get("missions", []),
            "budget": budget,
        }
        canonical_json = json.dumps(decision_record, sort_keys=True, separators=(",", ":"), default=str)
        ai_decision_hash = Web3.keccak(text=canonical_json).hex()

        # Contract expects confidence 0-100; risk agent produces 0.0-1.0
        confidence = risk.get("confidence", 0)
        if isinstance(confidence, float) and confidence <= 1.0:
            confidence = round(confidence * 100)

        # Contract expects severity 1-5; pipeline severity is a 0-10 score
        severity_10 = float(state.get("severity", 5.0))
        severity_5 = max(1, min(5, round(severity_10 / 2)))

        payload = {
            "disaster_id": str(state.get("disaster_id", "")),
            "location": state.get("raw_location", "Unknown"),
            "disaster_severity": severity_5,
            "confidence_score": confidence,
            "recommended_amount": int(budget.get("recommended_budget", 0)),
            "ai_decision_hash": ai_decision_hash,
            "metadata_uri": f"aapdasetu://disaster/{state.get('disaster_id', '')}",
            # Explicit verification gate — blockchain_service reads this directly
            "verification_status": state.get("verification_status", "UNKNOWN"),
        }

        tx = submit_to_blockchain(payload)
        tx["ai_decision_hash"] = ai_decision_hash
    except Exception as e:
        # Blockchain is an audit layer — never let it break the relief plan
        app_logger.error(f"Blockchain node failed (continuing pipeline): {e}", exc_info=True)
        tx = {
            "transaction_hash": "N/A",
            "status": "ERROR",
            "block_number": 0,
            "explorer_url": "",
            "timestamp": "",
            "error": str(e)
        }

    completed = state.get("completed_agents", []) + ["blockchain"]
    return {
        **state,
        "blockchain": tx,
        "completed_agents": completed
    }


def router_node(state: DisasterState) -> DisasterState:
    """Hub node that simply passes state through."""
    return state


# Dependency order for execution
DEPENDENCY_ORDER = [
    "classify_and_geocode",
    "analyze_flood",
    "analyze_earthquake",
    "allocate_resources",
    "generate_advisory",
    "assess_risk",
    "plan_missions",
    "calculate_budget",
    "blockchain"
]

def route_from_router(state: DisasterState) -> str:
    """Routes to the next required agent that hasn't been completed yet.

    NOTE: plan_missions, calculate_budget, and blockchain are NOT skipped here
    for non-LIVE events — each of those nodes handles the non-LIVE case
    internally and returns deterministic safe defaults (PREPAREDNESS tasks,
    zero budget, SKIPPED blockchain).  Skipping them at the router level
    causes the state to be missing those keys entirely, which breaks reports.
    """
    required = state.get("required_agents", [])
    completed = state.get("completed_agents", [])

    for agent in DEPENDENCY_ORDER:
        if agent in required and agent not in completed:
            app_logger.info(f"Router directing to: {agent}")
            return agent

    app_logger.info("Router directing to: END")
    return "__end__"


def build_disaster_graph():
    """Builds and compiles the orchestrating StateGraph."""
    workflow = StateGraph(DisasterState)
    
    # 1. Register nodes
    workflow.add_node("router", router_node)
    workflow.add_node("classify_and_geocode", classify_and_geocode_node)
    workflow.add_node("analyze_flood", analyze_flood_node)
    workflow.add_node("analyze_earthquake", analyze_earthquake_node)
    workflow.add_node("allocate_resources", allocate_resources_node)
    workflow.add_node("generate_advisory", generate_advisory_node)
    workflow.add_node("assess_risk", assess_risk_node)
    workflow.add_node("plan_missions", plan_missions_node)
    workflow.add_node("calculate_budget", calculate_budget_node)
    workflow.add_node("blockchain", blockchain_node)
    
    # 2. Wire connections
    workflow.set_entry_point("router")
    
    workflow.add_conditional_edges(
        "router",
        route_from_router,
        {
            "classify_and_geocode": "classify_and_geocode",
            "analyze_flood": "analyze_flood",
            "analyze_earthquake": "analyze_earthquake",
            "allocate_resources": "allocate_resources",
            "generate_advisory": "generate_advisory",
            "assess_risk": "assess_risk",
            "plan_missions": "plan_missions",
            "calculate_budget": "calculate_budget",
            "blockchain": "blockchain",
            "__end__": END
        }
    )
    
    # All agents route back to router when done
    for agent in DEPENDENCY_ORDER:
        workflow.add_edge(agent, "router")
    
    # 3. Compile
    return workflow.compile()


# Singleton compiled graph client
relief_graph = build_disaster_graph()


def execute_pipeline(query: str) -> dict:
    """
    Synchronous interface running the compiled LangGraph flow based on NLP intent.
    
    Returns:
        dict: The final converged state dictionary or an error dictionary.
    """
    app_logger.info(f"LangGraph: Parsing user query: {query}")
    parsed = parse_intent(query)
    
    location = parsed.get("location")
    disaster = parsed.get("disaster")
    
    if not location:
        return {
            "error": "Missing Location",
            "message": "Could you please specify the location you are inquiring about?"
        }
        
    if not disaster or disaster.lower() not in ["flood", "earthquake"]:
        return {
            "error": "Missing/Unknown Disaster",
            "message": "I couldn't detect a supported disaster type (like Flood or Earthquake). Could you please specify?"
        }

    # Determine required agents based on intents
    intents_list = parsed.get("intents", ["General"])
    disaster = disaster.lower()
    
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
            # Report usually requires everything
            required_agents.extend([
                analysis_agent, 
                "allocate_resources", 
                "generate_advisory", 
                "assess_risk", 
                "plan_missions", 
                "calculate_budget", 
                "blockchain"
            ])
        else:
            # General query defaults to running everything applicable
            required_agents.extend([
                analysis_agent, 
                "allocate_resources", 
                "generate_advisory", 
                "assess_risk", 
                "plan_missions", 
                "calculate_budget", 
                "blockchain"
            ])
            
    # Deduplicate while preserving order logic will be handled by the router dependency list
    required_agents = list(set(required_agents))

    initial_state = {
        "disaster_id": uuid4(),
        "query": query,
        "raw_location": location,
        "event_type": disaster,
        "intents": intents_list,
        "time_context": parsed.get("time_context", "Current"),
        "required_agents": required_agents,
        "completed_agents": [],
        "evidence_tracking": []
    }
    
    app_logger.info(f"LangGraph: Starting pipeline execution for tracking ID={initial_state['disaster_id']}")
    app_logger.info(f"Required Agents identified: {required_agents}")
    final_state = relief_graph.invoke(initial_state)
    app_logger.info("LangGraph: Pipeline execution completed successfully.")
    
    return final_state

def format_disaster_report(state: dict) -> str:
    """
    Formats the final state dictionary into a structured markdown report.
    Delegates to the professional Disaster Intelligence Report service.
    """
    if "error" in state:
        return f"\n{state['message']}\n"
        
    from services.reports_service import generate_reports
    reports = generate_reports(state)
    return reports.get("government_report", "Report generation failed.")
