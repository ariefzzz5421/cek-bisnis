import rawData from "@/data/business-data.json";
import {getDossier,sourceList} from "@/financial-models/catalog";
import {calculate, scenarios, withOverrides} from "@/financial-models/engine";

export type BusinessId =
  | "laundry"
  | "kelontong"
  | "franchise"
  | "game"
  | "gym"
  | "coffee"
  | "barber"
  | "angkringan";

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
  bepMonths: [number, number] | null;
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

export const businessData: BusinessData = {...rawData, updatedAt:'2026-09-08', methodNote:'Seluruh hasil finansial adalah estimasi deterministik. Sumber dan asumsi tersedia per model. Skor lokasi bukan data penjualan.', businesses:(rawData.businesses as Business[]).map(b=>{
 const m=getDossier(b.id).model,r=calculate(m),ss=scenarios(m),pay=ss.flatMap(s=>s.result.payback===null?[]:[s.result.payback]);
 return {...b,capex:[r.capital/1e6,r.capital/1e6],fixedBase:r.fixedOpex/1e6,rentBase:m.inputs.rent.value/1e6,staffCount:m.inputs.employees.value,staffCostBase:m.inputs.salary.value/1e6,variableRate:r.variableCostRatio??0,avgTicket:m.inputs.ticket.value/1e6,targetRevenue:r.revenue/1e6,trafficLabel:m.unit,bepMonths:pay.length?[Math.min(...pay),Math.max(...pay)]:null,scenarios:ss.map(s=>({name:s.name,units:s.model.inputs.units.value})),kpi:[{label:'Volume dasar model',target:m.inputs.units.value+' '+m.unit,note:'Estimasi, bukan hasil observasi.'},{label:'BEP volume',target:r.breakEvenUnits===null?'Di luar kapasitas':Math.ceil(r.breakEvenUnits)+' '+m.unit,note:'Dihitung dari biaya dan kontribusi unit.'},{label:'Margin of safety',target:r.marginOfSafety===null?'Tidak tersedia':Math.round(r.marginOfSafety*100)+'%',note:'Buffer pendapatan terhadap BEP.'}]};
})};
export const businesses = businessData.businesses;
export const cities = businessData.cities;
export const sources = businessData.sources;

export const getBusiness = (slug: string) => businesses.find((business) => business.slug === slug);
export const getBusinessSources = (business: Business) =>
  sourceList(getDossier(business.id)).map(s=>({id:s.id,title:s.title,note:s.supports,url:s.url}));

export const formatMoney = (value: number | null, decimals = 1) => {
  if(value===null||!Number.isFinite(value))return "Tidak tersedia";
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
  const original=getDossier(business.id).model;
  // Legacy adapter returns million-IDR for directory/map consumers. No city multipliers.
  void scaleCapex;
  const model=targetRevenue===undefined?original:withOverrides(original,{units:Math.min(original.capacity,Math.max(0,targetRevenue*1e6/(original.inputs.ticket.value*(original.mode==='membership'?1:original.inputs.days.value))))});
  const r=calculate(model),ss=scenarios(original);
  return {
    monthlyRevenue:r.revenue/1e6,revenueLow:ss[0].result.revenue/1e6,revenueHigh:ss[2].result.revenue/1e6,
    rent:model.inputs.rent.value/1e6,payroll:r.payroll/1e6,fixedCost:r.fixedOpex/1e6,
    capexLow:r.capital/1e6,capexHigh:r.capital/1e6,capexMid:r.capital/1e6,
    breakEvenRevenue:r.breakEvenRevenue===null?null:r.breakEvenRevenue/1e6,
    opex:r.totalOpex/1e6,profit:r.operatingProfit/1e6,
    traffic:r.breakEvenUnits===null?null:Math.ceil(r.breakEvenUnits),targetTraffic:Math.ceil(model.inputs.units.value),
    payback:r.payback,variableCost:r.cogs/1e6,contributionMargin:1-(r.variableCostRatio??0),
    marginRate:r.operatingMargin??0,dailyRevenue:r.revenue/30/1e6,roiPerYear:r.annualRoi??0,
    bepRatio:r.breakEvenRevenue&&r.breakEvenRevenue>0?r.revenue/r.breakEvenRevenue:0,
    rentToSales:r.rentToSales??0,health:r.operatingProfit<=0?'Rugi':(r.marginOfSafety??0)<.2?'Tipis':'Sehat',
    opportunity:city.scores[business.id],
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

export const formatMonths = (months: number | null) =>
  months!==null && Number.isFinite(months) ? `${Math.ceil(months)} bulan` : "belum balik";

export const rankedCities = (business: Business) =>
  [...cities].sort((a, b) => b.scores[business.id] - a.scores[business.id]);
