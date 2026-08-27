# AapdaSetu AI — Disaster Intelligence Platform

<div align="center">

**AI Detects • Actionable Planning • Relief Reaches**

[![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-orange)](https://langchain-ai.github.io/langgraph/)
[![Gemini](https://img.shields.io/badge/LLM-Gemini%20%7C%20Groq-purple?logo=google)](https://ai.google.dev/)
[![Web3](https://img.shields.io/badge/Blockchain-Web3.py%20%7C%20Sepolia-blueviolet?logo=ethereum)](https://web3py.readthedocs.io/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](LICENSE)

</div>

---

## Overview

**AapdaSetu** (meaning *Bridge to Relief* in Hindi) is a production-hardened, autonomous multi-agent AI platform for real-time natural disaster intelligence. It seamlessly integrates a powerful **React frontend** with a robust **FastAPI backend** to ingest plain-language citizen or agency reports, orchestrating a chain of specialised AI agents to produce:

- Structured **stakeholder reports** (Government / NGO / Public)
- **Risk classification** (LOW / MEDIUM / HIGH / URGENT / EXTREME) with deterministic scoring
- **Mission queue** with prioritised rescue or preparedness tasks
- **Resource discovery** — live hospitals and shelters from OpenStreetMap
- **Safe evacuation routing** via OSRM
- **Budget estimation** with heuristic funding recommendations
- **Blockchain audit trail** — on-chain disaster record via Ethereum smart contract (Sepolia Testnet)
- **NDMA-grounded advisory** via local RAG over official guidelines

Designed for **Flood** and **Earthquake** disaster types. All agents are stateless LangGraph nodes; the graph is fully deterministic at the routing layer with LLMs (Gemini/Groq) used only for data enrichment and advisory generation.

---

## Architecture

### LangGraph Multi-Agent Flow

```text
┌──────────────────────────────────────────────────────────────┐
│                        INPUT                                 │
│  "Heavy flooding reported at Howraghat, Assam"               │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   1. Coordinator Agent  │  ← Geocodes location (Nominatim OSM)
              │      Intent Parser      │    Classifies disaster type (Gemini/Groq)
              │      Verification       │    Determines verification_status
              └──────────┬──────────────┘    
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
          └──────────┬──────────────┘    
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
          │                         │    → confidence → weather 
          └──────────┬──────────────┘
                     │
                     ▼
          ┌─────────────────────────┐
          │  7. Mission Planner     │  ← Deterministic task registries
          │     Agent               │    LIVE     → rescue missions
          │                         │    PREPAREDNESS → checklists
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
          │                         │    Immutable audit logs on Sepolia
          └──────────┬──────────────┘
                     │
                     ▼
          ┌─────────────────────────┐
          │  10. Reports Service    │  ← Streaming SSE updates to React Frontend
          │                         │    Government / NGO / Public reports
          └─────────────────────────┘
```

---

## Key Design Principles

| Principle | Implementation |
|---|---|
| **Full Stack Integration** | React Vite frontend seamlessly calls FastAPI endpoints and streams real-time SSE updates. |
| **Deterministic routing** | Verification status drives every decision; LLM never controls flow |
| **Schema safety** | Resource Agent normalises all LLM output — strings, dicts, mixed lists, null |
| **Non-empty guarantees** | Mission Planner always returns tasks via built-in registries |
| **Blockchain gate** | Web3/RPC/wallet initialised only when `verification_status == LIVE` |
| **Singleton caches** | Embedding model, vector store, Web3 client loaded once and reused |

---

## Quick Start (Local Setup)

### 1. Configure Environment
Copy `.env.example` to `.env` in the root directory:
```env
ENV=dev
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=sqlite:///./aapdasetu.db

# Blockchain Sepolia (Optional, falls back to Mock mode if blank)
WEB3_PROVIDER_URI=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_key
AAPDA_SETU_CONTRACT_ADDRESS=0xF84b71d0395139705E535651dddB2bbdD93a904C
BACKEND_WALLET_PRIVATE_KEY=your_wallet_private_key
```

### 2. Run Backend (Python)
```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\activate

# Install dependencies and build RAG vector index
pip install -r requirements.txt
python scripts/preprocess.py

# Start FastAPI server
python -m uvicorn backend.main:app --port 8000 --reload
```
* Interactive API docs: **http://127.0.0.1:8000/docs**

### 3. Run Frontend (React)
Open a new terminal window:
```bash
cd Frontend
npm install
npm run dev
```
* App URL: **http://localhost:5173**

---

## Smart Contract Details (Sepolia)
* **Contract Address:** `0xF84b71d0395139705E535651dddB2bbdD93a904C`
* **On-Chain Functions:** `storeDisaster`, `approveRecommendation`, `releaseFunds`, `getDisaster`
