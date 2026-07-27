# PROJECT_PLAN.md — ReliefChain AI

**Tagline:** AI Detects • Blockchain Verifies • Relief Reaches
**Team:** ANPX
**Members:** Praman Jain, Prasun Singh, Member 3, Member 4

---

## Table of Contents

1. [Vision](#1-vision)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Objectives](#4-objectives)
5. [Scope (MVP vs Future)](#5-scope-mvp-vs-future)
6. [Team Roles & Responsibilities](#6-team-roles--responsibilities)
7. [System Architecture](#7-system-architecture)
8. [End-to-End Workflow](#8-end-to-end-workflow)
9. [Tech Stack (with reasoning)](#9-tech-stack-with-reasoning)
10. [Folder Structure](#10-folder-structure)
11. [Database Schema](#11-database-schema)
12. [AI Agent Architecture (LangGraph/LangChain)](#12-ai-agent-architecture-langgraphlangchain)
13. [Prompt Engineering Notes](#13-prompt-engineering-notes)
14. [API Specifications](#14-api-specifications)
15. [Blockchain & Smart Contract Architecture](#15-blockchain--smart-contract-architecture)
16. [Blockchain Transaction Flow](#16-blockchain-transaction-flow)
17. [Dashboard Features](#17-dashboard-features)
18. [Security Considerations](#18-security-considerations)
19. [Development Milestones & Timeline](#19-development-milestones--timeline)
20. [Git Branching Strategy](#20-git-branching-strategy)
21. [Deployment Plan](#21-deployment-plan)
22. [Testing Checklist](#22-testing-checklist)
23. [Demo Preparation](#23-demo-preparation)
24. [Future Improvements](#24-future-improvements)

---

## 1. Vision

ReliefChain AI is an autonomous, multi-agent AI system that detects natural disasters in near real-time, verifies their authenticity, assesses severity, identifies beneficiaries, and recommends relief funding — with every decision permanently and transparently recorded on a Layer-1 blockchain. The goal is to compress the time between "disaster happens" and "relief reaches the right people," while eliminating manual bottlenecks, corruption, and duplicate/fraudulent claims.

**Core philosophy:** AI is the brain of the system. Blockchain is a tool the AI uses — specifically for immutable audit trails, transparent approvals, and tamper-proof transaction records. Actual fund movement happens through conventional rails (Bank API / UPI), not crypto wallets, so the system stays usable by governments and NGOs without requiring citizens to hold crypto.

---

## 2. Problem Statement

Relief distribution after natural disasters is slow and unreliable because of:

- Manual disaster verification (human teams must confirm before aid is authorized)
- Slow beneficiary identification (paperwork, local surveys)
- Corruption in fund allocation (money diverted before reaching victims)
- Lack of transparency (no public visibility into who got what and why)
- Duplicate/fake claims (same household claiming multiple times)
- No immutable audit trail (records can be altered or lost)

---

## 3. Proposed Solution

An autonomous AI agent pipeline that:

1. Continuously collects disaster-relevant data (weather, satellite, news, citizen reports, government alerts)
2. Verifies whether a reported disaster is genuine
3. Calculates severity and predicted impact
4. Identifies and prioritizes beneficiaries
5. Generates a funding recommendation
6. Writes the decision + supporting evidence to a smart contract on a Layer-1 blockchain
7. Triggers real-world disbursement via Bank API / UPI, gated by government approval
8. Exposes everything on a public, auditable dashboard

**Why blockchain isn't the "money mover":** Early designs assumed a simple Government → NGO → People flow, but that reintroduces the same trust problem the project is meant to solve ("what if NGOs steal the money?"). The revised design uses blockchain purely as an incorruptible ledger and rules engine (smart contracts enforce approval logic), while actual money moves through regulated bank rails so funds remain traceable, reversible in case of error, and usable by non-crypto-native citizens.

---

## 4. Objectives

- Reduce disaster-to-relief latency from days/weeks to hours
- Provide a tamper-proof, publicly verifiable audit trail for every relief decision
- Automatically flag and reject low-confidence or suspicious disaster reports
- Prioritize vulnerable groups (children, women, elderly, hospitals) in beneficiary ranking
- Keep a human-in-the-loop for low-confidence or high-value decisions
- Demonstrate a working, demo-able pipeline within the hackathon timeframe

---

## 5. Scope (MVP vs Future)

**MVP (hackathon build):**
- Simulated/mocked external data feeds (weather, news, satellite) if live APIs are rate-limited
- Working LangGraph pipeline: Collector → Verifier → Risk Assessment → Beneficiary → Decision
- Smart contract on a testnet (e.g., Sepolia) recording verification + decision hashes
- Basic dashboard showing the pipeline's decisions and blockchain transaction records
- Mocked Bank API / UPI disbursement (no real money movement)

**Explicitly out of scope for MVP:**
- Real government integration / real citizen KYC
- Real fund disbursement
- Production-grade security hardening
- Mobile app

---

## 6. Team Roles & Responsibilities

| Track | Owner (suggested) | Responsibilities |
|---|---|---|
| **AI / Agents** | Praman Jain | LangChain/LangGraph pipeline, prompt engineering, agent state design, RAG + ChromaDB memory, confidence scoring logic |
| **Blockchain** | Prasun Singh | Solidity smart contracts, ethers.js integration, wallet/testnet setup, blockchain_tool.py, gas/transaction handling |
| **Backend** | Member 3 | FastAPI service, API endpoints, database (PostgreSQL) models, connecting AI pipeline output to blockchain tool and frontend |
| **Frontend / Dashboard** | Member 4 | React + Tailwind dashboard, visualizing agent decisions, transaction history, beneficiary lists, public audit view |
| **Integration & Demo** | Shared (rotate) | End-to-end wiring, Docker setup, deployment, demo script, PPT/slide content |

Everyone should have baseline understanding of the full flow so the demo can be presented by any member.

---

## 7. System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        DATA SOURCES LAYER                      │
│   Weather API │ News API │ Satellite API │ Citizen Reports │    │
│                     Government Alerts                          │
└───────────────────────────────┬────────────────────────────────┘
                                 ▼
                        Data Aggregation Layer
                                 ▼
┌───────────────────────────────────────────────────────────────┐
│                 AUTONOMOUS AI AGENT (LangGraph)                 │
│  Collector → Verifier → Risk Assessment → Beneficiary → Decision│
│         (shared graph state passed node to node)                │
└───────────────────────────────┬────────────────────────────────┘
                                 ▼
                          Smart Contract Call
                                 ▼
┌───────────────────────────────────────────────────────────────┐
│                    LAYER-1 BLOCKCHAIN (Ethereum testnet)        │
│     Immutable record: confidence, severity, decision, tx_hash   │
└───────────────────────────────┬────────────────────────────────┘
                                 ▼
                        Government Approval Gate
                                 ▼
                          Bank API / UPI (mocked)
                                 ▼
                              Citizen
                                 ▼
                         Public Dashboard
```

**Architectural principle:** Every layer is independently replaceable. The AI pipeline doesn't need to know blockchain internals (it calls a `blockchain_tool`); the blockchain doesn't need to know how disbursement happens (it just emits an approved decision); the dashboard just reads from the database + chain, it doesn't drive logic.

---

## 8. End-to-End Workflow

1. **Ingestion:** External APIs and citizen reports feed into a Data Aggregation layer, normalized into a common schema.
2. **Collection:** The Collector Agent pulls the latest weather, news, satellite, and alert data for a given location/event.
3. **Verification:** The Verifier Agent cross-checks sources and produces a **confidence score** (e.g., 94%).
4. **Routing:** If confidence > 90%, the pipeline continues automatically. Otherwise, it routes to **Human Review** or ends (rejected).
5. **Risk Assessment:** Predicts damage extent, population affected, and assigns a priority level.
6. **Beneficiary Identification:** Builds a prioritized beneficiary list, weighting children, women, elderly, and hospitals higher.
7. **Decision:** The Decision Agent decides whether to release funds. If yes, it builds a blockchain payload; if no, it logs a rejection.
8. **Blockchain Write:** The payload (confidence, severity, beneficiary summary, decision) is hashed and written to a smart contract, producing a `tx_hash`.
9. **Government Approval:** A human/government actor reviews and approves the on-chain decision before funds move.
10. **Disbursement:** Approved decisions trigger a Bank API / UPI payout (mocked in MVP).
11. **Transparency:** All of the above is visible on the Public Dashboard, linked to the on-chain `tx_hash` for independent verification.

---

## 9. Tech Stack (with reasoning)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Tailwind | Fast to build, component-driven, easy to make a clean dashboard quickly for a hackathon |
| Backend | FastAPI | Async-native, plays well with LangChain/LangGraph, auto-generates OpenAPI docs, fast to prototype |
| Database | PostgreSQL | Relational integrity for beneficiaries, disasters, and decisions; strong JSON support for flexible agent payloads |
| Vector DB | ChromaDB | Lightweight, embeddable, no separate infra needed — good for storing past disaster cases and SOP documents for RAG |
| AI Orchestration | LangChain | Standard abstractions for prompts, tools, chains, output parsing |
| Agent Workflow | LangGraph | Explicit graph-based control flow with shared state and conditional routing — better fit than a single monolithic agent for a multi-step, auditable decision pipeline |
| LLM Provider | OpenAI | Reliable function/tool-calling support, fast to integrate |
| Blockchain | Ethereum (Layer-1, testnet e.g. Sepolia) | Widely supported tooling, large ecosystem, easy for judges to verify on a public explorer |
| Smart Contracts | Solidity | Standard for EVM chains, huge amount of tooling/AI (Copilot) support |
| Chain Interaction | ethers.js | Mature JS library for contract calls, well documented |
| Wallet | MetaMask | Simplest wallet integration for demo purposes |
| Deployment | Docker, Railway, Vercel | Docker for consistent local/prod parity; Railway for backend/db hosting; Vercel for frontend — all fast to set up for a hackathon timeline |

---

## 10. Folder Structure

```
ReliefChainAI/
├── data/                       # sample/mock disaster data, SOP PDFs for RAG
├── agents/
│   ├── collector.py
│   ├── verifier.py
│   ├── risk.py
│   ├── beneficiary.py
│   └── decision.py
├── tools/
│   ├── weather_tool.py
│   ├── news_tool.py
│   └── blockchain_tool.py
├── graph.py                    # LangGraph definition wiring all agents
├── prompts/                    # prompt templates per agent
├── memory/                     # ChromaDB setup + RAG ingestion scripts
├── backend/
│   ├── main.py                 # FastAPI app entrypoint
│   ├── routers/
│   ├── models/                 # Pydantic + ORM models
│   └── db/                     # PostgreSQL connection, migrations
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/
│   └── public/
├── blockchain/
│   ├── contracts/
│   │   └── ReliefChain.sol
│   ├── scripts/                # deploy scripts
│   └── test/                   # contract tests
├── notebook.ipynb              # Colab prototyping notebook
├── docker-compose.yml
└── README.md
```

---

## 11. Database Schema

**disasters**
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| location | TEXT | |
| event_type | TEXT | e.g. flood, earthquake |
| reported_at | TIMESTAMP | |
| confidence_score | FLOAT | from Verifier Agent |
| severity_score | FLOAT | from Risk Assessment Agent |
| status | TEXT | pending / verified / rejected |
| raw_data | JSONB | collected weather/news/satellite payload |

**beneficiaries**
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| disaster_id | UUID (FK → disasters.id) | |
| name | TEXT | |
| category | TEXT | child / woman / elderly / hospital / general |
| priority_rank | INT | |
| location | TEXT | |
| verified | BOOLEAN | |

**decisions**
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| disaster_id | UUID (FK → disasters.id) | |
| decision | TEXT | approved / rejected |
| amount_recommended | NUMERIC | |
| tx_hash | TEXT | on-chain transaction hash |
| government_approved | BOOLEAN | |
| created_at | TIMESTAMP | |

**transactions**
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| decision_id | UUID (FK → decisions.id) | |
| tx_hash | TEXT | |
| block_number | BIGINT | |
| disbursement_status | TEXT | pending / completed / failed |
| disbursed_at | TIMESTAMP | |

---

## 12. AI Agent Architecture (LangGraph/LangChain)

**Graph flow:**
```
START → Collector → Verifier → (conditional) → Risk Assessment → Beneficiary → Decision → END
                                     │
                                     └─ if confidence ≤ 90% → Human Review or END (rejected)
```

**Shared Graph State (example):**
```python
class GraphState(TypedDict):
    location: str
    weather: dict
    news: dict
    satellite: dict
    confidence: float
    severity: float
    beneficiaries: list
    decision: str
    tx_hash: str | None
```

**Agent responsibilities:**

- **Collector Agent** — Pulls weather, news, satellite, and government alert data for the target location; normalizes into shared state.
- **Verifier Agent** — Cross-references sources, outputs a confidence score (e.g. 94%) on whether the disaster is genuine.
- **Risk Assessment Agent** — Predicts damage, population affected, and assigns a priority tier.
- **Beneficiary Agent** — Builds and ranks the beneficiary list, prioritizing children, women, elderly, and hospitals.
- **Decision Agent** — Decides fund release; on approval, builds the blockchain payload; on rejection, logs the reason.

**Conditional routing rule:** confidence > 90% → continue automatically; otherwise → human review / end.

**LangChain concepts used, in learning order:** Prompt Templates → Chains → Output Parsers → Tools → Memory → Agents → Tool Calling → LangGraph.

**Memory / RAG:**
- ChromaDB stores previous disasters, previous decisions, historical cases, and government SOPs.
- A separate RAG store holds government disaster guidelines, WHO documents, NDRF SOPs, and disaster-response PDFs, so agents can ground severity/beneficiary decisions in real protocols rather than free-form LLM judgment.

---

## 13. Prompt Engineering Notes

- Each agent gets its own prompt template stored under `prompts/`, kept short and structured (system role + expected output schema).
- Use output parsers (e.g., Pydantic-based) so every agent returns structured JSON that maps directly onto `GraphState` fields — this avoids brittle string parsing between nodes.
- The Verifier Agent's prompt should explicitly require a numeric confidence score and a short justification, so the routing logic has something deterministic to branch on.
- The Decision Agent's prompt should require citing which SOP/guideline (via RAG) informed the recommended amount, for auditability.

---

## 14. API Specifications

Base URL (dev): `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/disasters/ingest` | Trigger data collection for a location; kicks off the LangGraph pipeline |
| GET | `/disasters/{id}` | Get full disaster record incl. confidence, severity, status |
| GET | `/disasters/{id}/beneficiaries` | List ranked beneficiaries for a disaster |
| POST | `/disasters/{id}/decision` | Manually trigger/override the Decision Agent (human review path) |
| GET | `/decisions/{id}` | Get a decision record incl. `tx_hash` |
| POST | `/blockchain/write` | Internal: write a decision payload to the smart contract |
| GET | `/blockchain/tx/{tx_hash}` | Fetch on-chain transaction details for the dashboard |
| POST | `/disbursement/{decision_id}` | Trigger mocked Bank API / UPI payout |
| GET | `/dashboard/summary` | Aggregate stats for the public dashboard |

All endpoints return JSON; errors follow `{ "error": string, "detail": string }`.

---

## 15. Blockchain & Smart Contract Architecture

**Contract: `ReliefChain.sol`**

Core responsibilities:
- Store a record per disaster decision: `disasterId`, `confidence`, `severity`, `decisionHash`, `amountRecommended`, `approved` (bool), `timestamp`.
- Emit an event (`DecisionRecorded`) whenever a new decision is written, so the frontend/dashboard can listen or query logs.
- Restrict "government approval" actions to a whitelisted address/role (simple `onlyGovernment` modifier for MVP; can evolve to multi-sig).
- Keep contract logic minimal — the heavy lifting (AI reasoning) happens off-chain; the contract's job is to be the tamper-proof record and gatekeeper for the approval step.

**Development approach:** Start with a fake `send_transaction()` tool in Python that returns a mock `tx_hash`, so the AI pipeline can be built and tested end-to-end without blockchain being ready. Swap in real `ethers.js`/Solidity calls once the contract is deployed to testnet — this was an explicit priority decision (AI first, blockchain last) to reduce complexity during the learning curve.

---

## 16. Blockchain Transaction Flow

```
Decision Agent (approved)
        ↓
Build payload {disasterId, confidence, severity, amount, decisionHash}
        ↓
blockchain_tool.py → ethers.js call → ReliefChain.sol
        ↓
Transaction mined on testnet → tx_hash returned
        ↓
tx_hash + block_number stored in `transactions` table
        ↓
Government wallet calls `approve(disasterId)` on-chain
        ↓
Backend listens for `DecisionRecorded`/`Approved` event
        ↓
Triggers mocked Bank API / UPI disbursement
        ↓
Dashboard displays tx_hash linked to a public block explorer
```

---

## 17. Dashboard Features

- **Live disaster feed:** incoming disasters with status (pending / verified / rejected)
- **Confidence & severity visualization:** score bars/gauges per disaster
- **Beneficiary list view:** ranked, filterable by category (children/women/elderly/hospitals)
- **Decision & audit trail:** every decision with its on-chain `tx_hash`, linked to a public explorer (e.g., Sepolia Etherscan)
- **Government approval panel:** simple approve/reject UI for the human-in-the-loop step
- **Public transparency view:** read-only page anyone can access to verify a specific disaster's full history
- **Stats summary:** total disasters processed, funds recommended vs. disbursed, average response time

---

## 18. Security Considerations

- Validate and sanitize all external API data before it enters the AI pipeline (avoid prompt injection via news/citizen report text).
- Keep the government-approval role restricted on-chain (access control modifier), not just enforced in the frontend.
- Never store real financial credentials in the repo; use environment variables (`.env`, excluded via `.gitignore`).
- Rate-limit the `/disasters/ingest` endpoint to avoid pipeline abuse/spam.
- Log every agent decision with inputs used, so any output can be traced back and explained (important both for security review and for the "transparency" pitch).
- For MVP, disbursement is mocked — explicitly do not connect real payment credentials during the hackathon.

---

## 19. Development Milestones & Timeline

**Day 1 — Foundations**
- Set up Colab notebook, install libraries (`langchain`, `langgraph`, `langchain-openai`, `chromadb`, `tavily`, `python-dotenv`, `fastapi`, `pydantic`)
- Learn core LangChain concepts

**Day 2 — Agents basics**
- Learn LangChain Agents & Tool Calling
- Build first standalone tool (e.g., `weather_tool.py`) and test in isolation

**Day 3 — LangGraph**
- Learn LangGraph fundamentals
- Build a skeleton graph with **dummy nodes**: Collector → Verifier → Risk → Decision, to validate the flow and shared state before adding real logic

**Day 4 — Collector & Verifier**
- Replace dummy Collector/Verifier with real API calls and confidence scoring logic

**Day 5 — Risk & Decision**
- Build Risk Assessment and Decision agents; wire conditional routing (confidence > 90%)
- Add ChromaDB + RAG for SOP-grounded decisions

**Day 6 — Complete AI pipeline**
- End-to-end test of the full LangGraph pipeline with real/mocked data
- Fix state-passing bugs, finalize output schemas

**Day 7 — Blockchain**
- Write and test `ReliefChain.sol`, deploy to testnet
- Replace fake `send_transaction()` with real ethers.js calls

**Day 8 — Backend & Frontend integration**
- Wire FastAPI endpoints to the AI pipeline and blockchain tool
- Build React dashboard consuming the API

**Day 9 — Polish & Demo prep**
- End-to-end testing, bug fixes, seed demo data
- Build the 6-slide deck, rehearse demo script

*(Compress or expand days based on actual hackathon duration — this is a dependency-ordered plan, not a fixed calendar.)*

---

## 20. Git Branching Strategy

- `main` — always demo-ready, protected branch
- `develop` — integration branch, merged into `main` only when stable
- Feature branches off `develop`, named by track:
  - `feature/ai-collector-agent`
  - `feature/ai-langgraph-pipeline`
  - `feature/blockchain-contract`
  - `feature/backend-api`
  - `feature/frontend-dashboard`
- Open a PR into `develop` for every feature branch; at least one teammate reviews before merge, even in a hackathon, to catch integration breaks early
- Tag a `demo-ready` commit/tag before the final presentation as a rollback point
- Commit small and often — large, infrequent commits make merge conflicts painful under time pressure

---

## 21. Deployment Plan

- **Local dev:** `docker-compose up` running FastAPI + PostgreSQL + frontend together for consistent local testing
- **Backend + DB:** Deploy to Railway (or similar PaaS) for a public URL judges can hit
- **Frontend:** Deploy to Vercel, pointed at the Railway backend URL
- **Blockchain:** Deploy `ReliefChain.sol` to a public testnet (e.g., Sepolia) via a deploy script (Hardhat/Foundry), so transactions are verifiable on a public explorer
- **Environment variables:** manage via `.env` locally and the platform's secret manager in deployment (never commit secrets)
- **Smoke test after deploy:** run one full disaster-ingest-to-dashboard cycle against the deployed stack before the demo

---

## 22. Testing Checklist

- [ ] Each agent (Collector, Verifier, Risk, Beneficiary, Decision) tested in isolation with mock inputs
- [ ] LangGraph conditional routing tested for both branches (confidence > 90% and ≤ 90%)
- [ ] Shared graph state correctly passed and mutated across all nodes
- [ ] ChromaDB/RAG returns relevant SOP context for a sample query
- [ ] Smart contract unit tests (deploy, write decision, emit event, access control on approval)
- [ ] `blockchain_tool.py` correctly calls the contract and returns a real `tx_hash` on testnet
- [ ] FastAPI endpoints return correct status codes and payloads for happy path + error cases
- [ ] Database writes for `disasters`, `beneficiaries`, `decisions`, `transactions` are consistent (no orphaned records)
- [ ] Dashboard correctly renders live data (not stale/mocked) from backend
- [ ] Full end-to-end run: ingest → verify → decide → blockchain write → approval → mocked disbursement → dashboard update
- [ ] Error handling: pipeline gracefully handles a failed/unavailable external API
- [ ] Load check: pipeline handles at least 2–3 concurrent disaster ingests without state collision

---

## 23. Demo Preparation

- Prepare 2–3 seeded disaster scenarios in advance (one clearly genuine/high-confidence, one ambiguous/low-confidence to show human review routing, one clearly fake to show rejection)
- Have the public block explorer link open and ready to show a real on-chain transaction during the demo
- Rehearse a tight narrative: Problem → Live demo (ingest → AI decision → blockchain record → dashboard) → Architecture slide → Impact/scalability close
- Have a fallback: pre-recorded screen capture of a successful run, in case live APIs/network fail during presentation
- Assign one speaker per section (Problem, AI, Blockchain, Demo, Impact) so the whole team is visibly involved
- Time the demo — hackathon slots are usually tight; know exactly which parts to cut if running long

**PPT (6 slides), already drafted:**
1. Title — ReliefChain AI, team, tagline
2. Problem + Solution
3. Technology Stack
4. Workflow
5. Architecture
6. Feasibility, Scalability, Impact

Design direction: dark theme, glassmorphism, professional startup-deck style (comparable to YC/Microsoft Build/Google I/O decks) — can be generated via Gamma, Canva AI, Beautiful.ai, or Tome using this same content as the source outline.

---

## 24. Future Improvements

- Real integration with government disaster-response systems and verified NGO partners
- Move from testnet to a production-grade Layer-1 or L2 for lower gas costs at scale
- Real Bank API / UPI disbursement with proper KYC and fraud checks
- Drone and IoT sensor data as additional Collector Agent inputs
- Multi-signature government approval instead of single-address approval
- Mobile app for citizen self-reporting and beneficiary status tracking
- Multilingual support for citizen reports and dashboard (critical for real-world disaster zones)
- Explainability layer: let any citizen query *why* a specific decision was made, backed by the RAG-grounded SOP citations
- Offline-first data collection for citizen reports in areas with damaged network infrastructure

---

*This document is the single source of truth for ReliefChain AI's build. Update it as architectural decisions change — treat it as living documentation, not a one-time write-up.*
