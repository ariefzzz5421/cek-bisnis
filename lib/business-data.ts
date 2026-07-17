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
  const traffic = business.trafficMode === "member"
    ? Math.ceil(breakEvenRevenue / business.avgTicket)
    : Math.ceil(breakEvenRevenue / business.avgTicket / 30);
  const payback = profit > 0 ? capexMid / profit : Infinity;
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
    payback,
    health,
    opportunity: city.scores[business.id],
  };
};

export const rankedCities = (business: Business) =>
  [...cities].sort((a, b) => b.scores[business.id] - a.scores[business.id]);
