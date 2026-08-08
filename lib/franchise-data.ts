import rawArticles from "@/data/franchise-articles.json";
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
  /** Nama berkas logo resmi yang sudah disimpan lokal, jika tersedia. */
  logoFile?: string;
  /** URL logo resmi untuk sumber yang hanya mengizinkan hotlink. */
  logoUrl?: string;
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

/* ------------------------------------------------------------- artikel */

export type FranchiseArticleSection = { heading: string; body: string };
export type FranchiseCostRow = { item: string; amount: string; note: string };
export type FranchiseSchemeDoc = { label: string; url: string; kind: "page" | "pdf" };

export type FranchiseArticle = {
  lede: string;
  sections: FranchiseArticleSection[];
  costBreakdown: FranchiseCostRow[];
  /**
   * Halaman kemitraan resmi. Prospektus penawaran waralaba wajib diberikan
   * franchisor ke calon mitra tetapi umumnya bukan berkas unduhan publik, jadi
   * yang ditautkan adalah halaman tempat memintanya.
   */
  schemeDocs: FranchiseSchemeDoc[];
  verdict: string;
};

type ArticleFile = {
  note: string;
  prospectusNote: string;
  articles: Record<string, FranchiseArticle>;
};

export const franchiseArticleFile = rawArticles as ArticleFile;

export const getFranchise = (id: string) => franchises.find((franchise) => franchise.id === id);
export const getFranchiseArticle = (id: string): FranchiseArticle | undefined =>
  franchiseArticleFile.articles[id];

export type FranchiseEstimate = {
  rank: number;
  slug: string;
  name: string;
  logo: string;
  officialUrl: string;
  investment: string;
  monthlyRevenue: string;
  monthlyProfit: number;
  rating: number;
  basis: "Proyeksi brand" | "Skenario Cek Bisnis";
  note: string;
};

/**
 * Urutan memakai estimasi laba operasional bulanan, bukan laporan laba outlet
 * yang telah diaudit. Angka brand dipakai hanya saat situs resmi menerbitkan
 * simulasi; sisanya adalah skenario konservatif Cek Bisnis untuk screening.
 */
export const franchiseLeaderboard: FranchiseEstimate[] = [
  {
    rank: 1,
    slug: "kopigo",
    name: "KOPIGO",
    logo: "/brands/franchises/kopigo.svg",
    officialUrl: "https://kemitraan.kopigo.id/",
    investment: "Rp53-87 jt all-in",
    monthlyRevenue: "Rp45 jt",
    monthlyProfit: 20.65,
    rating: 9,
    basis: "Proyeksi brand",
    note: "Contoh resmi setelah royalti mulai bulan ke-6.",
  },
  {
    rank: 2,
    slug: "bingxue",
    name: "Bingxue",
    logo: "/brands/franchises/bingxue.png",
    officialUrl: "https://bingxueindonesia.co.id/",
    investment: "Minta quotation",
    monthlyRevenue: "Rp55-80 jt",
    monthlyProfit: 18,
    rating: 8,
    basis: "Skenario Cek Bisnis",
    note: "Skenario memakai margin kotor resmi sekitar 60% lalu dikurangi OPEX.",
  },
  {
    rank: 3,
    slug: "ayam-geprek-sai",
    name: "Ayam Geprek Sa'i",
    logo: "/brands/franchises/ayam-geprek-sai.png",
    officialUrl: "https://ayamgepreksai.com/",
    investment: "±Rp300 jt + sewa",
    monthlyRevenue: "Rp85-115 jt",
    monthlyProfit: 17,
    rating: 7,
    basis: "Skenario Cek Bisnis",
    note: "Estimasi bagian mitra setelah biaya dan skema bagi hasil.",
  },
  {
    rank: 4,
    slug: "esteh-indonesia",
    name: "Esteh Indonesia",
    logo: "/brands/franchises/esteh-indonesia.svg",
    officialUrl: "https://www.estehindonesia.com/partnership",
    investment: "Minta quotation",
    monthlyRevenue: "Rp55-75 jt",
    monthlyProfit: 14,
    rating: 8,
    basis: "Skenario Cek Bisnis",
    note: "Format grab-and-go; nilai akhir wajib mengikuti proposal terbaru.",
  },
  {
    rank: 5,
    slug: "baba-rafi",
    name: "Kebab Baba Rafi",
    logo: "/brands/franchises/baba-rafi.png",
    officialUrl: "https://www.babarafi.com/",
    investment: "Minta quotation",
    monthlyRevenue: "Rp45-65 jt",
    monthlyProfit: 12,
    rating: 8,
    basis: "Skenario Cek Bisnis",
    note: "Skenario booth pada titik komuter dengan traffic stabil.",
  },
  {
    rank: 6,
    slug: "rocket-chicken",
    name: "Rocket Chicken",
    logo: "https://firebasestorage.googleapis.com/v0/b/rocketchicken-v2/o/Assets%2Frc_logo_square.png?alt=media&token=4d2c56f5-c57a-48a4-8989-31c356e5cb2e",
    officialUrl: "https://www.rocketchicken.co.id/about",
    investment: "Minta quotation",
    monthlyRevenue: "Rp75-100 jt",
    monthlyProfit: 10,
    rating: 7,
    basis: "Skenario Cek Bisnis",
    note: "Restoran penuh: omzet besar, tetapi gaji, sewa, dan bahan juga tinggi.",
  },
  {
    rank: 7,
    slug: "sabana",
    name: "Sabana Fried Chicken",
    logo: "/brands/franchises/sabana.webp",
    officialUrl: "https://sabana.co.id/?page_id=10",
    investment: "Rp22 jt",
    monthlyRevenue: "Rp28-40 jt",
    monthlyProfit: 7,
    rating: 8,
    basis: "Skenario Cek Bisnis",
    note: "Tanpa royalti; bahan utama tetap wajib dari pusat.",
  },
  {
    rank: 8,
    slug: "nyoklat-klasik",
    name: "Nyoklat Klasik",
    logo: "https://nyoklatklasik.co.id/wp-content/uploads/2020/10/logo_nyoklat.png",
    officialUrl: "https://nyoklatklasik.co.id/faq/",
    investment: "Rp12-17 jt",
    monthlyRevenue: "Rp15-30 jt",
    monthlyProfit: 6,
    rating: 8,
    basis: "Skenario Cek Bisnis",
    note: "Memakai sisi bawah rentang penjualan harian yang dipublikasikan brand.",
  },
  {
    rank: 9,
    slug: "esteh-poci",
    name: "Es Teh Poci",
    logo: "/brands/franchises/esteh-poci.png",
    officialUrl: "https://estehpoci.id/",
    investment: "Rp22,49 jt",
    monthlyRevenue: "Rp10,5 jt",
    monthlyProfit: 3.8,
    rating: 9,
    basis: "Proyeksi brand",
    note: "Simulasi resmi 70 cup per hari dengan harga Rp5.000.",
  },
  {
    rank: 10,
    slug: "tahu-go",
    name: "Tahu Go",
    logo: "https://www.tahugo.co.id/wp-content/uploads/2019/11/Screen-Shot-2019-11-05-at-12.23.08-1024x962.png",
    officialUrl: "https://www.tahugo.co.id/",
    investment: "Minta quotation",
    monthlyRevenue: "Rp16-25 jt",
    monthlyProfit: 3.5,
    rating: 7,
    basis: "Skenario Cek Bisnis",
    note: "Skenario volume rendah; situs resmi mengingatkan omzet dapat naik-turun.",
  },
];
