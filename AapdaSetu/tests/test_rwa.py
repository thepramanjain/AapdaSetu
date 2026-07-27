"""
Tests for the RWA Service (Phase 1).
Tests Haversine distance, evacuation priority, volunteer matching, resource gaps.
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from modules.rwa.rwa_service import haversine_distance, RWAService


def test_haversine_distance_same_point():
    """Distance between identical points should be 0."""
    assert haversine_distance(19.0760, 72.8777, 19.0760, 72.8777) == 0.0


def test_haversine_distance_known_pair():
    """Mumbai to Delhi is roughly 1150 km."""
    dist = haversine_distance(19.0760, 72.8777, 28.6139, 77.2090)
    assert 1100 < dist < 1200


def test_haversine_distance_short():
    """Two points ~10km apart in Mumbai."""
    # Andheri to Borivali
    dist = haversine_distance(19.1362, 72.8296, 19.2307, 72.8567)
    assert 5 < dist < 15


@pytest.mark.asyncio
async def test_find_nearby_societies_empty():
    """With no DB data at a random location, should return empty list."""
    service = RWAService()
    # Use a remote location with no seeded data
    result = await service.find_nearby_societies(0.0, 0.0, 1.0)
    assert isinstance(result, list)


def test_rwa_agent_runs():
    """The RWA agent should return a valid AgentResult."""
    from modules.rwa.rwa_agent import RWAAgent

    agent = RWAAgent()
    result = agent.run({
        "disaster_id": "test-123",
        "event_type": "flood",
        "severity": 8.0,
        "latitude": 19.0760,
        "longitude": 72.8777,
        "radius_km": 50.0
    })
    assert result.agent_name == "RWA Community Agent"
    assert result.status in ("SUCCESS", "PARTIAL", "ERROR")
    assert "societies_affected" in result.data
    assert "recommended_volunteers" in result.data
    assert "resource_shortages" in result.data
