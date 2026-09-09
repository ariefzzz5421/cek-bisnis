import { mkdir, writeFile } from "node:fs/promises";
import { dossiers, confidence, sourceList } from "../financial-models/catalog";
import {
  calculate,
  scenarios,
  money,
  percent,
  months,
} from "../financial-models/engine";
import { buildDossierPdf } from "../lib/financial-pdf";
await mkdir("research", { recursive: true });
await mkdir("output/pdf", { recursive: true });
const report = [
  "# Audit resolution and model QA",
  "",
  "Reviewed 2026-09-08. All 50 brands and 8 independent businesses inventoried. Legacy snapshot: legacy-audit.json. Unknown is not verified. Industry templates are planning hypotheses, not brand-specific observed economics.",
  "",
  "## Resolution rules",
  "",
  "- Unsupported revenue/profit/payback figures are quarantined in the legacy JSON and replaced in active views by deterministic estimates.",
  "- Fee/commission/royalty terms remain unknown unless supported by a cited fact. Zero model fee is a lower-bound assumption, not free partnership.",
  "- Local costs and demand require survey; national salary context is not UMK.",
  "- Contract, area, manpower and equipment evidence remain distinct from modeled operational needs.",
  "- Official status refers to provenance, not freshness or audited outlet performance.",
  "",
  "## Complete inventory",
  "",
  "| Entry | Type | Confidence | Source status | Resolution |",
  "|---|---|---|---|---|",
  ...dossiers.map(
    (d) =>
      `| ${d.name} | ${d.model.archetype} | ${confidence(d).label} | ${d.research.sources.map((s) => s.status).join(", ") || "industry context"} | ${d.research.note.replaceAll("|", "/")} |`,
  ),
  "",
  "## Manual arithmetic samples",
  "",
];
for (const id of [
  "lion-parcel",
  "sicepat",
  "alfamart",
  "laundry",
  "coffee",
  "barber",
  "gym",
  "kelontong",
]) {
  const d = dossiers.find((d) => d.id === id)!,
    m = d.model,
    n = m.inputs,
    r = calculate(m),
    periods = m.mode === "membership" ? 1 : n.days.value;
  report.push(
    `### ${d.name}`,
    "",
    `- Gross sales / GMV: ${n.units.value} × ${n.ticket.value} × ${periods} = ${r.grossSales}.`,
    ...(r.gmv !== null
      ? [
          `- Agent revenue: ${m.mode === "commission-rate" ? `${r.grossSales} × ${n.commissionRate.value}` : `${n.units.value} × ${periods} × ${n.commissionFixed.value}`} = ${r.revenue}.`,
        ]
      : []),
    `- COGS: ${r.revenue} × ${n.cogsRate.value} + ${n.units.value * periods} × ${n.unitCost.value} = ${r.cogs}.`,
    `- Gross profit: ${r.revenue} − ${r.cogs} = ${r.grossProfit}; margin ${percent(r.grossMargin)}.`,
    `- Payroll: ${n.employees.value} × ${n.salary.value} × (1 + ${n.payrollLoad.value}) + ${n.ownerPay.value} = ${r.payroll}.`,
    `- Fixed OPEX: ${r.fixedOpex}; royalty ${r.royalty}; profit share ${r.managementShare}.`,
    `- Operating profit: ${r.grossProfit} − ${r.fixedOpex} − ${r.royalty} − ${r.managementShare} = ${r.operatingProfit}.`,
    `- Operating margin: ${r.operatingProfit} / ${r.revenue} = ${percent(r.operatingMargin)}.`,
    `- BEP: ${r.breakEvenUnits?.toFixed(2) ?? "outside capacity"} ${m.unit}; revenue ${money(r.breakEvenRevenue)}. Root of contribution less fixed costs, including royalty tiers.`,
    `- Capital: CAPEX ${r.capex} + fee ${r.entryFee} + deposit ${r.deposit} + working capital ${r.workingCapital} = ${r.capital}.`,
    `- Payback: ceil(${r.capital} / ${r.cashFlow}) when cash flow > 0 = ${months(r.payback)}.`,
    `- Annual simple ROI: 12 × ${r.cashFlow} / ${r.capital} = ${percent(r.annualRoi)}.`,
    "",
  );
  await writeFile(
    `output/pdf/${id}.pdf`,
    new Uint8Array(await buildDossierPdf(d).arrayBuffer()),
  );
}
report.push(
  "## Remaining uncertainties",
  "",
  "No model is an investment recommendation. Most entries have LOW confidence because volume, rent, payroll and contract fees require outlet-level evidence. Unavailable source checks are documented and must not be described as verified research. No live LLM is used to generate these numbers.",
  "",
);
await writeFile(
  "research/AUDIT-RESOLUTION.md",
  report.join("\n").replace(/\b\d+\.\d{8,}\b/g, (value) => String(Math.round(Number(value)))),
);
await writeFile(
  "research/model-snapshot.json",
  JSON.stringify(
    dossiers.map((d) => ({
      id: d.id,
      model: d.model,
      confidence: confidence(d),
      sources: sourceList(d),
      results: scenarios(d.model).map((s) => ({
        scenario: s.name,
        ...s.result,
      })),
    })),
    null,
    2,
  ) + "\n",
);
for (const d of dossiers.filter((d) => d.kind === "business"))
  await writeFile(
    `public/downloads/cek-bisnis-${d.href.split("/").at(-1)}-guide.pdf`,
    new Uint8Array(await buildDossierPdf(d).arrayBuffer()),
  );
console.log(
  "58 model snapshots, complete audit inventory, 8 QA PDFs and 8 refreshed legacy download PDFs generated.",
);
