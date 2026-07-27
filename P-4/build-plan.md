# AapdaSetu — Solo 36-Hour Build Plan

**Team:** 1 person · **Time:** 24–36 hrs · **Demo star:** AI Command Center (multi-agent orchestration)

---

## 1. The Hard Truth First

The original spec is a 6-role, 10-agent, blockchain-integrated enterprise platform. That's a 3–6 month team project. Built solo in 36 hours, attempting all of it guarantees a broken demo. The fix isn't to build less impressively — it's to build **one thing deep** (the AI Command Center) and **everything else just deep enough to sell the story**.

**Judging reality:** judges remember the one moment that felt magical, not the number of pages you built. Your magic moment is watching AI agents reason through a disaster in real time and produce a funding recommendation. Everything else exists to make that moment feel grounded in a real product.

**Golden rule for the next 36 hours:** if a feature doesn't either (a) feed the AI Command Center demo, or (b) prove the platform is "real" in under 10 seconds of judge attention, cut it or fake it.

---

## 2. What You're Actually Building

A **3-screen narrative**, not a 6-role platform:

1. **Landing page** — proves vision, 60 seconds of judge scroll
2. **AI Command Center** — the hero feature, 3–4 minutes of live demo
3. **Government Dashboard** — shows the *output* of the AI (fund allocation table, approval flow) — proves it's not just a toy

Everything else (Citizen app, NGO portal, Volunteer app, Donor dashboard, blockchain explorer) becomes **1–2 static/mocked screens each**, enough to click through and say "this exists too, here's the flow" — no real backend logic behind them.

---

## 3. Cut List (be ruthless)

| Keep & build for real | Fake with static UI / hardcoded data | Cut entirely, mention verbally |
|---|---|---|
| AI Command Center (agent graph, live logs, confidence) | Citizen dashboard (1 screen: request form → status) | Multilingual i18n |
| Government Dashboard (fund table, approve button) | NGO dashboard (1 screen: task list) | Offline sync |
| Landing page + live disaster map | Donor dashboard (1 screen: history) | Voice messages |
| Auth (simple, 1–2 roles only) | Notification center (toast mockups) | Real blockchain (say "Phase 2") |
| 3 real AI agents (LLM-backed) | Volunteer dashboard (skip or 1 card) | SMS/WhatsApp integration |
| 1 real map w/ 3–5 seeded disasters | Blockchain explorer (2 static screens, labeled "Coming Soon") | Full admin panel |

**Roles for auth:** just build **Citizen** and **Government**. Say the rest ("NGO, Volunteer, Donor portals follow the same pattern") — don't build 6 login flows.

---

## 4. Tech Stack (lean, fast to ship solo)

Stick close to the original stack but drop anything with setup overhead:

- **Frontend:** React + Vite + TypeScript + Tailwind + shadcn/ui
- **Routing:** React Router
- **State:** React Query + Zustand (skip Redux-style store) — actually for 36h, plain `useState`/Context is fine; don't add Zustand unless state gets messy
- **Maps:** Leaflet (free, no API key hassle) — not Mapbox (needs token setup)
- **Charts:** Recharts
- **Agent graph viz:** Hand-rolled with **React Flow** — it's genuinely the fastest way to get an impressive node graph, worth the setup time
- **Animations:** Framer Motion (only on Command Center — makes the "thinking" states feel alive)
- **Icons:** Lucide React
- **Backend:** Node + Express, single service (no microservices)
- **DB:** SQLite or lowdb (JSON file) — zero setup, resets are trivial. Postgres only if you're faster than expected
- **Real-time:** Socket.IO — for streaming agent logs to the frontend, this is your single most important real-time feature. Skip real-time everywhere else (poll or refresh)
- **AI:** Anthropic API (Claude) — use **for real** on 2–3 agents; mock the rest (see Section 6)
- **Auth:** Skip OAuth/Google login entirely. Hardcoded demo accounts + simple JWT or even just role-in-localStorage for the hackathon. This is not where you spend hours.

**Do not build:** blockchain integration, real payment gateway (UPI/Razorpage), real SMS/WhatsApp, real satellite/social-media data ingestion. All faked.

---

## 5. Architecture (minimal but real)

```
Frontend (React)
   │
   ├── Socket.IO client ──── streams agent logs, status updates
   │
   ▼
Backend (Express + Socket.IO server)
   │
   ├── /api/disaster        → seeded disaster data (JSON)
   ├── /api/agents/run      → triggers the agent pipeline (see below)
   ├── /api/requests        → citizen help requests (SQLite)
   ├── /api/funds           → fund allocation table
   │
   ▼
Agent Pipeline (Node functions, chained)
   │
   ├── [REAL] Weather/Risk Agent    → Claude API call, real reasoning
   ├── [REAL] Damage Estimation Agent → Claude API call
   ├── [REAL] Fund Allocation Agent  → Claude API call, produces number + reasoning
   ├── [MOCK] Fraud Detection Agent  → scripted "no anomalies found" w/ fake delay
   ├── [MOCK] NGO Assignment Agent   → picks from seeded NGO list
   └── [MOCK] Volunteer Dispatch     → picks from seeded volunteer list
```

Each agent step: emit a Socket.IO event (`agent:status`, `agent:log`, `agent:complete`) so the frontend graph lights up node-by-node in real time. This is 80% of your "wow."

---

## 6. The AI Agent Pipeline — How to Fake It Convincingly

You do **not** need LangGraph or a real multi-agent framework. You need the *appearance* of one. Build a single backend orchestrator function that calls agents in sequence and streams progress:

```js
async function runDisasterPipeline(disasterId) {
  emit('agent:status', { agent: 'weather', status: 'running' });
  const risk = await callClaude(weatherPrompt(disaster));       // REAL
  emit('agent:complete', { agent: 'weather', output: risk });

  emit('agent:status', { agent: 'damage', status: 'running' });
  const damage = await callClaude(damagePrompt(disaster, risk)); // REAL
  emit('agent:complete', { agent: 'damage', output: damage });

  emit('agent:status', { agent: 'funding', status: 'running' });
  const funding = await callClaude(fundingPrompt(disaster, damage)); // REAL
  emit('agent:complete', { agent: 'funding', output: funding });

  await fakeDelay(1500);
  emit('agent:complete', { agent: 'fraud', output: 'No anomalies detected' }); // MOCK

  await fakeDelay(1000);
  emit('agent:complete', { agent: 'ngo', output: pickNGO() }); // MOCK

  await fakeDelay(1000);
  emit('agent:complete', { agent: 'volunteer', output: pickVolunteers() }); // MOCK
}
```

**Prompt the 3 real agents to return structured JSON** (severity score, confidence %, reasoning bullets, recommended budget). This structured output is what makes the Command Center UI look legitimate — confidence gauges, reasoning lists, evidence cards all populate from real model output, not hardcoded text.

This is honest: three agents are genuinely reasoning with an LLM; the rest are believable stubs that would be real agents in v2. If asked by judges, say so plainly — it reads as good engineering judgment, not a shortcut.

---

## 7. Feature Spec — What Each Screen Actually Contains

### Landing Page (2–3 hrs)
- Hero with headline + 3 CTA buttons (Report / Donate / Get Help)
- Leaflet map with 5 seeded disaster markers (flood, earthquake, cyclone, fire, landslide), colored by severity
- Stat cards (hardcoded numbers, framed as "live")
- "AI is currently monitoring..." ticker (static text rotating, no real feed)
- Recent alerts (3–4 seeded cards)

### AI Command Center (10–14 hrs — most of your time)
- Agent graph (React Flow): Weather → Damage → Funding → Fraud → NGO → Volunteer, nodes glow/pulse when active
- Live streaming log panel (Socket.IO events rendered as scrolling text)
- Confidence gauge (Recharts radial bar, populated from real Claude output)
- "Why AI recommended this" panel — bullet reasoning, pulled directly from the structured JSON response
- A "Run Pipeline" button tied to one of your 5 seeded disasters — this is your live demo trigger

### Government Dashboard (4–5 hrs)
- Fund allocation table: Disaster | Requested | AI-Recommended | Approved | Status
- "Approve" button that updates the row (local state / SQLite write) — this closes the loop: AI recommends → human approves → fund total updates on landing page stat
- 1–2 charts (damage trend, response time) — Recharts, seeded data is fine

### Citizen Screen (2–3 hrs)
- Single request-help form (name, location, type, image upload optional)
- Status timeline showing Submitted → Verified → Assigned → Dispatched → Completed (static progression, can be a fake auto-advance for demo)

### Everything else (NGO/Volunteer/Donor/Blockchain) (2–3 hrs total)
- One clean screen each, static/seeded data, clearly labeled where relevant ("Blockchain integration — Phase 2")
- Do not build real CRUD for these — clicking around should just work visually

---

## 8. Hour-by-Hour Timeline (36 hrs)

| Hours | Block | Deliverable |
|---|---|---|
| 0–2 | Setup | Vite+TS+Tailwind+shadcn scaffold, Express+Socket.IO backend, repo structure, seed data (5 disasters, 3 NGOs, 5 volunteers) as JSON |
| 2–5 | Landing page | Hero, map, stat cards, alerts — get something demoable early |
| 5–7 | Auth (minimal) | 2 hardcoded roles, route guarding, role-based nav |
| 7–8 | Sleep/break checkpoint #1 | — |
| 8–13 | AI Command Center — backend | Agent orchestrator, 3 real Claude prompts returning structured JSON, Socket.IO events wired |
| 13–18 | AI Command Center — frontend | React Flow graph, log stream panel, confidence gauge, reasoning panel — wire to backend events |
| 18–19 | Break | — |
| 19–22 | Government Dashboard | Fund table, approve flow, 2 charts, connect to AI output |
| 22–24 | Citizen screen | Request form + status timeline |
| 24–26 | Sleep block | Protect this — exhausted demos fail |
| 26–29 | Remaining screens (NGO/Volunteer/Donor/Blockchain stub) | Static, seeded, clickable |
| 29–31 | Visual polish | Dark theme consistency, glassmorphism accents, spacing/typography pass, loading states |
| 31–33 | Bug bash + fallback data | Fix crashes, hardcode fallback if Claude API is slow/rate-limited during demo |
| 33–34 | Record backup demo video | In case live demo/wifi fails at the venue |
| 34–35 | Slides/pitch (5–6 slides max) | Problem → Vision → Live demo → Architecture → Roadmap (blockchain, more agents) → Ask |
| 35–36 | Rehearse pitch 2–3x | Timing, know exactly when to click "Run Pipeline" |

Adjust freely, but protect the sleep block and the last 2 hours for rehearsal — a shaky live demo of a great product loses to a smooth demo of a good product.

---

## 9. Demo Script (rehearse this exact flow)

1. **Landing page (30 sec):** "This isn't a donation form — it's a coordination platform. Here's a live flood in Assam." *(point to map marker)*
2. **Click into AI Command Center (3–4 min):** "Watch what happens when this disaster is reported." Click **Run Pipeline**.
   - Weather agent lights up, streams reasoning
   - Damage agent lights up next, references weather output
   - Funding agent produces a number + confidence + reasoning — **let this breathe on screen**, it's your best shot
   - Fraud/NGO/Volunteer agents complete quickly, showing the full chain
3. **Government Dashboard (1 min):** "The recommendation flows straight to the government dashboard." Click **Approve**. Fund total updates.
4. **Quick click-through (30 sec):** Citizen request screen, NGO screen — "same coordination extends to every stakeholder."
5. **Close (30 sec):** "Today, 3 of these agents run live on Claude. The architecture is built to scale to all 10, plus blockchain-verified fund tracking in phase 2." — *this line does a lot of work: it's honest and shows you know exactly what's a prototype vs. roadmap.*

---

## 10. Fallback Plan (things that go wrong at hackathons)

- **Claude API slow/rate-limited during demo:** cache one full successful pipeline run's output as a "replay" fallback you can trigger with a hidden flag
- **Wifi dies:** have the recorded demo video ready, don't attempt live if venue wifi is known to be bad
- **Socket.IO flakiness:** test on venue wifi if possible before your slot; have a polling fallback (setInterval) as backup
- **Out of time for Government Dashboard:** cut it before you cut Command Center polish — the AI Center alone can carry the demo if the story is told well

---

## 11. Stretch Goals (only if you finish early)

In priority order:
1. Add a 4th real agent (e.g., Shelter Recommendation) instead of mocking it
2. Multilingual toggle on landing page (even just 2 languages, static strings)
3. A tiny "blockchain-lite" visual — hash-looking string generated per donation, displayed as "verification hash," clearly labeled as a mock for now
4. Volunteer dashboard with real task-accept flow
5. PDF export of the government fund report (jsPDF, quick to add)

---

## 12. One-Sentence Pitch to Lock In Early

*"We built the coordination layer disaster response is missing — AI agents that reason through severity, damage, and funding in real time, with every recommendation traceable and human-approved before a rupee moves."*

Write this down now and don't let scope creep pull you away from proving exactly this sentence in your demo.
