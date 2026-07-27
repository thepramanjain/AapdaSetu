"""
AapdaSetu — Base Agent Interface
=================================
Defines the abstract BaseAgent contract and AgentResult data class that all
new agents (RWA, Heatwave, etc.) must implement.  Existing agents are NOT
required to subclass this — thin adapters can bridge them if needed.

Architecture Note
-----------------
This is part of Phase 0 (Foundation).  The interface guarantees every agent
produces a uniform AgentResult so the event bus and coordinator can treat
them generically.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, Optional


@dataclass
class AgentResult:
    """Standardised output envelope returned by every BaseAgent."""

    status: str                          # "SUCCESS" | "ERROR" | "PARTIAL"
    data: Dict[str, Any]                 # The agent's output payload
    confidence: float = 0.0              # 0.0 – 1.0
    timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    agent_name: str = ""
    next_agent_hint: Optional[str] = None  # Suggestion for the router

    def is_success(self) -> bool:
        return self.status == "SUCCESS"


class BaseAgent(ABC):
    """
    Abstract interface every *new* agent must implement.

    Attributes
    ----------
    name : str
        Human-readable identifier (e.g. "Heatwave Prediction Agent").
    description : str
        One-line explanation of what this agent does.
    input_schema : dict
        JSON-schema-style dict describing expected context keys.
    output_schema : dict
        JSON-schema-style dict describing the AgentResult.data shape.
    """

    name: str = "BaseAgent"
    description: str = ""
    input_schema: Dict[str, Any] = {}
    output_schema: Dict[str, Any] = {}

    @abstractmethod
    def run(self, context: Dict[str, Any]) -> AgentResult:
        """
        Execute the agent's logic.

        Parameters
        ----------
        context : dict
            Shared disaster state dictionary (same shape as DisasterState).

        Returns
        -------
        AgentResult
            Uniform result envelope.
        """
        ...

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} name={self.name!r}>"
