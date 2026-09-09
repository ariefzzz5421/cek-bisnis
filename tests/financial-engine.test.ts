import test from "node:test";
import assert from "node:assert/strict";
import { dossiers, getDossier, sourceList } from "../financial-models/catalog";
import {
  calculate,
  withOverrides,
  scenarios,
  sensitivity,
  tierRoyalty,
  cashCurve,
  validate,
} from "../financial-models/engine";
import { buildDossierPdf } from "../lib/financial-pdf";

test("all 58 dossiers have deterministic finite results, three scenarios and provenance", () => {
  assert.equal(dossiers.length, 58);
  assert.equal(new Set(dossiers.map((d) => d.id)).size, 58);
  for (const d of dossiers) {
    assert.deepEqual(validate(d.model), [], d.id);
    const r = calculate(d.model);
    assert.deepEqual(calculate(d.model), r);
    assert.equal(scenarios(d.model).length, 3);
    for (const [k, v] of Object.entries(r))
      if (typeof v === "number") assert.ok(Number.isFinite(v), d.id + ":" + k);
    for (const [k, i] of Object.entries(d.model.inputs)) {
      assert.ok(i.note, d.id + ":" + k);
      if (i.type !== "estimate") assert.ok(i.sourceIds.length);
    }
    const ids = sourceList(d).map((s) => s.id);
    for (const i of Object.values(d.model.inputs))
      for (const id of i.sourceIds)
        assert.ok(ids.includes(id), d.id + ":" + id);
    assert.ok(r.capital >= r.capex);
    assert.ok(Math.abs(r.revenue - r.totalOpex - r.operatingProfit) < 0.01);
    if (r.cashFlow <= 0) assert.equal(r.payback, null);
    else if (r.payback)
      assert.ok(cashCurve(d.model, r.payback).at(-1)!.cash >= 0);
  }
});
test("courier GMV and commission remain distinct, fixed Rp is not a percent", () => {
  const m = withOverrides(getDossier("lion-parcel").model, {
    units: 100,
    ticket: 20000,
    days: 30,
    commissionRate: 0.2,
  });
  const r = calculate(m);
  assert.equal(r.gmv, 60000000);
  assert.equal(r.revenue, 12000000);
  assert.equal(r.cogs, 1050000);
  assert.equal(r.grossProfit, 10950000);
  assert.equal(r.payroll, 5196000);
  assert.equal(r.fixedOpex, 8896000);
  assert.equal(r.operatingProfit, 2054000);
  assert.ok(Math.abs(r.breakEvenUnits! - 8896000 / (3650 * 30)) < 1e-7);
  const fixed = calculate(
    withOverrides(getDossier("sicepat").model, {
      units: 100,
      commissionFixed: 2500,
    }),
  );
  assert.equal(fixed.revenue, 7500000);
  assert.ok(fixed.operatingProfit < 0);
  assert.equal(fixed.payback, null);
});
test("laundry uses kg production costs; membership is not multiplied by 30", () => {
  const l = calculate(getDossier("laundry").model);
  assert.equal(l.revenue, 80 * 8000 * 30);
  assert.equal(l.cogs, 80 * 2200 * 30);
  const g = calculate(getDossier("gym").model);
  assert.equal(g.revenue, 170 * 275000);
});
test("independent hand-checked retail, coffee and barber samples", () => {
  const coffee = calculate(getDossier("coffee").model);
  assert.equal(coffee.revenue, 71400000);
  assert.equal(coffee.cogs, 29988000);
  assert.equal(coffee.fixedOpex, 14892000);
  assert.equal(coffee.operatingProfit, 26520000);
  assert.equal(coffee.payback, 5);
  assert.ok(Math.abs(coffee.breakEvenRevenue! - 14892000 / 0.58) < 0.01);
  const retail = calculate(getDossier("alfamart").model);
  assert.equal(retail.revenue, 337500000);
  assert.equal(retail.royalty, 5750000);
  assert.equal(retail.operatingProfit, 19070000);
  assert.equal(retail.capital, 671540000);
  assert.equal(retail.payback, 36);
  const barber = calculate(getDossier("barber").model);
  assert.equal(barber.revenue, 29700000);
  assert.ok(Math.abs(barber.operatingProfit - 9680000) < 0.01);
  assert.equal(barber.payback, 13);
  assert.ok(Math.abs(barber.annualRoi! - (9680000 * 12) / 121868000) < 1e-8);
});
test("negative, zero, unavailable contracts, bad ratios and over-capacity fail safely", () => {
  const m = getDossier("coffee").model;
  const missing=structuredClone(m);delete (missing.inputs as Partial<typeof missing.inputs>).rent;
  assert.throws(()=>calculate(missing),/rent: input wajib/);
  const zero = calculate(withOverrides(m, { units: 0 }));
  assert.equal(zero.revenue, 0);
  assert.equal(zero.operatingMargin, null);
  assert.equal(zero.payback, null);
  for (const bad of [
    { equipment: -1 },
    { commissionRate: 20 },
    { ticket: Infinity },
    { ticket: NaN },
    { ticket: 1e300 },
    { days: 32 },
    { employees: 1.5 },
    { units: 201 },
  ])
    assert.throws(() => calculate(withOverrides(m, bad)));
  const noContribution = calculate(withOverrides(m, { cogsRate: 1 }));
  assert.equal(noContribution.breakEvenRevenue, null);
  assert.equal(noContribution.payback, null);
  assert.equal(getDossier("fore-coffee").research.status, "closed");
  assert.ok(
    getDossier("lion-parcel").research.facts.some(
      (f) => f.type === "unknown" && f.value === null,
    ),
  );
});
test("progressive royalty, stock and reserve do not double count monthly costs", () => {
  const m = getDossier("alfamart").model;
  assert.equal(tierRoyalty(300e6, m.royaltyTiers!), 4250000);
  const r = calculate(m),
    extra = calculate(
      withOverrides(m, {
        inventory: m.inputs.inventory.value + 1000000,
        reserveMonths: 4,
      }),
    );
  assert.equal(extra.operatingProfit, r.operatingProfit);
  assert.equal(extra.capital - r.capital, 1000000 + r.fixedOpex);
});
test("sensitivity follows volume and holds fixed costs; all PDFs have text, sources, page numbers", async () => {
  for (const id of [
    "lion-parcel",
    "sicepat",
    "alfamart",
    "laundry",
    "coffee",
    "barber",
    "gym",
  ]) {
    const d = getDossier(id),
      base = calculate(d.model);
    for (const s of sensitivity(d.model))
      if (s.result) {
        assert.equal(s.result.fixedOpex, base.fixedOpex);
        assert.ok(
          Math.abs(s.result.revenue - base.revenue * (1 + s.change)) < 0.01,
        );
      }
    const text = await buildDossierPdf(d).text();
    assert.ok(text.startsWith("%PDF-"));
    assert.match(text, /CEK BISNIS ESTIMATE/);
    assert.match(text, /REFERENSI/);
    assert.match(text, /Sensitivitas volume/);
    assert.match(text, /1 \/ \d+/);
    assert.doesNotMatch(text, /NaN|Infinity/);
  }
});
