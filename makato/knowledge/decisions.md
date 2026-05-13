# Decisions

This file tracks architectural and product decisions made during development.

---

## Date: 2024-05-10
### Decision: Dedicated Bottom Sheet for Tags
- **Context**: Agent profile tags need management.
- **Decision**: Use a dedicated bottom sheet (`Sheet`) instead of inline editing.
- **Rationale**: Better UX on mobile and more space for tag search/selection.
- **Status**: Final

---

## Date: 2026-05-12
### Decision: Custom Toast Notification System
- **Context**: Need to provide user feedback for actions like "Save Assignments" without adding external dependencies.
- **Decision**: Implemented a lightweight, Vanilla JS toast system that injects DOM elements into a fixed container.
- **Rationale**: Maintains the single-file goal and zero-build requirement while providing modern UX.
- **Status**: Final

### Decision: Centralized Agent State
- **Context**: Multiple panels (Agent List, Settings, Summary, Modal) need to stay in sync.
- **Decision**: Use a global `agents` array as the source of truth and re-render components on change.
- **Rationale**: Simplest way to ensure data consistency in a non-reactive Vanilla JS environment without a state management library.
- **Status**: Final

---

## Date: 2026-05-13
### Decision: Remove Actions from Default Assignments Table
- **Context**: The user wanted to simplify the Default Assignments table.
- **Decision**: Removed the three-dot action menu.
- **Rationale**: Reduces visual noise in the high-density assignment list.
- **Status**: Final

### Decision: Hide Default Assignments Section
- **Context**: The user wanted to hide the Default Assignments table temporarily.
- **Decision**: Commented out the section in both React and HTML.
- **Rationale**: Temporary removal from view while other features are finalized.
- **Status**: Temporary

---

## Date: 2026-05-14
### Decision: Commission Breakdown Role Permissions (CANONICAL)
- **Context**: Strict role-based access for commission breakdown CTAs.
- **Rules**:
  1. **Agent**: Can add pre-split Credits/Referrals (dollar amount). Can add post-split deductions. Can edit pre-determined post-split deductions. CANNOT add "Agent pre-split deductions" (TL/Admin only). Cannot change commission plan.
  2. **Team Lead**: Can edit everything EXCEPT Radius fees.
  3. **Radius Admin**: Can edit everything.
- **Status**: Final — follow religiously.

---

### Decision: Fee Payment Assignment — Who Pays (Future)
- **Context**: Biju's feedback on fee deductions and CDA payment instructions.
- **Rules**:
  1. Every fee needs "Who Pays": **Agent**, **Team**, or **Both** (50/50 split).
  2. CDA purpose: instructions telling title company exactly who to transfer money to.
  3. Three payment routing modes (configured in Settings):
     - **Everything to Radius**: Title sends full check to Radius, Radius distributes.
     - **Radius fee to Radius, rest to Team**: Title splits — Radius fees → Radius, remainder → Team distributes to agents.
     - **Direct to all**: Title pays Radius fee → Radius, team fee → Team, agent commission → Agent directly.
- **Status**: Captured — not yet implemented.
