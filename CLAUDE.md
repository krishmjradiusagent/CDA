---
project: Commission Breakdown
tags: [project/commission-breakdown, foundation, type/documentation]
updated: 2026-07-05
---

# CLAUDE.md — Commission Breakdown

**Connected to:** [[README.md|Readme]], [[workspace/CDA_SETTINGS_BACKEND_REFERENCE.md|CDA Settings Backend Reference]], [[/Vault/CLAUDE.md|Vault Root]], [[/Radius UI 3.0/DESIGN.md|Design System]]

CDA / commission breakdown design prototypes.

- `magicpath-project/` — **legacy** MagicPath prototype (Vite 6 + React 19; preview config `magicpath-dev`, port 5180). MagicPath is retired; new prototypes are single-file HTML per the Design OS.
- Legacy workspace app: `workspace/web-app/` — contains the large CommissionBreakdown.tsx / CDASettings.tsx pages (~4,000 lines each; verify build after every edit).
- GitHub remotes: `krishmjradiusagent/CDA` (workspace) and `krishmjradiusagent/cdasoul` (magicpath-project, public).
- Ignore `AGENTS.md` and the `makato/` folder — deprecated context framework, not in use.
- `mpath1`–`mpath5` are prototype iterations; ask before modifying them if the active one isn't obvious from the request.

## Session log

- **2026-07-07** — CDA templates: auto MB signature by state/team, DocuSign chrome removed, no broker phones. Resolver in `src/app/lib/broker.ts`, component `src/app/components/BrokerSignature.tsx`, wired into all 5 tabs of `/cda/templates`. Demo dropdown in toolbar. Signature PNGs pending from Lindsey → cursive placeholder in the meantime. See `claude-design-prompt.md` for full handoff.
- **2026-07-07** — Auditing queue CDA states collapsed to 4 (Generated/Sent/Regenerated/Deleted), DocuSign / Signed / Sent-for-Signature all removed. Role switcher (Auditor/Lead/Agent) in `.viewas` bar drives `body[data-role]` w/ CSS visibility rules. New chips: `.b-generated .b-regen .b-deleted`. Demo rows IJWXY/KLBCD/LMEFG/MNGHI cover all 4 states. Regenerate + Delete flows wired w/ in-place state bumps. All 12 role×state combos verified live. Files: `transaction-queue.html` + `workspace/web-app/public/auditing-queue.html` (synced).
