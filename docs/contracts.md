# Contract Alignment — Lista (v2, post-Checkpoint Revision)

> Supersedes the original Hati contract doc. Changes below came out of the market-research checkpoint meeting and the Main Features doc. Where a new decision **reverses** a prior Day 1 decision, it's flagged explicitly — confirm these with the team before merging, since they affect work already in progress on some tracks.
> 

---

## 0. Summary of What Changed

| Area | v1 (Hati) | v2 (Lista) | Reversal? |
| --- | --- | --- | --- |
| Auth | Guest join, account created lazily at first settlement | Login required on landing, before any group access | ⚠️ Yes — flag to team |
| Cash confirmation | Single payee confirms | ALL owed users must confirm | Extension, not reversal |
| Payment methods | gcash / maya / bank / cash / stellar (4 stubs) | QRPH / cash (2 methods) | Simplification |
| Naming | "Group" | "Listahan" (UI-facing only) | Cosmetic |
| Wallet linking | N/A | Linked at onboarding (GCash/Maya/Bank ref) | New |
| Nudge | N/A | New notification entity | New |
| Expiry | N/A | Auto-archive after 7 days at ₱0 balance | New |
| Expense input | Structured form only | Free-text description w/ @mentions, parsed | New |
| Invoice scan | Unspecified AI | Gemini API specifically | Implementation detail |

---

## 1. Data Models (Updated)

### `User`

```json
{
  "id": "string (uuid)",
  "displayName": "string",
  "photoUrl": "string | null",
  "phone": "string | null",
  "email": "string | null",
  "authMethod": "phone | email | google",
  "linkedPaymentMethods": [
    { "type": "gcash | maya | bank", "referenceToken": "string", "linkedAt": "ISO8601 timestamp" }
  ],
  "walletAddress": "string | null",
  "createdAt": "ISO8601 timestamp"
}
```

**Changes from v1:**

- **`isGuest` and `authMethod: guest` removed.** Per the new landing-page flow, every user authenticates (phone/email/Google) before reaching the main menu — there is no guest state anymore. **This is the flagged reversal — confirm with team.**
- `linkedPaymentMethods` added — populated during onboarding ("prompted to link GCash, Maya, or Bank"). Stores a reference token, never raw account credentials.
- `walletAddress` (Stellar custodial) is still created lazily at first Settle tap — that part of the original decision still holds, since linking a GCash/Maya reference is a different action from custodial Stellar account creation.
- `photoUrl` added for the profile-photo/avatar step in onboarding.

---

### `Group` (internally `Group`, UI-labeled "Listahan")

```json
{
  "id": "string (uuid)",
  "name": "string",
  "hostId": "string (User.id)",
  "memberIds": ["string (User.id)"],
  "memberJoinedAt": { "userId": "ISO8601 timestamp" },
  "createdAt": "ISO8601 timestamp",
  "status": "active | archived",
  "zeroBalanceSince": "ISO8601 timestamp | null"
}
```

**Changes from v1:**

- `zeroBalanceSince` added — set whenever `Ledger.balances` for this group all hit zero; cleared if a new expense breaks that. A scheduled job checks this field and flips `status` to `archived` once it's been non-null for 7 days. (Backend: this needs an actual cron/scheduled task, not just a field — flag for whoever owns backend infra.)
- Naming: keep `Group` as the internal/DB/API name. Only the UI copy says "Listahan." Renaming the entity itself across the whole codebase is unnecessary churn for a cosmetic distinction — don't do it.

---

### `Expense`

```json
{
  "id": "string (uuid)",
  "groupId": "string (Group.id)",
  "description": "string",
  "mentions": ["string (User.id)"],
  "amount": "integer (smallest currency unit)",
  "currency": "string (e.g. PHP)",
  "category": "rent | utilities | groceries | other",
  "paidBy": "string (User.id)",
  "splitType": "equal | percentage | itemized | custom",
  "splitDetails": "object — shape unchanged from v1",
  "source": "manual_description | invoice_scan",
  "createdAt": "ISO8601 timestamp",
  "syncStatus": "local_only | synced"
}
```

**Changes from v1:**

- `mentions` array added — extracted `@{user}` tags from the free-text `description` field. Frontend parses `@mentions` client-side as the user types (for the tag-autocomplete UX), sends the resolved `User.id` list alongside the raw text.
- **Decision on @mention → split logic**: mentioned users are added to `splitDetails.participantIds` (for `equal` split) automatically, in addition to whoever `paidBy` is. Example: "@Mark ordered extra rice" — for MVP, this does **not** attempt to parse "extra rice" as a separate itemized amount; it's a stretch goal. MVP just uses mentions to determine *who's included* in an equal split, not fine-grained itemization from prose. Don't over-scope this for Phase 1 — true NLP-based itemized parsing from a sentence is a real research problem, not a hackathon-week feature.
- `source` renamed from `manual` to `manual_description` to reflect that manual entry is now the free-text description flow, not a structured form.

---

### `Ledger`

Unchanged from v1 — `balances` array already supports the pie-chart breakdown the Dashboard needs (`netBalance` per user maps directly to pie slices). No schema change required here.

---

### `Settlement` (restructured for multi-party cash confirmation)

```json
{
  "id": "string (uuid)",
  "groupId": "string (Group.id)",
  "fromUserId": "string",
  "method": "qrph | cash | stellar",
  "amount": "integer",
  "status": "pending | awaiting_confirmation | confirmed | failed",
  "stellarTxHash": "string | null",
  "confirmations": [
    { "toUserId": "string", "confirmedAt": "ISO8601 timestamp | null" }
  ],
  "initiatedAt": "ISO8601 timestamp"
}
```

**Changes from v1 — this is the biggest structural change:**

- `toUserId` (singular) replaced with `confirmations` array — one entry per creditor the `fromUserId` owes money to within this settlement action. This is required because the new spec has settlements resolve against **multiple** owed users at once, not one pairwise debt.
- Status only flips to `confirmed` once **every** entry in `confirmations` has a non-null `confirmedAt`. Backend logic: on each confirm action, check if all entries are filled; if yes, cascade-update `status`.
- `method` collapsed to `qrph | cash | stellar` — `gcash`/`maya`/`bank` are no longer separate stub methods, since QRPH is a unified standard covering that whole payment-rail category. This actually **reduces** your stub-endpoint burden versus the original 4-method design.
- `qrph` status behavior: same as the old gcash/maya/bank stubs — for Phase 1, accepting the request immediately sets `status: confirmed`, no real payment call, clearly labeled "simulated" in UI.

---

### `Nudge` (new entity)

```json
{
  "id": "string (uuid)",
  "groupId": "string (Group.id)",
  "fromUserId": "string (User.id, who sent the nudge)",
  "toUserId": "string (User.id, who owes money)",
  "sentAt": "ISO8601 timestamp",
  "acknowledged": "boolean"
}
```

**Decisions:**

- A nudge is a lightweight notification, not a payment action — it doesn't touch `Settlement` at all, just triggers a push/in-app notification to the target user.
- Rate limiting: **max 1 nudge per user pair per 24 hours**, to avoid it becoming a harassment vector. Enforce this server-side, not just in UI, since UI-only limits are trivial to bypass.

---

### `JoinLink`

Unchanged from v1 — one link per `Group`, encodes full URL only, host-generated. Still holds under the new spec: "Join a Listahan" flow (scan/upload QR/enter code) matches this model exactly.

---

## 2. API Endpoint Contracts (Updated)

| Endpoint | Method | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| `/auth/login` | POST | `{ method: phone|email|google, credential }` | `{ user: User, token }` | **New** — replaces the old guest-join path entirely |
| `/users/me/payment-methods` | POST | `{ type: gcash|maya|bank, referenceToken }` | `User` (updated) | **New** — onboarding wallet-linking step |
| `/groups` | POST | `{ name, hostId }` | `Group` | unchanged |
| `/groups/:id/join-link` | POST | `{ createdBy }` | `JoinLink` | unchanged |
| `/join/:slug` | GET | — (now requires auth token, not anonymous) | `{ group: Group, ledger: Ledger }` | ⚠️ auth now required here — was anonymous in v1 |
| `/groups/:id/expenses` | POST | `Expense` (minus id/createdAt), raw `description` text | `Expense` (incl. parsed `mentions`) | description parsing happens server-side or client-side — **decide**: client-side parsing of `@mentions` is faster to build and avoids a server NLP dependency; do it client-side for Phase 1 |
| `/groups/:id/expenses/scan` | POST | multipart image | `Expense` (AI-parsed via Gemini) | **New** — separate endpoint from manual entry, since it hits Gemini API |
| `/groups/:id/ledger` | GET | — | `Ledger` | unchanged |
| `/settlements` | POST | `{ groupId, fromUserId, amount, method, toUserIds: string[] }` | `Settlement` (with `confirmations` array populated per `toUserIds`) | request shape changed — `toUserIds` (plural) replaces `toUserId` |
| `/settlements/:id/confirm` | POST | `{ confirmedBy }` | `Settlement` (that entry's `confirmedAt` set; status cascade-checked) | logic updated per multi-party confirm |
| `/groups/:id/nudge` | POST | `{ fromUserId, toUserId }` | `Nudge` | **New**, server-side rate-limited |

**Decisions:**

- Auth is now real (token-based), not the "skip real auth, pass userId in body" approach from v1 — this follows directly from the login-first requirement. Use a standard JWT issued at `/auth/login`, attached as a bearer token on every subsequent request. This is more work than v1's shortcut, but it's no longer optional once login gates the whole app.
- Gemini API calls happen server-side (never expose the Gemini API key to the client) — `/groups/:id/expenses/scan` is the only place that touches it.

---

## 3. Naming Conventions

Unchanged from v1 — still applies:

- PascalCase types, camelCase JSON
- `id` for primary key, `xId` for foreign keys
- ISO8601 timestamps suffixed `At`
- Money always integer smallest-unit + paired `currency`
- Booleans prefixed `is`/`has`
- Enums lowercase snake_case

One addition: **UI-facing copy says "Listahan," all code/schema/API says "Group."** Don't let this drift — if a track starts naming variables `listahanId` instead of `groupId`, that's an immediate cross-track mismatch bug waiting to happen.

---

## 4. Flagged for Team Discussion (not unilaterally decided)

- **Auth-first vs. guest-first**: the new spec's login-on-landing conflicts with the original zero-friction join principle from your Front-End Outline. This is a real UX tradeoff (friction vs. structure) that came out of market research, so I've updated the contract to match the new spec — but confirm this was an intentional call and not just an artifact of how the Main Features doc was written, since it affects onboarding conversion in a way that's worth being deliberate about.
- **Client-side vs. server-side @mention parsing**: recommended client-side for Phase 1 (above) — confirm Frontend Track 3/4 owner agrees before building.
- **7-day expiry job**: needs an owner (Backend) and a mechanism (cron job, or lazy-check-on-read) — not specified who's building this.

---

*Once confirmed, replace `/docs/contracts.md` in the repo with this version and commit as `docs: update contracts for Lista rebrand and checkpoint revisions`.*
