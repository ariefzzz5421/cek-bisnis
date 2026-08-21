import {
  businesses,
  cities,
  formatMoney,
  formatMonths,
  formatPercent,
  type Business,
  type BusinessId,
} from "@/lib/business-data";
import {
  formatInvestmentRange,
  formatMonthRange,
  franchiseLeaderboard,
  franchises,
  readableInkOn,
  sortFranchises,
  type Franchise,
} from "@/lib/franchise-data";

/**
 * Peringkat dihitung pada baseline nasional: seluruh faktor kota = 1.
 *
 * Kalau memakai faktor kota tertentu, urutannya akan berubah mengikuti kota itu
 * dan tidak lagi membandingkan model usaha secara setara. Simulator di halaman
 * masing-masing usaha tetap tempat untuk menghitung angka per kota.
 */
export type BaselineMetrics = {
  fixedCost: number;
  breakEvenRevenue: number;
  monthlyRevenue: number;
  profit: number;
  capexMid: number;
  traffic: number;
  payback: number;
  contributionMargin: number;
  marginRate: number;
  roiPerYear: number;
};

export const baselineMetrics = (business: Business): BaselineMetrics => {
  const fixedCost = business.fixedBase;
  const breakEvenRevenue = fixedCost / (1 - business.variableRate);
  const monthlyRevenue = business.targetRevenue;
  const profit = monthlyRevenue * (1 - business.variableRate) - fixedCost;
  const capexMid = (business.capex[0] + business.capex[1]) / 2;
  const traffic = business.trafficMode === "member"
    ? Math.ceil(breakEvenRevenue / business.avgTicket)
    : Math.ceil(breakEvenRevenue / business.avgTicket / 30);

  return {
    fixedCost,
    breakEvenRevenue,
    monthlyRevenue,
    profit,
    capexMid,
    traffic,
    payback: profit > 0 ? capexMid / profit : Infinity,
    contributionMargin: 1 - business.variableRate,
    marginRate: monthlyRevenue > 0 ? profit / monthlyRevenue : 0,
    roiPerYear: capexMid > 0 ? (profit * 12) / capexMid : 0,
  };
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  /** Nilai utama yang diperingkat, sudah diformat. */
  value: string;
  /** Konteks pendukung supaya angka utama tidak berdiri sendiri. */
  detail: string;
  href: string;
  accent: string;
  /** Warna angka peringkat, dihitung agar kontras di atas `accent`. */
  accentInk: string;
  initials?: string;
};

export type Leaderboard = {
  id: string;
  title: string;
  /** Apa yang diukur dan kenapa itu penting. */
  measure: string;
  caveat: string;
  entries: LeaderboardEntry[];
};

const TOP = 5;

export type ProfitabilityRank = {
  rank: number;
  id: string;
  name: string;
  kind: "business" | "franchise";
  profit: number;
  revenue: string;
  rating: number;
  basis: string;
  href: string;
  external: boolean;
  accent: string;
  businessId?: BusinessId;
  logo?: string;
  initials?: string;
};

/**
 * Sepuluh peluang dengan estimasi laba operasional bulanan tertinggi.
 *
 * Model usaha memakai baseline nasional Cek Bisnis. Entri waralaba memakai
 * proyeksi brand atau skenario Cek Bisnis yang sudah diberi label sumbernya.
 * Skor bintang bersifat relatif terhadap laba tertinggi di daftar ini.
 */
export const buildProfitabilityRanking = (): ProfitabilityRank[] => {
  const businessRows = businesses.map((business) => ({
    id: business.id,
    name: business.name,
    kind: "business" as const,
    profit: baselineMetrics(business).profit,
    revenue: `${formatMoney(business.targetRevenue)}/bln`,
    basis: "Baseline usaha mandiri",
    href: `/usaha/${business.slug}`,
    external: false,
    accent: business.accent,
    businessId: business.id,
  }));

  const franchiseRows = franchiseLeaderboard.map((item) => {
    const detail = franchises.find((franchise) =>
      franchise.id === item.slug || franchise.name.toLocaleLowerCase("id-ID").includes(item.name.toLocaleLowerCase("id-ID")),
    );
    return {
      id: item.slug,
      name: item.name,
      kind: "franchise" as const,
      profit: item.monthlyProfit,
      revenue: `${item.monthlyRevenue}/bln`,
      basis: item.basis,
      href: detail ? `/franchise/${detail.id}` : item.officialUrl,
      external: !detail,
      accent: detail?.brandColor ?? "var(--color-accent)",
      logo: item.logo,
      initials: item.name.split(" ").map((word) => word[0]).join("").slice(0, 3),
    };
  });

  const top = [...businessRows, ...franchiseRows]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10);
  const maximum = Math.max(...top.map((item) => item.profit), 1);

  return top.map((item, index) => ({
    ...item,
    rank: index + 1,
    rating: Math.max(1, Math.min(10, Math.round((item.profit / maximum) * 10))),
  }));
};

const businessEntry = (business: Business, value: string, detail: string): LeaderboardEntry => ({
  id: business.id,
  name: business.name,
  value,
  detail,
  href: `/usaha/${business.slug}`,
  accent: business.accent,
  accentInk: readableInkOn(business.accent),
});

const franchiseEntry = (franchise: Franchise, value: string, detail: string): LeaderboardEntry => ({
  id: franchise.id,
  name: franchise.name,
  value,
  detail,
  href: `/franchise/${franchise.id}`,
  accent: franchise.brandColor,
  accentInk: readableInkOn(franchise.brandColor),
  initials: franchise.initials,
});

/** Rata-rata skor kota untuk seluruh model usaha, dipakai memeringkat kota. */
const cityAverage = (scores: Record<BusinessId, number>) => {
  const values = businesses.map((business) => scores[business.id]).filter((value) => typeof value === "number");
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
};

export const buildLeaderboards = (): Leaderboard[] => {
  const withMetrics = businesses.map((business) => ({ business, metrics: baselineMetrics(business) }));

  return [
    {
      id: "bep-usaha",
      title: "Balik modal tercepat",
      measure: "Modal tengah dibagi laba operasional bulanan, pada target omzet baseline tiap model.",
      caveat: "Belum termasuk cicilan, pajak penghasilan, dan gaji pemilik.",
      entries: withMetrics
        .filter((item) => Number.isFinite(item.metrics.payback))
        .sort((a, b) => a.metrics.payback - b.metrics.payback)
        .slice(0, TOP)
        .map(({ business, metrics }) => businessEntry(
          business,
          formatMonths(metrics.payback),
          `Modal ${formatMoney(business.capex[0], 0)}-${formatMoney(business.capex[1], 0).replace("Rp", "")} · laba ${formatMoney(metrics.profit)}/bln`,
        )),
    },
    {
      id: "modal-usaha",
      title: "Modal awal paling ringan",
      measure: "Batas bawah modal awal untuk membuka model usaha ini.",
      caveat: "Modal kecil bukan berarti laba besar. Baca juga margin dan traffic minimumnya.",
      entries: [...businesses]
        .sort((a, b) => a.capex[0] - b.capex[0])
        .slice(0, TOP)
        .map((business) => businessEntry(
          business,
          formatMoney(business.capex[0], 0),
          `Sampai ${formatMoney(business.capex[1], 0)} · BEP khas ${business.bepMonths[0]}-${business.bepMonths[1]} bln`,
        )),
    },
    {
      id: "margin-usaha",
      title: "Margin kontribusi tertinggi",
      measure: "Bagian dari setiap rupiah omzet yang tersisa setelah biaya variabel, sebelum biaya tetap.",
      caveat: "Margin tinggi tidak berguna kalau volumenya tidak pernah tercapai.",
      entries: withMetrics
        .sort((a, b) => b.metrics.contributionMargin - a.metrics.contributionMargin)
        .slice(0, TOP)
        .map(({ business, metrics }) => businessEntry(
          business,
          formatPercent(metrics.contributionMargin),
          `Biaya variabel ${formatPercent(business.variableRate)} · omzet BEP ${formatMoney(metrics.breakEvenRevenue)}`,
        )),
    },
    {
      id: "traffic-usaha",
      title: "Traffic minimum paling ringan",
      measure: "Jumlah transaksi harian yang dibutuhkan sekadar untuk menutup biaya tetap.",
      caveat: "Satuannya berbeda antar model, jadi bandingkan bersama nilai transaksi rata-ratanya.",
      entries: withMetrics
        .filter(({ business }) => business.trafficMode === "daily")
        .sort((a, b) => a.metrics.traffic - b.metrics.traffic)
        .slice(0, TOP)
        .map(({ business, metrics }) => businessEntry(
          business,
          `${metrics.traffic}`,
          `${business.trafficLabel} · omzet BEP ${formatMoney(metrics.breakEvenRevenue)}`,
        )),
    },
    {
      id: "bep-franchise",
      title: "Waralaba balik modal tercepat",
      measure: "Batas bawah rentang balik modal yang dipublikasikan untuk merek tersebut.",
      caveat: "Franchise tanpa angka BEP publik dikeluarkan dari ranking. Angka franchisor tetap perlu divalidasi dengan prospektus resmi.",
      entries: sortFranchises(franchises, "bep-asc")
        .filter((franchise) => franchise.bepMonths[0] > 0)
        .slice(0, TOP)
        .map((franchise) => franchiseEntry(
          franchise,
          formatMonthRange(franchise.bepMonths),
          `Modal ${formatInvestmentRange(franchise.investment)} · ${franchise.royalty}`,
        )),
    },
    {
      id: "modal-franchise",
      title: "Waralaba modal paling ringan",
      measure: "Batas bawah investasi awal yang dipublikasikan merek tersebut.",
      caveat: "Franchise quotation-only tidak dianggap bermodal Rp0. Sewa lokasi dan modal kerja sering berada di luar angka paket.",
      entries: sortFranchises(franchises, "modal-asc")
        .filter((franchise) => franchise.investment[0] > 0)
        .slice(0, TOP)
        .map((franchise) => franchiseEntry(
          franchise,
          formatInvestmentRange(franchise.investment),
          `${franchise.outlets} · BEP ${formatMonthRange(franchise.bepMonths)}`,
        )),
    },
  ];
};

export type CityRank = {
  id: string;
  name: string;
  province: string;
  average: number;
  best: { name: string; slug: string; score: number };
};

/** Kota dengan rata-rata skor peluang tertinggi untuk seluruh model usaha. */
export const buildCityRanking = (): CityRank[] =>
  [...cities]
    .map((city) => {
      const ranked = [...businesses].sort((a, b) => city.scores[b.id] - city.scores[a.id]);
      const top = ranked[0];
      return {
        id: city.id,
        name: city.name,
        province: city.province,
        average: cityAverage(city.scores),
        best: { name: top.name, slug: top.slug, score: city.scores[top.id] },
      };
    })
    .sort((a, b) => b.average - a.average)
    .slice(0, TOP);
