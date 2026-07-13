# Dev Prompt — CDA Full Transparency: Single-Page PDF Fit

Paste this into Cursor / Claude Code as the task brief. All context needed is here; the file paths are relative to the CDA repo.

---

## Goal

The **Full Transparency** CDA template (the one served at `/cda/templates` → tab1) must render as **a single Letter-size page** when the user clicks **Print / Save PDF**. Today it spills onto page 2 because paddings/margins built for a web canvas were also being sent to the print pipeline.

Nothing else about the layout should change — same components, same content, same visual hierarchy. Only spacing tightens and print CSS forces a one-page fit.

## Scope

Two files:

- `workspace/web-app/src/app/pages/CDATemplates.tsx` — tab1 `<Card>` content + print stylesheet.
- `workspace/web-app/src/app/components/BrokerSignature.tsx` — signature block density.

Other tabs (tab2 / tab3 / tab4 / tab5) are not covered by this ticket. Only tab1.

## What changed and why

### 1. Print stylesheet (added once, top of the page component)

Inject a `<style>` block right inside the returned root wrapper of `CDATemplates.tsx`:

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

- `@page Letter, 0.35in` → the target medium.
- `zoom: 0.88` on the print-only class → an easy final safety scale (~88%). Prefer this over CSS `transform: scale()` because `zoom` reflows correctly for print in Chromium.
- Hide the fixed floating layout / broker-demo pills, the header, and any nav so only the doc prints.
- `page-break-inside: avoid` on the card and its children stops the browser from splitting the doc between wire cards.

### 2. Tab1 `<Card>` — add `cda-print-page` class and tighten spacing

The Card wrapper needs the new class **and** tighter tokens:

- `p-12` → `p-8`
- Header row `mb-8` → `mb-4`, RA badge `w-10 h-10` → `w-9 h-9`, title `text-lg` → `text-base`.
- "Please disburse funds as follows" `text-sm mb-6` → `text-xs mb-2`.
- Property meta grid: `gap-4 p-5 text-sm mb-8` → `gap-x-4 gap-y-1 p-2.5 text-xs mb-2`. Field labels `text-[10px] mb-1` → `text-[9px] mb-0.5`. Gross Commission value `text-base` → `text-sm`.
- Ledger wrapper `space-y-4 mb-8` → `space-y-1.5 mb-2`.
- Each payee card: `p-4 space-y-3` → `p-2.5 space-y-2`; payee name/amount `text-sm` → `text-xs`; wire block `p-3 text-xs space-y-1` → `p-2 text-[11px] space-y-0.5`; memo `text-[10px]` → `text-[9px] leading-snug`.
- Signature block wrapper: `mt-12 pt-6 border-t` → `mt-4 pt-3 border-t`.
- Footer: replaced the `<Separator className="my-8" />` + `text-[10px]` block with `mt-4 pt-2 border-t text-[9px] text-center leading-snug`.

All wire card / meta card border-radius shifted from `rounded-lg` to `rounded-md` to match the tighter scale.

### 3. `BrokerSignature.tsx` — density + date wrap fix

- Outer `space-y-2` → `space-y-1`.
- Label `text-[10px]` → `text-[9px]`.
- Sig line `h-12` → `h-9`; fallback cursive `22px` → `18px`; image `max-h-10 max-w-[180px]` → `max-h-8 max-w-[160px]`.
- Meta row: `text-xs` → `text-[11px]`; add `gap-2` + `whitespace-nowrap` on the date span so the "Managing BrokerJuly 13, 2026" collision is impossible at narrow widths.

## Acceptance

- Loading `/cda/templates` with tab1 selected and hitting **Print / Save PDF** produces a PDF whose Full Transparency doc is contained on **one Letter page** with default Chrome print settings (Letter, default margins, no scaling).
- Floating layout pill and broker-demo pill do not appear in the print output.
- Web view (non-print) still looks legible and unbroken — no clipped rows, no overlap in the signature row at 1280px viewport.
- BrokerSignature name + title + date all fit on one line at the 320px sig column without wrapping or colliding.

## Non-goals

- Don't touch tab2 / tab3 / tab4 / tab5 layouts — they still print as before.
- Don't change any of the auto-broker resolver logic (`lib/broker.ts`) or the signature image list.
- No new dependencies. `zoom` + `@page` are enough; do not pull in a PDF library.

## Ref implementation

The changes above are already on `main` at `krishmjradiusagent/CDA` — commits:

- `94bfb44` — tighten Full Transparency card + print CSS (`CDATemplates.tsx`).
- `f170e61` — tighten BrokerSignature block + date wrap.
- Latest — property meta / ledger gap further condensed (`gap-y-1`, `mb-2`, `space-y-1.5`).

Use those as the reference diff if you want to cherry-pick or match exactly.
