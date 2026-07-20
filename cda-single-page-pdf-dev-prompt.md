# Dev Prompt — CDA Template: Fit One PDF Page (Cursor / Claude Code)

Paste this into Cursor or Claude Code as the task. Scope is intentionally narrow.

---

## Goal

The **CDA document itself** — the printable card with the teal top border, "Disbursement Authorization" header, property meta, wire cards, MB signature, and address footer — must fit on **one Letter page** when the user prints it or saves as PDF.

**Scope is the document only.** Ignore surrounding app UI (header, nav, floating layout / broker-demo pills, breadcrumbs). Those are already hidden from print and are not part of this ticket.

## What the document is

The single React block inside the tab that starts with the teal gradient bar and ends at the address footer. All content between:

- Teal top border (`h-[3px] bg-gradient-to-r from-teal-500 to-teal-400`).
- Header row: RA badge (left) + "Disbursement Authorization" (right).
- "Please disburse funds as follows:" lead.
- Property meta grid (property address, representation, agent, escrow company, escrow email, sale price, gross commission).
- Ledger stack: one card per payee (Radius Agent, Move Sales Inc, Listwizer). Each card has a payee name + amount header and a wire block below (Wire To, Bank/Account/Routing, optional memo).
- Managing Broker signature block (label, sig line, name · title · date).
- Address footer.

Everything above lives inside a single `<Card>` in the tab. **That card is the entire print target.** Nothing else goes on the page.

## Approach

Two pieces to land: (1) tightened density inside the card, and (2) a print stylesheet that pins the card to one page.

### 1. Density inside the card

Match these tokens. The goal is a compact-but-legible enterprise document — not the airy web view we ship for on-screen preview.

- Card padding: `p-8` (not `p-12`).
- Header row: `mb-4`; RA badge `w-9 h-9 text-xs`; title `text-base font-semibold`.
- Lead sentence: `text-xs mb-2`.
- Property meta box: `bg-muted/20 border rounded-md p-2.5 text-xs mb-2`, grid `grid-cols-2 gap-x-4 gap-y-1`. Field label `text-[9px] font-bold uppercase tracking-wider mb-0.5`. Gross Commission value `text-sm font-bold text-teal-600`. Rest of values `font-medium text-foreground`.
- Ledger wrapper: `space-y-1.5 mb-2`.
- Each payee card: `border rounded-md p-2.5 bg-muted/10 space-y-2`. Payee row `text-xs`. Wire block `bg-background border rounded p-2 text-[11px] space-y-0.5 text-muted-foreground`. Memo `text-[9px] italic leading-snug pt-1 border-t mt-1`.
- Signature wrapper: `mt-4 pt-3 border-t max-w-[320px] ml-auto`.
- Signature block (inside `BrokerSignature`): outer `space-y-1`; label `text-[9px] uppercase tracking-wider`; sig line `h-9 border-b`; fallback cursive `18px`; sig image `max-h-8 max-w-[160px]`; meta row `flex justify-between items-baseline gap-2 text-[11px] whitespace-nowrap` on the date span (prevents the "Managing BrokerJuly 13, 2026" collision).
- Address footer: `mt-4 pt-2 border-t text-[9px] text-center leading-snug`.

### 2. Print stylesheet

Inject once at the top of the page component. Only the document card should print. Do not modify anything outside `.cda-print-page`.

```tsx
<style>{`
  @page { size: Letter; margin: 0.35in; }
  @media print {
    body { background: #fff !important; }
    .no-print, header, nav, [data-slot="dropdown-menu-trigger"], .fixed { display: none !important; }
    .cda-print-page {
      box-shadow: none !important;
      border: 0 !important;
      padding: 12px !important;
      max-width: 100% !important;
      width: 100% !important;
      page-break-inside: avoid;
      break-inside: avoid;
      zoom: 0.88;
    }
    .cda-print-page * { page-break-inside: avoid; }
  }
`}</style>
```

Add the class `cda-print-page` to the outer `<Card>` of the document.

- `@page Letter, 0.35in margin` locks the paper size and physical margins.
- `zoom: 0.88` gives ~12% headroom so the tightened density above always lands on one page, even with the longest signature name and longest property address.
- `page-break-inside: avoid` on both the card and every descendant stops the browser from slicing between wire cards or between the signature and its label.
- Hiding `.fixed`, `header`, `nav`, and dropdown triggers removes app chrome from the print output. Nothing else about that chrome is your concern.

## Acceptance

- Print / Save PDF on the CDA document → **one Letter page**, no overflow onto page 2.
- Signature name + title + date fit on one line inside the 320px signature column — no wrap, no collision.
- On-screen the document still reads clean at a 1280px viewport: no clipped rows, no overlapping text.
- Nothing outside the document card appears in the printed output.

## Non-goals

- App chrome (header, nav, floating pills) — already handled, don't touch.
- Other tabs / other CDA layouts — this ticket is one document only.
- Broker resolver logic, signature asset list, tab routing — untouched.
- No new dependencies. `@page` + `zoom` are the whole print engine.

## Reference

Reference diff on `main` at `krishmjradiusagent/CDA`:

- `94bfb44` — card + print CSS.
- `f170e61` — signature density + date wrap.
- `5759a9a` — meta grid / ledger gap final pass.
