# 🧾 Lista: Your tab. settled.

**Lista** (formerly *Hati*) is a premium, mobile-first roommate expense-sharing and smart settlement application designed for the **APAC Stellar Hackathon 2026**. 

By combining the **Stellar Blockchain** for stablecoin payments with a **Splitwise-style debt netting engine** and **Google's Gemini API** for receipt scanning, Lista makes splitting household bills, dorm expenses, and shared living costs completely effortless.

---

## 📖 Master Documentation Directory (`/docs`)

This README serves as a master summary of all design specifications, system architectures, and research files in the project. For deeper technical and market analysis, refer directly to the following documents:

*   📘 **[Project Outline](file:///c:/Users/Tedd/Documents/College/Projects/APAC%20Hackathon/Lista/docs/Project%20Outline.md)**: High-level overview of the problem space, proposed solution, and product mechanics.
*   🗄️ **[Back-end Outline](file:///c:/Users/Tedd/Documents/College/Projects/APAC%20Hackathon/Lista/docs/Back-end%20Outline.md)**: Server components, database architectures, and outline of the offline-first sync mechanism.
*   🎨 **[Front-End Outline](file:///c:/Users/Tedd/Documents/College/Projects/APAC%20Hackathon/Lista/docs/Front-End%20Outline.md)**: Design principles, Splitwise comparative design, UX flows, and HSL style palettes.
*   🤝 **[Contracts Alignment](file:///c:/Users/Tedd/Documents/College/Projects/APAC%20Hackathon/Lista/docs/contracts.md)**: Normalized database tables, API payloads, endpoint routes, and strict naming conventions.
*   📅 **[Features Roadmap](file:///c:/Users/Tedd/Documents/College/Projects/APAC%20Hackathon/Lista/docs/features_roadmap.md)**: Project timelines, Gantt charts, feature progress logs, and post-hackathon plans.
*   📊 **[Market Research](file:///c:/Users/Tedd/Documents/College/Projects/APAC%20Hackathon/Lista/docs/Market%20Research.md)**: APAC market sizing (TAM/SAM/SOM), competitor feature matrix, user personas, and monetization strategies.
*   📝 **[Notes - Checkpoint Meeting 1](file:///c:/Users/Tedd/Documents/College/Projects/APAC%20Hackathon/Lista/docs/Notes%20-%20Checkpoint%20Meeting%201.md)**: Hackathon timelines, evaluation metrics, tips for success, and post-hackathon grant opportunities.
*   🌐 **[Stellar Integration Guide](file:///c:/Users/Tedd/Documents/College/Projects/APAC%20Hackathon/Lista/docs/stellar_integration.md)**: Detailed on-chain payment architectures, trustline setups, faucets, and fee-sponsorship mechanics.
*   📋 **[Task Monitoring](file:///c:/Users/Tedd/Documents/College/Projects/APAC%20Hackathon/Lista/docs/Task%20Monitoring.md)**: Work breakdown structure, role assignments, pacing schedules, and committed vs. stretch checklists.
*   🔗 **[Resources Index](file:///c:/Users/Tedd/Documents/College/Projects/APAC%20Hackathon/Lista/docs/Resources.md)**: Reference URLs, glossary terms, and design inspiration guides.
*   🌟 **[Main Features](file:///c:/Users/Tedd/Documents/College/Projects/APAC%20Hackathon/Lista/docs/Main%20Features.md)**: Breakdown of core user-facing features and interaction mechanics.

---

## 📌 Project Overview & Positioning

### 🧩 The Problem
Urbanization and internal migration in Southeast Asia have driven a surge in co-living and student housing. However, shared-living communities face structural challenges:
*   **Tedious Manual Math:** Calculating "who owes whom" gets complex with multiple roommates.
*   **Awkward Social Friction:** Roommates find chasing each other for bill settlements awkward.
*   **Infrastructure Instability:** Intermittent power and internet drops in concrete dorms make online payments fail frequently.

### 💡 The Solution: Lista
Lista is an e-wallet designed to manage group expenses seamlessly:
1.  **Smart Netting Engine:** Graph-simplification reduces multi-party debts into minimal single payments.
2.  **AI Invoice Scanner:** Powered by Google's Gemini API, users take a photo of a receipt, and the app auto-splits line items.
3.  **Invisible Stellar Rails:** Instant settlements via stablecoin transfers. Users do not need to manage gas fees or private keys.
4.  **Offline Resiliency:** Ledgers can be viewed and expense intents logged fully offline, syncing the moment a connection is re-established.

---

## 📊 Market Analysis & Competitor Matrix

Global tracking apps lack regional financial rails, while local wallets lack expense-splitting math. 

| Feature / Capability | Splitwise (Global Tracker) | GCash / Maya (Local Wallets) | Existing Hati Apps (Calculators) | Lista (The Solution) |
| :--- | :--- | :--- | :--- | :--- |
| **Debt Netting Math** | **Excellent** | None | Basic | **Excellent** |
| **Direct Money Settlement** | External (Manual) | **Native** | External (Manual) | **Native (Stellar/APIs)** |
| **Offline Resilience** | Fails Offline | Fails Offline | Calculates Only | **Caches & Auto-Syncs** |
| **AI Receipt Scanning** | Premium-Only | No | No | **Core Feature** |
| **App-less Onboarding** | Requires App | Via QR | Requires App | **Web QR / No Install** |

### Market Sizing
*   **TAM:** Digital natives and digital wallet users in emerging APAC markets (Vietnam, Indonesia, Philippines).
*   **SAM:** Students, co-living residents, and migrant workers in high-density urban centers experiencing unstable internet.
*   **SOM:** Year 1 targeting dormitories and co-living hubs in Metro Manila.

---

## 🏗️ High-Level System Architecture

```mermaid
flowchart TB
    subgraph Client [React Frontend - Vite]
        UI[Vite UI Client]
        APIClient[api.js wrapper handles promises]
    end

    subgraph Service [Express API Backend & Supabase]
        Router[Router handles Auth, Groups, Settlements]
        AuthGate[JWT Middleware authorizes session]
        DB[(PostgreSQL Pool - Supabase)]
        Debt[debt.js nets and simplifies roommate debts]
        StellarSvc[stellar.js manages wallets & transactions]
    end

    subgraph Blockchain [Stellar Testnet Horizon Network]
        Bumper[Central Bumper sponsors fees]
        Issuer[USDC Issuer mints stablecoins]
        HorizonNode[Testnet Ledger records transfers]
    end

    UI --> APIClient
    APIClient -- HTTP & JWT Token --> Router
    Router --> AuthGate
    AuthGate --> DB
    Router --> Debt
    Router --> StellarSvc
    StellarSvc --> HorizonNode
    Bumper -- Sponsors fees --> HorizonNode
    Issuer -- Faucets USDC --> HorizonNode
```

---

## 🌐 Stellar USDC Integration & Gas-Free Settlement

To remove onboarding friction, Lista leverages a **custodial wallet model** combined with sponsored transactions.

1.  **Custodial Account Generation:** Settle-up triggers a randomized keypair generation (`Ed25519`). Keys are saved in the DB, and Friendbot deposits test native `XLM` to activate the account.
2.  **Sponsored trustlines:** Establishing a `USDC` trustline requires transaction gas. The backend signs the transaction with the user's key (fee: 0), wraps it in an outer fee-bump transaction sponsored by Lista's Treasury account, and submits it.
3.  **Autonomous Testnet USDC Faucet:** Newly registered users are automatically minted **1,000 USDC** via the issuer key (`GBK52A...`) so they can test settlement flows instantly.
4.  **Zero-Gas Payments:** Roommate-to-roommate transfers are wrapped in sponsored fee-bumps. **Users pay 0 XLM.**

---

## 🤝 API Contract & Data Schema (Core Endpoints)

Full API specs and database structures are maintained in the **[Contracts Alignment Guide](file:///c:/Users/Tedd/Documents/College/Projects/APAC%20Hackathon/Lista/docs/contracts.md)**.

### Core Database Entities
*   `User`: Contains profile metadata, linked payment method references, and custodial `walletAddress`/`walletSecret`.
*   `Group`: Lists member IDs, status (`active`/`archived`), and timestamp of zero balances (`zeroBalanceSince`).
*   `Expense`: Tracks the payer, split details, category, list of parsed `@mentions`, and source (`manual_description` / `invoice_scan`).
*   `Settlement`: Tracks group ledger transactions, status (`pending`/`confirmed`), and the `confirmations` list for multi-party cash confirmations.
*   `Nudge`: Tracks nudge logs, rate-limited server-side to **1 nudge per user pair per 24 hours**.

### Primary API Routes
*   `POST /auth/login`: Lazy login that authenticates and creates profiles on-the-fly.
*   `POST /users/me/payment-methods`: Links GCash/Maya reference tokens during onboarding.
*   `POST /groups/:id/expenses`: Saves expenses and parses description `@mentions` to assign participants automatically.
*   `POST /groups/:id/expenses/scan`: Uploads receipt images to Gemini AI for structured line-item extraction.
*   `POST /settlements`: Initiates pending cash confirmations or broadcasts live Stellar transactions.
*   `POST /groups/:id/nudge`: Triggers in-app alerts to delinquent roommates.

---

## 🛠️ Local Development Setup

### Project Monorepo Structure
The project is configured using **npm workspaces** to automatically handle dependencies across both subprojects:
```
Lista/
├── package.json         ← Workspace mappings & unified build script
├── vercel.json          ← Routing proxy rules
├── api/
│   └── index.js         ← Serverless deployment entrypoint
├── backend/
│   ├── package.json
│   ├── src/             ← Express app, DB connection pool, and services
│   └── stress_test.js   ← Concurrent load test script
└── frontend/
    ├── package.json
    ├── src/             ← React Vite application
    └── dist/            ← Production frontend bundle
```

### Installation Steps

1.  **Clone and Install Workspace Dependencies:**
    At the project root directory, run:
    ```bash
    npm install
    ```
    *This automatically installs packages for both `frontend` and `backend` subdirectories.*

2.  **Configure Environment Variables:**
    Create a `.env` file in the `/backend` directory containing:
    ```env
    PORT=3001
    DATABASE_URL=postgresql://postgres.eloyolwfnesymjqvnyal:2-4chimkenLista@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
    JWT_SECRET=supersecretapachatihackathonkey2026
    GEMINI_API_KEY=your_gemini_api_key_here
    HORIZON_URL=https://horizon-testnet.stellar.org
    FEE_BUMPER_SECRET= # Optional: Leave blank to generate/fund a temporary bumper on-chain
    ```

3.  **Run Development Servers:**
    *   **Backend Server:**
        ```bash
        cd backend
        npm run dev
        ```
    *   **Frontend Vite App:**
        ```bash
        cd frontend
        npm run dev
        ```
        Open `http://localhost:5173` to interact with the user interface.

4.  **Run Stress & Type Testing:**
    *   **Backend Stress Tests:**
        Ensure the backend server is running, then execute:
        ```bash
        node backend/stress_test.js http://localhost:3001
        ```
    *   **Frontend Compilation Check:**
        ```bash
        cd frontend
        npm run lint
        ```

---

## 👥 Hackathon Team & Roles

Christanne Tedd Revidad - Project Lead
Ehra Calderon - Market and Pitch Lead
Hanniel Alindogan II - UI/UX Lead
Xancho Bryan Monreal - Frontend Lead
Tim Kaiser Llegue - Frontend Lead

---

## 🔍 On-Chain Verification

To verify that the smart settlement engine submits live, fee-bumped transactions successfully, review this on-chain record:
*   **Transaction Hash:** `bcc674bd8a807111df28bc70638776ca720f614595f8111ae8755eeb5fbf3f23`
*   **Stellar Expert Testnet Explorer:** [View Transaction Details](https://stellar.expert/explorer/testnet/tx/bcc674bd8a807111df28bc70638776ca720f614595f8111ae8755eeb5fbf3f23)

---

## ⚖️ Open-Source License

This project is open-source and licensed under the **[MIT License](file:///c:/Users/Tedd/Documents/College/Projects/APAC%20Hackathon/Lista/LICENSE)**.
