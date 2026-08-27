"""
AapdaSetu - API Routes Test Suite
=================================
Tests FastAPI request validation, health checks, and routes using TestClient.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add workspace root to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
from unittest.mock import patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base, get_db

# Create an in-memory SQLite database for sandboxed test isolation
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Initialize schema in testing database
Base.metadata.create_all(bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Override FastAPI database dependency
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_health_check_endpoint():
    """Verify health diagnostics status and payload."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "flood" in data["supported_disasters"]


@patch("backend.routes.execute_pipeline")
def test_analyze_endpoint(mock_execute):
    """Verify post ingestion validation and pipeline orchestration matching."""
    from uuid import uuid4
    # Mock returning state
    mock_execute.return_value = {
        "disaster_id": uuid4(),
        "event_type": "flood",
        "raw_location": "Kurla Suburbs",
        "latitude": 19.0728,
        "longitude": 72.8826,
        "severity": 8.0,
        "government_advisory": "Evacuate immediately along designated high lanes.",
        "nearby_shelters": [
            {"id": "SHEL003", "name": "Kurla Relief Base", "latitude": 19.0728, "longitude": 72.8826, "capacity": 600, "occupied": 120, "has_supplies": True, "active": True}
        ],
        "nearby_hospitals": [
            {"id": "HOSP001", "name": "Mumbai Central General Hospital", "latitude": 19.0760, "longitude": 72.8777, "capacity": 300, "occupied_beds": 240, "specialties": ["ICU"], "active": True}
        ],
        "safe_route": "Eastern Express Highway is open.",
        "required_supplies": ["Life Jackets", "Drinking Water"],
        "emergency_contacts": {"NDRF": "011-23438019"}
    }
    
    payload = {
        "query": "Severe flooding reported near the main rail junction in Kurla Suburbs, water levels rising to 4 feet."
    }
    
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["event_type"] == "flood"
    assert data["disaster_severity"] == 8.0
    assert len(data["nearby_shelters"]) == 1
    assert data["nearby_shelters"][0]["id"] == "SHEL003"


@patch("services.llm_manager.llm_manager.invoke")
@patch("backend.routes.search_guidelines")
def test_chat_endpoint(mock_search, mock_invoke):
    """Verify chat follow-ups with mock session handling."""
    # Mock RAG search return
    mock_search.return_value = [
        {"text": "NDMA Guidelines: Seek higher ground.", "score": 0.1, "metadata": {"disaster_type": "flood"}}
    ]
    
    # Mock LLM manager invoke method
    mock_invoke.return_value = "Make sure you stay indoors and move to the second floor if water levels rise."

    payload = {
        "session_id": "test-session-123",
        "message": "What should I do if water is coming in?",
        "location_context": "Mumbai"
    }
    
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == "test-session-123"
    assert "water" in data["response"] or "floor" in data["response"]
    assert len(data["suggested_actions"]) > 0


def test_analyze_endpoint_validation_error():
    """Verify that omitting required fields raises a 422 Validation Error."""
    payload = {}  # Missing 'query'
    response = client.post("/analyze", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
