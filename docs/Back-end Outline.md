# Back-end Outline

# 🗄️ Back-end Outline — Hati

> System architecture, data model, algorithms, and Stellar integration details
> 

---

## 🏗️ High-Level System Components

- **Frontend clients**: Mobile app (iOS/Android) + lightweight web view for QR/link joins — built via **Google AI Studio**
- **Backend API server**: auth, business logic, group/expense management — built via **Google Antigravity**
- **Database**: user, group, expense, and ledger data
- **Blockchain layer**: Stellar SDK integration, Horizon API calls, **Freighter wallet** for auth/signing
- **AI/OCR service**: invoice scanning & parsing pipeline
- **Fee-bumping service**: centralized account absorbing transaction/trustline costs
- **Anchor integration**: SEP-24 interactive flow for on/off-ramp (GCash, Maya)

### 🛠️ Hackathon Tooling Notes

- **Google Antigravity** is the chosen backend coding tool — document its generated code structure clearly in the repo, since judges will review the public GitHub repo for technical implementation quality
- Keep backend code organized enough that a judge skimming the repo can quickly see the Stellar/SEP-24 integration points (this is explicitly part of the "Technical Implementation and Usage" score)
- Since the hackathon rewards heavy, visible Stellar usage, make sure Horizon API calls, SEP-24 flows, and fee-bumping logic are not buried — clear file/module naming matters for judging, not just functionality

---

## 🧬 Data Model (Draft Entities)

| Entity | Key Fields |
| --- | --- |
| `User` | profile, wallet address, KYC status, phone/name (for light-identity joins) |
| `Group` | members, host, settings, currency |
| `Expense` / `Bill` | payer/host, amount, split details, category, timestamp, receipt image, source (manual/scan) |
| `Ledger / Balance` | running debt matrix per group |
| `Settlement` | computed transactions, method (GCash/Maya/Bank/Cash), status, Stellar tx hash if applicable |
| `Invoice` | raw image, OCR output, parsed line items |
| `JoinLink` | unique slug, associated bill/group, expiry/revocation status |

---

## 🔗 QR / Link Join System

- [ ]  Each bill/group generates a unique short link + QR (`hati.ph/xxxx`)
- [ ]  Link resolves to a lightweight view showing the renter's computed share — no forced auth wall
- [ ]  Auth-light first touch: identify renter by phone number or name, defer full auth until settlement or account creation
- [ ]  **Security**: prevent link-guessing/enumeration attacks — use non-sequential, sufficiently random slugs
- [ ]  **Expiry/revocation**: host can deactivate a link (e.g., bill fully settled, fraud concern)

---

## 🧮 Smart Settlement Algorithm (Concept)

- [ ]  Model debts as a directed graph (who owes whom, how much)
- [ ]  Apply a debt-simplification algorithm (min cash flow / netting) to minimize total transactions
- [ ]  Output the minimal set of transactions needed to settle all balances
- [ ]  Research reference: Splitwise-style "simplify debts" algorithms as a starting point

---

## 📡 Offline-First Architecture

- [ ]  Local-first database on device (e.g., SQLite, WatermelonDB, Realm) as source of truth for UI
- [ ]  Background sync service reconciles local ledger with server once online
- [ ]  Conflict resolution strategy for concurrent edits (e.g., host edits bill while renter is offline)
- [ ]  QR/link payload should encode enough data to render a basic view without an immediate network call (e.g., a signed group snapshot), refreshing live once online
- [ ]  Payment *initiation* can be queued locally; actual execution (GCash/Maya/bank/Stellar tx) requires connectivity — clearly distinguish "pending sync" vs. "confirmed" states
- [ ]  Design for **low-bandwidth**, not just no-bandwidth: compress payloads, avoid heavy assets on core flows (join → view debt → settle)

---

## 🌐 Stellar Integration Details

| Component | Purpose |
| --- | --- |
| **SEP-24** | Interactive fiat-to-crypto on/off-ramp flow via local anchors (GCash, Maya) |
| **Horizon API** | Submitting/querying Stellar transactions |
| **Fee-bumping service** | Centralized account sponsors transaction + trustline reserve fees so users never need XLM |
| **Stablecoin** | USDC or PHP-pegged asset for settlement value stability |

### Open Technical Questions

- [ ]  Which SEP-24 anchor(s) actually support GCash/Maya rails in-region?
- [ ]  Custodial vs. non-custodial key management — who controls wallet keys?
- [ ]  How is the fee-bumping treasury account funded, topped up, and monitored?
- [ ]  KYC/AML integration point — at anchor level or app level?
- [ ]  Stablecoin selection: liquidity, regulatory status, redemption path

---

## 🧾 AI Invoice Reader Pipeline (Draft)

1. Image capture (client-side)
2. Upload to OCR/AI parsing service
3. Line-item extraction (item name, price, quantity)
4. Return structured JSON to client for host confirmation/edit
5. Confirmed data becomes an `Expense`/`Bill` record
- [ ]  Choose OCR/AI provider or model approach
- [ ]  Define accuracy benchmarks and fallback for low-confidence scans (manual correction UI)

---

## 🔐 Security & Compliance Notes

- [ ]  Data privacy for financial data and invoice images (encryption at rest/in transit)
- [ ]  KYC/AML compliance touchpoints for fiat ramps
- [ ]  Fraud prevention: fake expenses, collusion, false "paid in cash" confirmations
- [ ]  Rate limiting / abuse prevention on join-link endpoints

---

*Related pages: Project Outline · Front-End Outline · Task Monitoring · Market Research · Resources*