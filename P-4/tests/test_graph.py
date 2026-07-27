"""
AapdaSetu - LangGraph Workflow Verification Test Suite
======================================================
Tests the orchestrator pipeline state transitions and conditional routing logic.
"""

import sys
import os
import pytest
from unittest.mock import patch

# Add workspace root to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.coordinator import execute_pipeline, relief_graph


@patch("agents.coordinator.parse_intent")
@patch("agents.coordinator.geocode_location")
@patch("agents.coordinator.analyze_flood")
@patch("agents.coordinator.allocate_resources")
@patch("agents.coordinator.generate_advisory")
@patch("agents.coordinator.assess_risk")
@patch("agents.coordinator.plan_missions")
@patch("agents.coordinator.calculate_budget")
@patch("agents.coordinator.submit_to_blockchain")
def test_flood_workflow_execution(
    mock_blockchain,
    mock_budget,
    mock_missions,
    mock_risk,
    mock_adv, 
    mock_alloc, 
    mock_flood, 
    mock_geo, 
    mock_parse
):
    """Verify that a flood report takes the flood routing track and merges state variables."""
    # 1. Setup mocks
    mock_parse.return_value = {
        "location": "Bandra, Mumbai",
        "disaster": "flood",
        "intent": "General",
        "time_context": "Current"
    }
    
    mock_geo.return_value = {"latitude": 19.0760, "longitude": 72.8777, "source": "local"}
    mock_flood.return_value = {
        "severity_score": 8.2,
        "analysis_summary": "Torrential rain triggers severe flooding."
    }
    mock_alloc.return_value = {
        "nearby_shelters": [{"id": "SHEL001", "name": "Bandra Camp"}],
        "nearby_hospitals": [{"id": "HOSP002", "name": "KEM Medical"}],
        "safe_route": "Bandra highway clear.",
        "required_supplies": ["Life Jackets"],
        "emergency_contacts": {"NDRF": "1078"}
    }
    mock_adv.return_value = ("Stay on high ground.", [])
    
    mock_risk.return_value = {"risk_level": "HIGH", "priority": "CRITICAL"}
    mock_missions.return_value = {"mission_queue": [{"title": "Evacuate", "status": "PENDING", "priority": "HIGH"}]}
    mock_budget.return_value = {"recommended_budget": 500000}
    mock_blockchain.return_value = {"status": "success"}

    # 2. Execute pipeline
    final_state = execute_pipeline(query="Streets flooded with chest-high water after cloudburst in Bandra, Mumbai")

    # 3. Assert correct node execution and state accumulation
    assert final_state["event_type"] == "flood"
    assert final_state["severity"] == 8.2
    assert final_state["latitude"] == 19.0760
    assert len(final_state["nearby_shelters"]) == 1
    assert final_state["government_advisory"] == "Stay on high ground."
    
    # Assert that flood agent was called
    assert mock_flood.called
    
    # Assert that missing properties were extracted
    assert final_state["raw_location"] == "Bandra, Mumbai"
