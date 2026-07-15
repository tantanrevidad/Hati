# Front-End Outline

# 💻 Front-End Outline — Hati

> UX/UI structure, screen flows, and front-end feature scope
> 

---

## 🎨 Design Principles

- No crypto jargon anywhere in the core user experience — it should feel like GCash/Maya, not a crypto wallet
- Every core action (join, view debt, settle) should be completable in a few taps
- Trust through clarity: always show whether something is "pending," "syncing," or "confirmed"
- Mobile-first, low-bandwidth aware (see Back-end Outline for sync architecture)
- **Hackathon note**: UX/Accessibility is a direct Demo Day judging criterion — the live demo needs to look and feel effortless, not just function
- **Splitwise-inspired**: borrow Splitwise's clarity-first visual language (see below), but adapt it for Hati's host-led QR flow and instant settlement, which Splitwise doesn't do

---

## 🟢 Splitwise-Inspired Design Direction

Splitwise is the closest mental model users will already have for this category — leaning into familiar patterns lowers onboarding friction, which matters both for real users and for Demo Day judges who may already know the app.

### Patterns to Borrow

- **Color-coded balances**: green for "you are owed," red for "you owe" — instantly scannable, no reading required
- **Simple list-based group view**: each group/household shown as a card with a running net balance at a glance
- **Per-person breakdown**: tapping into a group shows a clean list of "X owes Y ₱Z" lines rather than a raw transaction log
- **Big, friendly numbers**: balances are the visual focus of the screen — everything else (icons, categories) is secondary
- **Minimal-friction "Add Expense" entry**: large "+" button, simple form (amount, who paid, how split), defaults to "split equally"
- **Activity feed**: chronological log of expenses/settlements per group, so history is always transparent
- **Simple iconography per category**: rent, groceries, utilities, etc., each with a distinct icon for fast visual scanning

### Where Hati Should Diverge from Splitwise

- **Splitwise has no host-led onboarding** — Hati's QR/link join flow with a host uploading the initial bill is a differentiator worth visually emphasizing, not hiding behind a generic "add member" flow
- **Splitwise has no built-in settlement rail** — it just tracks debt; Hati's single-tap "Settle" button (GCash/Maya/Bank/Cash) is the core differentiator, so it should be more prominent in the UI than Splitwise's more passive "settle up" flow
- **Splitwise assumes constant connectivity** — Hati's offline/low-bandwidth states need visible treatment that Splitwise doesn't need to design for
- **Debt simplification visualization**: Splitwise simplifies debts mathematically but shows it in the same flat list style; Hati can differentiate by actually visualizing the simplified graph (see Debt Visualization below) rather than just listing numbers

### Visual Style Notes

- Clean, card-based layout with generous whitespace (avoid clutter — Splitwise keeps screens sparse even with a lot of underlying data)
- Friendly, rounded typography and icons — reinforces "this is easy," not "this is finance"
- Reserve bold color (green/red) strictly for balance indicators, so it carries meaning rather than becoming decorative

---

## 📱 Core Screens / Flows

### 1. Host Flow — Bill Upload

- [ ]  Manual entry form (amount, category, split type)
- [ ]  Invoice scan flow: camera capture → AI parses line items → host confirms/edits before finalizing
- [ ]  Generate QR code + shareable link (hati.ph/xxxx) once bill is finalized
- [ ]  Option to deactivate/revoke a link later

### 2. Renter Flow — Join via QR/Link

- [ ]  Scan QR or tap link → lands on lightweight view (web or in-app)
- [ ]  Light identification step (name or phone number tap-in — no forced full signup)
- [ ]  Instantly displays: "You owe ₱X" with a visual debt graph
- [ ]  Prompt to create full account happens *after* this view, not before

### 3. Debt Visualization

- [ ]  Splitwise-style color coding: green = "you are owed," red = "you owe"
- [ ]  Simple per-person list view ("X owes Y ₱Z") as the default, low-effort read
- [ ]  Optional expanded graph view showing the simplified debt network (Hati's differentiator vs. Splitwise's flat list)
- [ ]  Toggle between "my balance" and "full group view"
- [ ]  Big, prominent balance numbers as the visual focus of the screen

### 4. Settlement Flow

- [ ]  Single-tap **"Settle"** button
- [ ]  Payment method bottom sheet:
    - [ ]  GCash
    - [ ]  Maya
    - [ ]  Bank transfer
    - [ ]  Pay in cash
- [ ]  "Pay in cash" triggers a confirmation step (host/payee must acknowledge receipt)
- [ ]  Post-settlement confirmation screen + updated balance view

### 5. Expense Logging (Ongoing Use)

- [ ]  Fast "Add Expense" flow via a large, always-accessible "+" button (Splitwise pattern)
- [ ]  Category tagging with simple, distinct icons (rent, utilities, groceries, etc.)
- [ ]  Split type selector: equal / percentage / itemized / custom — default to "split equally" for speed

### 6. Dashboard / Home

- [ ]  Group list as cards, each showing a net balance at a glance (Splitwise-style)
- [ ]  Chronological activity feed (recent expenses, settlements) for transparency
- [ ]  Notifications center

### 7. Offline State Indicators

- [ ]  Clear visual states: "Offline — will sync," "Pending confirmation," "Confirmed"
- [ ]  Non-blocking banners rather than hard error screens when offline

---

## 🧩 Component Inventory (Draft)

- [ ]  QR scanner component
- [ ]  Debt graph/chart component
- [ ]  Settle bottom-sheet / modal
- [ ]  Expense card component
- [ ]  Invoice scan/camera component
- [ ]  Sync status indicator (badge/banner)
- [ ]  Group/member avatar list

---

## 🛠️ Front-End Tech Stack

| Decision | Choice |
| --- | --- |
| **Build tool** | **Google AI Studio** (for front-end generation/prototyping) |
| Framework | *(fill in — Flutter / React Native / web-first, depending on what Google AI Studio outputs)* |
| State management | *(TBD)* |
| Local-first storage | *(TBD — e.g., WatermelonDB, Realm, SQLite)* — see Back-end Outline |
| Charting/graph library | *(TBD)* for debt visualization |
| Camera/OCR SDK | *(TBD)* for invoice scanning capture (parsing handled server/AI-side) |
| Wallet integration | **Freighter wallet** (Stellar-recommended over MetaMask for this hackathon) |

### Notes on Using Google AI Studio

- [ ]  Confirm whether Google AI Studio's output targets web, mobile, or both — this determines whether the "QR/link join" flow can be a lightweight web view or needs to be native
- [ ]  Since Demo Day judges UX/accessibility live, prioritize getting the join → view debt → settle flow polished first, even if other screens are rougher
- [ ]  Keep Google AI Studio–generated components documented in the repo so the README's technical section is easy to write

---

*Related pages: Project Outline · Back-end Outline · Task Monitoring · Market Research · Resources*