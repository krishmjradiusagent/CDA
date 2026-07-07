# CDA — Broker Signature + Auditing Queue States (2026-07-07)

## Pass 3 — Activity log drawer + Commission Breakdown page mirror

Two surfaces now speak the same 4-state language: `transaction-queue.html` (auditing queue) + `CommissionBreakdown.tsx` (deal page).

**Auditing queue additions:**
- Slide-in Activity Log drawer (420px, right-aligned) w/ reverse-chron entries per UID
- Entry types: `generated · sent · regenerated · deleted`, each w/ color-coded icon
- "View this version →" link per entry (stub → `/cda/templates?version=vN`)
- Seeded log data: `window.__cdaLog` object keyed by UID
- All Send / Regenerate / Delete handlers write log entries via `logAppend()`
- History links now on Sent / Regenerated / Deleted rows (Generated deferred)
- Legacy `revertRowToConfirmed` rewired: delete now → tombstone (not revert to Confirmed)

**Commission Breakdown (CommissionBreakdown.tsx) additions:**
- New CDA Status strip above Total Gross Commission — chip + version + activity log button + state-aware Send/Regenerate/Delete cluster
- Radix `Sheet` drawer w/ same visual language as auditing queue
- Seeded `defaultActivityLog` (3 entries) + `pushLog()` writes on every state transition
- State machine: `generated → sent`, `generated|sent|regenerated → regenerated (v++)`, `any → deleted`, `deleted → generated (v1 fresh start)`

**Key decision locked (was Krish's open Q):**
- Placement of regenerated CDA = **option (a) in-place**. One row = one active CDA. History drawer holds all versions. Matches Krish's own "only latest active CDA shown to all roles" rule.

**Files this pass:**
- `transaction-queue.html` (drawer CSS + JS + seed data)
- `workspace/web-app/public/auditing-queue.html` (synced)
- `workspace/web-app/src/app/lib/cda-state.ts` (new — shared types + style map)
- `workspace/web-app/src/app/pages/CommissionBreakdown.tsx` (CDA status strip + Sheet)

**Open threads (Milan):**
- Backend contract for `activity_log[]`: id, ts, actor, action, version, doc_url
- Confirm history drawer scope (audit trail vs prior versions only)
- Confirm "View this version" URL pattern

---


## Pass 2 — Auditing Queue CDA states + role visibility

Files: `transaction-queue.html` (root) + `workspace/web-app/public/auditing-queue.html` (synced).

**4 canonical CDA row-states** (DocuSign / Signed / Sent-for-Signature all collapsed):

| State | Chip | data-cda-state | Auditor | Team Lead | Agent |
|---|---|---|---|---|---|
| Generated | teal "Generated" | `generated` | View · Send · Regenerate · Delete | View · Send · Delete | View |
| Sent | blue "Sent" + timestamp | `sent` | View · Regenerate · Delete | View · Delete | View |
| Regenerated | amber "Regenerated" + `v2` + history link | `regenerated` | same as Generated | same as Generated | View (v2 only) |
| Deleted | gray "Deleted" tombstone + who/when | `deleted` | Regenerate | Regenerate | *row hidden* |

**Role switch** — dropdown in `.viewas` bar. URL param `?role=auditor|lead|agent`. Drives `body[data-role]`; CSS hides actions per role. No DOM rewriting on switch.

**Demo rows currently mapped:**
- IJWXY → Generated
- KLBCD → Deleted (tombstone w/ "by Emily Rodriguez · Jul 7, 10:42 AM")
- LMEFG → Sent (Jul 7, 09:15 AM)
- MNGHI → Regenerated v2 (history: v1 sent Jul 5, 04:20 PM)

**Interactions wired:**
- Regenerate button → row bumps state to `regenerated`, version increments, history link auto-appended
- Delete button → row converts to Deleted tombstone in-place, action collapses to single "Regenerate" pill
- History link → alert stub (drawer content TBD from Milan)
- Role change → toast + URL sync

**Open threads (flagged to team):**
- Regenerated visual (chip+history vs two chips vs drawer-only) — currently option (c)
- Deleted recovery action — currently "Regenerate", confirm
- History drawer content shape (auditor-only? full audit trail?)
- Gross/Net toggle — assumed inside preview modal, not on row
- Send-CDA popup — needs team review pass (from prior thread)

---

# Pass 1 — CDA Templates: Auto Broker Signature + Scrub

**Scope:** `/cda/templates` (tab1–tab5) only. Email templates + sent-PDF are separate follow-ups.

## What shipped

1. **Auto-applied MB signature** at bottom of every CDA template.
2. **DocuSign chrome removed** from broker block (no "Signed by", no envelope IDs, no dashed placeholder line).
3. **Broker resolves from deal state + team** (see map).
4. **Generation date** = today, format `July 7, 2026` (long).
5. **No broker personal phones** — MB block shows name + signature + title only. Wire-confirmation Ops phones (415-…) stay because they are Radius Ops, not brokers.

## Broker resolver

| State(s) | Broker | Notes |
|---|---|---|
| CA | Roger Zelaya | |
| TX, FL, WA, CO, AZ | Katherine Rzad ("Kathy") | |
| GA — standard | Katherine Rzad | |
| GA — Indigo Road team | Rhonda Morgan | trigger: `team = "indigo-road"` |
| NY | Kevin Kieffer (transitional) → Eric Eckardt once `ericLicensed = true` | title suffix "(Transitional)" while Kevin |
| Unknown / fallback | Katherine Rzad | assumed until Lindsey/Biju confirm |

Code: `src/app/lib/broker.ts` → `resolveBroker(state, team, ericLicensed)`.

## Component

`src/app/components/BrokerSignature.tsx` — drop-in replacement for the old "Broker Signature" 4-line placeholder. Props: `state`, `team`, `ericLicensed`, `date`.

Rendered block:
```
MANAGING BROKER
[signature image OR cursive placeholder]     ← ends flush on border
Roger Zelaya · Managing Broker     July 7, 2026
```

Signature source order:
1. `<img src="/signatures/{id}.png">` — set by Lindsey once PNGs land
2. Cursive fallback (`Homemade Apple` Google Font) when the image 404s

## Files changed
- `workspace/web-app/src/app/lib/broker.ts` (new)
- `workspace/web-app/src/app/components/BrokerSignature.tsx` (new)
- `workspace/web-app/src/app/pages/CDATemplates.tsx` — 5 sig blocks swapped, demo-state selector added
- `workspace/web-app/index.html` — Google Fonts (Homemade Apple, Caveat)

## Demo controls (dev only)

Toolbar of `/cda/templates` shows a **Broker demo** dropdown. Query params:
- `?demo_state=CA|TX|FL|WA|CO|AZ|GA|NY`
- `?demo_team=indigo-road` (only meaningful when state=GA)

Verified live: CA→Roger, NY→Kevin (Transitional), GA+Indigo→Rhonda, GA→Kathy, TX→Kathy.

## Open items → Lindsey / Biju

- Ship 5 signature PNGs into `workspace/web-app/public/signatures/` (kathy.png, rhonda.png, roger.png, eric.png, kevin.png). Then cursive fallback disappears automatically.
- Confirm Roger name format: "Roger Zelaya" vs "G. Zelaya".
- Confirm fallback broker when state is unknown (currently defaults Kathy).
- Confirm the real production signal for Indigo Road team (currently reading `data-team="indigo-road"` — needs backend contract with Milan).
- Next passes: email templates at `/cda/email-template`, and sent-PDF to escrow.
