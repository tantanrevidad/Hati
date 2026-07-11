# Market Research

# 📊 Market Research — Lista

> The Southeast Asian co-living and student housing market is booming due to rapid urbanization, internal migration, and the return to face-to-face academic classes. Recent real estate literature highlights that co-living has emerged as a vital solution to address residential shortages in urban centers, offering a finance-friendly alternative that can reduce rental rates by up to 30% for tenants (Hsia et al., 2024).
> 

However, this growing demographic faces a severe structural hurdle: **chronic digital infrastructure instability.** Despite high smartphone penetration, fixed broadband access in the Philippines was only 28% as of 2023, lagging significantly behind regional neighbors, with rural and highly congested urban areas facing frequent signal drops and slow connection speeds (World Bank, 2024). A 2025 empirical analysis of the Philippines, Indonesia, and Vietnam further proved that intermittent power and internet interruptions severely throttle digital and financial transactions across the region (Setiawan et al., 2025).  

Currently, global apps (like Splitwise) track shared debt but cannot move money, while local digital wallets (GCash/Maya) require a stable, continuous data connection to parse and execute splits.

Lista bridges this gap by combining AI bill parsing with an **offline-first architecture**. It allows users to reconcile debts and generate payment intent even on a fractured 3G connection, settling instantly via Stellar and local payment rails the moment a signal is re-established.

---

## 🎯 Target Users / Audience

> Our initial go-to-market strategy focuses on the Philippines, utilizing local payment rails, with an architecture designed to scale seamlessly across similar APAC markets (e.g., Indonesia, Vietnam).
> 
- 🎓 Students in dormitories or boarding houses
- 🏠 Roommates in shared apartments/condos
- 🏢 Co-living space residents
- Landlords/hosts managing shared bills across multiple tenants
- Migrant/OFW-style shared housing situations common across SEA labor markets — worth exploring as an APAC-relevant use case for the pitch

---

## 🧑‍🤝‍🧑 User Personas (To Validate via Interviews)

### 1. The Host / Bill Organizer

- Uploads bills, manages the household group
- Wants: minimal manual work, clear visibility into who's paid
- Frustration: chasing people for payment

### 2. The Passive Payer

- Wants to just be told what they owe and pay it
- Wants: zero setup friction, one-tap settlement
- Frustration: apps that require full onboarding before showing any value

### 3. The Group Admin (Multi-Group User)

- May belong to more than one shared living situation (dorm + trip group, etc.)
- Wants: clear separation between groups, no cross-contamination of balances

*(Personas should be validated/refined through actual user interviews — see Task Monitoring, Phase 0.)*

---

## 🏁 Competitive Landscape

The current market is fragmented into two flawed categories: Global Trackers that lack regional integration, and Local Wallets that lack specific shared-expense logic and infrastructure resilience.

| Competitor | Focus | Strengths | Gaps vs. Hati |
| --- | --- | --- | --- |
| Splitwise | General expense splitting | Well-known, simple UX, debt simplification, color-coded balance clarity | No local payment rail integration, no crypto/stablecoin settlement, no invoice AI scanning, no host-led QR onboarding, no built-in payment execution (tracks debt only, doesn't move money) |
| GCash / Maya (native) | Payments only | Ubiquitous in PH, trusted | No shared-expense tracking or splitting logic |
| Hati (IOS App) | Localized Bill Splitting | Designed for the PH market ("KKB"); allows users to copy GCash/other payment methods’ details. | They are just calculators. They generate payment links or copy-paste text for GCash/other payment platforms, but they do not execute the settlement. They lack offline-first infrastructure and Stellar cross-border rails. |
| Tricount | Lightweight cost tracking | Fast, offline-first functionality, no login required. | They are just calculators. They generate payment links or copy-paste text for GCash, but they do not execute the settlement. They lack offline-first infrastructure and Stellar cross-border rails. |

| Competitor Type | Key Players | Strengths | Strategic Gaps vs. Hati |
| --- | --- | --- | --- |
| **Global Debt Trackers** | Splitwise, Tricount, Settle Up | Ubiquitous, simplifies complex debt structures, clean UI. | **No local payment execution.** Tracks debt but forces users to switch apps to settle. Requires stable internet to sync ledgers. |
| **Local Digital Wallets** | GCash, Maya (PH), GoPay (ID) | Massive regional penetration; built-in QR payment ecosystems. | **High bandwidth dependency.** Fails frequently in low-signal areas (e.g., concrete dormitories). Lacks dedicated shared-expense logic and AI receipt scanning. |
| **Localized Calculators** | Existing "Hati" apps (iOS) | Designed specifically for local markets; simple UI. | **Purely calculators.** They generate text to copy-paste into wallets but do not execute settlement. Lack offline-first infrastructure and cross-border capabilities. |

#### **Competitor Analysis: SEA Expense Splitting**

| Feature / Capability | **Splitwise**(Global Tracker) | **GCash / Maya** (Local Wallets) | **Hati: Local App** (Calculators) | **Lista** (The Solution) |
| --- | --- | --- | --- | --- |
| **Debt Tracking & Math** | **Excellent** | None | Basic | **Excellent** |
| **Actual Money Movement (SEA)** | Manual (External) | **Native** | Manual (External) | **Native (Stellar/APIs)** |
| **Offline-First Resiliency** | Fails Offline | Fails Offline | Calculates Only | **Caches & Auto-Syncs** |
| **AI Invoice/Receipt Parsing** | Premium Only | No | No | **Core Feature** |
| **App-less Onboarding (Payers)** | Requires App | Via QR | Requires App | **Web QR / No Install** |

### **Market Sizing (TAM / SAM / SOM)**

- **TAM (Total Addressable Market):** Digital natives and active digital wallet users across major SEA markets (Philippines, Indonesia, Vietnam).
- **SAM (Serviceable Available Market):** University students, young professionals, and migrant workers living in shared accommodations within those specific countries who regularly experience intermittent connectivity.Market Sizing (TAM / SAM / SOM)
- **SOM (Serviceable Obtainable Market):** Year 1 Target: Co-living spaces and university dormitories in Metro Manila, specifically targeting active digital wallet users.

### **Monetization Strategy**

Current global competitors rely heavily on the "Freemium + Ads" model (e.g., Splitwise Pro charging ~$3.99/month for OCR scanning), which creates high friction in emerging markets where users are unwilling to pay monthly subscriptions for basic tracking features.

Our strategy leverages our unique infrastructure to avoid user paywalls:

1. **Free Core Utility:** The core splitting, offline tracking, and basic settlement remain 100% free to drive rapid user acquisition and network effects.
2. **B2B2C "Landlord Portal" (SaaS):** We monetize the Host/Landlord by charging dormitory operators and co-living managers a small monthly SaaS fee to utilize the platform for automated utility collections and reconciliation.
3. **Cross-Border Micro-Spreads (The Stellar Advantage):** We monetize cross-border shared expenses (e.g., OFW remittances splitting costs with family) by taking a micro-spread on foreign exchange rates. Because Stellar’s transaction costs are negligible, the profit margin on these cross-border splits is highly competitive.
4. **"Premium AI" Micro-Transactions:** Instead of a monthly subscription, advanced AI receipt scanning (beyond a free monthly allowance) is monetized via ad-hoc micro-transactions (e.g., ₱5 per complex scan), aligning the cost directly with immediate user value.

### Research To-Do

- [x]  Identify direct competitors in the Philippines/SEA co-living expense-splitting space
- [x]  Identify indirect competitors (general splitting apps: Splitwise, Tricount, etc.)
- [x]  Analyze pricing/monetization models of comparable apps
- [x]  Identify gaps Hati can uniquely fill (Stellar settlement, invoice AI, offline-first, QR host-led onboarding)

---

## 💬 Validation Questions for User Interviews

- How do you currently track shared expenses with roommates?
- What's the most annoying part of splitting bills today?
- Would you trust an app to handle actual money movement (vs. just tracking)?
- How comfortable are you with a host/landlord uploading bills on your behalf?
- Would you use a "pay in cash" option, or expect everything digital?
- How reliable is your internet connectivity day-to-day?

---

## 📌 Market Sizing Notes (To Develop)

- [ ]  Estimate # of shared-living households/students in target region
- [ ]  Estimate GCash/Maya penetration among target demographic
- [ ]  Identify potential landlord/dorm-operator partnership channels for distribution

---

*Related pages: Project Outline · Front-End Outline · Back-end Outline · Task Monitoring · Resources*