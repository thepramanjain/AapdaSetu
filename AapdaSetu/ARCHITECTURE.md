# AapdaSetu — System Architecture

> **AI-Powered Disaster Lifecycle Management Platform**
> Prediction → Preparedness → Response → Recovery → Transparent Governance

---

## Updated Pipeline

```
Citizen Report / Proactive Monitor
          │
          ▼
┌─────────────────────────┐
│   Coordinator Agent     │  ← Geocodes location, classifies disaster type
│   Intent Parser         │    Determines verification status
└──────────┬──────────────┘
           │
    ┌──────┴──────────────┐
    ▼                     ▼
┌────────────┐   ┌───────────────┐
│ Flood Agent│   │Earthquake Agent│
│ Open-Meteo │   │ USGS Seismic  │
│ GloFAS     │   │ Mag / Depth   │
└─────┬──────┘   └───────┬───────┘
      └──────────┬───────┘
                 ▼
┌─────────────────────────┐
│ Heatwave Prediction     │  ← NEW (Phase 3)
│ Agent (Open-Meteo)      │    Proactive district-level risk forecasting
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ RWA Community Agent     │  ← NEW (Phase 1)
│ Society evacuation      │    Priority queues, volunteer matching
│ & resource matching     │    Notification cascade
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ Resource Agent          │  ← OSM Overpass: hospitals, shelters
│ + OSRM Routing          │    Safe evacuation routes
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ RAG Agent               │  ← ChromaDB + NDMA/WHO guidelines
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ Risk Assessment Agent   │  ← Deterministic scoring engine
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ Mission Planner Agent   │  ← Task registries
│ + Budget Service        │    Heuristic funding estimation
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ Shardeum Blockchain     │  ← NEW (Phase 2)
│ Disaster registry       │    Supply-chain tracking
│ Funding lifecycle       │    Immutable audit trail
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ Stakeholder Reports     │  Gov / NGO / Public
└─────────────────────────┘
```

---

## Agent Interface Contract

All **new** agents implement the `BaseAgent` abstract class (defined in `agents/base_agent.py`):

```python
class BaseAgent(ABC):
    name: str
    description: str
    input_schema: dict
    output_schema: dict

    @abstractmethod
    def run(self, context: dict) -> AgentResult: ...
```

`AgentResult` is a standardised envelope:

```python
@dataclass
class AgentResult:
    status: str        # "SUCCESS" | "ERROR" | "PARTIAL"
    data: dict         # Agent's output payload
    confidence: float  # 0.0 – 1.0
    timestamp: str     # ISO 8601
    agent_name: str
    next_agent_hint: Optional[str]
```

> **Note:** Existing agents (Flood, Earthquake, Resource, RAG, Risk, Mission Planner)
> are NOT refactored to subclass BaseAgent — they continue to work as before through
> the LangGraph state machine.  Only new agents (RWA, Heatwave) use this interface.

---

## Event Bus

Defined in `services/event_bus.py`. Lightweight async pub/sub enabling
cross-module communication without hard-coded imports.

### Event Catalog

| Event Name            | Emitter                | Consumers                   |
|----------------------|------------------------|-----------------------------|
| `disaster.verified`   | Coordinator Agent      | Shardeum Service, RWA Agent |
| `risk.high`           | Risk Assessment Agent  | RWA Service (notifications) |
| `risk.extreme`        | Risk Assessment Agent  | RWA Service (notifications) |
| `evacuation.needed`   | Mission Planner        | RWA Service                 |
| `heatwave.alert`      | Heatwave Agent         | RWA Service (cascade)       |
| `rwa.alert_ready`     | RWA Agent              | Notification system         |
| `blockchain.registered`| Shardeum Service      | UI (transparency page)      |

### Usage

```python
from services.event_bus import event_bus

# Subscribe
async def on_verified(payload):
    await shardeum_service.register_disaster(payload)

event_bus.subscribe("disaster.verified", on_verified)

# Emit (async context)
await event_bus.emit("disaster.verified", {"disaster_id": "abc"})

# Emit (sync context — e.g., inside a LangGraph node)
event_bus.emit_sync("disaster.verified", {"disaster_id": "abc"})
```

---

## Module Folder Layout

Each new feature is self-contained under `modules/`:

```
P-4/
├── agents/                 # Existing agents (untouched)
│   ├── base_agent.py       # NEW — BaseAgent interface
│   ├── coordinator.py
│   ├── flood_agent.py
│   ├── earthquake_agent.py
│   ├── resource_agent.py
│   ├── rag_agent.py
│   ├── risk_assessment_agent.py
│   ├── mission_planner_agent.py
│   └── intent_parser.py
│
├── modules/                # NEW — self-contained feature modules
│   ├── shared_types.py     # Shared Pydantic models (Location, Severity, etc.)
│   │
│   ├── rwa/                # Phase 1 — Resident Welfare Association
│   │   ├── rwa_agent.py
│   │   ├── rwa_models.py   # SQLAlchemy: Society, Volunteer, Resource, Evacuation
│   │   ├── rwa_routes.py   # FastAPI router
│   │   └── rwa_service.py  # Business logic + NotificationProvider
│   │
│   ├── blockchain/         # Phase 2 — Shardeum integration
│   │   ├── shardeum_service.py    # BlockchainServiceInterface impl
│   │   ├── supply_chain.py        # Relief shipment tracking
│   │   └── blockchain_routes.py   # Public transparency page API
│   │
│   └── heatwave/           # Phase 3 — Heatwave prediction
│       ├── heatwave_agent.py      # HeatwaveAgent(BaseAgent)
│       ├── heatwave_tool.py       # Open-Meteo client + heat index formula
│       ├── heatwave_routes.py     # Forecast, map, recommendations API
│       └── heatwave_config.py     # Monitored cities/districts list
│
├── services/
│   ├── event_bus.py        # NEW — async pub/sub
│   ├── blockchain_service.py  # Existing Sepolia integration
│   └── ...
│
└── backend/
    ├── config.py           # MODIFIED — new env vars for Shardeum, Open-Meteo, RWA
    └── main.py             # MODIFIED — mounts module routers, inits event bus
```

---

## Phase Roadmap

| Phase | Module | Goal |
|-------|--------|------|
| **0** | Foundation | Base agent interface, event bus, shared types, module scaffolding |
| **1** | RWA | Society registration, evacuation priorities, volunteer matching, notifications |
| **2** | Shardeum | Migrate blockchain from Sepolia → Shardeum, add supply-chain tracking |
| **3** | Heatwave | Proactive heat risk prediction with India district map |
| **4** | Integration | Cross-module wiring, design consistency, unified navigation |
| **5** | Demo Prep | Demo script, seed data, simulate disaster trigger, fallback assets |
