# CONTRACTS (ALWAYS INCLUDE IN PROMPTS)

# Day 1 Contract Alignment — Hati (DECIDED)

> All decisions below are final for Phase 1 (MVP, through July 15). This is what every track builds against, no further debate needed. If reality forces a change mid-week, flag it in team chat and update this file; don't silently diverge.
> 

---

## 1. Data Models

### `User`

```json
{
  "id": "string (uuid)",
  "displayName": "string",
  "phone": "string | null",
  "email": "string | null",
  "authMethod": "guest | phone | email | full",
  "walletAddress": "string | null",
  "createdAt": "ISO8601 timestamp",
  "isGuest": "boolean"
}
```

**Decisions:**

- A real `id` (uuid) is assigned immediately on QR join, even for guests. Simplifies every foreign-key reference elsewhere — no separate "session token → real user" migration step needed later.
- `walletAddress` is created lazily — only at first "Settle" tap, not at guest-join or full-signup time. Don't spin up Stellar custodial accounts for people who never transact.
- Guest → full account conversion happens at **first settlement attempt**, not first debt view. Someone should be able to see "you owe ₱X" with zero commitment; the moment they try to move money is the natural, motivated point to ask for a name/phone (if not already given) and finalize the account.

---

### `Group`

```json
{
  "id": "string (uuid)",
  "name": "string",
  "hostId": "string (User.id)",
  "memberIds": ["string (User.id)"],
  "memberJoinedAt": { "userId": "ISO8601 timestamp" },
  "createdAt": "ISO8601 timestamp",
  "status": "active | archived"
}
```

**Decisions:**

- Exactly one `hostId` per group for MVP. Multi-host is out of scope — don't build for it.
- Membership stays inline on `Group` as `memberIds` (no separate join table) — a `GroupMembership` table is unnecessary normalization overhead for a one-week build. `memberJoinedAt` is a flat map alongside it so the activity feed can show "X joined" without a second table.

---

### `Expense`

```json
{
  "id": "string (uuid)",
  "groupId": "string (Group.id)",
  "description": "string",
  "amount": "integer (smallest currency unit, e.g. centavos)",
  "currency": "string (e.g. PHP)",
  "category": "rent | utilities | groceries | other",
  "paidBy": "string (User.id)",
  "splitType": "equal | percentage | itemized | custom",
  "splitDetails": "object — shape below",
  "source": "manual | invoice_scan",
  "createdAt": "ISO8601 timestamp",
  "syncStatus": "local_only | synced"
}
```

`splitDetails` by type:

```json
// equal
{ "participantIds": ["User.id", "..."] }
// percentage
{ "shares": [{ "userId": "...", "percent": 0-100 }] }
// itemized
{ "lineItems": [{ "label": "string", "amount": "number", "assignedTo": ["User.id"] }] }
// custom
{ "shares": [{ "userId": "...", "amount": "number" }] }
```

**Decisions:**

- `amount` is always an **integer in smallest currency unit** (centavos). No floats for money, anywhere, ever — this avoids the exact class of rounding bug your own commit-convention examples already anticipate.
- All four `splitDetails` shapes are defined in the schema now, even though Phase 1 only builds UI/logic for `equal`. Backend implements validation for all four; Frontend only wires up `equal`. This avoids a schema migration later if percentage/itemized get built as a stretch goal.

---

### `Ledger`

```json
{
  "groupId": "string (Group.id)",
  "balances": [{ "userId": "string", "netBalance": "integer" }],
  "pairwiseDebts": [{ "fromUserId": "string", "toUserId": "string", "amount": "integer" }],
  "simplifiedDebts": [{ "fromUserId": "string", "toUserId": "string", "amount": "integer" }],
  "lastUpdated": "ISO8601 timestamp"
}
```

**Decisions:**

- `pairwiseDebts` and `simplifiedDebts` are always both present as separate arrays — never one field that changes shape based on a flag. Frontend Track 4 renders `simplifiedDebts` by default, with an "expanded/full detail" toggle switching to `pairwiseDebts`.
- `Ledger` is **recalculated on every write and cached**, not computed on-demand per GET. This matters specifically for offline sync: when a batch of queued expenses replays after reconnecting, recompute once at the end of the batch, not once per item.

---

### `Settlement`

```json
{
  "id": "string (uuid)",
  "groupId": "string (Group.id)",
  "fromUserId": "string",
  "toUserId": "string",
  "amount": "integer",
  "method": "gcash | maya | bank | cash | stellar",
  "status": "pending | awaiting_confirmation | confirmed | failed",
  "stellarTxHash": "string | null",
  "initiatedAt": "ISO8601 timestamp",
  "confirmedAt": "ISO8601 timestamp | null",
  "confirmedBy": "string (User.id) | null"
}
```

**Decisions:**

- **Cash confirmation authority: only `toUserId` (the payee) can move status from `awaiting_confirmation` → `confirmed`.** Not the host, even if the host and payee are different people. Rationale: letting the host confirm on someone else's behalf reopens exactly the "false paid-in-cash claim" fraud vector flagged in your own Compliance section — the person owed the money is the only one with the incentive to confirm honestly. Host can *see* the pending state and nudge the payee, but cannot confirm it themselves.
- `gcash`/`maya`/`bank` methods are **pure UI stubs for Phase 1**: the endpoint accepts the request and immediately sets `status: confirmed`, no real payment call. Label these visibly as "simulated" in the UI per your Committed checklist. Only `cash` and `stellar` have real status transitions in Phase 1.

---

### `JoinLink`

```json
{
  "id": "string (uuid)",
  "groupId": "string (Group.id)",
  "slug": "string",
  "createdBy": "string (User.id, must be host)",
  "isActive": "boolean",
  "createdAt": "ISO8601 timestamp",
  "revokedAt": "ISO8601 timestamp | null"
}
```

**Decisions:**

- QR encodes the **full URL only** (`hati.ph/xxxx`), no embedded group data. Resolve everything server-side on scan. Simpler, and works even if the group schema changes later.
- **One `JoinLink` per `Group` (household-level), not per-bill.** New expenses added to an existing group just appear in the existing group view — roommates don't rescan a QR for every new bill. This resolves the inconsistency between "per-bill" and "per-household" language across the existing docs, in favor of the lower-friction model that also matches the stated design principle of minimizing taps for repeat use.

---

## 2. API Endpoint Contracts

| Endpoint | Method | Request | Response | First needed by |
| --- | --- | --- | --- | --- |
| `/groups` | POST | `{ name, hostId }` | `Group` | Track 3 |
| `/groups/:id` | GET | — | `Group` | Track 3 & 4 |
| `/groups/:id/join-link` | POST | `{ createdBy }` | `JoinLink` | Track 3 |
| `/join/:slug` | GET | — | `{ group: Group, ledger: Ledger }` | Track 4 |
| `/groups/:id/expenses` | POST | `Expense` (minus id/createdAt) | `Expense` | Track 3 |
| `/groups/:id/expenses` | GET | — | `Expense[]` | Track 4 |
| `/groups/:id/ledger` | GET | — | `Ledger` | Track 4 |
| `/settlements` | POST | `{ groupId, fromUserId, toUserId, amount, method }` | `Settlement` | Track 3 |
| `/settlements/:id/confirm` | POST | `{ confirmedBy }` | `Settlement` | Track 3 |
| `/users/guest` | POST | `{ displayName, phone? }` | `User` (isGuest: true) | Track 4 |

**Decisions:**

- **No real auth/session system for Phase 1.** Pass `userId` explicitly in request bodies. State this openly in the README as a deliberate scope cut, not an oversight — judges scoring "technical implementation" care more about Stellar depth than a bespoke auth layer in a one-week build.
- **Uniform error shape**: `{ "error": { "code": "string", "message": "string" } }` for every endpoint, no exceptions. One error handler in Frontend, full stop.
- **Offline queue envelope**: `{ "localId": "string (uuid, client-generated)", "payload": "<Expense | Settlement request body>", "queuedAt": "ISO8601 timestamp" }`. Backend dedupes on `localId` if the same item syncs twice (e.g. retry after a flaky connection). This is a hard requirement, not optional, since offline-first is a Committed Phase 1 item.

---

## 3. Naming Conventions

- Entities: PascalCase in docs/types (`User`, `JoinLink`); camelCase in JSON (`userId`, `joinedAt`)
- Primary key always `id`; foreign keys always `xId` pattern (`groupId`, `userId`) — never `group_id`
- Timestamps: always ISO8601 strings, always suffixed `At` (`createdAt`, `confirmedAt`) — never Unix epoch ints
- Money: always integer smallest-unit, always paired with a `currency` field
- Booleans: prefixed `is`/`has` (`isGuest`, `hasSettled`)
- Enums: lowercase, snake_case if multi-word (`"awaiting_confirmation"`, `"cash"`)

---

## 4. Other Decisions Pulled Forward from the Open Decisions Tracker

- **Mobile framework: web-first (mobile web view), not native.** The host/renter join flow is explicitly QR/link-based with no forced install — a lightweight web view matches that UX intent, works regardless of what Google AI Studio's output targets natively, and removes app-store distribution as a dependency for Demo Day. If Google AI Studio's output turns out to be strongly native-oriented once you see it, this is the one call worth revisiting fast — everything else in this doc holds either way.
- **Guest → full account conversion trigger: first settlement attempt** (stated above under `User`).
- **Cash-payment confirmation mechanism: payee-only confirmation** (stated above under `Settlement`).

---

*This is the locked spec. Commit it to `/docs/contracts.md` today and build against it.*