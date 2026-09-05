# AapdaSetu — Disaster Intelligence Platform

<div align="center">

**AI Detects • Actionable Planning • Relief Reaches**

[![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-orange)](https://langchain-ai.github.io/langgraph/)
[![Gemini](https://img.shields.io/badge/LLM-Gemini%20%7C%20OpenRouter-purple?logo=google)](https://openrouter.ai/)
[![Web3](https://img.shields.io/badge/Blockchain-Web3.py%20%7C%20Sepolia-blueviolet?logo=ethereum)](https://web3py.readthedocs.io/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](LICENSE)

</div>

---

## Overview

**AapdaSetu** (meaning *Bridge to Relief* in Hindi) is a production-hardened, autonomous multi-agent AI platform for real-time natural disaster intelligence. It ingests a plain-language citizen or agency report, orchestrates a chain of specialised AI agents, and produces:

- Structured **stakeholder reports** (Government / NGO / Public)
- **Risk classification** (LOW / MEDIUM / HIGH / URGENT / EXTREME) with deterministic scoring
- **Mission queue** with prioritised rescue or preparedness tasks
- **Resource discovery** — live hospitals and shelters from OpenStreetMap
- **Safe evacuation routing** via OSRM
- **Budget estimation** with heuristic funding recommendations
- **Blockchain audit trail** — on-chain disaster record via Ethereum smart contract (or mock mode)
- **NDMA-grounded advisory** via local RAG over official guidelines

Designed for **Flood** and **Earthquake** disaster types. All agents are stateless LangGraph nodes; the graph is fully deterministic at the routing layer with LLM used only for enrichment.

---

## Architecture

### LangGraph Multi-Agent Flow

```
┌──────────────────────────────────────────────────────────────┐
│                        INPUT                                 │
│  "Heavy flooding reported at Howraghat, Assam"               │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   1. Coordinator Agent  │  ← Geocodes location (Nominatim OSM)
              │      Intent Parser      │    Classifies disaster type (Gemini)
              │      Verification       │    Determines verification_status:
              └──────────┬──────────────┘    LIVE | PREPAREDNESS | HISTORICAL
                         │
          ┌──────────────┴──────────────┐
          │  Conditional Routing        │
          ▼ (Flood)                     ▼ (Earthquake)
┌──────────────────┐         ┌──────────────────────┐
│  2. Flood Agent  │         │  3. Earthquake Agent  │
│  Open-Meteo API  │         │    USGS Seismic API   │
│  GloFAS River    │         │    Magnitude / Depth  │
│  Discharge       │         │    Aftershock Risk    │
└────────┬─────────┘         └──────────┬────────────┘
         └──────────────┬───────────────┘
                        │
                        ▼
          ┌─────────────────────────┐
          │  4. Resource Agent      │  ← OSM Overpass: hospitals, shelters
          │     Hospital Tool       │    OSRM: safe route computation
          │     Shelter Tool        │    Schema-normalises all LLM output
          └──────────┬──────────────┘    (string / dict / mixed / null)
                     │
                     ▼
          ┌─────────────────────────┐
          │  5. RAG Agent           │  ← ChromaDB + SentenceTransformer
          │     Vector Store        │    NDMA / WHO / NDRF guidelines
          │     NDMA Guidelines     │    Singleton cache — loads once
          └──────────┬──────────────┘
                     │
                     ▼
          ┌─────────────────────────┐
          │  6. Risk Assessment     │  ← DETERMINISTIC scoring engine
          │     Agent               │    Priority table:
          │                         │    verification_status → severity
          │                         │    → confidence → weather → ReliefWeb
          │                         │    LLM only explains the decision
          └──────────┬──────────────┘
                     │
                     ▼
          ┌─────────────────────────┐
          │  7. Mission Planner     │  ← Deterministic task registries
          │     Agent               │    LIVE     → rescue missions
          │                         │    PREPAREDNESS → 10-item checklist
          │                         │    HISTORICAL → awareness tasks
          │                         │    LLM enriches; fallback guaranteed
          └──────────┬──────────────┘
                     │
                     ▼
          ┌─────────────────────────┐
          │  8. Budget Service      │  ← Heuristic funding estimation
          │                         │    Severity × affected population
          └──────────┬──────────────┘
                     │
                     ▼
          ┌─────────────────────────┐
          │  9. Blockchain Service  │  ← LIVE only: submit to smart contract
          │                         │    PREPAREDNESS / HISTORICAL / UNKNOWN:
          │                         │    → SKIPPED immediately
          │                         │    → No wallet, no RPC, no gas
          └──────────┬──────────────┘
                     │
                     ▼
          ┌─────────────────────────┐
          │  10. Reports Service    │  ← Government / NGO / Public reports
          │                         │    Hospital & shelter names listed
          │                         │    Preparedness tasks with checkmarks
          │                         │    Blockchain status consistent
          └─────────────────────────┘
```

---

## Key Design Principles

| Principle | Implementation |
|---|---|
| **Deterministic routing** | Verification status drives every decision; LLM never controls flow |
| **Schema safety** | Resource Agent normalises all LLM output — strings, dicts, mixed lists, null |
| **Non-empty guarantees** | Mission Planner always returns tasks via built-in registries |
| **Blockchain gate** | Web3/RPC/wallet initialised only when `verification_status == LIVE` |
| **Singleton caches** | Embedding model, vector store, Web3 client loaded once and reused |
| **Defensive programming** | Every agent handles null, empty arrays, missing fields, partial JSON |
| **Report consistency** | All sections agree: verification → risk → mode → tasks → blockchain |

---

## Folder Structure

```
P-4/
├── agents/
│   ├── coordinator.py            # LangGraph orchestrator; geocodes, routes, injects state
│   ├── flood_agent.py            # Hydrological assessment (Open-Meteo + GloFAS)
│   ├── earthquake_agent.py       # Seismic assessment (USGS + magnitude/depth)
│   ├── resource_agent.py         # Hospitals/shelters (OSM Overpass) + routing (OSRM)
│   │                             #   → crash-proof normalization for all LLM output formats
│   ├── rag_agent.py              # NDMA guideline retrieval from local ChromaDB
│   ├── risk_assessment_agent.py  # Deterministic 5-factor scoring engine
│   ├── mission_planner_agent.py  # Mode-based deterministic task registries
│   ├── intent_parser.py          # Classifies natural language disaster query
│   └── prompt_loader.py          # Loads .md prompts; parses LLM JSON responses
│
├── backend/
│   ├── main.py                   # FastAPI app + lifespan hooks
│   ├── routes.py                 # /analyze /chat /health /dashboard endpoints
│   ├── blockchain_routes.py      # /blockchain/approve /reject /release /status
│   ├── schemas.py                # Pydantic request/response schemas
│   ├── config.py                 # BaseSettings env validation + central logger
│   ├── database.py               # SQLite engine + session pooling
│   └── models.py                 # SQLAlchemy ORM: DisasterEvent, ChatSession
│
├── blockchain/
│   ├── contracts/                # Solidity smart contract (AapdaSetu.sol)
│   ├── abi/                      # Compiled ABI (AapdaSetu.json)
│   ├── deployments/              # Deployment manifests
│   ├── scripts/                  # Hardhat deploy scripts
│   ├── test/                     # Solidity unit tests
│   ├── hardhat.config.js         # Hardhat + Sepolia network config
│   └── package.json              # Node dependencies for Hardhat
│
├── data/
│   ├── datasets/                 # hospitals.csv, shelters.csv, roads.csv
│   ├── rag_docs/                 # Raw NDMA / WHO / NDRF guidelines text
│   ├── cache/                    # API response cache (hospitals, shelters, weather)
│   └── vector_db/                # ChromaDB persistent index
│
├── prompts/
│   ├── flood_agent_prompt.md
│   ├── earthquake_agent_prompt.md
│   ├── resource_agent_prompt.md
│   ├── risk_assessment_prompt.md
│   ├── mission_planner_prompt.md
│   └── rag_agent_prompt.md
│
├── scripts/
│   ├── demo.py                   # Interactive CLI — run the full pipeline locally
│   ├── demo_client.py            # REST client demo against running FastAPI server
│   ├── preprocess.py             # Chunk + embed NDMA docs → build ChromaDB index
│   ├── download_data.py          # Fetch live USGS / ReliefWeb feeds
│   └── generate_guideline_pdfs.py# Compile NDMA manuals to PDF (ReportLab)
│
├── services/
│   ├── blockchain_service.py     # Web3.py bridge; LIVE-only gate; mock mode fallback
│   ├── budget_service.py         # Heuristic funding estimation
│   ├── context_optimizer.py      # Token-budget state compression
│   ├── llm_manager.py            # Gemini + OpenRouter LLM routing with fallback
│   ├── logging_service.py        # Centralised timestamped execution logger
│   ├── optimization.py           # StateSanitizer, ResponseFormatter, PromptCompressor
│   ├── reports_service.py        # Generates Gov / NGO / Public stakeholder reports
│   ├── vector_store.py           # ChromaDB + FallbackChroma; singleton model cache
│   └── verification_service.py   # Classifies event into LIVE / PREPAREDNESS / HISTORICAL
│
├── tools/
│   ├── geocoder_tool.py          # Address → (lat, lon) via Nominatim OSM
│   ├── weather_tool.py           # Current + forecast weather (Open-Meteo)
│   ├── flood_tool.py             # River discharge forecasts (GloFAS)
│   ├── earthquake_tool.py        # Seismic catalog queries (USGS)
│   ├── hospital_tool.py          # Nearby hospitals (OSM Overpass API)
│   ├── shelter_tool.py           # Nearby shelters (OSM Overpass API)
│   ├── maps_tool.py              # Safe route + distance (OSRM API)
│   ├── road_tool.py              # Road status monitoring (OSM)
│   ├── reliefweb_tool.py         # Live ReliefWeb disaster report feed
│   ├── rag_tool.py               # Vector similarity search (ChromaDB)
│   ├── overpass_client.py        # Shared Overpass API HTTP client
│   └── utils.py                  # Shared utilities
│
├── tests/
│   ├── test_api.py               # FastAPI endpoint tests (TestClient)
│   ├── test_graph.py             # LangGraph node routing tests
│   └── test_tools.py             # Tool output and fallback tests
│
├── memory/
│   └── memory.py                 # LangGraph MemorySaver checkpointer
│
├── frontend/                     # (Dashboard UI — separate service)
├── docs/                         # Architecture diagrams and references
├── assets/                       # Static assets
├── Dockerfile                    # Production container image
├── docker-compose.yml            # App + services composition
├── Makefile                      # Developer shortcut commands
├── requirements.txt              # Python dependencies
├── pyproject.toml                # Project metadata
└── .env.example                  # Environment variable template
```

---

## External APIs Used

| API | Purpose | Free Tier |
|---|---|---|
| [Google Gemini](https://ai.google.dev/) | Primary LLM (analysis, enrichment, JSON generation) | ✅ Yes |
| [OpenRouter](https://openrouter.ai/) | Fallback LLM (LLaMA-3.3 70B) | ✅ Yes |
| [Open-Meteo](https://open-meteo.com/) | Weather forecast (rainfall, wind) | ✅ Yes, no key |
| [GloFAS](https://global-flood-awareness-system.eu/) | River discharge forecast | ✅ Yes, no key |
| [USGS Earthquake Catalog](https://earthquake.usgs.gov/) | Seismic event data | ✅ Yes, no key |
| [OSM Nominatim](https://nominatim.openstreetmap.org/) | Geocoding (address → coordinates) | ✅ Yes, no key |
| [OSM Overpass](https://overpass-api.de/) | Hospital & shelter proximity search | ✅ Yes, no key |
| [OSRM](http://router.project-osrm.org/) | Safe route & distance computation | ✅ Yes, no key |
| [ReliefWeb](https://reliefweb.int/api/) | Live humanitarian disaster reports | ✅ Yes, no key |
| [Alchemy / Infura](https://www.alchemy.com/) | Ethereum RPC (Sepolia testnet) | ✅ Free tier |

> **All APIs except Gemini/OpenRouter/Alchemy require no API key.** The system functions in full mock mode if blockchain credentials are absent.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Agent Orchestration** | LangGraph (stateful multi-agent graph) |
| **Primary LLM** | Google Gemini 3.6 Flash |
| **Fallback LLM** | OpenRouter (meta-llama/llama-3.3-70b-instruct:free) |
| **Embeddings** | `BAAI/bge-small-en-v1.5` (SentenceTransformers) |
| **Vector Store** | ChromaDB (native) with pure-Python fallback |
| **Web Framework** | FastAPI + Uvicorn |
| **Database** | SQLite via SQLAlchemy ORM |
| **Blockchain** | Web3.py → Solidity smart contract (Hardhat + Sepolia) |
| **Data Validation** | Pydantic v2 + Pydantic Settings |
| **HTTP Client** | HTTPX with Tenacity retry logic |
| **Testing** | Pytest + pytest-asyncio |
| **Containerisation** | Docker + docker-compose |
| **Language** | Python 3.12 |

---

## Setup & Installation

### Prerequisites

- Python 3.12+
- Node.js 18+ *(only needed for blockchain contract compilation/deployment)*
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/thepramanjain/AapdaSetu.git
cd AapdaSetu
```

### 2. Create Virtual Environment & Install Dependencies

```powershell
# Windows
python -m venv .venv
.venv\Scripts\pip install --upgrade pip
.venv\Scripts\pip install -r requirements.txt
```

```bash
# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Or using the Makefile:

```bash
make setup
```

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```env
# === Required ===
GEMINI_API_KEY=your_google_gemini_api_key_here
DATABASE_URL=sqlite:///./aapdasetu.db
VECTOR_DB_PATH=data/vector_db
HOST=127.0.0.1
PORT=8000
LOG_LEVEL=INFO

# === Optional: Fallback LLM ===
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free

# === Optional: Blockchain (leave blank for mock mode) ===
WEB3_PROVIDER_URI=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_key
AAPDA_SETU_CONTRACT_ADDRESS=0xYourDeployedContractAddress
BACKEND_WALLET_PRIVATE_KEY=0xyour_private_key
BLOCK_EXPLORER_TX_URL=https://sepolia.etherscan.io/tx/
```

> ⚠️ **Blockchain fields are optional.** Leave them blank and the system runs in full mock mode — no real transactions are submitted.

### 4. Build the RAG Vector Index

Chunk and embed official NDMA / WHO guidelines into the local ChromaDB:

```powershell
.venv\Scripts\python scripts\preprocess.py
```

> This only needs to be run once. The index is persisted to `data/vector_db/`.

---

## Running the System

### Option A — Interactive CLI Demo

Run the full multi-agent pipeline from your terminal:

```powershell
.venv\Scripts\python scripts\demo.py
```

Example queries:
```
> Heavy rainfall and flooding reported at Howraghat, Assam
> Earthquake magnitude 6.2 near Imphal, Manipur
> Flood preparedness check for Brahmaputra river region
```

Type `exit` or press `Ctrl+C` to quit.

### Option B — FastAPI REST Server

Start the web server:

```powershell
.venv\Scripts\python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Or via Makefile:

```bash
make run
```

Interactive Swagger docs: **http://127.0.0.1:8000/docs**

### Option C — Docker Compose

```bash
make docker-up    # Build and launch containers
make docker-down  # Stop and clean up
```

---

## API Endpoints

### Core

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | System health check and configuration status |
| `POST` | `/analyze` | Run the full multi-agent disaster intelligence pipeline |
| `GET` | `/dashboard/{disaster_id}` | Fetch full JSON payload for the dashboard |
| `POST` | `/chat` | RAG-powered emergency chatbot session |

### Blockchain Lifecycle

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/blockchain/status` | Connection health of the blockchain service |
| `GET` | `/blockchain/disaster/{disaster_id}` | Read on-chain disaster record |
| `POST` | `/blockchain/approve/{disaster_id}` | Approve a pending funding recommendation |
| `POST` | `/blockchain/reject/{disaster_id}` | Reject a recommendation with reason |
| `POST` | `/blockchain/release/{disaster_id}` | Release approved funds on-chain |

### Example Request — `/analyze`

```json
POST /analyze
{
  "query": "Severe flooding in Silchar, Assam. Water level rising rapidly."
}
```

### Example Response Structure

```json
{
  "disaster_id": "DIS-2026-abc123",
  "verification_status": "LIVE",
  "risk_level": "HIGH",
  "severity": 7.2,
  "confidence": 0.87,
  "mission_mode": "LIVE",
  "missions": [...],
  "preparedness_tasks": [],
  "nearby_hospitals": [
    { "name": "CHC Silchar", "lat": 24.82, "lon": 92.79, "distance_km": 3.1 }
  ],
  "nearby_shelters": [...],
  "budget": { "recommended_budget": 450000 },
  "blockchain": {
    "blockchain_status": "SUCCESS",
    "transaction_hash": "0xabc...",
    "gas_used": 42000
  },
  "government_report": "# DISASTER INTELLIGENCE REPORT\n...",
  "ngo_report": "# NGO ACTION PLAN\n...",
  "public_report": "# PUBLIC SAFETY ADVISORY\n..."
}
```

---

## Sample Report Output

### PREPAREDNESS Mode

```
# DISASTER INTELLIGENCE REPORT
Tracking ID: DIS-2026-xyz
Verification Status: PREPAREDNESS

## 1. Executive Summary
Flood monitoring at Howraghat, Assam — LOW risk (AI Confidence: 85%)

## 4. Resource Availability
Hospitals Found: Estimated 2 hospitals available.
Shelters Found: Estimated 1 shelter available.

**Hospitals:**
- CHC Howraghat (Unverified)
- Arogyao Clinic (Unverified)

**Shelters:**
- Community Relief Centre (Unverified)

## 6. Mission Plan
Planner Status: SUCCESS | Mode: PREPAREDNESS
**Preparedness Tasks:**
- [x] Weather Monitoring — track rainfall, wind speed, and flood alerts every 2 hours.
- [x] Shelter Inspection — verify structural integrity and capacity of all registered shelters.
- [x] Hospital Readiness — confirm emergency ward capacity and trauma team availability.
- [x] Medical Inventory Check — audit medicines, blood supply, and surgical kits.
- [x] Rescue Equipment Inspection — test boats, generators, ropes, and safety gear.
- [x] Volunteer Readiness — brief and deploy community volunteer teams.
- [x] Communication System Check — test satellite phones, sirens, and radio networks.
- [x] NDMA SOP Review — conduct tabletop exercise using latest standard procedures.
- [x] Community Awareness — distribute early-warning leaflets to vulnerable localities.
- [x] Early Warning Monitoring — ensure automated alert thresholds are active.

## 7. Budget
Total Recommended: $0.00

## 10. Blockchain Status
Status: SKIPPED -- Event Not Confirmed
Tx Hash: N/A
```

---

## Risk Decision Table

The Risk Assessment Agent uses a **fully deterministic** scoring engine. The LLM only explains the decision, never makes it.

| Verification Status | Severity | Confidence | Risk Level | Alert Mode |
|---|---|---|---|---|
| PREPAREDNESS | 0 | > 0.8 | LOW | MONITOR |
| PREPAREDNESS | 2–4 | any | MEDIUM | WATCH |
| LIVE | 5–7 | any | HIGH | URGENT |
| LIVE | > 8 | any | EXTREME | IMMEDIATE |
| HISTORICAL | any | any | LOW | MONITOR |

---

## Blockchain Architecture

The AapdaSetu Solidity smart contract (`AapdaSetu.sol`) provides an immutable audit trail for verified disasters:

```
storeDisaster(id, location, severity, confidence, amount, aiHash, metadataUri)
    → records on-chain
approveRecommendation(id, note)   → PENDING → APPROVED
rejectRecommendation(id, reason)  → PENDING → REJECTED
releaseFunds(id, note)            → APPROVED → RELEASED
getDisaster(id)                   → read record
getHistory(id)                    → read lifecycle events
```

**Verification Gate (enforced in `blockchain_service.py`):**
- `verification_status == LIVE` → submit transaction
- Any other status → return `SKIPPED` immediately; wallet/RPC/gas never initialised

**Mock Mode:** If `WEB3_PROVIDER_URI`, `BACKEND_WALLET_PRIVATE_KEY`, and `AAPDA_SETU_CONTRACT_ADDRESS` are not set, the service returns a mock transaction hash with no network calls.

---

## Testing

```powershell
# Run full test suite
.venv\Scripts\python -m pytest

# Run with verbose output
.venv\Scripts\python -m pytest -v

# Or via Makefile
make test
```

Test coverage includes:
- FastAPI endpoint handlers (`test_api.py`)
- LangGraph node routing transitions (`test_graph.py`)
- Tool outputs and fallback paths (`test_tools.py`)

---

## Development Commands (Makefile)

```bash
make help        # Show all available commands
make setup       # Create venv and install dependencies
make run         # Start FastAPI development server
make test        # Run pytest suite
make docker-up   # Build and launch Docker containers
make docker-down # Stop Docker containers and clean volumes
make clean       # Remove __pycache__, .venv, build artifacts
```

---

## Performance Notes

| Optimisation | Detail |
|---|---|
| **Embedding model singleton** | `BAAI/bge-small-en-v1.5` loaded once at first query; reused for all subsequent queries |
| **Vector store singleton** | ChromaDB client initialised once; `_VECTOR_STORE` cached globally |
| **Web3 singleton** | `_w3` and `_contract` cached after first LIVE transaction |
| **API response cache** | Hospital, shelter, and weather responses cached in `data/cache/` |
| **Context compression** | `StateSanitizer` and `PromptCompressor` keep LLM prompts within token budget |
| **No duplicate calls** | Each external API called at most once per pipeline execution |

---

## Limitations

- Supports **Flood** and **Earthquake** disaster types only.
- Geospatial queries use a **25 km radius** from the reported location.
- Hospital and shelter data sourced from **OpenStreetMap** — coverage varies by region.
- River discharge (GloFAS) data may have latency of several hours.
- Blockchain transactions target the **Sepolia testnet** — not mainnet.
- `datetime.utcnow()` deprecation warning exists in Python 3.12+ (non-breaking; future migration to `datetime.now(datetime.UTC)` planned).

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-change`
3. Make your changes following the existing code style
4. Run the test suite: `make test`
5. Submit a pull request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
Built for disaster relief coordination · AapdaSetu AI · 2026
</div>
