## 1. UI redesign
Replace decorative financial posters with a neutral financial research dashboard. Shared responsive hierarchy, accessible expandable assumptions, readable KPIs/tables, restrained accents and preserved routes. Before/after screenshots are in `docs/screenshots/`.

## 2. Data audit
Inventory covers all 50 franchises and eight independent businesses across 25 financial/operational fields. See `research/legacy-audit.json` and `research/AUDIT-RESOLUTION.md`. This is an honest coverage audit, not certification of every source.

## 3. Corrected inaccurate or unsupported data
Active views no longer treat historical unsupported revenue, payback and investment figures as company facts. Courier GMV is distinct from agent commission; fixed rupiah commission is distinct from a percentage. Fore's official no-franchise statement is flagged. Alfamart package inclusions and progressive royalties, Teh Poci package context, Kopigo packages and selected other attributable facts are separated from operational estimates. Unknown fees are not described as free partnerships.

## 4. Financial modeling architecture
Research registry → structured assumptions → deterministic TypeScript engine → scenarios/charts/PDF/PNG. Sales, commission-rate, fixed commission and membership drivers are supported. No runtime LLM generates financial numbers. Calculated outputs are not hand-authored per page.

## 5. Businesses/franchises researched
All existing entries have a source-status disposition and a model. Detailed inventory is linked above. Samples include Lion Parcel, SiCepat, JNE, Alfamart, Indomaret, Teh Poci, Kopigo, Sabana, Nyoklat, MrKlin, Farmapoint and all eight independent businesses. Many primary pages were limited/unavailable; these are not called verified.

## 6. Sources
Field-level registry includes publisher, URL, support scope, source type, available date, verification status and limitations. Official company pages/prospectus links take priority; BPS and ESDM are context, not invented local benchmarks. Third-party evidence is labeled separately.

## 7. Formulas and manual QA
Full sampled arithmetic appears in `research/AUDIT-RESOLUTION.md`.

- Courier test: 100 packages/day × Rp20,000 × 30 = Rp60m shipping GMV; 20% modeled commission = Rp12m agent income, not Rp60m revenue. Fixed Rp2,500/package uses a separate revenue mode.
- Coffee: 85 cups × Rp28,000 × 30 = Rp71.4m sales; 42% COGS = Rp29.988m; gross profit Rp41.412m; fixed OPEX Rp14.892m; operating profit Rp26.52m; margin ≈37%. Total capital Rp126.676m; steady-state payback ≈5 months; simple annual ROI ≈251%. These are estimates contingent on reaching volume, not an investment claim.
- Barbershop: 18 × Rp55,000 × 30 = Rp29.7m; COGS Rp3.564m; gross profit Rp26.136m; fixed OPEX Rp16.456m; profit Rp9.68m; margin ≈33%; BEP revenue Rp18.7m; capital Rp121.868m; payback ≈13 months; simple annual ROI ≈95%.
- Kelontong: 75 × Rp45,000 × 30 = Rp101.25m; COGS Rp85.05m; gross profit Rp16.2m; OPEX Rp10.92m; profit Rp5.28m; margin ≈5%; BEP Rp68.25m; capital Rp106.76m; payback ≈21 months; simple annual ROI ≈59%.

Negative cash flow yields no finite payback. Break-even is capacity-bounded. Zero denominators return unavailable metrics. Ratios are validated within 0–1.

## 8. Assumptions
Volume, ticket, COGS, payroll, benefits, owner pay, rent, utility costs, maintenance, operating reserve and contract uncertainty are exposed. National context is not a city wage/rent quote. Users edit local inputs independently; no blind city multiplier. Zero unknown fees produce an incomplete lower-bound model. Scenarios change drivers, not hardcoded profit.

## 9. Charts
Revenue/cost/profit bars, cost structure, scenario table, cumulative cash-flow/payback curve, break-even curve and ±20% volume sensitivity. Tooltips and expandable exact tables accompany charts. Mobile uses intentional internal scrolling.

## 10. PDF and PNG redesign
Current model inputs drive compact five-to-six-page financial reports with sources, assumptions, scenarios, risks, sensitivity, KPI and page numbers. Brands with more verified facts receive the sixth page instead of compressing the text. Repetitive unknown fields are grouped into one verification warning, long labels wrap in a dedicated column, and row spacing prevents labels from touching values. Franchise exports embed the mapped official/public brand mark when a verified local asset is available; unavailable marks are omitted instead of fabricated. PNG summaries use the same brand identity and prioritize capital, income, operating profit, cash flow, break-even volume, payback and model status. Existing eight guide PDFs and preview PNGs are refreshed; old guide URLs remain compatible.

## 11. Build/test results
Local TypeScript and ESLint passed. Vinext and Next production builds passed. Seven financial test groups and 12 rendered-route tests passed. Browser layout matrix: eight routes × six widths (360–1440), no unintended page overflow. Input editing, invalid capacity, reset, PDF/PNG downloads and PDF visual rendering checked. CI now repeats lint, tests, both builds and typecheck.

## 12. Remaining uncertain data / review gates
Draft PR: many brand contracts, commissions, local costs and demand assumptions still require direct outlet/company evidence. Industry templates are not observed brand unit economics. No live configured AI provider was tested. Existing dependency audit findings need a separate compatibility/security review. Historical map scores are screening estimates, not investment ratings. Format selectors preserve descriptive options but require explicit financial adjustments. Do not merge or promote production until CI passes and uncertainty labels/data assumptions are reviewed.

No production deployment or merge was performed.
