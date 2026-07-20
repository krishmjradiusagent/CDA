---
project: Commission Breakdown
tags: [project/commission-breakdown, foundation, type/documentation]
updated: 2026-07-05
---

# CLAUDE.md — Commission Breakdown

**Connected to:** [[README.md|Readme]], [[workspace/CDA_SETTINGS_BACKEND_REFERENCE.md|CDA Settings Backend Reference]], [[/Vault/CLAUDE.md|Vault Root]], [[/Radius UI 3.0/DESIGN.md|Design System]], [[/Vault/SKILLS/DESIGN SYSTEM LOCK.md|Design System Lock]]

### Design system lock (hard law)
Full procedure: `/Users/radius/Desktop/Design OS/Vault/SKILLS/DESIGN SYSTEM LOCK.md`
- Canonical DS: `/Users/radius/Desktop/Design OS/Radius UI 3.0/` — reference only; do not fork into this project.
- Before UI: COMPONENT MAP → compose only from closed set → **STOP on gaps** → label exact | adapted | new.
- New single-file HTML prototypes: link DS CSS; no freestyle primitives; §16 before done.

CDA / commission breakdown design prototypes.

- `magicpath-project/` — **legacy** MagicPath prototype (Vite 6 + React 19; preview config `magicpath-dev`, port 5180). MagicPath is retired; new prototypes are single-file HTML per the Design OS.
- Legacy workspace app: `workspace/web-app/` — contains the large CommissionBreakdown.tsx / CDASettings.tsx pages (~4,000 lines each; verify build after every edit).
- GitHub remotes: `krishmjradiusagent/CDA` (workspace) and `krishmjradiusagent/cdasoul` (magicpath-project, public).
- Ignore `AGENTS.md` and the `makato/` folder — deprecated context framework, not in use.
- `mpath1`–`mpath5` are prototype iterations; ask before modifying them if the active one isn't obvious from the request.

## Session log

- **2026-07-07** — CDA templates: auto MB signature by state/team, DocuSign chrome removed, no broker phones. Resolver in `src/app/lib/broker.ts`, component `src/app/components/BrokerSignature.tsx`, wired into all 5 tabs of `/cda/templates`. Demo dropdown in toolbar. Signature PNGs pending from Lindsey → cursive placeholder in the meantime. See `claude-design-prompt.md` for full handoff.
- **2026-07-07** — Auditing queue CDA states collapsed to 4 (Generated/Sent/Regenerated/Deleted), DocuSign / Signed / Sent-for-Signature all removed. Role switcher (Auditor/Lead/Agent) in `.viewas` bar drives `body[data-role]` w/ CSS visibility rules. New chips: `.b-generated .b-regen .b-deleted`. Demo rows IJWXY/KLBCD/LMEFG/MNGHI cover all 4 states. Regenerate + Delete flows wired w/ in-place state bumps. All 12 role×state combos verified live. Files: `transaction-queue.html` + `workspace/web-app/public/auditing-queue.html` (synced).
- **2026-07-07 (Pass 3)** — Activity log drawer added to both auditing queue (HTML slide-in, 420px, seeded via `window.__cdaLog`) and CommissionBreakdown.tsx (Radix Sheet, seeded via `defaultActivityLog`). New shared types in `src/app/lib/cda-state.ts`. Deal page now has visible CDA Status strip above stats: chip + version + activity log button + Send/Regen/Delete cluster. Placement Q locked to option (a) — one row = latest active CDA, history via drawer.
- **2026-07-07 (Pass 4)** — Auditing queue picker: 2-section combo (Transparency Settings × CDA Settings) w/ Default markers, on Generate + Regenerate + Send. Send button icon-only (caret removed), opens send modal directly. Modal restored CC + Subject + Attachment chip. Removed Wire Incomplete red pill; Generate + Upload CDA always paired on unfinalized rows.
- **2026-07-07 (Pass 5)** — Commission Breakdown page picker port: `CdaComboPicker` React component + Popover triggers on Regenerate/Generate, Radix Dialog Send modal w/ CC+Subject+Attachment. Uses shared 2-section pattern.
- **2026-07-07 (Pass 6)** — CDA templates: removed all non-broker sigs (Agent / Partner / Operations Manager / Manager). Only Managing Broker signature remains, right-aligned. Applies to all 5 tabs.
- **2026-07-14** — CDASettings: added `group_lead` role to switcher. Commission Plans + Fee Types now scope by ownership: GL sees TL items + own; other-GL items hidden. TL sees all + Group filter (All/Team-level/West/East). New `Created by` column w/ chips (Team / You / Group: X). Edit + Archive gated by `canEditOwned`; Assign/View/Duplicate stay open. New `Creator` type + `createdBy` on `CommissionPlan` + `FeeRecord`; seed annotated (TL: Sarah a3 / GL West: Emma a5 / GL East: James a6). `creatorForNew()` stamps new items. Locked: group defaults allowed, name collisions allowed, GL-removal → orphan-to-TL (recommendation).
