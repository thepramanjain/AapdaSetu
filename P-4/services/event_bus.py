"""
AapdaSetu — Async Event Bus
============================
Lightweight in-process pub/sub system that lets modules communicate via
named events instead of hard-coded imports.

Usage
-----
    from services.event_bus import event_bus

    # Subscribe (usually at module init)
    async def on_disaster_verified(payload: dict):
        print(f"Disaster verified: {payload}")

    event_bus.subscribe("disaster.verified", on_disaster_verified)

    # Emit (from any agent/service)
    await event_bus.emit("disaster.verified", {"disaster_id": "abc", ...})

Architecture Note
-----------------
Phase 0 foundation.  Simple asyncio-based dispatcher — no external deps.
Can be swapped for Redis Pub/Sub or Kafka later without changing call sites.
"""

import asyncio
import logging
from collections import defaultdict
from typing import Any, Callable, Coroutine, Dict, List

logger = logging.getLogger("aapdasetu.event_bus")


# Type alias for event handler callbacks
EventHandler = Callable[[Dict[str, Any]], Coroutine[Any, Any, None]]


class EventBus:
    """
    Singleton async event bus.

    Supported events (initial catalog — extend as modules are built):
        disaster.verified     — coordinator after LIVE classification
        risk.high             — risk_assessment when >= HIGH
        risk.extreme          — risk_assessment when EXTREME
        evacuation.needed     — mission planner for LIVE events
        heatwave.alert        — heatwave agent (Phase 3)
        rwa.alert_ready       — RWA agent (Phase 1)
        blockchain.registered — after on-chain write (Phase 2)
    """

    def __init__(self) -> None:
        self._subscribers: Dict[str, List[EventHandler]] = defaultdict(list)
        self._event_log: List[Dict[str, Any]] = []  # Audit trail
        logger.info("EventBus initialised.")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def subscribe(self, event_name: str, handler: EventHandler) -> None:
        """Register *handler* to be called whenever *event_name* is emitted."""
        self._subscribers[event_name].append(handler)
        logger.debug(
            "Subscribed %s to '%s' (total listeners: %d)",
            handler.__name__,
            event_name,
            len(self._subscribers[event_name]),
        )

    def unsubscribe(self, event_name: str, handler: EventHandler) -> None:
        """Remove a previously registered handler."""
        handlers = self._subscribers.get(event_name, [])
        if handler in handlers:
            handlers.remove(handler)
            logger.debug("Unsubscribed %s from '%s'", handler.__name__, event_name)

    async def emit(self, event_name: str, payload: Dict[str, Any] | None = None) -> None:
        """
        Fire *event_name* and invoke all registered handlers concurrently.

        Errors in individual handlers are logged but never propagate — the
        event bus must never crash the main pipeline.
        """
        payload = payload or {}
        logger.info("Event emitted: '%s'  (payload keys: %s)", event_name, list(payload.keys()))

        self._event_log.append({
            "event": event_name,
            "payload_keys": list(payload.keys()),
        })

        handlers = self._subscribers.get(event_name, [])
        if not handlers:
            logger.debug("No subscribers for '%s'.", event_name)
            return

        tasks = []
        for handler in handlers:
            tasks.append(self._safe_call(handler, event_name, payload))
        await asyncio.gather(*tasks)

    def emit_sync(self, event_name: str, payload: Dict[str, Any] | None = None) -> None:
        """
        Fire-and-forget emit for synchronous callers (e.g. LangGraph nodes).

        If an event loop is running, the coroutine is scheduled on it.
        Otherwise a warning is logged and the event is dropped — never blocks.
        """
        payload = payload or {}
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self.emit(event_name, payload))
        except RuntimeError:
            # No running loop — log and move on
            logger.warning(
                "emit_sync('%s') called with no running event loop; event dropped.", event_name
            )
            self._event_log.append({
                "event": event_name,
                "payload_keys": list(payload.keys()),
                "note": "dropped_no_loop",
            })

    # ------------------------------------------------------------------
    # Introspection helpers
    # ------------------------------------------------------------------

    def get_event_log(self) -> List[Dict[str, Any]]:
        """Return a copy of all emitted events (for debugging / tests)."""
        return list(self._event_log)

    def list_subscriptions(self) -> Dict[str, int]:
        """Return {event_name: handler_count} for all registered events."""
        return {name: len(handlers) for name, handlers in self._subscribers.items()}

    def clear(self) -> None:
        """Remove all subscriptions and event history (useful in tests)."""
        self._subscribers.clear()
        self._event_log.clear()

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------

    async def _safe_call(
        self, handler: EventHandler, event_name: str, payload: Dict[str, Any]
    ) -> None:
        """Invoke a single handler, catching and logging any errors."""
        try:
            await handler(payload)
        except Exception:
            logger.exception(
                "Handler %s raised an exception for event '%s'",
                handler.__name__,
                event_name,
            )


# ---------------------------------------------------------------------------
# Module-level singleton — import this everywhere
# ---------------------------------------------------------------------------
event_bus = EventBus()
