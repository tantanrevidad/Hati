# Task Monitoring

# ✅ Task Monitoring — Hati

> Roadmap, phased milestones, and task tracker
**Context: APAC Hackathon 2026 (hosted by Stellar)**
> 

---

## 📅 Hackathon Key Dates (Hard Deadlines)

| Event | Date | Details |
| --- | --- | --- |
| **Idea Submission** | **July 10, 2026** | Submit initial idea to be tracked as an active team. Pivoting later is fine — no resubmission needed, just update for final submission |
| **Final Project Submission** | **July 15, 2026** | Working MVP + GitHub repo (public) + demo video + pitch deck + README, all due |
| **In-Person Demo Day (Local)** | **July 18, 2026** | Present at GCash office, BGC (or online). Top 10 PH finalists selected |
| **Regional Finals** | **July 24, 2026** | Top 10 PH teams compete online vs. Indonesia and Vietnam finalists |

---

## 📦 Final Submission Checklist (Due July 15)

- [ ]  **GitHub repository** — public, code demonstrates real technical implementation
- [ ]  **Demo video** — link accessible, included in README
- [ ]  **Pitch deck** — accessible, linked in README
- [ ]  **Working MVP** — deployed on testnet minimum (mainnet encouraged; Stellar can provide funds if needed); must have a functional frontend/UI
- [ ]  **README file** — must cover: project vision, features, problem solved, team members (names + optional photos/logos), scalability metrics
- [ ]  Confirm team roster (max 5 members; changes allowed until final submission)
- [ ]  Book a mentorship session before calendar closes (July 15)
- [ ]  (Optional but recommended) Create an X/Twitter account for the project to signal scalability intent

---

## ✅ Phase 0 — Research & Validation (COMPLETE)

- [x]  SEP-24 anchor research — decision: SDF sandbox anchor, simulate GCash/Maya off-ramp in demo
- [x]  Custodial vs. non-custodial wallet decision — decision: custodial
- [x]  Stablecoin choice — decision: USDC
- [x]  Front-end tool: Google AI Studio
- [x]  Back-end tool: Google Antigravity
- [ ]  User interviews with target roommates/students/landlords *(carry forward if not yet done — squeeze in parallel to Phase 1, not blocking)*
- [ ]  Competitor/market research *(carry forward — see Market Research page)*

---

## 🚀 Phase 1 — MVP Build (5-Person Parallel Tracks, July 6 → July 15)

> With 5 members, work runs in **parallel tracks** rather than one sequential path. The single most important thing to get right is Day 1 alignment — agree on data models and API contracts before anyone writes AI-assisted code independently, or you'll lose time reconciling mismatched pieces later.
> 

### 👥 Role Assignments

| Role | Owner | Focus | Notes |
| --- | --- | --- | --- |
| **1. Stellar/Blockchain Lead** | @Christanne Tedd Revidad  | Freighter + Stellar SDK, SEP-24 sandbox anchor, custodial wallet flow | Highest-risk track — needs a dedicated owner, not a shared task |
| **2. Backend Lead** | *(assign name)* | Data models, QR/link generation endpoint, debt calculation logic | Works in parallel with #1 once data models are agreed Day 1 |
| **3. Frontend — Host/Settle Flow** | @Xancho Monreal  | Host manual bill entry, QR/link generation UI, Settle button + payment method sheet |  |
| **4. Frontend — Renter/Join Flow** | *(assign name)* | QR/link join screen, debt list/graph view, notifications | Naturally separable from Track 3 — minimal overlap |
| **5. Integration + AI Features + PM** | *(assign name)* | Wires all tracks together end-to-end, owns Smart Settlement Engine, tracks submission checklist | Least glamorous, most demo-critical — owns "does this actually work" |

### 🔗 Day 1 Non-Negotiable: Contract Alignment

- [x]  Agree on final data model shapes (`User`, `Group`, `Expense`, `Ledger`, `Settlement`, `JoinLink`) — **before** any track starts building against them
- [x]  Agree on API endpoint contracts (request/response shapes) so frontend can build against mocks while backend is still in progress
- [x]  Agree on naming conventions across tracks (avoid 5 different naming schemes for the same concepts)

Refer to [CONTRACTS (ALWAYS INCLUDE IN PROMPTS)](CONTRACTS%20(ALWAYS%20INCLUDE%20IN%20PROMPTS)%203957f87969248048b262f64d5c89b6a0.md) 

### 🗓️ Parallel-Track Day-by-Day Pacing

RED - Needs Attention

GREEN - Complete

YELLOW - Ongoing

| Dates | Stellar Track | Backend Track | Frontend Tracks (3 & 4) | Integration/PM Track |
| --- | --- | --- | --- | --- |
| **Jul 6 (today)** | Start Freighter + Stellar SDK test harness | Finalize data models (with whole team, Day 1 alignment) | Build UI mocks against agreed API contracts | Submit idea; confirm contracts locked |
| **Jul 7** | SDF sandbox Anchor Platform on testnet, SEP-24 deposit/withdraw with dummy data | QR/link generation + resolution endpoint | Host bill-entry screen (Track 3) · Renter join screen (Track 4), both against mocked API | Monitor integration points; unblock as needed |
| **Jul 8** | Custodial wallet creation flow verified working | Basic pairwise debt calculation (raw, not simplified) | Settle button + payment sheet (Track 3) · debt list view (Track 4) | Start wiring frontend mocks to real backend endpoints |
| **Jul 9** | Hand off wallet flow to Integration track for wiring | Debt calculation feeding into API responses | Polish host/settle flow · polish join/debt view | First real end-to-end pass: join → view debt |
| **Jul 10** | ⚠️ **Idea Submission Deadline** — support integration testing | Support integration testing | Support integration testing | End-to-end join → view → settle (Cash path) working |
| **Jul 11** | Wire real Stellar settlement into Settle flow | Support settlement wiring | UI polish, GCash/Maya/Bank stubs clearly labeled | Smart Settlement Engine (debt simplification) — start build |
| **Jul 12** | Support offline-sync integration | Offline-first data layer (local cache + sync) | Offline state indicators in UI | Smart Settlement Engine — finish + integrate |
| **Jul 13** | Buffer / bug support | Buffer / bug support | Debt graph visualization (if time allows) · bug pass | AI Invoice Reader (stretch, only if ahead of schedule) |
| **Jul 14** | — | — | — | Demo video, pitch deck, README polish (whole team supports) |
| **Jul 15** | ⚠️ **Final Submission Deadline** |  |  | Final gitignore/secrets check, confirm repo public, submit |

### ✅ Committed vs. Stretch (Revised for 5-Person Team)

**Committed for Phase 1 (this is the real MVP, must ship):**

- [x]  Host manual bill entry → QR/link generation
- [x]  Renter join via QR/link → sees debt (list view minimum)
- [x]  Settle button: Cash path fully functional; GCash/Maya/Bank clearly labeled as simulated for demo
- [x]  Basic pairwise settlement
- [x]  Real Stellar testnet transaction somewhere in the loop (via Freighter + SDK + SEP-24 sandbox)
- [ ]  Offline-first data layer (core, not polish)
- [x]  **Smart Settlement Engine (debt simplification)** — promoted to committed with 5-person parallelization; owned by Integration/PM track starting Jul 11

**Stretch (only if ahead of schedule):**

- [x]  AI Invoice Reader
- [ ]  Debt graph visualization (fallback: Splitwise-style flat list)
- [x]  Invoice scan (manual entry only for MVP)

### ✅ Build Checklist (Reference — Same Items, Grouped by Layer)

**1. Stellar Plumbing (build first — highest technical risk)**

- [x]  Freighter wallet + Stellar SDK integrated into a bare test harness
- [ ]  SDF sandbox Anchor Platform on testnet, SEP-24 deposit/withdraw working end-to-end with dummy data
- [x]  Custodial wallet creation flow (account generation, key storage) verified before building UI on top
- [x]  USDC trustline setups, sponsored fee-bumps, and minting faucet

**2. Backend Core (Google Antigravity)**

- [x]  Data models: `User`, `Group`, `Expense`, `Ledger`, `Settlement`, `JoinLink`
- [x]  QR/link generation + resolution endpoint
- [x]  Basic pairwise debt calculation (raw "who owes who" — simplification comes later)
- [x]  Dynamic read/query list routing for group resources

**3. Frontend Core Flows (Google AI Studio) — build in this exact order**

- [x]  Host: manual bill entry → generates QR/link
- [x]  Renter: scan/tap link → sees debt (plain list first, graph later)
- [x]  Settle button → wired to Stellar settlement; Cash option fully functional first, GCash/Maya/Bank as UI stubs
- [x]  Authentication dashboard forms (email, phone, google login) wired to port 3000

**4. Differentiators (only after core flow works end-to-end)**

- [x]  Smart Settlement Engine (debt simplification)
- [x]  AI Invoice Reader (Gemini API)
- [ ]  Debt graph visualization (fallback: Splitwise-style number list)

**5. Offline-First (cross-cutting — build alongside #2/#3, not after)**

- [ ]  Local-first data layer + background sync, woven into backend/frontend core work rather than bolted on at the end

**6. Submission Prep (reserve last 2-3 days)**

- [x]  README polish (judge-facing — don't leave to the last hour)
- [x]  Bug pass, dead code removal, gitignore/secrets check
- [ ]  Demo video
- [ ]  Pitch deck

---

## 🧠 Phase 2 — Remaining Differentiators (Post-Submission, or Stretch Goals Before July 15)

> Note: with the 5-person parallel-track structure, the **Smart Settlement Engine is now a committed Phase 1 deliverable** (owned by the Integration/PM track, Jul 11-12), not a stretch goal. AI Invoice Reader and debt graph visualization remain stretch — see the "Committed vs. Stretch" breakdown above. Anything not finished by July 15 rolls into here for post-submission work ahead of Demo Day (July 18) or Regional Finals (July 24).
> 
- [ ]  AI Invoice Reader (OCR + parsing + auto-split) — *stretch; if not completed in Phase 1*
- [ ]  Debt graph visualization — *stretch; fallback is a flat Splitwise-style list*
- [ ]  Split types: equal / percentage / itemized / custom
- [ ]  Transaction history & exportable statements
- [ ]  In-app comments per expense (dispute context)

---

## 📈 Phase 3 — Post-Hackathon Growth (Beyond July 24)

- [ ]  Recurring bills automation (rent, Wi-Fi, subscriptions)
- [ ]  Multi-group support
- [ ]  Spending analytics/insights
- [ ]  Referral/rewards system
- [ ]  Dispute resolution/flagging mechanism
- [ ]  Multi-currency support (APAC-wide expansion: VN, ID, PH)
- [ ]  Explore **Instawards** ($5k–$15k grants) — keep GitHub commits active post-hackathon
- [ ]  Explore **Stellar Community Fund (SCF)** for pre-seed scaling — review past SCF projects (up to SCF40) for positioning ideas

---

## 🧪 Validation & Testing Checklist

- [ ]  Prototype testing for join → view debt → settle flow
- [ ]  Stellar testnet integration testing (SEP-24 sandbox anchors)
- [ ]  OCR accuracy testing across varied receipt formats
- [ ]  Load testing for settlement engine with large groups (10+ members)
- [ ]  Offline/low-bandwidth simulation testing
- [ ]  Security audit before mainnet/production launch

---

## 🧭 Open Decisions Tracker

| Decision | Status | Notes |
| --- | --- | --- |
| Custodial vs. non-custodial wallet | 🟢 Decided | Custodial — see Project Outline rationale |
| Stablecoin choice (USDC vs. PHP-pegged) | 🟢 Decided | USDC — PHPC not natively on Stellar |
| Mobile framework | 🔴 Not decided |  |
| Monetization model | 🔴 Not decided | Transaction fee / subscription / freemium? |
| SEP-24 anchor partner | 🟡 Interim decision | SDF sandbox anchor for hackathon demo; Coins.ph/Cheesecake Labs as post-hackathon real integration path |
| Cash-payment confirmation mechanism | 🔴 Not decided | Prevent false "paid in cash" claims |
| Demo Day presentation mode | 🔴 Not decided | In-person at GCash BGC office vs. online |
| Open-source license | 🔴 Not decided | Stellar prefers open-source (e.g., MIT) |

---

## 💰 Hackathon Logistics Reference

- **Prize pool**: $60,000 total, split across categories (e.g., Local Finance, DeFi Ecosystem); consolation prizes are meaningful (~$3,000)
- **Demo Day format**: Hybrid at GCash office (BGC), likely afternoon — provincial teams (Davao, Iloilo, Bacolod, etc.) can present online
- **Licensing**: Any license is fine for the public repo, but Stellar prefers open-source (e.g., MIT)
- **User metrics**: Not a strict judging requirement, but early users strengthen the pitch and validate feasibility
- **Feedback**: All participants get judge score sheets + feedback after Demo Day — useful for iterating toward Instawards/SCF applications

---

*Related pages: Project Outline · Front-End Outline · Back-end Outline · Market Research · Resources*