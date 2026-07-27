"""
Tests for the Base Agent Interface (Phase 0 Foundation).
Verifies the contract: BaseAgent subclasses must implement run(),
and AgentResult behaves correctly.
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agents.base_agent import BaseAgent, AgentResult


class MockAgent(BaseAgent):
    """Concrete test agent implementing BaseAgent."""

    name = "Mock Agent"
    description = "A test agent for unit testing."
    input_schema = {"query": "str"}
    output_schema = {"answer": "str"}

    def run(self, context):
        return AgentResult(
            status="SUCCESS",
            data={"answer": f"Processed: {context.get('query', '')}"},
            confidence=0.95,
            agent_name=self.name,
            next_agent_hint="next_agent",
        )


def test_agent_result_creation():
    """AgentResult should populate all fields correctly."""
    result = AgentResult(
        status="SUCCESS",
        data={"key": "value"},
        confidence=0.85,
        agent_name="TestAgent",
    )
    assert result.status == "SUCCESS"
    assert result.data == {"key": "value"}
    assert result.confidence == 0.85
    assert result.agent_name == "TestAgent"
    assert result.is_success() is True
    assert result.timestamp  # Should be auto-populated


def test_agent_result_is_success():
    """is_success() should only return True for SUCCESS status."""
    success = AgentResult(status="SUCCESS", data={})
    error = AgentResult(status="ERROR", data={})
    partial = AgentResult(status="PARTIAL", data={})

    assert success.is_success() is True
    assert error.is_success() is False
    assert partial.is_success() is False


def test_mock_agent_implements_interface():
    """A concrete BaseAgent subclass should work through the interface."""
    agent = MockAgent()
    assert agent.name == "Mock Agent"
    assert agent.description == "A test agent for unit testing."

    result = agent.run({"query": "test input"})
    assert result.is_success()
    assert result.data["answer"] == "Processed: test input"
    assert result.confidence == 0.95
    assert result.agent_name == "Mock Agent"
    assert result.next_agent_hint == "next_agent"


def test_agent_repr():
    """__repr__ should include agent name."""
    agent = MockAgent()
    assert "MockAgent" in repr(agent)
    assert "Mock Agent" in repr(agent)


def test_cannot_instantiate_base_agent():
    """BaseAgent is abstract — direct instantiation should fail."""
    try:
        agent = BaseAgent()
        agent.run({})
        assert False, "Should have raised TypeError"
    except TypeError:
        pass  # Expected — abstract class


def test_rwa_agent_stub():
    """The RWA agent should return SUCCESS or PARTIAL status."""
    from modules.rwa.rwa_agent import RWAAgent

    agent = RWAAgent()
    result = agent.run({"disaster_type": "flood", "severity": 7.5, "latitude": 19.0, "longitude": 72.0, "disaster_id": "test"})
    assert result.status in ("SUCCESS", "PARTIAL")
    assert result.agent_name == "RWA Community Agent"


def test_heatwave_agent_stub():
    """The Heatwave agent should return SUCCESS status with valid districts."""
    from modules.heatwave.heatwave_agent import HeatwaveAgent

    agent = HeatwaveAgent()
    result = agent.run({"districts": ["New Delhi"]})
    assert result.status == "SUCCESS"
    assert result.agent_name == "Heatwave Prediction Agent"
    assert "district_forecasts" in result.data
