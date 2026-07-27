"""
AapdaSetu - Execution Logging Service
=====================================
Provides structured execution logging for all Agents and Services
with precise timestamps to maintain an audit trail of decisions.
"""

from datetime import datetime
from backend.config import app_logger

class ExecutionLogger:
    @staticmethod
    def log_agent_execution(agent_name: str, status: str, details: str = ""):
        """Logs an agent's execution status."""
        timestamp = datetime.utcnow().isoformat()
        msg = f"[{timestamp}] [AGENT:{agent_name}] [STATUS:{status}] - {details}"
        app_logger.info(msg)

    @staticmethod
    def log_service_execution(service_name: str, status: str, details: str = ""):
        """Logs a service's execution status."""
        timestamp = datetime.utcnow().isoformat()
        msg = f"[{timestamp}] [SERVICE:{service_name}] [STATUS:{status}] - {details}"
        app_logger.info(msg)

execution_logger = ExecutionLogger()
