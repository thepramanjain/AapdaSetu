# EXECUTION PLAN — AI-Powered AapdaSetu
### Target: autonomous coding agent (Claude Code / Codex). Follow this document top to bottom, in order. Do not skip ahead, do not add features not listed here. Each section has explicit acceptance criteria — treat them as done/not-done checks, not suggestions.

---

## 0. PROJECT SUMMARY

Build a web platform where AI agents analyze a disaster, estimate damage, recommend funding, and stream their reasoning live to a UI ("AI Command Center"). A government user reviews and approves the AI's recommendation, which updates a fund table and the landing page stats. Citizens can submit a help request and see it move through a status timeline.

**Single most important deliverable:** the AI Command Center — a live, streaming, multi-agent pipeline visualized as a graph, backed by real LLM calls for at least 3 agents.

**Explicit non-goals — do NOT build these, do NOT scaffold placeholders beyond a single static screen for them:**
- Real blockchain / smart contracts (label as "Phase 2" in UI only)
- Real payment processing (UPI/Razorpay/Stripe) — fake a "Donate" button that shows a success toast
- Real OAuth/Google login — use hardcoded mock accounts
- Real SMS/WhatsApp/email sending
- i18n / multilingual support
- Offline sync
- Voice input
- More than 2 user roles with real auth (Citizen, Government). All other roles (NGO, Volunteer, Donor, Admin) get exactly one static page each, no auth gating needed beyond nav visibility.

If at any point a task not listed here seems tempting to add, do not add it. Finish the listed scope first.

---

## 1. TECH STACK (exact)

**Frontend**
- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- React Router v6
- React Query (TanStack Query) — for REST data fetching only, not for socket state
- Zustand — for lightweight global state (current user/role, active disaster)
- React Flow (`reactflow`) — agent pipeline graph
- Leaflet + `react-leaflet` — disaster map
- Recharts — charts
- Framer Motion — Command Center animations only
- Lucide React — icons
- socket.io-client

**Backend**
- Node.js + Express
- socket.io (server)
- better-sqlite3 (synchronous, zero-config, fastest for this timeline) — OR lowdb if you want pure JSON; use better-sqlite3
- @anthropic-ai/sdk
- dotenv
- cors
- nanoid (id generation)

**No build tooling beyond Vite. No microservices. Single backend process, single frontend app.**

---

## 2. REPO STRUCTURE (create exactly this tree)

```
disaster-relief-platform/
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── db/
│   │   │   ├── init.ts
│   │   │   └── seed.ts
│   │   ├── routes/
│   │   │   ├── disasters.ts
│   │   │   ├── requests.ts
│   │   │   ├── funds.ts
│   │   │   └── agents.ts
│   │   ├── agents/
│   │   │   ├── orchestrator.ts
│   │   │   ├── prompts.ts
│   │   │   ├── claudeClient.ts
│   │   │   └── mockAgents.ts
│   │   ├── sockets/
│   │   │   └── index.ts
│   │   └── types.ts
│   ├── data/
│   │   └── seed.json
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── citizen/
│   │   │   │   └── CitizenDashboard.tsx
│   │   │   ├── government/
│   │   │   │   └── GovernmentDashboard.tsx
│   │   │   ├── command-center/
│   │   │   │   └── AICommandCenter.tsx
│   │   │   └── stubs/
│   │   │       ├── NGODashboard.tsx
│   │   │       ├── VolunteerDashboard.tsx
│   │   │       ├── DonorDashboard.tsx
│   │   │       └── BlockchainExplorer.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── RoleGuard.tsx
│   │   │   ├── map/
│   │   │   │   └── DisasterMap.tsx
│   │   │   ├── cards/
│   │   │   │   └── StatCard.tsx
│   │   │   ├── command-center/
│   │   │   │   ├── AgentGraph.tsx
│   │   │   │   ├── AgentLogPanel.tsx
│   │   │   │   ├── ConfidenceGauge.tsx
│   │   │   │   └── ReasoningPanel.tsx
│   │   │   └── charts/
│   │   │       └── FundChart.tsx
│   │   ├── hooks/
│   │   │   └── useAgentSocket.ts
│   │   ├── store/
│   │   │   └── useAppStore.ts
│   │   ├── api/
│   │   │   └── client.ts
│   │   └── types/
│   │       └── index.ts
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   └── vite.config.ts
│
└── README.md
```

**Acceptance criteria for this step:** both `backend/` and `frontend/` run independently with `npm run dev`, no build errors, empty pages are fine at this stage.

---

## 3. ENVIRONMENT VARIABLES

`backend/.env` (create from `.env.example`):
```
ANTHROPIC_API_KEY=your_key_here
PORT=4000
FRONTEND_URL=http://localhost:5173
```

`frontend/.env`:
```
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

---

## 4. DATA MODELS

Define in `backend/src/types.ts` and mirror in `frontend/src/types/index.ts`:

```typescript
export interface Disaster {
  id: string;
  type: 'flood' | 'earthquake' | 'cyclone' | 'fire' | 'landslide';
  name: string;
  location: { lat: number; lng: number; district: string; state: string };
  severity: 'low' | 'medium' | 'high' | 'critical';
  populationAffected: number;
  reportedAt: string; // ISO date
  status: 'active' | 'monitoring' | 'resolved';
}

export interface AgentRun {
  id: string;
  disasterId: string;
  startedAt: string;
  status: 'running' | 'completed' | 'failed';
  steps: AgentStepResult[];
}

export interface AgentStepResult {
  agent: 'weather' | 'damage' | 'funding' | 'fraud' | 'ngo' | 'volunteer';
  status: 'pending' | 'running' | 'completed';
  isReal: boolean; // true = real Claude call, false = mocked
  output: Record<string, any>;
  completedAt?: string;
}

export interface FundingRecommendation {
  disasterId: string;
  recommendedBudgetINR: number;
  confidence: number; // 0-100
  reasoning: string[];
  requestedBudgetINR?: number;
  approvedBudgetINR?: number;
  releasedBudgetINR?: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface HelpRequest {
  id: string;
  citizenName: string;
  phone: string;
  location: string;
  disasterType: Disaster['type'];
  needs: ('medical' | 'food' | 'water' | 'shelter')[];
  status: 'submitted' | 'verified' | 'assigned' | 'dispatched' | 'completed';
  createdAt: string;
}

export interface NGO { id: string; name: string; focus: string; verified: boolean; }
export interface Volunteer { id: string; name: string; skills: string[]; available: boolean; }
```

---

## 5. SEED DATA

Create `backend/data/seed.json` with exactly:
- 5 disasters (one of each type), varied severity, real-sounding Indian locations (e.g. Assam flood, Gujarat earthquake, Odisha cyclone, Uttarakhand fire, Kerala landslide)
- 4 NGOs
- 6 volunteers
- 3 pre-existing help requests (varied statuses, for the citizen dashboard to show history)
- 1 pre-existing funding recommendation row (status: approved) so the government dashboard table isn't empty on first load

`backend/src/db/seed.ts` loads this JSON into SQLite tables on server start if tables are empty (idempotent seeding — check row count before inserting).

**Acceptance criteria:** `GET /api/disasters` returns the 5 seeded disasters after a fresh `npm run dev` in backend.

---

## 6. BACKEND — BUILD ORDER

### 6.1 Server bootstrap (`server.ts`)
- Express app, cors enabled for `FRONTEND_URL`
- HTTP server wraps Express so socket.io can attach
- Mount routes: `/api/disasters`, `/api/requests`, `/api/funds`, `/api/agents`
- Initialize DB + seed on boot
- Listen on `PORT`

### 6.2 Routes

**`GET /api/disasters`** → all disasters
**`GET /api/disasters/:id`** → single disaster

**`GET /api/requests`** → all help requests
**`POST /api/requests`** → body: `{citizenName, phone, location, disasterType, needs}` → creates with status `submitted`, returns created object
**`PATCH /api/requests/:id/advance`** → advances status to next stage in the timeline (submitted→verified→assigned→dispatched→completed), used to simulate progress for demo purposes

**`GET /api/funds`** → all funding recommendation rows
**`PATCH /api/funds/:disasterId/approve`** → body: `{approvedBudgetINR}` → sets status `approved`, sets `releasedBudgetINR` = approvedBudgetINR, returns updated row

**`POST /api/agents/run`** → body: `{disasterId}` → triggers `orchestrator.runPipeline(disasterId, io)` (fire-and-forget, responds `202 {runId}` immediately, progress comes via socket)

### 6.3 Agent orchestrator (`agents/orchestrator.ts`)

Implements this exact sequence, emitting socket events at each transition. Socket event names and payloads (must match frontend hook exactly):

```
emit('agent:status', { runId, agent, status: 'running' })
emit('agent:log', { runId, agent, message: string })
emit('agent:complete', { runId, agent, output, isReal })
emit('pipeline:complete', { runId, disasterId })
```

Sequence:
1. **weather** (REAL — Claude call via `prompts.weatherPrompt`)
2. **damage** (REAL — Claude call via `prompts.damagePrompt`, receives weather output as context)
3. **funding** (REAL — Claude call via `prompts.fundingPrompt`, receives damage output as context) → also writes/updates a row in the funds table with status `pending`
4. **fraud** (MOCK — `mockAgents.fraudCheck()`, artificial 1200ms delay, returns `{ flagged: false, message: "No anomalies detected in recent disbursement patterns" }`)
5. **ngo** (MOCK — `mockAgents.assignNGO()`, picks one seeded NGO matching disaster type if possible else random, 1000ms delay)
6. **volunteer** (MOCK — `mockAgents.assignVolunteers()`, picks 2 seeded volunteers, 1000ms delay)

After step 6, emit `pipeline:complete`.

### 6.4 Claude prompts (`agents/prompts.ts`)

Each prompt function returns a string. Each Claude call MUST use this system instruction pattern: **"Respond with ONLY valid JSON matching the schema below, no markdown fences, no preamble."** Use `claudeClient.ts` wrapping `@anthropic-ai/sdk`, model `claude-sonnet-4-6`... `max_tokens: 1024`, parse response text as JSON, strip any accidental \`\`\`json fences defensively before parsing.

**weatherPrompt(disaster) → schema:**
```json
{
  "riskScore": 0-100,
  "forecastSummary": "string, 2-3 sentences",
  "keyFactors": ["string", "string", "string"]
}
```
Prompt content: describe the disaster (type, location, population affected, severity) and ask the model to act as a disaster risk analysis agent estimating near-term risk escalation.

**damagePrompt(disaster, weatherOutput) → schema:**
```json
{
  "estimatedDamageINR": number,
  "affectedInfrastructure": ["string", "string"],
  "populationAtRisk": number,
  "severityAssessment": "string, 2-3 sentences"
}
```
Prompt content: pass disaster details + weather agent's output, ask the model to act as a damage estimation agent producing a realistic Indian-context damage estimate.

**fundingPrompt(disaster, damageOutput) → schema:**
```json
{
  "recommendedBudgetINR": number,
  "confidence": 0-100,
  "reasoning": ["string", "string", "string", "string"],
  "urgency": "low" | "medium" | "high" | "critical"
}
```
Prompt content: pass disaster + damage output, ask the model to act as a fund allocation agent, output a specific recommended budget in INR crores-equivalent (actual rupee number), a confidence percentage, and 3-5 bullet reasons (hospitals affected, roads blocked, rainfall prediction, population at risk — style of reasoning, drawn from actual context given, not hardcoded).

**Acceptance criteria for section 6:** `POST /api/agents/run` with a valid disasterId completes the full 6-step sequence, all real agents return valid parsed JSON (add try/catch with a hardcoded fallback JSON object if parsing fails, so a malformed response never crashes the pipeline), and a funds row is created/updated by the end.

---

## 7. FRONTEND — BUILD ORDER

### 7.1 Shell
- `App.tsx`: React Router routes for `/`, `/login`, `/citizen`, `/government`, `/command-center`, `/ngo`, `/volunteer`, `/donor`, `/blockchain`
- `Navbar.tsx`: shows nav items based on `useAppStore` current role; role switcher dropdown for demo convenience (lets you switch role without re-login — fine for a hackathon)
- `RoleGuard.tsx`: simple wrapper, redirects to `/login` if no role set in store — do not build real JWT validation

### 7.2 Login (mock)
- Two buttons: "Continue as Citizen" / "Continue as Government" — sets role in Zustand store, no backend call needed, no password fields

### 7.3 Landing (`Landing.tsx`)
- Hero section with 3 CTA buttons routing to `/citizen`, donate scroll-anchor, `/citizen` (report)
- `DisasterMap.tsx`: Leaflet map centered on India, markers from `GET /api/disasters`, marker color by severity (green/yellow/orange/red), popup shows name/type/population/severity
- Stat cards row using `StatCard.tsx`: Active Disasters (from API count), Funds Raised (hardcoded ₹ figure), People Helped (hardcoded), NGOs Active (seeded count), Volunteers (seeded count), Fraud Cases Prevented (hardcoded small number)
- "AI is currently monitoring..." — a small rotating text component, array of 4-5 static strings cycling every 3s (no real feed)
- Recent alerts: map over seeded disasters, render as cards

### 7.4 AI Command Center (`AICommandCenter.tsx`) — PRIORITY, BUDGET MOST TIME HERE
- Disaster selector dropdown (from `GET /api/disasters`)
- "Run Pipeline" button → `POST /api/agents/run { disasterId }`
- `useAgentSocket.ts` hook: connects to socket.io, listens for `agent:status`, `agent:log`, `agent:complete`, `pipeline:complete`, maintains local state map of agent statuses/outputs keyed by agent name
- `AgentGraph.tsx` (React Flow): 6 nodes laid out top-to-bottom: Weather → Damage → Funding → Fraud → NGO → Volunteer. Node visual states: gray (pending) / pulsing blue (running, use Framer Motion) / green with checkmark (completed). Edge between nodes animates when the downstream node starts.
- `AgentLogPanel.tsx`: scrolling terminal-style panel, appends a line for every `agent:log` and `agent:status` event, auto-scrolls to bottom, monospace font
- `ConfidenceGauge.tsx`: Recharts RadialBarChart, displays the `confidence` value from the funding agent's output once available, animates from 0 to final value
- `ReasoningPanel.tsx`: once funding agent completes, render its `reasoning` array as a bulleted "Why AI recommended this" card, plus the `recommendedBudgetINR` formatted in ₹ crores

### 7.5 Government Dashboard (`GovernmentDashboard.tsx`)
- Fund allocation table: columns Disaster | Requested | AI-Recommended | Approved | Status, data from `GET /api/funds`, joined client-side with disaster names
- Row-level "Approve" button (only visible if status is `pending`) → `PATCH /api/funds/:disasterId/approve` with the AI-recommended amount as default approvedBudgetINR (editable number input before confirming)
- `FundChart.tsx`: one Recharts BarChart comparing requested vs approved across disasters (seeded/live combined data is fine)
- Stat cards row: Active Disasters, Total Damage (sum from damage agent outputs if available else hardcoded), AI Recommendations count, Funds total

### 7.6 Citizen Dashboard (`CitizenDashboard.tsx`)
- "Request Help" form: name, phone, location, disaster type dropdown, needs checkboxes (medical/food/water/shelter) → `POST /api/requests`
- "My Requests" list: `GET /api/requests`, render each with a horizontal status timeline (5 stages, current stage highlighted) — include a demo-only "Advance Status →" button next to each request calling `PATCH /api/requests/:id/advance`, so you can show progression live without waiting for real logistics

### 7.7 Stub pages (NGO / Volunteer / Donor / Blockchain)
Each is a single static page, no data fetching required (hardcoded arrays inline in the component is fine):
- **NGODashboard.tsx**: 3-4 hardcoded task cards with "Accept Task" button (local state toggle only, no API)
- **VolunteerDashboard.tsx**: 3 hardcoded mission cards
- **DonorDashboard.tsx**: hardcoded donation history table + one impact stat card
- **BlockchainExplorer.tsx**: 2 static "transaction" rows with fake hash strings, banner at top: "Blockchain verification launching in Phase 2 — shown here as a preview of the planned architecture"

**Acceptance criteria for section 7:** clicking "Run Pipeline" on the Command Center with backend running produces visible sequential node activation, live log lines, a populated confidence gauge, and a populated reasoning panel within ~15-30 seconds (real Claude latency), with zero console errors.

---

## 8. STYLING

- Dark theme by default (Tailwind `dark` class on `<html>`, no light mode toggle needed)
- Base palette: near-black background (`#0a0e14` or similar), card surfaces slightly lighter with subtle border (`#151b26`), accent colors strictly: green `#22c55e` (low/completed), yellow `#eab308` (medium/pending), orange `#f97316` (high), red `#ef4444` (critical/running-alert)
- Command Center specifically: glassmorphism cards (`backdrop-blur`, translucent background), subtle glow on active agent nodes
- Consistent spacing via Tailwind scale, no custom pixel values
- Use shadcn/ui `Card`, `Button`, `Badge`, `Table`, `Dialog`, `Select` components rather than hand-rolling primitives

---

## 9. BUILD SEQUENCE (strict order — do not reorder)

1. Repo scaffold (Section 2) — both apps boot empty
2. Backend: DB + seed + `GET /api/disasters` working, verified via curl/browser
3. Backend: remaining REST routes (requests, funds) working, verified via curl
4. Backend: Claude client + 3 prompts, test each in isolation with a script (`ts-node` one-off) before wiring into orchestrator — verify JSON parses cleanly
5. Backend: orchestrator + socket events, test end-to-end with a minimal socket client script or Postman before touching frontend
6. Frontend: shell, routing, navbar, mock login
7. Frontend: Landing page (map + stats + alerts)
8. Frontend: AI Command Center — this is the largest single task, budget the most time and do not move on until "Run Pipeline" works end-to-end with real streaming data
9. Frontend: Government Dashboard, wire approve flow, confirm fund table updates propagate back to Landing stat cards on refresh
10. Frontend: Citizen Dashboard
11. Frontend: stub pages
12. Styling pass across all pages for visual consistency
13. End-to-end smoke test: fresh `npm run dev` on both, walk the full demo script (Landing → Command Center run → Government approve → Citizen request) with zero errors
14. Add a `FALLBACK_MODE` env flag: if set, orchestrator skips real Claude calls and returns pre-saved sample JSON outputs instantly — build this last as insurance against API issues during the actual demo

---

## 10. DEFINITION OF DONE (verify every line before considering the build complete)

- [ ] `npm run dev` in both `backend/` and `frontend/` starts cleanly with no errors
- [ ] Landing page loads map with 5 markers and stat cards with no console errors
- [ ] Login → role selection → correct nav items shown
- [ ] Command Center: selecting a disaster + clicking Run Pipeline animates all 6 nodes in sequence, log panel streams text, confidence gauge and reasoning panel populate from real Claude output
- [ ] Government Dashboard: fund table shows the row created by the last pipeline run, Approve button updates status and released amount
- [ ] Citizen Dashboard: submitting the form creates a request visible in "My Requests" with a working status timeline and advance button
- [ ] All 4 stub pages render without errors and are reachable from nav
- [ ] `FALLBACK_MODE=true` produces an instant, believable pipeline run with no network calls, as a demo safety net
- [ ] No feature outside this document has been added

Do not proceed past this checklist to add unlisted features. If time remains after every box is checked, refer back to the human-facing build plan's "Stretch Goals" section for what to add next, in the order listed there.
