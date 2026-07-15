# Project Outline

# 📘 Project Outline — Hati

> *Bill Splitting with Ease*
> 

---

## 📌 Project Overview

| Field | Details |
| --- | --- |
| **Project Name** | Hati |
| **Category** | E-wallet / Fintech / Shared Expense Management |
| **Blockchain Layer** | Stellar Network (SEP-24, Horizon API, fee-bumping) |
| **Target Launch** | July 15, 2026 (Final Submission) — MVP on Stellar testnet |
| **Team Size** | 5 members — see Task Monitoring page for role assignments (Stellar/Blockchain Lead, Backend Lead, 2x Frontend, Integration/PM) |
| **Status** | 🟡 Planning |
| **Context** | Built for the **APAC Hackathon 2026** (hosted by Stellar) — financial inclusion / cross-border payments / emerging markets, spanning Vietnam, Indonesia, and the Philippines |

> ⚠️ **Important positioning note:** Hati must be framed as an **APAC-wide** solution, not PH-only. Shared-living expense splitting (dorms, OFWs sharing housing, co-living) is common across Vietnam, Indonesia, and the Philippines — the pitch, README, and demo should reflect this regional applicability, even if GCash/Maya are the first-market payment rails.
> 

---

## 🧩 Problem Statement

Living with roommates usually means tracking shared bills — rent, electricity, Wi-Fi, groceries — through informal, error-prone methods like whiteboards or group chats.

**Core pain points:**

- 📝 Manual tracking is tedious and easy to forget
- 🧮 Calculating "who owes who" gets complicated with 3+ people
- 😬 Chasing people down for payment is socially awkward
- 🔁 No single source of truth for shared balances
- 💸 Settling debts requires manual bank transfers or cash handoffs

---

## 💡 Proposed Solution

Hati is an **e-wallet designed to track and split shared living expenses** with minimal friction.

### Core Mechanics

- Users log shared expenses (offline or online) as they happen
- App maintains a **running tally** of who owes what to whom
- A **Smart Settlement Engine** simplifies multi-party debts:
    - Example: A owes B, B owes C → simplified to **A pays C directly**
- Settlements are executed **instantly** via Stellar-powered payments

### Standout Feature

- 🧾 **AI Invoice Reader**: Snap a photo of a physical receipt/invoice → AI extracts line items → auto-splits among roommates

### Onboarding & Settlement Flow (Host-Led Model)

1. **Host** (e.g., landlord, house head) uploads a bill — manually or via invoice scan
2. Hati generates a **QR code / link (hati.ph/xxxx)** for that bill or household group
3. **Renters join** by scanning the QR or tapping the link — no prior account setup required to view
4. Once joined, each renter immediately sees a **graph/visual breakdown** of what they owe (and to whom, post-simplification)
5. Renter taps a **single "Settle" button** with payment method options:
    - 💳 GCash
    - 💳 Maya
    - 🏦 Bank Transfer
    - 💵 "Pay in Cash" (marks debt as settled manually, host/payee confirms)
6. Settlement is recorded instantly and reflected in everyone's balance view

**Design implication:** the QR/link flow needs a fast **"guest-to-user"** conversion path — someone should be able to see their debt and settle within seconds of scanning, with full account creation happening in parallel or after first payment (progressive onboarding).

### Offline / Low-Bandwidth Resilience

A core requirement, not an afterthought — many target users (dorms, provincial housing) have inconsistent internet access.

- Expense logging and balance viewing should work **fully offline**, syncing once connectivity returns
- QR/link-based joining should degrade gracefully (e.g., cached group data if link was opened before)
- Settlement *initiation* can be queued offline; actual GCash/Maya/bank/Stellar transactions require connectivity, but the **intent to pay** should be capturable offline
- "Pay in Cash" option is inherently offline-friendly — no network dependency for the payment itself, only for recording it

---

## 🎯 Target Users / Audience

- 🎓 Students in dormitories or boarding houses
- 🏠 Roommates in shared apartments/condos
- 🏢 Co-living space residents
- Anyone needing a **reliable, low-friction** way to manage and settle group living expenses

**User personas to define:**

- [ ]  The "Bill Organizer" (proactive tracker)
- [ ]  The "Passive Payer" (wants minimal effort)
- [ ]  The "Group Admin" / Host (manages a household of 3+)

*(See the Market Research page for deeper persona and competitor work.)*

---

## 🐙 GitHub Repository Guide

> Repo must be **public** (per hackathon submission rules) — treat it as judge-facing from day one, not just internal tooling.
> 

### Repo Structure (Proposed)

```
hati/
├── README.md              ← vision, features, problem, team, scalability metrics
├── /frontend               ← Google AI Studio–generated app
├── /backend                ← Google Antigravity–generated services
├── /stellar                ← Stellar SDK integration, SEP-24 flows, Horizon calls, fee-bumping logic
├── /docs                   ← architecture notes, API docs, diagrams
├── /assets                 ← logo, screenshots, demo assets
└── LICENSE                 ← e.g., MIT (Stellar prefers open-source)
```

### Branching Strategy

- `main` — always deployable/demo-ready; this is what judges will see
- `dev` — active integration branch
- `feature/<short-description>` — one branch per feature (e.g., `feature/qr-join-flow`, `feature/sep24-onramp`)
- Merge to `dev` via PR once a feature works locally; merge `dev` → `main` only at stable checkpoints (esp. before July 15 and July 18)

### Commit Conventions

- Use clear, action-based messages: `feat: add QR join flow`, `fix: settlement rounding bug`, `docs: update README with demo link`
- Prefixes to standardize on: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`
- Commit early and often — active, visible commit history matters for Instawards applications post-hackathon, and shows judges genuine iteration (not a single dump before deadline)

### Team Workflow

- [ ]  Assign a repo owner/admin (manages access, branch protections)
- [ ]  Set up branch protection on `main` (no direct pushes, PR review recommended even for a small team)
- [ ]  Agree on PR review expectations (at least 1 teammate glance before merging to `dev`)
- [ ]  Use GitHub Issues or a linked board to track tasks from the Task Monitoring page
- [ ]  Tag releases/checkpoints (e.g., `v0.1-idea-submission`, `v1.0-final-submission`) for easy judge/mentor reference

### README Checklist (Judge-Facing — Critical)

- [ ]  Project vision & problem statement
- [ ]  Feature list (MVP + differentiators)
- [ ]  Team members (names, optional photos/logos)
- [ ]  Scalability metrics / APAC-wide relevance
- [ ]  Link to demo video
- [ ]  Link to pitch deck
- [ ]  Setup/installation instructions (so judges/mentors can run it if needed)
- [ ]  Stellar integration summary (SEP-24, Horizon, Freighter, fee-bumping) — make this easy to find, since it's directly scored
- [ ]  License declaration

### Pre-Submission Repo Hygiene

- [ ]  Remove dead code/commented-out blocks before July 15
- [ ]  Ensure `.env`/secrets are gitignored, never committed
- [ ]  Confirm repo is set to **public** before final submission
- [ ]  Double-check all README links (demo video, pitch deck) are live and accessible

---

## 🌐 Stellar Integration

| Component | Purpose |
| --- | --- |
| **SEP-24** | Fiat-to-crypto on/off-ramping via local platforms (GCash, Maya) |
| **USDC / PHP-pegged stablecoin** | Stable store of value for settlements, avoids crypto volatility |
| **Horizon API** | Interface for submitting/querying transactions on Stellar |
| **Centralized Fee-Bumping Service** | Absorbs transaction & trustline reserve costs so users never touch XLM |
| **End-user experience goal** | Fast, free, invisible on-chain settlement — feels like a normal e-wallet |

### Key Technical Questions — Research Findings & Decisions

- [x]  **SEP-24 anchor(s) supporting GCash/Maya**: No direct GCash-as-Stellar-anchor integration exists today. GCash added USDC support via its GCrypto marketplace (Sept 2025), and MoneyGram partnered with Stellar for USDC-to-cash pickups at GCash/local banks — but this is remittance-focused, not a general P2P anchor. Coins.ph and Maya both hold BSP VASP registrations and are more realistic anchor/off-ramp partners to explore than GCash directly.
    - **Hackathon approach**: use the SDF-maintained Anchor Platform on testnet with a sandbox anchor; simulate the GCash/Maya off-ramp step visually in the demo UI. This still demonstrates real SEP-24 + Horizon integration (what's scored) without needing a live banking partnership in one week.
    - **Post-hackathon path**: reach out to Cheesecake Labs (SDF partner, has built anchor infra for MoneyGram) or pursue Coins.ph directly for a real integration.
- [x]  **Custodial vs. non-custodial wallet**: **Decision: Custodial.** The project's own goal — "invisible on-chain settlements," users never holding XLM — inherently requires custodial key management. Non-custodial would force key/seed-phrase management onto users, directly undermining the frictionless UX this project is built around. Tradeoff to state explicitly in README/pitch: custodial means Hati takes on e-money/VASP-adjacent regulatory exposure, which is a deliberate, informed choice — not an oversight.
- [x]  **Stablecoin choice**: **Decision: USDC.** PHP-pegged PHPC (Coins.ph) is issued on Polygon and Ronin — **not natively on Stellar** — so using it would require a custom cross-chain bridge, out of scope for the hackathon timeline. USDC is natively issued on Stellar via Circle, is the ecosystem-standard SEP-24 asset, and already has a live path into GCash (GCrypto marketplace). Frame PHP-pegged settlement as a post-hackathon roadmap item rather than an MVP feature.

### Hackathon-Recommended Stellar Tooling

- **Wallet**: Use **Freighter** wallet (explicitly recommended by Stellar over MetaMask for this hackathon)
- **SDK**: Use the **Stellar SDK** for wallet integration — advised for easier, more judge-recognizable implementation
- **SEP-24**: Heavily emphasized as a way to boost the "Technical Implementation" score — lean into this rather than treating it as optional
- Deploy MVP on **testnet** at minimum (mainnet encouraged — Stellar can provide funds if needed for mainnet deployment)

### Still Open

- [ ]  How is the fee-bumping account funded and monitored (treasury management)?
- [ ]  Compliance: KYC/AML requirements for fiat on/off-ramp partners (relevant if pursuing Coins.ph/Maya integration post-hackathon)

*(See the Back-end Outline page for deeper technical architecture.)*

---

## ⚖️ Compliance & Risk Considerations

- [ ]  KYC/AML requirements for fiat ramps (local regulations, e.g., BSP in the Philippines)
- [ ]  Custodial wallet licensing implications
- [ ]  Data privacy (user financial data, invoice images)
- [ ]  Dispute handling policy (what if someone claims an expense is wrong?)
- [ ]  Fraud prevention (fake expenses, collusion, false "paid in cash" claims)
- [ ]  Stablecoin regulatory status in target market

---

## 🏆 Hackathon Evaluation Criteria (Demo Day, July 18)

Judges will score on:

1. **Technical Implementation and Usage** — depth/quality of Stellar network integration
2. **Real-World Fit and Use Case** — practical applicability and problem-solving strength
3. **Innovation and Differentiation** — standing out vs. existing Stellar/blockchain solutions
4. **User Experience (UX) and Accessibility** — simplicity/usability during the live demo
5. **Go-to-Market Strategy** — target audience clarity (e.g., B2C renters/students) and scalability potential
6. **Team** — background/capabilities; worth highlighting explicitly in the README and pitch deck

**Design implication:** Every major product decision in this project should be traceable back to one of these six criteria — e.g., the offline-first architecture strengthens #4 (accessibility), the Smart Settlement Engine + AI invoice reader strengthen #3 (innovation), and heavy SEP-24 usage strengthens #1.

---

## 📊 Success Metrics (KPIs)

- [ ]  # of active groups created
- [ ]  # of expenses logged per week per group
- [ ]  Average time from expense logged → settled
- [ ]  Settlement completion rate (% of debts actually paid via app)
- [ ]  AI invoice scan accuracy rate
- [ ]  User retention (30/60/90-day)

---

*Related pages: Front-End Outline · Back-end Outline · Task Monitoring · Market Research · Resources*