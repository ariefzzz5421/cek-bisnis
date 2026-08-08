import rawData from "@/data/franchise-data.json";

export type FranchiseCategoryId = "minimarket" | "minuman" | "makanan" | "jasa" | "kesehatan";

export type FranchiseSource = {
  id: string;
  title: string;
  url: string;
};

export type FranchiseCategory = {
  id: FranchiseCategoryId;
  name: string;
};

export type Franchise = {
  id: string;
  name: string;
  category: FranchiseCategoryId;
  /** Warna merek dipakai untuk ubin logo; tidak ada berkas logo resmi yang dibundel. */
  brandColor: string;
  initials: string;
  officialUrl: string;
  outlets: string;
  since: number;
  /** Rentang investasi awal dalam juta rupiah. */
  investment: [number, number];
  investmentNote: string;
  franchiseFee: string;
  royalty: string;
  contractYears: number;
  /** Rentang balik modal khas, dalam bulan. */
  bepMonths: [number, number];
  /** Perkiraan omzet kotor per bulan, dalam juta rupiah. */
  monthlyRevenue: [number, number];
  scheme: string;
  kpi: string[];
  requirements: string[];
  sourceIds: string[];
};

type FranchiseFile = {
  updatedAt: string;
  note: string;
  disclaimer: string;
  sources: FranchiseSource[];
  categories: FranchiseCategory[];
  franchises: Franchise[];
};

export const franchiseData = rawData as FranchiseFile;
export const franchises = franchiseData.franchises;
export const franchiseCategories = franchiseData.categories;
export const franchiseSources = franchiseData.sources;

const relativeLuminance = (hex: string) => {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};

const contrastWith = (luminance: number, other: number) =>
  (Math.max(luminance, other) + 0.05) / (Math.min(luminance, other) + 0.05);

/**
 * Memilih tinta gelap atau terang di atas warna merek, mana pun yang kontrasnya
 * lebih tinggi. Beberapa warna merek resmi (biru muda, oranye) tidak cukup
 * kontras dengan teks putih, jadi pilihannya dihitung, bukan ditebak.
 */
export const readableInkOn = (brandColor: string) => {
  const luminance = relativeLuminance(brandColor);
  const onDark = contrastWith(luminance, relativeLuminance("#0d0d0d"));
  const onLight = contrastWith(luminance, relativeLuminance("#ffffff"));
  return onDark >= onLight ? "#0d0d0d" : "#ffffff";
};

export const getFranchiseSources = (franchise: Franchise) =>
  franchiseSources.filter((source) => franchise.sourceIds.includes(source.id));

export const franchiseCategoryName = (id: FranchiseCategoryId) =>
  franchiseCategories.find((category) => category.id === id)?.name ?? id;

/**
 * Nilai investasi disimpan dalam juta rupiah, jadi angka di atas seribu lebih
 * mudah dibaca sebagai miliar.
 */
export const formatInvestment = (juta: number) => {
  if (juta >= 1000) {
    const miliar = juta / 1000;
    return `Rp${Number(miliar.toFixed(miliar >= 10 ? 0 : 1)).toLocaleString("id-ID")} M`;
  }
  return `Rp${Math.round(juta).toLocaleString("id-ID")} jt`;
};

export const formatInvestmentRange = ([low, high]: [number, number]) =>
  low === high ? formatInvestment(low) : `${formatInvestment(low)} - ${formatInvestment(high)}`;

export const formatMonthRange = ([low, high]: [number, number]) => `${low}-${high} bulan`;

/**
 * Perkiraan kasar balik modal: modal tengah dibagi laba bulanan.
 * Dipakai hanya untuk mengurutkan, bukan ditampilkan sebagai janji.
 */
export const midInvestment = (franchise: Franchise) =>
  (franchise.investment[0] + franchise.investment[1]) / 2;

export type FranchiseSort = "modal-asc" | "modal-desc" | "bep-asc" | "nama";

export const sortFranchises = (list: Franchise[], sort: FranchiseSort) => {
  const sorted = [...list];
  switch (sort) {
    case "modal-asc":
      return sorted.sort((a, b) => midInvestment(a) - midInvestment(b));
    case "modal-desc":
      return sorted.sort((a, b) => midInvestment(b) - midInvestment(a));
    case "bep-asc":
      return sorted.sort((a, b) => a.bepMonths[0] - b.bepMonths[0] || a.bepMonths[1] - b.bepMonths[1]);
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "id"));
  }
};
