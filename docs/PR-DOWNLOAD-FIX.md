## Outcome

Fixes cramped financial downloads and reduces the analysis to decision-relevant information. The same deterministic model and source labels remain intact.

## Download redesign

- Typical reports are five pages; entries with additional verified facts may use six.
- Long labels wrap inside a narrower label column and values have a fixed gutter.
- Repetitive `UNKNOWN` rows are consolidated into one `BELUM TERKONFIRMASI` action note.
- Assumptions show formatted rupiah/percent values without repeating long boilerplate on every row.
- Main sections: executive decision, relevant public facts and core assumptions, calculation/scenarios, major costs/sensitivity/risks, sources.
- Browser-generated franchise PDF and PNG use the mapped official/public brand asset when verified locally. A missing asset is omitted rather than replaced by an invented official logo.
- Existing eight independent-business PDFs and PNG previews were regenerated.

## On-page summary

- Main KPI grid now prioritizes capital, monthly income, operating profit/margin, minimum break-even volume, monthly cash flow, payback and data confidence.
- Added a concise decision strip for base target, largest monthly cost and location dependency.
- Removed secondary ratios from the main detail table.
- Combined repetitive disadvantage/operational/financial risk cards into one focused watchlist.
- Kept assumptions, formulas, scenarios, useful charts, sources, downloads and optional AI interpretation.

## Brand asset integrity

The asset documentation now distinguishes brand-controlled marks from public/merchant/media identity assets. It does not call every public image an official logo. If no mark can be verified, the product uses a labeled name badge/monogram.

## Verification

- `npm test`: 7 financial groups and 12 rendered-route tests passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build:vercel`: passed (67 routes).
- Browser: J&T PDF and PNG download completed; mapped logo visible in both.
- PDF: pages rasterized and visually inspected; no overlapping labels or clipped rows.
- Responsive matrix: 8 routes × 6 widths (360, 390, 768, 1024, 1280, 1440), no unintended document-level horizontal overflow.

No manual production deployment is included in this PR.
