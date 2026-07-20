# CDA Templates — PDF Page Padding (page 2+)

**Component:** `workspace/web-app/src/app/pages/CDATemplates.tsx`
**Route:** `/cda/templates`
**Style block:** inline `<style>` inside the top-level render (~line 88)
**Print trigger:** `handlePrint()` → `window.print()`

---

## Bug

When a CDA template overflows to a second page during PDF export (File → Print → Save as PDF), page 2 renders **flush against the top edge** with no top padding — the "Radius Agent" wire card starts at pixel 0. Page 1 is fine.

**Repro:** open any Tab 1 (Full Transparency) template long enough to push a wire card onto page 2 (e.g. add a Team Wire card so the doc totals > 1 page). Print → PDF. Compare page 1 top margin vs page 2 top margin.

## Root cause

Two independent problems in the print CSS:

1. **Global `page-break-inside: avoid` on all descendants.** The prior rule was:
   ```css
   .cda-print-page * { page-break-inside: avoid; }
   ```
   That tells the browser to keep every element on a single page. When overflow forces a split, Chromium ignores `@page` margins on the split boundary — the child overflows onto page 2 starting at the physical page top, not the margin box.

2. **`html`/`body` user-agent margins collide with `@page` margin.** On some Chromium print paths (Mac Chrome + Preview) the default `body { margin: 8px }` interacts with a narrow `@page { margin: 0.35in }` and the second page inherits zero top margin.

## Fix (already shipped in commit 6156980)

```css
@page { size: Letter; margin: 0.5in 0.4in; }
@media print {
  html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
  .no-print, header, nav, [data-slot="dropdown-menu-trigger"], .fixed { display: none !important; }
  .cda-print-page {
    box-shadow: none !important;
    border: 0 !important;
    padding: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
    zoom: 0.88;
  }
  /* Break-inside: only direct children of the print root, NOT every element */
  .cda-print-page > * { break-inside: avoid; page-break-inside: avoid; }
  /* Explicit hooks for split-safe blocks — add data-print-block to any new card */
  .cda-print-page .wire-card,
  .cda-print-page [data-print-block] {
    break-inside: avoid;
    page-break-inside: avoid;
    margin-top: 8px;
  }
}
```

**Delta from before:**
- `@page margin`: `0.35in` → `0.5in 0.4in` (top/bottom widened)
- Added `html, body` reset inside `@media print`
- `.cda-print-page *` → `.cda-print-page > *` (direct children only)
- New hook `.wire-card, [data-print-block]` for split-safe blocks

**Kept:**
- `zoom: 0.88` — required for Tab 1 single-page fit on standard content
- `padding: 0` on `.cda-print-page` — @page margin is the single source of vertical whitespace

## If page 2 still hugs the top edge

Chromium PDF export in some setups (headless print, Print to PDF driver on Windows) does not honor `@page margin` when the printed root is `zoom`-scaled. Two escape hatches, in order of preference:

1. **Break-header spacer.** Add an invisible spacer that resets margin at the break:
   ```css
   .cda-print-page .page-break-spacer {
     display: block;
     height: 24px;
     break-before: page;
   }
   ```
   Then inject `<div class="page-break-spacer" />` between the wire cards most likely to split (right before the "Radius Agent" card).

2. **Drop `zoom` for a `transform: scale`.** `zoom` is a non-standard property Chromium respects but that interacts weirdly with paginated layout:
   ```css
   .cda-print-page {
     transform: scale(0.88);
     transform-origin: top left;
     width: calc(100% / 0.88);
   }
   ```
   Trade-off: `transform` doesn't shrink layout box, so you must widen the container to match.

## Non-goals

- Do **not** try to force single-page fit by shrinking `zoom` further (0.78 was tried, reverted in commit e649555 — text became unreadable). Stable value is 0.88.
- Do **not** re-add `page-break-inside: avoid` to `*` — that's the exact regression we just fixed.
- Do **not** touch tab 2–5 print behavior — this fix is scoped to Tab 1's `.cda-print-page` container.

## Verify

1. Open `/cda/templates` on Tab 1 (Full Transparency).
2. Add enough content that print preview shows 2 pages (extra Team Wire cards).
3. `⌘P` → Save as PDF → Chromium.
4. Confirm page 2 has ~0.5in top whitespace matching page 1.
5. Repeat with Firefox PDF export (uses different renderer — should also pass).

## Files touched by this fix

- `workspace/web-app/src/app/pages/CDATemplates.tsx` — print CSS block (~line 88)

## Related commits

- `6156980` — this fix (current)
- `5759a9a` — prior stable single-page compaction (zoom:0.88, @page 0.35in)
- `e649555` — reverted zoom:0.78 attempt (do not restore)
