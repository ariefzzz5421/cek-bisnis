import rawData from "@/data/business-data.json";

export type BusinessId =
  | "laundry"
  | "kelontong"
  | "franchise"
  | "game"
  | "gym"
  | "coffee"
  | "barber";

export type Source = {
  id: string;
  title: string;
  note: string;
  url: string;
};

export type EquipmentItem = {
  item: string;
  range: string;
  note: string;
};

export type PlanPhase = {
  phase: string;
  title: string;
  actions: string[];
};

/** Bagaimana usaha ini menghasilkan uang: sumber omzet, dasar harga, siklus kas. */
export type BusinessScheme = {
  model: string;
  priceBasis: string;
  cashCycle: string;
  streams: { name: string; share: number }[];
  costDrivers: string[];
};

export type BusinessKpi = {
  label: string;
  target: string;
  note: string;
};

/**
 * Skenario disimpan sebagai jumlah unit (order/cup/member) dan bukan rupiah,
 * sehingga omzetnya selalu diturunkan ulang dari `avgTicket`. Dengan begitu
 * angka di kartu skenario tidak bisa menyimpang dari simulator.
 */
export type BusinessScenario = {
  name: string;
  units: number;
};

export type Business = {
  id: BusinessId;
  slug: string;
  name: string;
  short: string;
  category: string;
  accent: string;
  oneLine: string;
  description: string;
  idealFor: string;
  format: string;
  capex: [number, number];
  fixedBase: number;
  rentBase: number;
  staffCount: number;
  staffCostBase: number;
  variableRate: number;
  avgTicket: number;
  targetRevenue: number;
  trafficMode: "daily" | "member";
  trafficLabel: string;
  marginLabel: string;
  idealRadius: string;
  locationSignal: string;
  equipment: EquipmentItem[];
  dailyOps: string[];
  checklist: string[];
  risks: string[];
  plan90: PlanPhase[];
  permits: string[];
  sourceIds: string[];
  scheme: BusinessScheme;
  kpi: BusinessKpi[];
  /** Rentang balik modal khas model usaha ini, dari riset lapangan. */
  bepMonths: [number, number];
  scenarios: BusinessScenario[];
};

export type City = {
  id: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
  wageFactor: number;
  rentFactor: number;
  capexFactor: number;
  demandFactor: number;
  demandLabel: string;
  competition: string;
  note: string;
  hotspots: string[];
  scores: Record<BusinessId, number>;
};

type BusinessData = {
  updatedAt: string;
  methodNote: string;
  sources: Source[];
  businesses: Business[];
  cities: City[];
};

export const businessData = rawData as BusinessData;
export const businesses = businessData.businesses;
export const cities = businessData.cities;
export const sources = businessData.sources;

export const getBusiness = (slug: string) => businesses.find((business) => business.slug === slug);
export const getBusinessSources = (business: Business) =>
  sources.filter((source) => business.sourceIds.includes(source.id));

export const formatMoney = (value: number, decimals = 1) => {
  const rounded = Number(value.toFixed(decimals));
  return `Rp${rounded.toLocaleString("id-ID")} jt`;
};

/**
 * Harga satuan disimpan dalam juta rupiah, jadi nilainya kecil (mis. 0,042).
 * formatMoney() akan membulatkannya jadi "Rp0 jt", karena itu harga jual selalu
 * ditampilkan sebagai rupiah penuh.
 */
export const formatTicket = (juta: number) => `Rp${Math.round(juta * 1_000_000).toLocaleString("id-ID")}`;

export const calculateMetrics = (
  business: Business,
  city: City,
  targetRevenue?: number,
  scaleCapex: [number, number] = business.capex,
) => {
  const monthlyRevenue = targetRevenue ?? Math.round(business.targetRevenue * city.demandFactor);
  const payrollBase = business.staffCount * business.staffCostBase;
  const otherFixed = business.fixedBase - business.rentBase - payrollBase;
  const rent = business.rentBase * city.rentFactor;
  const payroll = payrollBase * city.wageFactor;
  const fixedCost = Math.max(1, otherFixed + rent + payroll);
  const capexLow = scaleCapex[0] * city.capexFactor;
  const capexHigh = scaleCapex[1] * city.capexFactor;
  const capexMid = (capexLow + capexHigh) / 2;
  const breakEvenRevenue = fixedCost / (1 - business.variableRate);
  const opex = fixedCost + monthlyRevenue * business.variableRate;
  const profit = monthlyRevenue * (1 - business.variableRate) - fixedCost;
  /** Member dihitung sebagai stok bulanan, model lain sebagai arus harian. */
  const unitsFor = (revenue: number) => business.trafficMode === "member"
    ? Math.ceil(revenue / business.avgTicket)
    : Math.ceil(revenue / business.avgTicket / 30);
  const traffic = unitsFor(breakEvenRevenue);
  const targetTraffic = unitsFor(monthlyRevenue);
  const payback = profit > 0 ? capexMid / profit : Infinity;
  const variableCost = monthlyRevenue * business.variableRate;
  const contributionMargin = 1 - business.variableRate;
  const marginRate = monthlyRevenue > 0 ? profit / monthlyRevenue : 0;
  const dailyRevenue = monthlyRevenue / 30;
  const roiPerYear = capexMid > 0 ? (profit * 12) / capexMid : 0;
  /** >1 berarti target sudah melewati titik impas. */
  const bepRatio = breakEvenRevenue > 0 ? monthlyRevenue / breakEvenRevenue : 0;
  const rentToSales = monthlyRevenue > 0 ? rent / monthlyRevenue : 0;
  const health = monthlyRevenue >= breakEvenRevenue * 1.2
    ? "Sehat"
    : monthlyRevenue >= breakEvenRevenue
      ? "Tipis"
      : "Rugi";

  return {
    monthlyRevenue,
    revenueLow: monthlyRevenue * 0.86,
    revenueHigh: monthlyRevenue * 1.14,
    rent,
    payroll,
    fixedCost,
    capexLow,
    capexHigh,
    capexMid,
    breakEvenRevenue,
    opex,
    profit,
    traffic,
    targetTraffic,
    payback,
    variableCost,
    contributionMargin,
    marginRate,
    dailyRevenue,
    roiPerYear,
    bepRatio,
    rentToSales,
    health,
    opportunity: city.scores[business.id],
  };
};

export type BusinessMetrics = ReturnType<typeof calculateMetrics>;

/** Omzet sebuah skenario, diturunkan dari jumlah unit supaya konsisten dengan simulator. */
export const scenarioRevenue = (business: Business, scenario: BusinessScenario) =>
  business.trafficMode === "member"
    ? scenario.units * business.avgTicket
    : scenario.units * business.avgTicket * 30;

/** Satuan yang dipakai di kartu skenario, mis. "order per hari". */
export const trafficUnit = (business: Business) => business.trafficLabel;

export const formatPercent = (ratio: number, decimals = 0) =>
  `${(ratio * 100).toFixed(decimals).replace(".", ",")}%`;

export const formatMonths = (months: number) =>
  Number.isFinite(months) ? `${Math.ceil(months)} bulan` : "belum balik";

export const rankedCities = (business: Business) =>
  [...cities].sort((a, b) => b.scores[business.id] - a.scores[business.id]);
