import type { Franchise } from "@/lib/franchise-data";
import { getDossier } from "@/financial-models/catalog";
import { scenarios, compactMoney, months } from "@/financial-models/engine";
export const formatScenarioMoney = (juta: number) => compactMoney(juta * 1e6);
export const formatScenarioPayback = months;
export function buildFranchiseScenarioModel(franchise: Franchise) {
  const d = getDossier(franchise.id),
    cases = scenarios(d.model),
    base = cases[1].result;
  return {
    archetype: d.model.archetype,
    basis: d.research.note,
    formula:
      d.model.mode === "commission-fixed"
        ? "Paket × komisi rupiah/paket × hari"
        : d.model.mode === "commission-rate"
          ? "Paket × ongkir rata-rata × komisi (%) × hari"
          : "Unit × harga rata-rata × periode",
    grossSalesLabel:
      d.model.archetype === "courier" ? "GMV ongkir" : "Penjualan",
    partnerRevenueLabel:
      d.model.archetype === "courier" ? "Komisi agen" : "Pendapatan",
    startupCapital: [base.capex / 1e6, base.capex / 1e6] as [number, number],
    startupCapitalBasis:
      "CAPEX estimasi; fee, deposit dan modal kerja terpisah.",
    workingCapitalReserve: base.workingCapital / 1e6,
    assumptions: Object.entries(d.model.inputs).map(
      ([key, i]) => key + ": " + i.value + " (" + i.type + ") — " + i.note,
    ),
    cases: cases.map((c) => ({
      name: c.name,
      driver: c.model.inputs.units.value + " " + d.model.unit,
      grossSales: c.result.grossSales / 1e6,
      partnerRevenue: c.result.revenue / 1e6,
      operatingProfit: c.result.operatingProfit / 1e6,
      operatingMargin: c.result.operatingMargin ?? 0,
      paybackMonths: c.result.payback,
    })),
    pros: d.pros,
    cons: d.cons,
    researchLinks: d.research.sources.map((s) => ({
      title: s.title,
      url: s.url,
    })),
    commercialTerms: franchise.royalty,
  };
}
export type FranchiseScenarioModel = ReturnType<
  typeof buildFranchiseScenarioModel
>;
