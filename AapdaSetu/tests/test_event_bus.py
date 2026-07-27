"""
Tests for the Event Bus (Phase 0 Foundation).
Verifies subscribe → emit round-trip, error isolation, and sync emit.
"""

import asyncio
import pytest
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.event_bus import EventBus


@pytest.fixture
def bus():
    """Provide a fresh EventBus instance per test."""
    eb = EventBus()
    yield eb
    eb.clear()


@pytest.mark.asyncio
async def test_subscribe_and_emit(bus):
    """A subscribed handler should receive the emitted payload."""
    received = []

    async def handler(payload):
        received.append(payload)

    bus.subscribe("test.event", handler)
    await bus.emit("test.event", {"key": "value"})

    assert len(received) == 1
    assert received[0]["key"] == "value"


@pytest.mark.asyncio
async def test_multiple_subscribers(bus):
    """Multiple handlers for the same event should all fire."""
    results = []

    async def handler_a(payload):
        results.append("A")

    async def handler_b(payload):
        results.append("B")

    bus.subscribe("multi.event", handler_a)
    bus.subscribe("multi.event", handler_b)
    await bus.emit("multi.event", {})

    assert "A" in results
    assert "B" in results
    assert len(results) == 2


@pytest.mark.asyncio
async def test_no_subscribers_no_error(bus):
    """Emitting an event with no subscribers should not raise."""
    await bus.emit("unheard.event", {"data": 123})
    log = bus.get_event_log()
    assert len(log) == 1
    assert log[0]["event"] == "unheard.event"


@pytest.mark.asyncio
async def test_handler_error_does_not_propagate(bus):
    """A failing handler should not crash the bus or block other handlers."""
    results = []

    async def bad_handler(payload):
        raise ValueError("intentional test error")

    async def good_handler(payload):
        results.append("ok")

    bus.subscribe("error.event", bad_handler)
    bus.subscribe("error.event", good_handler)
    await bus.emit("error.event", {})

    # Good handler should still have fired
    assert "ok" in results


@pytest.mark.asyncio
async def test_unsubscribe(bus):
    """Unsubscribed handlers should no longer fire."""
    results = []

    async def handler(payload):
        results.append("fired")

    bus.subscribe("unsub.event", handler)
    bus.unsubscribe("unsub.event", handler)
    await bus.emit("unsub.event", {})

    assert len(results) == 0


@pytest.mark.asyncio
async def test_event_log(bus):
    """Event log should record every emitted event."""
    await bus.emit("a", {"x": 1})
    await bus.emit("b", {"y": 2})

    log = bus.get_event_log()
    assert len(log) == 2
    assert log[0]["event"] == "a"
    assert log[1]["event"] == "b"


@pytest.mark.asyncio
async def test_list_subscriptions(bus):
    """list_subscriptions should return handler counts per event."""
    async def h(p): pass

    bus.subscribe("evt1", h)
    bus.subscribe("evt1", h)
    bus.subscribe("evt2", h)

    subs = bus.list_subscriptions()
    assert subs["evt1"] == 2
    assert subs["evt2"] == 1


@pytest.mark.asyncio
async def test_clear(bus):
    """clear() should remove all subscriptions and event history."""
    async def h(p): pass

    bus.subscribe("x", h)
    await bus.emit("x", {})
    bus.clear()

    assert bus.list_subscriptions() == {}
    assert bus.get_event_log() == []
