/** Deterministic financial engine. Currency is IDR, ratios are fractions (20% = .20). */
export type EvidenceType = "official" | "verified" | "estimate" | "unknown";
export type Input = {
  value: number;
  type: Exclude<EvidenceType, "unknown">;
  note: string;
  sourceIds: string[];
  verifiedAt?: string;
};
export type Archetype =
  | "retail"
  | "restaurant"
  | "beverage"
  | "laundry"
  | "courier"
  | "pharmacy"
  | "automotive"
  | "service"
  | "kiosk"
  | "distribution"
  | "membership";
export type RevenueMode =
  | "sales"
  | "commission-rate"
  | "commission-fixed"
  | "membership";
export type InputKey =
  | "units"
  | "ticket"
  | "days"
  | "commissionRate"
  | "commissionFixed"
  | "cogsRate"
  | "unitCost"
  | "employees"
  | "salary"
  | "payrollLoad"
  | "ownerPay"
  | "rent"
  | "utilities"
  | "logistics"
  | "marketing"
  | "maintenance"
  | "other"
  | "royaltyRate"
  | "recurringFee"
  | "profitShare"
  | "equipment"
  | "fitout"
  | "entryFee"
  | "deposit"
  | "inventory"
  | "reserveMonths"
  | "taxReserve"
  | "debtService"
  | "replacementReserve";
export type Inputs = Record<InputKey, Input>;
export type Scenario = {
  id: "conservative" | "base" | "optimistic";
  name: string;
  overrides: Partial<Record<InputKey, number>>;
  rationale: string;
};
export type Tier = { from: number; to: number | null; rate: number };
export type Model = {
  id: string;
  name: string;
  archetype: Archetype;
  mode: RevenueMode;
  unit: string;
  location: string;
  inputs: Inputs;
  scenarios: Scenario[];
  royaltyTiers?: Tier[];
  capacity: number;
  capacityNote: string;
  limitations: string[];
};
export const input = (
  value: number,
  note: string,
  sourceIds: string[] = [],
  type: Input["type"] = "estimate",
): Input => ({
  value,
  note,
  sourceIds,
  type,
  ...(type !== "estimate" ? { verifiedAt: "2026-09-08" } : {}),
});
const ratios = new Set<InputKey>([
  "commissionRate",
  "cogsRate",
  "payrollLoad",
  "royaltyRate",
  "profitShare",
  "taxReserve",
]);
export function validate(model: Model): string[] {
  const issues: string[] = [];
  const required = 'units ticket days commissionRate commissionFixed cogsRate unitCost employees salary payrollLoad ownerPay rent utilities logistics marketing maintenance other royaltyRate recurringFee profitShare equipment fitout entryFee deposit inventory reserveMonths taxReserve debtService replacementReserve'.split(' ');
  for (const key of required) if (!model.inputs?.[key as InputKey]) issues.push(`${key}: input wajib belum tersedia.`);
  if (issues.length) return issues;
  for (const [key, item] of Object.entries(model.inputs)) {
    if (!Number.isFinite(item.value) || item.value < 0 || item.value > 1e12)
      issues.push(`${key}: harus berupa angka non-negatif maksimum 1 triliun.`);
    if (ratios.has(key as InputKey) && item.value > 1)
      issues.push(`${key}: gunakan rasio 0–1.`);
  }
  if (
    model.inputs.days.value < 1 ||
    model.inputs.days.value > 31 ||
    !Number.isInteger(model.inputs.days.value)
  )
    issues.push("days: harus bilangan bulat 1–31.");
  if (!Number.isInteger(model.inputs.employees.value))
    issues.push("employees: harus bilangan bulat.");
  if (model.inputs.units.value > model.capacity)
    issues.push(`Volume melampaui kapasitas model ${model.capacity}.`);
  if (!Number.isFinite(model.capacity) || model.capacity <= 0)
    issues.push("Kapasitas tidak valid.");
  for (const tier of model.royaltyTiers ?? []) {
    if (
      !Number.isFinite(tier.rate) || !Number.isFinite(tier.from) || (tier.to !== null && !Number.isFinite(tier.to)) || tier.rate < 0 ||
      tier.rate > 1 ||
      tier.from < 0 ||
      (tier.to !== null && tier.to <= tier.from)
    )
      issues.push("Tier royalti tidak valid.");
  }
  return issues;
}
export function withOverrides(
  model: Model,
  overrides: Partial<Record<InputKey, number>>,
): Model {
  const inputs = { ...model.inputs };
  for (const [key, value] of Object.entries(overrides)) {
    const k = key as InputKey;
    inputs[k] = input(
      value!,
      `Input pengguna / skenario; referensi awal: ${inputs[k].note}`,
      inputs[k].sourceIds,
    );
  }
  return { ...model, inputs };
}
export function tierRoyalty(sales: number, tiers: Tier[]) {
  return tiers.reduce(
    (sum, t) =>
      sum + Math.max(0, Math.min(sales, t.to ?? sales) - t.from) * t.rate,
    0,
  );
}
const ratio = (numerator: number, denominator: number): number | null =>
  denominator > 0 ? numerator / denominator : null;
export function calculate(model: Model) {
  const issues = validate(model);
  if (issues.length) throw new Error(issues.join(" "));
  const n = Object.fromEntries(
    Object.entries(model.inputs).map(([key, item]) => [key, item.value]),
  ) as Record<InputKey, number>;
  const periods = model.mode === "membership" ? 1 : n.days;
  const units = n.units * periods;
  const grossSales = units * n.ticket;
  const courier =
    model.mode === "commission-rate" || model.mode === "commission-fixed";
  const revenuePerUnit =
    model.mode === "commission-rate"
      ? n.ticket * n.commissionRate
      : model.mode === "commission-fixed"
        ? n.commissionFixed
        : n.ticket;
  const revenue = units * revenuePerUnit;
  const cogs = revenue * n.cogsRate + units * n.unitCost;
  const grossProfit = revenue - cogs;
  const payroll = n.employees * n.salary * (1 + n.payrollLoad) + n.ownerPay;
  const fixedOpex =
    payroll +
    n.rent +
    n.utilities +
    n.logistics +
    n.marketing +
    n.maintenance +
    n.other +
    n.recurringFee;
  const royalty = model.royaltyTiers
    ? tierRoyalty(revenue, model.royaltyTiers)
    : revenue * n.royaltyRate;
  const beforeShare = grossProfit - fixedOpex - royalty;
  const managementShare = Math.max(0, beforeShare) * n.profitShare;
  const operatingProfit = beforeShare - managementShare;
  const totalOpex = cogs + fixedOpex + royalty + managementShare;
  const cashFlow =
    operatingProfit -
    Math.max(0, operatingProfit) * n.taxReserve -
    n.debtService -
    n.replacementReserve;
  const capex = n.equipment + n.fitout;
  const cashReserve = n.reserveMonths * fixedOpex;
  const workingCapital = n.inventory + cashReserve;
  const capital = capex + n.entryFee + n.deposit + workingCapital;
  // Root solving also handles progressive royalties. Beyond the declared capacity is infeasible.
  const profitAt = (daily: number) => {
    const r = daily * periods * revenuePerUnit;
    return (
      r * (1 - n.cogsRate) -
      daily * periods * n.unitCost -
      fixedOpex -
      (model.royaltyTiers
        ? tierRoyalty(r, model.royaltyTiers)
        : r * n.royaltyRate)
    );
  };
  let breakEvenUnits: number | null = null;
  if (revenuePerUnit > 0 && profitAt(model.capacity) >= 0) {
    let lo = 0,
      hi = model.capacity;
    for (let i = 0; i < 70; i++) {
      const mid = (lo + hi) / 2;
      if (profitAt(mid) >= 0) hi = mid;
      else lo = mid;
    }
    breakEvenUnits = hi;
  }
  const breakEvenRevenue =
    breakEvenUnits === null ? null : breakEvenUnits * periods * revenuePerUnit;
  const payback =
    cashFlow > 0 && capital > 0 ? Math.ceil(capital / cashFlow) : null;
  const costs = [
    { name: "HPP / biaya variabel", value: cogs },
    { name: "Payroll + pemilik", value: payroll },
    { name: "Sewa", value: n.rent },
    { name: "Utilitas", value: n.utilities },
    { name: "Logistik", value: n.logistics },
    { name: "Marketing", value: n.marketing },
    { name: "Maintenance", value: n.maintenance },
    { name: "Royalti / bagi hasil", value: royalty + managementShare },
    { name: "Lainnya / biaya berulang", value: n.other + n.recurringFee },
  ];
  return {
    grossSales,
    gmv: courier ? grossSales : null,
    revenue,
    cogs,
    grossProfit,
    grossMargin: ratio(grossProfit, revenue),
    payroll,
    fixedOpex,
    totalOpex,
    royalty,
    managementShare,
    operatingProfit,
    operatingMargin: ratio(operatingProfit, revenue),
    cashFlow,
    capex,
    entryFee: n.entryFee,
    deposit: n.deposit,
    cashReserve,
    workingCapital,
    capital,
    breakEvenRevenue,
    breakEvenUnits,
    payback,
    monthlyRoi: ratio(cashFlow, capital),
    annualRoi: ratio(cashFlow * 12, capital),
    revenueToCapital: ratio(revenue, capital),
    rentToSales: ratio(n.rent, revenue),
    payrollToSales: ratio(payroll, revenue),
    marketingToSales: ratio(n.marketing, revenue),
    variableCostRatio: ratio(cogs + royalty, revenue),
    marginOfSafety:
      breakEvenRevenue === null
        ? null
        : ratio(revenue - breakEvenRevenue, revenue),
    costs,
  };
}
export type Result = ReturnType<typeof calculate>;
export function scenarios(model: Model) {
  return model.scenarios.map((s) => ({
    ...s,
    model: withOverrides(model, s.overrides),
    result: calculate(withOverrides(model, s.overrides)),
  }));
}
export function sensitivity(model: Model) {
  return [-0.2, -0.1, 0, 0.1, 0.2].map((change) => {
    const units = model.inputs.units.value * (1 + change);
    return {
      change,
      feasible: units <= model.capacity,
      result:
        units <= model.capacity
          ? calculate(withOverrides(model, { units }))
          : null,
    };
  });
}
export function cashCurve(model: Model, horizon = 60) {
  const r = calculate(model);
  return Array.from({ length: horizon + 1 }, (_, month) => ({
    month,
    cash: -r.capital + month * r.cashFlow,
  }));
}
export function breakEvenCurve(model: Model) {
  return Array.from({ length: 11 }, (_, i) => {
    const units = (model.capacity * i) / 10;
    const r = calculate(withOverrides(model, { units }));
    return {
      units,
      revenue: r.revenue,
      cost: r.totalOpex,
      profit: r.operatingProfit,
    };
  });
}
export function viability(model: Model) {
  const r = calculate(model);
  const label =
    r.breakEvenUnits === null
      ? "Risiko tinggi"
      : r.operatingProfit <= 0
        ? "Sensitif eksekusi"
        : (r.marginOfSafety ?? 0) < 0.2
          ? "Sensitif eksekusi"
          : "Layak diuji";
  return {
    label,
    reason:
      r.breakEvenUnits === null
        ? "Biaya tetap belum tertutup bahkan pada kapasitas model. Ubah struktur biaya atau format usaha."
        : `Biaya operasional tertutup sekitar ${Math.ceil(r.breakEvenUnits)} ${model.unit}. Volume dasar ${model.inputs.units.value} ${model.unit}; sewa dan payroll menyerap ${Math.round((r.rentToSales ?? 0) * 100)}% dan ${Math.round((r.payrollToSales ?? 0) * 100)}% pendapatan.`,
    note: "Penilaian skenario, bukan rekomendasi investasi.",
  };
}
export const money = (n: number | null) =>
  n === null
    ? "Tidak tersedia"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(n);
export const compactMoney = (n: number | null) =>
  n === null
    ? "—"
    : `${n < 0 ? "-" : ""}Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(Math.abs(n) / 1e6)} jt`;
export const percent = (n: number | null) =>
  n === null ? "—" : `${Math.round(n * 100)}%`;
export const months = (n: number | null) =>
  n === null ? "Belum tercapai" : `≈ ${n} bulan`;
