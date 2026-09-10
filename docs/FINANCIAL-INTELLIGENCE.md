# Financial intelligence overhaul

## Scope and evidence

All 50 existing franchises and eight independent business models are inventoried in `research/legacy-audit.json`. `research/AUDIT-RESOLUTION.md` records the disposition of each entry and sampled calculation checks. An audit entry is not a claim that the entire franchise prospectus was verified. Missing or inaccessible primary documents remain explicitly uncertain.

## Architecture

`research/registry.ts` holds attributable public facts and source limitations. `financial-models/catalog.ts` holds operational assumptions, capacity limits, scenario drivers and business-specific context. `financial-models/engine.ts` calculates results without network requests or runtime AI. The dashboard, PDF and PNG consume these same results. AI interpretation cannot supply or replace model numbers.

Each input distinguishes official, verified third-party, estimate and unknown. An unknown contractual fee modeled as zero means an incomplete lower-bound simulation, not a free contract. Local rent, payroll and demand are independently editable; there is no universal city multiplier.

## Financial definitions

- Sales: daily volume × average ticket × operating days.
- Courier: shipping GMV × commission rate, or packages × fixed commission. GMV is not agent income.
- Membership: active members × monthly membership price, without multiplying by operating days.
- Gross profit: recognized revenue less percentage COGS and per-unit variable costs.
- Operating profit: gross profit less fixed operating costs and applicable royalty/profit share.
- Cash flow: operating profit less modeled tax reserve, debt service and replacement reserve.
- Total capital: equipment and fit-out CAPEX + entry fee + deposit + opening inventory + operating cash reserve.
- Payback: total capital / positive monthly cash flow, rounded up. Non-positive cash flow has no finite payback.
- Simple annual ROI: monthly cash flow × 12 / total capital; not an IRR or guarantee.
- Break-even: bounded deterministic search that respects capacity. Unreachable break-even is unavailable, not Infinity.

Sensitivity changes volume by -20%, -10%, 0%, +10% and +20%. Scenarios vary operational inputs; profit is never manually entered. Cash-flow projections assume steady operations and do not imply a validated ramp-up forecast.

## Interface and reports

Neutral research-oriented styling replaces decorative financial posters. Shared dashboards expose editable assumptions, provenance, formulas, scenario comparison, revenue/cost/profit bars, cost structure, cumulative cash flow, break-even and sensitivity. Charts include exact data tables. Mobile tables and charts scroll within their own containers. Long sections collapse without removing access.

PDF reports use dark text, white backgrounds, five concise pages for typical entries and a sixth page when more verified facts require it, wrapped table labels, page numbers, source and assumption sections. Repetitive unknown facts are consolidated into one action-oriented warning. Browser franchise exports embed the mapped official/public brand mark when a verified asset exists; the export does not invent a replacement brand logo. Browser exports use the current edited model. Existing guide URLs remain supported. Business equipment, operating guides, comparison, map survey and AI interpretation remain accessible.

## Verification performed

- TypeScript, ESLint, Vinext production build and Next production build passed locally.
- Seven financial test groups cover all 58 models, deterministic output, provenance, courier commission units, membership/laundry drivers, manual arithmetic, missing inputs, negative profit, capacity and PDF content.
- Twelve rendered-route tests passed.
- Browser checks covered eight routes at 360, 390, 768, 1024, 1280 and 1440 pixels: no unintended document-level horizontal overflow.
- Lion Parcel input editing, over-capacity validation, reset, PDF and PNG download passed in-browser. SVG title hydration mismatch was corrected.
- PDF pages were rasterized and visually inspected, including an edited 100-package/day report.

## Remaining uncertainty

Many brands do not publish complete current unit economics. Shared industry profiles are transparent starting hypotheses, not measured store performance. Contract fees, royalties, commissions, local wages, rent, demand and franchise availability require direct confirmation where marked unknown. Published promotions may have expired. Capital package inclusions can overlap and require a quotation.

Business format selection describes the format; users adjust explicit financial inputs rather than applying an unsupported automatic scale factor. Historical map screening scores are not audited investment ratings or measured footfall. No configured live AI provider was exercised. Existing dependency audit findings require a separate compatibility/security review. This branch is for review, not automatic production promotion.
