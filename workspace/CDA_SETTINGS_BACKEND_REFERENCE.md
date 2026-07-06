---
project: Commission Breakdown
tags: [project/commission-breakdown, backend-reference, type/documentation]
updated: 2026-07-05
---

# CDA Settings Backend Reference

**Connected to:** [[../CLAUDE.md|Commission Breakdown CLAUDE]], [[../README.md|Readme]]


## Purpose

Reference for backend, API, and LLM consumers that need to understand the CDA Settings surface.

This covers:
- Commission plans
- Fee types
- Default assignments
- All CTAs, menus, inputs, toggles, and dialogs
- Role access and permission boundaries
- Validation and downstream calculation impact

## Source Basis

This doc is derived from:
- `workspace/web-app/src/app/pages/CDASettings.tsx`
- `workspace/web-app/src/app/components/finance/fee-builder-modal.tsx`
- `workspace/web-app/src/app/pages/AssignDefaults.tsx`
- `workspace/web-app/src/app/pages/CommissionPlanBuilder.tsx`
- `workspace/web-app/src/app/pages/FeeTypeBuilder.tsx`
- `workspace/web-app/src/app/pages/CDAInsertionMap.tsx`
- `workspace/web-app/src/imports/pasted_text/cda-settings-page.tsx`
- `workspace/web-app/src/imports/pasted_text/cda-design-system.md`

## Product Context

CDA means Closing Disclosure Audit.

CDA Settings powers automatic CDA calculations in Deal Terms and downstream review flows.

Core dependency chain:
1. CDA Settings defines default commission plans and fee types.
2. Default assignments attach plans and fees to agents.
3. Deal Terms and CDA breakdown screens consume those defaults.
4. Team Lead can override in review.
5. Auditor finalizes Radius fee and company dollar.

## Route / Surface Map

| Surface | Purpose | Primary Users |
|---|---|---|
| CDA Settings | Manage commission plans, fee types, and default assignments | Team Lead, Admin |
| Commission Plan Builder | Create or edit a plan | Team Lead, Admin |
| Fee Type Builder | Create or edit a fee type | Team Lead, Admin |
| Assign Defaults | Map plans and fees to agents | Team Lead, Admin |
| CDA Breakdown | Calculate and review CDA | Agent, Team Lead |
| Team Lead Review | Adjust CDA before agent confirmation | Team Lead |
| Auditor Verification | Final manual verification | Auditor |

## Role Permissions

### Permission Matrix

| Role | Can View CDA Settings | Can Create / Edit Plans | Can Create / Edit Fees | Can Assign Defaults | Can Archive | Can Apply Changes to Under-Contract Deals | Notes |
|---|---|---|---|---|---|---|---|
| Team Lead | Yes | Yes | Yes | Yes | Yes | Yes | Primary operator for settings |
| Admin | Yes | Yes | Yes | Yes | Yes | Yes | Same settings access as TL in current surface |
| Agent | No | No | No | No | No | No | Consumes defaults in CDA flows only |
| Team Member | No | No | No | No | No | No | No settings access defined |
| TC | No | No | No | No | No | No | Works in transaction scope only |
| Auditor | No | No | No | No | No | No | Uses final verification flow, not settings |

### Role Notes

- Team Lead and Admin are the only roles allowed to access CDA Settings. This is explicitly called out in the insertion map.
- Agents can see the effects of settings in CDA breakdown and confirmation flows, but not the settings page.
- TC and Auditor consume the result of settings, not the settings themselves.
- If backend enforces authorization, CDA Settings should be a hard permission boundary.

## Data Model

### Commission Plan

| Field | Type | Required | Meaning |
|---|---|---|---|
| id | string | Yes | Unique identifier |
| name | string | Yes | Display name, for example `80/20 Standard` |
| type | `standard` or `tiered` | Yes | Plan structure |
| agentSplit | number | Yes | Agent percentage for standard plans |
| teamSplit | number | Yes | Team percentage for standard plans |
| feeType | `flat` or `percentage` | Yes | Plan fee model |
| feeAmount | number | Yes | Flat amount or percentage value |
| capAmount | number | Yes | Cap amount in dollars |
| dealTypes | string[] | Yes | Buyer, Seller, Lease, Landlord |
| assignedAgentsCount | number | Yes | Count shown in list |
| resetPeriod | `yearly` or `quarterly` or `monthly` | Yes | Tiered plan reset cadence |
| basedOn | `units` or `gci` or `sales-volume` | Yes | Tier basis |
| tiers | TierRow[] | Yes | Tiered split rows |

### Tier Row

| Field | Type | Required | Meaning |
|---|---|---|---|
| id | string | Yes | Unique tier id |
| from | string | Yes | Tier lower bound |
| to | string | No for final tier | Tier upper bound |
| agentSplit | string | Yes | Agent percentage |
| teamSplit | string | Yes | Team percentage |

### Fee Type

| Field | Type | Required | Meaning |
|---|---|---|---|
| id | string | Yes | Unique identifier |
| name | string | Yes | Display name, for example `TC Fee` |
| type | `flat` or `percentage` | Yes | Fee value model |
| amount | string | Yes | Currency or percent value as entered |
| appliesToMode | `team` or `agents` | Yes | Assignment scope |
| agentIds | string[] | Yes | Assigned agents when mode is `agents` |
| timing | `pre-split` or `post-split` | Yes | Deduction timing |
| slidingScale | boolean | Yes | Enables tiered fee rows |
| tiers | FeeTier[] | Yes | Sliding scale configuration |
| contributesToCap | boolean | Yes | Whether fee counts toward cap |

### Fee Tier

| Field | Type | Required | Meaning |
|---|---|---|---|
| id | string | Yes | Unique tier id |
| from | string | Yes | Lower bound |
| to | string | Yes | Upper bound |
| fee | string | Yes | Tiered fee amount |

### Default Assignment

| Field | Type | Required | Meaning |
|---|---|---|---|
| id | string | Yes | Unique assignment id |
| agentId | string | Yes | Agent receiving defaults |
| planId | string or null | Conditional | Commission plan assigned to agent |
| feeIds | string[] | Yes | Default fee ids assigned to agent |
| applyToActiveDeals | boolean | Yes | Recalculate under-contract deals when changed |

## CDA Settings Page

### Header Actions

| CTA | Type | Effect |
|---|---|---|
| Save changes | Button | Persists settings changes |
| Add commission plan | Button | Opens Add Commission Plan dialog |
| Add fee type | Button | Opens Add Fee Type dialog |

### Commission Plans Table

| Column / Control | Type | Details |
|---|---|---|
| Plan name | Table cell | Displays the plan name |
| Type badge | Badge | `Standard` or `Tiered` |
| Split summary | Inline metadata | Standard shows agent/team split |
| Tier summary | Inline metadata | Tiered shows tier count and basis |
| Fee summary | Inline metadata | Shows fee amount / fee type |
| Cap summary | Inline metadata | Shows cap amount |
| Assigned agents | Inline metadata + avatars | Shows agent count or avatar stack |
| Row menu | Dropdown | Edit, Assign, Duplicate, Archive |

### Commission Plan Row Menu

| Item | Type | Effect |
|---|---|---|
| Edit | Dropdown item | Opens plan editor with existing values |
| Assign | Dropdown item | Opens Assign Defaults dialog with plan locked |
| Duplicate | Dropdown item | Creates copy flow with `Copy` suffix |
| Archive | Dropdown item | Opens archive confirmation |

### Fee Types Table

| Column / Control | Type | Details |
|---|---|---|
| Fee name | Table cell | Displays fee name |
| Fee type badge | Badge | `Flat` or `Percentage` |
| Timing badge | Badge | `Pre-split` or `Post-split` |
| Applies to badge | Badge | `Agent`, `Team`, or `Both` |
| Cap badge | Badge | `Cap` when contributing to cap |
| Amount | Table cell | Currency or percentage |
| Assigned agents | Inline metadata + avatars | Visible when fee is assigned to agents |
| Row menu | Dropdown | Edit, Assign, Duplicate, Archive |

### Fee Type Row Menu

| Item | Type | Effect |
|---|---|---|
| Edit | Dropdown item | Opens fee editor with existing values |
| Assign | Dropdown item | Opens Assign Defaults dialog with fee locked |
| Duplicate | Dropdown item | Creates copy flow |
| Archive | Dropdown item | Opens archive confirmation |

### Default Assignments Table

| Column / Control | Type | Details |
|---|---|---|
| Search | Input | Filters by agent name, email, or role |
| Agent | Table cell | Avatar, name, role |
| Email | Table cell | Agent email |
| Commission plan | Table cell | Plan name and split summary |
| Default fees | Table cell | Fee badges |
| Row actions | Action buttons | Edit, preview, view deals, clear assignment |

### Default Assignment Actions

| Action | Type | Effect |
|---|---|---|
| Edit | Button / row action | Opens Assign Defaults dialog for existing assignment |
| Preview | Button / row action | Opens preview panel or dialog for assignment impact |
| View deals | Button / row action | Opens affected deals view |
| Clear plan / clear assignment | Button / destructive action | Removes the default assignment |
| Bulk assign | Button | Opens bulk assign flow |
| Save assignments | Button | Persists assignment changes |
| Preview impact | Button | Shows recalculation preview |
| View affected deals | Button | Shows under-contract deals impacted by changes |

## Add / Edit Commission Plan Dialog

### Fields

| Field | Control | Notes |
|---|---|---|
| Plan name | Text input | Required |
| Plan type | Select | Standard or Tiered |
| Agent split % | Numeric input | Standard plans only |
| Team split % | Numeric input | Standard plans only |
| Reset period | Select | Tiered plans only |
| Based on | Select | Tiered plans only |
| Fee type | Select | Flat or Percentage |
| Fee amount | Adorned numeric input | Currency or percent based on fee type |
| Cap amount | Adorned numeric input | Required in plan editor |
| Deal types | Multi-select dropdown | Buyer, Seller, Lease, Landlord |
| Apply as default for selected agents | Toggle or checkbox | Triggers assignment behavior |
| Selected agents | Multi-select | Only when applying to specific agents |
| Tier rows | Repeating builder rows | Tiered plans only |

### Dialog Actions

| Action | Type | Effect |
|---|---|---|
| Cancel | Button | Closes dialog |
| Save plan | Button | Validates and persists plan |

### Tier Builder Controls

| Control | Type | Notes |
|---|---|---|
| Add Tier | Button | Adds a new tier row |
| Remove | Button | Removes a tier row |
| From | Input | Lower bound |
| To | Input | Upper bound; final row may omit upper bound |
| Agent split % | Input | Keeps total split in sync |
| Team split % | Input | Keeps total split in sync |

### Validation

| Rule | Error Surface |
|---|---|
| Plan name required | Inline field error |
| Standard splits must total 100% | Inline split error |
| Tiered rows must have valid split totals | Inline tier error |
| Tiered rows must have `from` values | Inline tier error |
| Non-final tiers must have `to` values | Inline tier error |
| At least one deal type required | Inline deal type error |
| Specific default assignment requires selected agents | Inline assignment error |

### Overwrite Confirmation

If `applyAsDefault` targets agents that already have defaults, the UI opens a confirm dialog:
- Replace defaults
- Cancel

Backend implication:
- Existing assignment records are replaced, not duplicated.

## Add / Edit Fee Type Dialog

### Fields

| Field | Control | Notes |
|---|---|---|
| Fee name | Text input | Required |
| Fee type | Select | Flat or Percentage |
| Amount | Adorned numeric input | Currency or percentage |
| When applied | Select | Pre-split or Post-split |
| Applies to | Select | Agent, Team, Both |
| Percentage basis | Select | Only visible when fee type is Percentage |
| Sliding scale | Toggle | Shows tier rows |
| Contributes to cap | Toggle | Counts toward cap |
| Tier rows | Repeating builder rows | Only when sliding scale is enabled |
| Default assignment toggles | Checkboxes | Apply to new CDA, selected plans, selected agents |

### Percentage Basis Options

| Value | Label |
|---|---|
| property | Property Value |
| gci | GCI / Gross Commission Income |
| net | Net Commission |
| post-split | Post-split Commission |

### Dialog Actions

| Action | Type | Effect |
|---|---|---|
| Cancel | Button | Closes dialog |
| Save fee type | Button | Validates and persists fee |

### Sliding Scale Builder

| Control | Type | Notes |
|---|---|---|
| Add Tier | Button | Adds a tier row |
| Remove | Button | Removes a tier row |
| From | Input | Lower bound |
| To | Input | Upper bound |
| Fee | Input | Tiered fee value |

### Validation

| Rule | Error Surface |
|---|---|
| Fee name required | Inline field error |
| Amount required and > 0 | Inline field error |
| Sliding scale tiers must be complete | Inline tier error |
| Percentage fee requires percentage basis | Field dependency |

## Assign Defaults Dialog

### Entry Modes

| Source | Behavior |
|---|---|
| Bulk | Set plan and fees for multiple agents |
| From plan | Plan is locked, assign that plan to selected agents |
| From fee | Fee is locked, assign that fee to selected agents |
| From agent | Agent is locked, edit one agent’s defaults |

### Fields

| Field | Control | Notes |
|---|---|---|
| Commission plan | Select | Hidden when plan is locked |
| Default fees | Multi-select dropdown | Hidden when not needed by source mode |
| Assign to | Agent multi-select | Hidden when agent is locked |
| Apply to under contract deals | Switch | Recalculates active transactions |

### Dialog Actions

| Action | Type | Effect |
|---|---|---|
| Cancel | Button | Closes dialog |
| Assign Defaults | Button | Saves assignment records |

### Locked Summary States

| Locked Source | What Appears |
|---|---|
| Plan | Plan summary card |
| Fee | Fee summary card |
| Agent | Agent summary card |

### Validation

| Rule | Error Surface |
|---|---|
| Plan required when source does not lock a plan | Inline error |
| At least one agent required when source does not lock an agent | Inline error |

## Assignment Side Effects

| Change | Result |
|---|---|
| Add or edit assignment | Agent’s default CDA rules update |
| Apply to under contract deals enabled | Active CDA forecasts recalculate |
| Clear assignment | Agent reverts to no default plan / fee mapping |
| Change plan with overwrite confirmed | Existing defaults are replaced |

## Fee and Plan Semantics

### Commission Plans

| Type | Behavior |
|---|---|
| Standard | Fixed agent/team split |
| Tiered | Split changes by range and reset period |

### Fee Types

| Attribute | Behavior |
|---|---|
| Pre-split | Deduct before split basis is allocated |
| Post-split | Deduct after agent allocation |
| Agent | Applies to agent share |
| Team | Applies to team share |
| Both | Applies to both shares |
| Cap contribution | Included in cap background math, not always displayed directly |

## Downstream Consumers

| Screen / Flow | Reads From CDA Settings |
|---|---|
| Deal Terms | Default commission plan and fee defaults |
| CDA Breakdown | Split and deduction structure |
| Team Lead Review | Editable defaults and plan overrides |
| Agent Confirmation | Final agent payout values |
| Auditor Verification | Radius fee and company dollar verification |
| Affected Deals preview | Under-contract recalc impact |

## Backend Contract Notes

### Recommended API Concepts

| Resource | Suggested Operations |
|---|---|
| commission_plans | list, create, update, archive, duplicate |
| fee_types | list, create, update, archive, duplicate |
| default_assignments | list, upsert, clear, bulk_upsert |
| affected_deals_preview | read-only preview for under-contract recalc |

### Important Behavior

- Archived plans and fees should remain historically traceable.
- Duplicate should create a new record, not mutate the original.
- Default assignment changes may affect active CDA forecasts.
- Changing settings after agent confirmation should be treated carefully because downstream flows may need reset logic.
- Unknown or unsupported access should be treated as `no access` until product explicitly defines otherwise.

## Summary

The CDA Settings surface is the source of truth for:
- Split rules
- Deduction rules
- Agent defaults
- Active CDA recalculation behavior

Backend should treat it as a permissioned configuration system, not just a list page.
