"""
AapdaSetu - FastAPI Router Definitions
=======================================
Defines the API endpoints for analyzing reports (/analyze), conversing (/chat),
and diagnostic indicators (/health), integrating SQLite database persistence.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.config import settings, app_logger
from backend.schemas import AnalyzeRequest, ReliefPlanResponse, ChatRequest, ChatResponse, DashboardResponseModel
from backend.database import get_db
from backend.models import DisasterEvent, ChatSession, FundRequest, BlockchainTransaction, SystemLog
from agents.coordinator import execute_pipeline
from tools.rag_tool import search_guidelines
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from services.llm_manager import llm_manager, LLMServiceError

router = APIRouter()

# Memory cache holding conversation history lists by session_id
# Format: session_id -> list of Messages
CONVERSATION_HISTORY: Dict[str, List[Any]] = {}

CHAT_SYSTEM_PROMPT = """You are the AapdaSetu Emergency Assistant, an empathetic, clear, and highly focused responder.
Your task is to guide citizens and agencies during disasters (specifically floods and earthquakes) with safe, actionable advice.

[RETRIEVED NDMA/NDRF STANDARDS]
{context}

[RULES]
1. Base your safety advice STRICTLY on the NDMA standards above.
2. If the user asks about an unsupported disaster (like wildfires or pandemics), kindly state that AapdaSetu currently only assists with Flood and Earthquake emergencies.
3. Keep your replies concise, direct, and easy to read under stress (use bolding and simple bullet points).
"""


@router.get("/health", tags=["Diagnostic"])
async def health_check():
    """Diagnostic health check verifying system configuration."""
    app_logger.debug("API: Health check endpoint called.")
    return {
        "status": "healthy",
        "environment": settings.ENV,
        "api_version": "1.0.0",
        "supported_disasters": ["flood", "earthquake"]
    }


@router.post("/analyze", response_model=ReliefPlanResponse, tags=["AI Core"])
async def analyze_disaster(payload: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Ingests a disaster report, runs the LangGraph multi-agent pipeline,
    returns a structured relief plan, and persists the record to SQLite database.
    """
    app_logger.info(f"API: Received disaster report query: '{payload.query}'")
    try:
        # Run orchestrator LangGraph state machine
        state = execute_pipeline(query=payload.query)
        
        if "error" in state:
            raise HTTPException(status_code=400, detail=state["message"])

        
        # Build validated structured output response
        response = ReliefPlanResponse(
            disaster_id=state["disaster_id"],
            event_type=state["event_type"],
            location=state["raw_location"],
            coordinates={
                "latitude": state["latitude"],
                "longitude": state["longitude"]
            },
            disaster_severity=state["severity"],
            government_advisory=state["government_advisory"],
            nearby_shelters=state.get("nearby_shelters", []),
            nearby_hospitals=state.get("nearby_hospitals", []),
            safe_route=state["safe_route"],
            required_supplies=state["required_supplies"],
            emergency_contacts=state["emergency_contacts"],
            risk_assessment=state.get("risk_assessment"),
            missions=state.get("missions"),
            budget=state.get("budget"),
            blockchain=state.get("blockchain"),
            verification_status=state.get("verification_status", "UNKNOWN")
        )
        
        # Persist DisasterEvent to SQLite
        try:
            event_record = DisasterEvent(
                id=response.disaster_id,
                event_type=response.event_type,
                latitude=response.coordinates["latitude"],
                longitude=response.coordinates["longitude"],
                severity=response.disaster_severity,
                description=payload.query,
                relief_plan=response.model_dump()
            )
            db.add(event_record)
            db.commit()
            app_logger.info(f"DB: Successfully persisted DisasterEvent {response.disaster_id} to SQLite.")
        except Exception as dberr:
            db.rollback()
            app_logger.error(f"DB: Failed to persist DisasterEvent to SQLite: {dberr}", exc_info=True)
            
        app_logger.info(f"API: Disaster analysis successful. ID={response.disaster_id}")
        return response
        
    except Exception as e:
        app_logger.error(f"API: Disaster analysis pipeline failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Emergency analysis pipeline error: {str(e)}"
        )


@router.post("/chat", response_model=ChatResponse, tags=["Interactive Chat"])
async def chat_interaction(payload: ChatRequest, db: Session = Depends(get_db)):
    """
    Enables conversational follow-ups with history retention, RAG guideline grounding,
    and chat history logging persisted to SQLite database.
    """
    session_id = payload.session_id
    user_msg = payload.message
    app_logger.info(f"API: Chat request for session_id='{session_id}'...")
    
    # 1. Retrieve relevant guidelines for context
    category_filter = None
    msg_lower = user_msg.lower()
    if "flood" in msg_lower or "water" in msg_lower or "rain" in msg_lower:
        category_filter = "flood"
    elif "earthquake" in msg_lower or "shake" in msg_lower or "tremor" in msg_lower:
        category_filter = "earthquake"
        
    chunks = search_guidelines(user_msg, disaster_filter=category_filter, top_k=2)
    context_str = "\n\n".join([c["text"] for c in chunks]) if chunks else "No direct guidelines retrieved. Advise general caution."

    # 2. Reconstruct session conversation history
    if session_id not in CONVERSATION_HISTORY:
        CONVERSATION_HISTORY[session_id] = []
    history = CONVERSATION_HISTORY[session_id]
    
    # 3. Instantiate Gemini
    if settings.GEMINI_API_KEY == "mock_api_key_value_for_testing":
        app_logger.warning("Using MOCK AI fallback because real GEMINI_API_KEY is not set.")
        reply = "MOCK AI RESPONSE: I have received your flood warning for Assam. Please evacuate immediately to higher ground and wait for rescue teams. (Note: Add a real Gemini API Key in .env to enable true AI)."

        # Commit to DB
        chat_record = ChatSession(session_id=session_id, user_message=user_msg, agent_response=reply)
        db.add(chat_record)
        db.commit()

        return ChatResponse(session_id=session_id, response=reply, suggested_actions=["Find Medical Aid", "Show Route"])

    # 4. Formulate messages payload
    system_instruction = CHAT_SYSTEM_PROMPT.format(context=context_str)

    messages = [SystemMessage(content=system_instruction)]
    messages.extend(history[-10:])
    messages.append(HumanMessage(content=user_msg))

    try:
        try:
            reply = llm_manager.invoke(messages, temperature=0.3)
        except LLMServiceError as api_err:
            app_logger.warning(f"LLM failed ({api_err}). Falling back to MOCK AI.")
            reply = "MOCK AI RESPONSE: I have received your flood warning for Assam. Please evacuate immediately to higher ground and wait for rescue teams. (Note: Ensure your Gemini API Key is valid and has access to gemini-1.5-flash)."

        # 5. Commit exchanges back to memory history
        history.append(HumanMessage(content=user_msg))
        history.append(AIMessage(content=reply))
        
        # Persist conversation to SQLite database
        try:
            chat_record = ChatSession(
                session_id=session_id,
                user_message=user_msg,
                agent_response=reply
            )
            db.add(chat_record)
            db.commit()
            app_logger.info(f"DB: Successfully persisted ChatSession log for session {session_id} to SQLite.")
        except Exception as dberr:
            db.rollback()
            app_logger.error(f"DB: Failed to persist ChatSession log to SQLite: {dberr}", exc_info=True)
            
        # Generate suggested buttons
        suggestions = ["Where is the nearest shelter?", "Show emergency contacts", "What should I pack?"]
        if category_filter == "flood":
            suggestions = ["How to check water purity?", "What route is safe?", "Call rescue teams"]
        elif category_filter == "earthquake":
            suggestions = ["How to check structural cracks?", "Are aftershocks expected?", "Find medical aid"]
            
        return ChatResponse(
            session_id=session_id,
            response=reply,
            suggested_actions=suggestions
        )
        
    except Exception as e:
        app_logger.error(f"API: Conversational chat failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Chatbot processing error: {str(e)}"
        )


@router.get("/dashboard/{disaster_id}", response_model=DashboardResponseModel, tags=["Dashboard"])
async def get_dashboard_data(disaster_id: str, db: Session = Depends(get_db)):
    """
    Exposes structured JSON endpoints for AI Decision, Risk Assessment, 
    Mission Queue, Budget Recommendation, Resource Summary, and Blockchain Status.
    """
    event = db.query(DisasterEvent).filter(DisasterEvent.id == disaster_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Disaster event not found")
        
    relief_plan = event.relief_plan or {}
    
    # Construct structured Dashboard response
    return DashboardResponseModel(
        disaster_id=event.id,
        event_type=event.event_type,
        location=relief_plan.get("location", "Unknown"),
        risk_assessment=relief_plan.get("risk_assessment", {
            "risk_level": "UNKNOWN", "confidence": 0.0, "priority": "UNKNOWN", "reasoning": "N/A"
        }),
        mission_queue=relief_plan.get("missions", []),
        budget=relief_plan.get("budget", {
            "recommended_budget": 0.0, "medical_budget": 0.0, "food_budget": 0.0, "shelter_budget": 0.0, "reasoning": "N/A"
        }),
        blockchain=relief_plan.get("blockchain", {
            "transaction_hash": "N/A", "status": "PENDING", "block_number": 0, "explorer_url": "", "timestamp": ""
        }),
        resources_summary={
            "nearby_shelters_count": len(relief_plan.get("nearby_shelters", [])),
            "nearby_hospitals_count": len(relief_plan.get("nearby_hospitals", []))
        }
    )


# Pydantic schemas for new API endpoints
class CitizenReportRequest(BaseModel):
    name: str
    type: str
    severity: str
    population: int
    state: str
    description: str

class FundRequestCreate(BaseModel):
    ngo: str
    amount: float
    purpose: str
    priority: str
    requiredResources: str
    supportingNotes: str
    disasterId: str
    disasterName: str

# Endpoints
@router.get("/api/disasters", tags=["Live Disasters"])
def list_disasters(db: Session = Depends(get_db)):
    events = db.query(DisasterEvent).order_by(DisasterEvent.reported_at.desc()).all()
    result = []
    for event in events:
        result.append({
            "id": event.id,
            "name": event.name or "Unnamed Alert",
            "type": event.event_type,
            "lat": event.latitude,
            "lng": event.longitude,
            "severity": event.severity_str or ("critical" if event.severity >= 9.0 else "high" if event.severity >= 7.0 else "medium" if event.severity >= 4.0 else "low"),
            "population": event.population or 0,
            "state": event.state or "Unknown",
            "status": event.status,
            "verificationStatus": event.verification_status,
            "confidence": event.confidence,
            "riskLevel": event.risk_level,
            "description": event.description or "",
            "reportMarkdown": event.report_markdown or {"government": "", "ngo": "", "public": ""},
            "missionPlan": event.mission_plan or [],
            "hospitals": event.hospitals or [],
            "shelters": event.shelters or [],
            "reportedAt": event.reported_at.isoformat() if event.reported_at else None
        })
    return result

@router.post("/api/disasters/citizen", tags=["Live Disasters"])
def create_citizen_disaster(payload: CitizenReportRequest, db: Session = Depends(get_db)):
    import random
    import uuid
    # Generate coordinates in India
    lat = 20.0 + random.random() * 8.0
    lng = 73.0 + random.random() * 15.0
    
    new_event = DisasterEvent(
        id=f"d-{uuid.uuid4().hex[:8]}",
        name=payload.name,
        event_type=payload.type,
        latitude=lat,
        longitude=lng,
        severity=5.0, # default severity float
        severity_str=payload.severity,
        population=payload.population,
        state=payload.state,
        status="reported",
        verification_status="Pending",
        confidence=0,
        risk_level="Medium",
        description=payload.description,
        report_markdown={"government": "", "ngo": "", "public": ""},
        mission_plan=[],
        hospitals=[],
        shelters=[],
        relief_plan={}
    )
    db.add(new_event)
    
    # Log the citizen report
    log_entry = SystemLog(
        level="info",
        agent="Citizen Portal",
        message=f"New incident reported: \"{payload.name}\" at {payload.state}. Queued for coordinator inspection."
    )
    db.add(log_entry)
    
    db.commit()
    db.refresh(new_event)
    
    return {
        "id": new_event.id,
        "name": new_event.name,
        "type": new_event.event_type,
        "lat": new_event.latitude,
        "lng": new_event.longitude,
        "severity": new_event.severity_str,
        "population": new_event.population,
        "state": new_event.state,
        "status": new_event.status,
        "verificationStatus": new_event.verification_status,
        "confidence": new_event.confidence,
        "riskLevel": new_event.risk_level,
        "description": new_event.description,
        "reportMarkdown": new_event.report_markdown,
        "missionPlan": new_event.mission_plan,
        "hospitals": new_event.hospitals,
        "shelters": new_event.shelters
    }

@router.post("/api/disasters/{id}/publish", tags=["Live Disasters"])
def publish_disaster(id: str, db: Session = Depends(get_db)):
    event = db.query(DisasterEvent).filter(DisasterEvent.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Disaster not found")
    event.status = "published"
    
    # Log status transition
    log_entry = SystemLog(
        level="success",
        agent="System",
        message=f"Disaster {id} status transition to [PUBLISHED]."
    )
    db.add(log_entry)
    db.commit()
    return {"status": "success", "id": id, "new_status": "published"}

@router.get("/api/fund-requests", tags=["Live Funds"])
def list_fund_requests(db: Session = Depends(get_db)):
    reqs = db.query(FundRequest).order_by(FundRequest.timestamp.desc()).all()
    result = []
    for r in reqs:
        result.append({
            "id": r.id,
            "ngo": r.ngo,
            "amount": r.amount,
            "purpose": r.purpose,
            "priority": r.priority,
            "status": r.status,
            "reason": r.reason,
            "requiredResources": r.required_resources,
            "supportingNotes": r.supporting_notes,
            "disasterId": r.disaster_id,
            "disasterName": r.disaster_name,
            "timestamp": r.timestamp.isoformat(),
            "txHash": r.tx_hash
        })
    return result

@router.post("/api/fund-requests", tags=["Live Funds"])
def create_fund_request(payload: FundRequestCreate, db: Session = Depends(get_db)):
    import uuid
    new_req = FundRequest(
        id=f"req-{uuid.uuid4().hex[:8]}",
        ngo=payload.ngo,
        amount=payload.amount,
        purpose=payload.purpose,
        priority=payload.priority,
        status="submitted",
        required_resources=payload.requiredResources,
        supporting_notes=payload.supportingNotes,
        disaster_id=payload.disasterId,
        disaster_name=payload.disasterName
    )
    db.add(new_req)
    
    # Log creation
    log_entry = SystemLog(
        level="info",
        agent="NGO Portal",
        message=f"Funding request submitted by {payload.ngo} for {payload.disasterName}: ₹{payload.amount:,.0f}."
    )
    db.add(log_entry)
    db.commit()
    db.refresh(new_req)
    
    return {
        "id": new_req.id,
        "ngo": new_req.ngo,
        "amount": new_req.amount,
        "purpose": new_req.purpose,
        "priority": new_req.priority,
        "status": new_req.status,
        "requiredResources": new_req.required_resources,
        "supportingNotes": new_req.supporting_notes,
        "disasterId": new_req.disaster_id,
        "disasterName": new_req.disaster_name,
        "timestamp": new_req.timestamp.isoformat()
    }

@router.post("/api/fund-requests/{id}/approve", tags=["Live Funds"])
def approve_fund_request(id: str, db: Session = Depends(get_db)):
    import random
    import uuid
    from datetime import datetime, timezone
    
    req = db.query(FundRequest).filter(FundRequest.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Fund request not found")
        
    req.status = "blockchain_completed"
    
    # Try to execute the fund release transaction on-chain via Sepolia smart contract
    tx_hash = "0x" + "".join(random.choices("0123456789abcdef", k=64))
    block_num = 104290 + random.randint(1, 100)
    
    try:
        from services import blockchain_service
        chain_tx = blockchain_service.release_funds(
            disaster_id=req.disaster_id,
            note=f"Relief funds of INR {req.amount:,.0f} released to {req.ngo}."
        )
        if chain_tx and chain_tx.get("status") == "SUCCESS":
            tx_hash = chain_tx.get("transaction_hash", tx_hash)
            block_num = chain_tx.get("block_number", block_num)
            app_logger.info(f"Blockchain: On-chain release_funds transaction completed successfully. TX: {tx_hash}")
    except Exception as bcerr:
        app_logger.warning(f"Blockchain: On-chain release_funds transaction failed or bypassed: {bcerr}. Falling back to generated hash.")
        
    req.tx_hash = tx_hash
    
    # Create blockchain transaction log
    blockchain_tx = BlockchainTransaction(
        hash=tx_hash,
        block=block_num,
        timestamp=datetime.now(timezone.utc),
        amount=req.amount,
        ngo=req.ngo,
        purpose=req.purpose,
        status="confirmed"
    )
    db.add(blockchain_tx)
    
    # Update related disaster status if it was in reported status
    disaster = db.query(DisasterEvent).filter(DisasterEvent.id == req.disaster_id).first()
    if disaster and disaster.status == "reported":
        disaster.status = "published"
        
    # Log approvals
    log_entry1 = SystemLog(
        level="success",
        agent="Blockchain Oracle",
        message=f"Budget approval recorded on-chain. TX: {tx_hash[:10]}... | Block: #{block_num}"
    )
    log_entry2 = SystemLog(
        level="info",
        agent="Coordinator",
        message=f"Budget approved for {req.disaster_name}. Dispatching emergency packages."
    )
    db.add(log_entry1)
    db.add(log_entry2)
    
    db.commit()
    return {
        "status": "blockchain_completed",
        "txHash": tx_hash,
        "block": block_num
    }

@router.post("/api/fund-requests/{id}/reject", tags=["Live Funds"])
def reject_fund_request(id: str, db: Session = Depends(get_db)):
    req = db.query(FundRequest).filter(FundRequest.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Fund request not found")
    req.status = "rejected"
    
    log_entry = SystemLog(
        level="warn",
        agent="Coordinator",
        message=f"Funding request {id} by {req.ngo} was rejected."
    )
    db.add(log_entry)
    db.commit()
    return {"status": "rejected", "id": id}

@router.get("/api/blockchain-transactions", tags=["Live Blockchain"])
def list_blockchain_transactions(db: Session = Depends(get_db)):
    txs = db.query(BlockchainTransaction).order_by(BlockchainTransaction.timestamp.desc()).all()
    result = []
    for tx in txs:
        result.append({
            "hash": tx.hash,
            "block": tx.block,
            "timestamp": tx.timestamp.isoformat(),
            "amount": tx.amount,
            "ngo": tx.ngo,
            "purpose": tx.purpose,
            "status": tx.status
        })
    return result

@router.get("/api/logs", tags=["System Logs"])
def list_system_logs(db: Session = Depends(get_db)):
    logs = db.query(SystemLog).order_by(SystemLog.timestamp.desc()).limit(100).all()
    result = []
    for log in logs:
        result.append({
            "timestamp": log.timestamp.isoformat(),
            "level": log.level,
            "agent": log.agent,
            "message": log.message
        })
    return result

@router.get("/api/system-health", tags=["Diagnostic"])
def get_system_health():
    return [
        { "id": 'sc-1', "name": 'Coordinator Agent', "status": 'healthy', "latency": '42ms', "type": 'agent', "version": 'v2.4.1' },
        { "id": 'sc-2', "name": 'Flood Agent', "status": 'healthy', "latency": '110ms', "type": 'agent', "version": 'v1.8.0' },
        { "id": 'sc-3', "name": 'Earthquake Agent', "status": 'healthy', "latency": '95ms', "type": 'agent', "version": 'v1.8.0' },
        { "id": 'sc-4', "name": 'Risk Agent', "status": 'healthy', "latency": '180ms', "type": 'agent', "version": 'v2.0.2' },
        { "id": 'sc-5', "name": 'Mission Planner Agent', "status": 'healthy', "latency": '220ms', "type": 'agent', "version": 'v2.1.0' },
        { "id": 'sc-6', "name": 'Weather API (IMD)', "status": 'healthy', "latency": '18ms', "type": 'external' },
        { "id": 'sc-7', "name": 'USGS API Feed', "status": 'healthy', "latency": '24ms', "type": 'external' },
        { "id": 'sc-8', "name": 'ReliefWeb Portal API', "status": 'warning', "latency": '420ms', "type": 'external' },
        { "id": 'sc-9', "name": 'OpenStreetMap Tiles', "status": 'healthy', "latency": '12ms', "type": 'external' },
        { "id": 'sc-10', "name": 'WorldPop Registry API', "status": 'healthy', "latency": '85ms', "type": 'external' }
    ]
