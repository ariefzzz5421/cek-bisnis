import {
  isRangeKnown,
  rangeHigh,
  rangeLow,
  type Franchise,
} from "@/lib/franchise-data";

export type FranchiseScenarioArchetype =
  | "minimarket"
  | "beverage"
  | "food"
  | "logistics"
  | "health"
  | "laundry"
  | "service";

export type FranchiseScenarioCase = {
  name: "Konservatif" | "Dasar" | "Optimistis";
  driver: string;
  grossSales: number;
  partnerRevenue: number;
  operatingProfit: number;
  operatingMargin: number;
  paybackMonths: number | null;
};

export type ScenarioResearchLink = {
  title: string;
  url: string;
};

export type FranchiseScenarioModel = {
  archetype: FranchiseScenarioArchetype;
  basis: string;
  formula: string;
  grossSalesLabel: string;
  partnerRevenueLabel: string;
  startupCapital: [number, number];
  startupCapitalBasis: string;
  workingCapitalReserve: number;
  assumptions: string[];
  cases: FranchiseScenarioCase[];
  pros: string[];
  cons: string[];
  researchLinks: ScenarioResearchLink[];
};

const BRAND_RESEARCH: Record<string, ScenarioResearchLink[]> = {
  alfamart: [
    {
      title: "Alfamart - skema waralaba dan royalti resmi",
      url: "https://waralaba.alfamart.co.id/about/memiliki-alfamart",
    },
  ],
  indomaret: [
    {
      title: "Indomaret - Brosur Waralaba 2026",
      url: "https://www.indomaret.co.id/wp-content/uploads/2025/02/pdf/BrosurIndomaret-2026.pdf",
    },
  ],
  kopigo: [
    {
      title: "KOPIGO Signature - kemitraan resmi",
      url: "https://kemitraan.kopigo.id/",
    },
  ],
  "lion-parcel": [
    {
      title: "Lion Parcel - pendaftaran agen dan struktur diskon resmi",
      url: "https://website.lionparcel.com/agen/registration/submit",
    },
  ],
  jne: [
    {
      title: "JNE - persyaratan keagenan resmi",
      url: "https://www.jne.co.id/agent",
    },
    {
      title: "JNE - FAQ biaya dan deposit keagenan",
      url: "https://www.jne.co.id/jadi-agen",
    },
  ],
  wahana: [
    {
      title: "Wahana - referensi biaya agen dan profit per pengiriman 2026",
      url: "https://wahana.com/promo-buka-agen-awal-tahun-2026",
    },
  ],
};

const median = (range: [number, number]) => (range[0] + range[1]) / 2;
const positive = (value: number) => Number.isFinite(value) && value > 0;

export const formatScenarioMoney = (juta: number, digits = 1) => {
  if (!Number.isFinite(juta)) return "-";
  if (Math.abs(juta) >= 1000) {
    const miliar = juta / 1000;
    return `Rp${Number(miliar.toFixed(digits)).toLocaleString("id-ID")} M`;
  }
  return `Rp${Number(juta.toFixed(digits)).toLocaleString("id-ID")} jt`;
};

export const formatScenarioPayback = (months: number | null) =>
  months !== null && Number.isFinite(months) ? `~${Math.ceil(months)} bulan` : "belum balik";

function classify(franchise: Franchise): FranchiseScenarioArchetype {
  const text = `${franchise.name} ${franchise.sector ?? ""} ${franchise.scheme}`.toLowerCase();
  if (franchise.category === "minimarket") return "minimarket";
  if (franchise.category === "minuman") return "beverage";
  if (franchise.category === "makanan") return "food";
  if (franchise.category === "kesehatan") return "health";
  if (/laundry|binatu|cuci/.test(text)) return "laundry";
  if (/ekspedisi|logistik|parcel|xpress|express|kurir|pengiriman|jne|j&t|sicepat|anteraja|wahana|ninja/.test(text)) {
    return "logistics";
  }
  return "service";
}

const DEFAULT_CAPITAL: Record<FranchiseScenarioArchetype, [number, number]> = {
  minimarket: [450, 650],
  beverage: [80, 180],
  food: [120, 250],
  logistics: [15, 30],
  health: [350, 600],
  laundry: [80, 150],
  service: [80, 180],
};

function startupCapital(franchise: Franchise, archetype: FranchiseScenarioArchetype) {
  if (isRangeKnown(franchise.investment)) {
    const low = rangeLow(franchise.investment);
    const high = rangeHigh(franchise.investment);
    if (low !== null && high !== null) {
      return {
        range: [low, high] as [number, number],
        basis: "Memakai rentang investasi publik yang tersimpan untuk brand. Sewa, deposit, dan modal kerja yang dikecualikan tetap harus ditambahkan sesuai lokasi.",
      };
    }
  }
  return {
    range: DEFAULT_CAPITAL[archetype],
    basis: "Brand belum mempublikasikan angka investasi yang dapat diverifikasi. Rentang ini adalah modal model Cek Bisnis untuk format usaha sejenis, bukan quotation brand.",
  };
}

function percentageRates(text: string) {
  const normalized = text.replace(/,/g, ".");
  return Array.from(normalized.matchAll(/(\d+(?:\.\d+)?)\s*%/g))
    .map((match) => Number(match[1]) / 100)
    .filter((value) => Number.isFinite(value) && value >= 0 && value <= 1);
}

function flatRoyaltyRate(franchise: Franchise) {
  const text = franchise.royalty.toLowerCase();
  if (/tanpa\s+(royalti|bagi hasil)|100%\s+profit/.test(text)) return 0;
  const rates = percentageRates(franchise.royalty);
  if (!rates.length) return 0;
  const positiveRates = rates.filter((value) => value > 0 && value <= 0.2);
  return positiveRates[0] ?? 0;
}

function managementProfitShare(franchise: Franchise) {
  const text = `${franchise.royalty} ${franchise.scheme}`.toLowerCase();
  if (!/bagi hasil/.test(text)) return 0;
  const manager = text.match(/(\d+(?:[.,]\d+)?)\s*%\s*(?:untuk\s+)?(?:manajemen|management|pusat)/);
  if (!manager) return 0;
  const value = Number(manager[1].replace(",", ".")) / 100;
  return value > 0 && value < 1 ? value : 0;
}

function minimarketRoyalty(franchise: Franchise, sales: number) {
  const progressive = (tiers: Array<[number, number, number]>, above: [number, number]) => {
    let total = 0;
    tiers.forEach(([from, to, rate]) => {
      const taxable = Math.max(0, Math.min(sales, to) - from);
      total += taxable * rate;
    });
    if (sales > above[0]) total += (sales - above[0]) * above[1];
    return total;
  };

  if (franchise.id === "alfamart") {
    return progressive(
      [
        [150, 175, 0.01],
        [175, 200, 0.02],
        [200, 250, 0.03],
      ],
      [250, 0.04],
    );
  }
  if (franchise.id === "indomaret") {
    return progressive(
      [
        [175, 200, 0.02],
        [200, 225, 0.03],
      ],
      [225, 0.04],
    );
  }
  return Math.max(0, sales - 175) * 0.02;
}

function logisticsCommission(franchise: Franchise) {
  if (franchise.id === "lion-parcel") return 0.275;
  if (franchise.id === "wahana") return 0.25;
  const text = franchise.royalty.toLowerCase();
  const rates = percentageRates(franchise.royalty).filter((value) => value >= 0.05 && value <= 0.5);
  if (rates.length >= 2) return (Math.min(...rates) + Math.max(...rates)) / 2;
  if (rates.length === 1 && /komisi|diskon|profit/.test(text)) return rates[0];
  return 0.22;
}

function calibratedDrivers(franchise: Franchise, ticket: number, fallback: number[]) {
  if (!isRangeKnown(franchise.monthlyRevenue) || ticket <= 0) return fallback;
  const rawLow = rangeLow(franchise.monthlyRevenue);
  const high = rangeHigh(franchise.monthlyRevenue);
  if (rawLow === null || high === null || high <= 0) return fallback;
  const low = rawLow > 0 ? rawLow : high * 0.5;
  const targets = [low, (low + high) / 2, high];
  return targets.map((revenue) => Math.max(1, Math.round(revenue / ticket / 30)));
}

function assumptionsFor(
  franchise: Franchise,
  archetype: FranchiseScenarioArchetype,
  capitalMid: number,
) {
  switch (archetype) {
    case "minimarket": {
      const ticket = 0.045;
      return {
        drivers: calibratedDrivers(franchise, ticket, [180, 300, 450]),
        ticket,
        variableRate: 0.87,
        fixedCost: 28 + Math.min(8, capitalMid * 0.01),
        unit: "transaksi/hari",
        assumptions: [
          "Basket rata-rata model Rp45 ribu/transaksi.",
          "Margin kotor model 13% sebelum payroll, sewa, utilitas, susut, dan royalti.",
          "Jika brand sudah punya rentang omzet terkurasi, driver transaksi dikalibrasi ke rentang itu agar skenario tidak bertentangan dengan data publik yang tersedia.",
          "Royalti Alfamart/Indomaret dihitung progresif dari tier publik; brand lain memakai screening 2% di atas Rp175 jt penjualan.",
        ],
      };
    }
    case "beverage": {
      const kopigo = franchise.id === "kopigo";
      const ticket = kopigo ? 0.015 : 0.018;
      return {
        drivers: calibratedDrivers(franchise, ticket, kopigo ? [50, 100, 160] : [60, 120, 180]),
        ticket,
        variableRate: kopigo ? 0.38 : 0.43,
        fixedCost: (kopigo ? 8.5 : 10) + Math.min(24, capitalMid * 0.02),
        unit: "cup/hari",
        assumptions: [
          `Average ticket model ${kopigo ? "Rp15 ribu" : "Rp18 ribu"}/cup.`,
          `HPP model ${(kopigo ? 38 : 43)}% omzet; untuk KOPIGO angka 38% mengikuti simulasi brand.`,
          "Jika rentang omzet brand/riset sudah tersedia, jumlah cup/hari dikalibrasi ke rentang tersebut.",
          "Biaya tetap mencakup payroll, sewa, utilitas, software, kebersihan, dan maintenance dasar.",
        ],
      };
    }
    case "food": {
      const ticket = 0.028;
      return {
        drivers: calibratedDrivers(franchise, ticket, [50, 100, 160]),
        ticket,
        variableRate: 0.50,
        fixedCost: 14 + Math.min(20, capitalMid * 0.015),
        unit: "order/hari",
        assumptions: [
          "Average ticket model Rp28 ribu/order.",
          "HPP + packaging model 50% omzet, sejalan dengan banyak simulasi outlet F&B mass market.",
          "Jika rentang omzet brand/riset tersedia, order/hari dikalibrasi ke rentang tersebut.",
          "Biaya tetap mencakup staf, sewa, utilitas, maintenance, dan promosi dasar; waste di luar asumsi harus diuji saat survei.",
        ],
      };
    }
    case "logistics": {
      const ticket = 0.025;
      return {
        drivers: calibratedDrivers(franchise, ticket, [20, 50, 90]),
        ticket,
        variableRate: 0.05,
        fixedCost: 4.5,
        unit: "paket/hari",
        assumptions: [
          "Ongkir rata-rata model Rp25 ribu/paket; ganti dengan mix rute aktual saat sudah punya data.",
          `Komisi/diskon efektif model ${(logisticsCommission(franchise) * 100).toFixed(1).replace(".0", "")}% dari GMV ongkir.`,
          "Biaya operasional setelah komisi dimodelkan 5% dari pendapatan agen ditambah Rp4,5 jt biaya tetap/bulan.",
        ],
      };
    }
    case "health": {
      const ticket = 0.12;
      return {
        drivers: calibratedDrivers(franchise, ticket, [35, 70, 110]),
        ticket,
        variableRate: 0.80,
        fixedCost: 18 + Math.min(18, capitalMid * 0.01),
        unit: "transaksi/hari",
        assumptions: [
          "Basket rata-rata model Rp120 ribu/transaksi.",
          "Gross margin model 20% sebelum payroll, sewa, sistem, shrinkage, dan royalti.",
          "Jika rentang omzet tersedia, transaksi/hari dikalibrasi ke angka tersebut.",
          "Stok mati, kedaluwarsa, modal kerja obat, dan kewajiban tenaga kefarmasian wajib diuji terpisah.",
        ],
      };
    }
    case "laundry": {
      const ticket = 0.01;
      return {
        drivers: calibratedDrivers(franchise, ticket, [35, 60, 90]),
        ticket,
        variableRate: 0.35,
        fixedCost: 7 + Math.min(8, capitalMid * 0.015),
        unit: "kg/hari",
        assumptions: [
          "Harga rata-rata model Rp10 ribu/kg dengan mix reguler dan express.",
          "Biaya variabel model 35% untuk bahan, listrik/air variabel, packaging, dan rework.",
          "Jika rentang omzet tersedia, kg/hari dikalibrasi ke rentang tersebut.",
          "Biaya tetap mencakup sewa, payroll dasar, maintenance, dan utilitas minimum.",
        ],
      };
    }
    default: {
      const ticket = 0.075;
      return {
        drivers: calibratedDrivers(franchise, ticket, [15, 30, 50]),
        ticket,
        variableRate: 0.40,
        fixedCost: 10 + Math.min(14, capitalMid * 0.015),
        unit: "transaksi/hari",
        assumptions: [
          "Average ticket model Rp75 ribu/transaksi untuk jasa umum.",
          "Biaya variabel model 40%; angka harus diganti dengan unit economics brand ketika quotation diterima.",
          "Jika rentang omzet tersedia, transaksi/hari dikalibrasi ke rentang tersebut.",
          "Biaya tetap mencakup payroll, sewa, utilitas, sistem, dan maintenance dasar.",
        ],
      };
    }
  }
}

function prosAndCons(archetype: FranchiseScenarioArchetype) {
  switch (archetype) {
    case "minimarket":
      return {
        pros: [
          "Permintaan kebutuhan harian berulang dan basket relatif terdiversifikasi.",
          "Sistem pasokan, POS, promosi, dan SOP brand mengurangi beban membangun operasi dari nol.",
          "Data transaksi harian membuat kontrol SKU, shrinkage, dan jam ramai relatif terukur.",
        ],
        cons: [
          "Margin kotor tipis membuat salah pilih lokasi atau sewa mahal cepat menggerus laba.",
          "Modal awal besar dan working capital stok menyerap kas.",
          "Royalti progresif, susut barang, dan kompetisi radius harus dihitung pada level toko.",
        ],
      };
    case "beverage":
      return {
        pros: [
          "Unit economics mudah diukur lewat cup/hari, average ticket, dan HPP.",
          "Format booth dapat mencapai throughput tinggi dengan ruang relatif kecil.",
          "Menu tambahan dan delivery memberi ruang menaikkan average ticket.",
        ],
        cons: [
          "Lokasi dan tren sangat menentukan; traffic yang turun langsung memukul utilisasi staf dan sewa.",
          "Ketergantungan bahan baku pusat dapat membatasi fleksibilitas HPP.",
          "Promo platform dan diskon dapat membuat omzet terlihat besar tetapi margin mengecil.",
        ],
      };
    case "food":
      return {
        pros: [
          "Permintaan makan harian dan delivery membuka peluang repeat order.",
          "Volume order, food cost, dan waste dapat dipantau sebagai KPI operasional yang jelas.",
          "Brand/SOP dapat mempercepat standardisasi rasa dan pembukaan outlet.",
        ],
        cons: [
          "Food cost, waste, payroll, dan kecepatan servis bisa mengubah laba sangat cepat.",
          "Kualitas harus konsisten di jam sibuk; satu bottleneck dapur membatasi omzet.",
          "Sewa dan kebutuhan parkir membuat lokasi bagus mahal.",
        ],
      };
    case "logistics":
      return {
        pros: [
          "Model relatif asset-light dan tidak memerlukan stok dagangan besar.",
          "Pendapatan dapat diproyeksikan langsung dari paket/hari x ongkir x komisi.",
          "Bisa mendapatkan pelanggan berulang dari seller lokal dan kebutuhan pickup.",
        ],
        cons: [
          "Komisi per paket tipis; volume adalah penentu utama, bukan sekadar jumlah walk-in.",
          "Ketentuan pickup, cutoff, deposit, eksklusivitas, dan target berbeda menurut jaringan/cabang.",
          "Perubahan subsidi marketplace dapat mengalihkan volume antarkurir dengan cepat.",
        ],
      };
    case "health":
      return {
        pros: [
          "Permintaan obat dan produk kesehatan lebih defensif daripada banyak kategori discretionary.",
          "Basket dapat diperluas lewat OTC, vitamin, personal care, dan layanan kesehatan.",
          "Sistem brand membantu procurement, POS, dan standardisasi operasional.",
        ],
        cons: [
          "Modal kerja stok tinggi serta risiko slow moving/kedaluwarsa.",
          "Regulasi dan kebutuhan tenaga profesional menambah fixed cost dan kompleksitas.",
          "Margin produk bervariasi; omzet besar tidak otomatis berarti laba besar.",
        ],
      };
    case "laundry":
      return {
        pros: [
          "Repeat demand tinggi di kos, apartemen, dan perumahan padat.",
          "Pendapatan sederhana untuk dimodelkan dari kg/hari x harga/kg.",
          "Upsell express, antar-jemput, sepatu, dan bedding dapat menaikkan ticket.",
        ],
        cons: [
          "Downtime mesin, kualitas air, listrik, dan komplain rework langsung memukul kapasitas.",
          "Persaingan harga lokal tinggi dan radius layanan cenderung sempit.",
          "Utilisasi mesin rendah membuat payback alat memanjang.",
        ],
      };
    default:
      return {
        pros: [
          "SOP dan nama brand dapat mengurangi waktu membangun kepercayaan dari nol.",
          "Model transaksi memudahkan pengujian target omzet sebelum ekspansi.",
          "Skala dapat dinaikkan setelah unit economics dan repeat rate terbukti.",
        ],
        cons: [
          "Kualitas eksekusi operator tetap lebih penting daripada nama brand.",
          "Biaya sewa dan payroll tetap berjalan ketika traffic turun.",
          "Quotation, kontrak, dan kewajiban pembelian pusat dapat mengubah hasil model.",
        ],
      };
  }
}

export function buildFranchiseScenarioModel(franchise: Franchise): FranchiseScenarioModel {
  const archetype = classify(franchise);
  const capital = startupCapital(franchise, archetype);
  const capMid = median(capital.range);
  const model = assumptionsFor(franchise, archetype, capMid);
  const workingCapitalReserve = model.fixedCost * (archetype === "logistics" ? 3 : 2);
  const capitalForPayback = capMid + workingCapitalReserve;
  const royaltyRate = flatRoyaltyRate(franchise);
  const profitShare = managementProfitShare(franchise);
  const commissionRate = archetype === "logistics" ? logisticsCommission(franchise) : 0;
  const names: FranchiseScenarioCase["name"][] = ["Konservatif", "Dasar", "Optimistis"];

  const cases = model.drivers.map((units, index): FranchiseScenarioCase => {
    const grossSales = units * model.ticket * 30;
    let partnerRevenue = grossSales * (1 - model.variableRate);
    let operatingProfit: number;

    if (archetype === "logistics") {
      partnerRevenue = grossSales * commissionRate;
      operatingProfit = partnerRevenue * (1 - model.variableRate) - model.fixedCost;
    } else {
      const royalty = archetype === "minimarket"
        ? minimarketRoyalty(franchise, grossSales)
        : grossSales * royaltyRate;
      operatingProfit = partnerRevenue - model.fixedCost - royalty;
      if (profitShare > 0 && operatingProfit > 0) operatingProfit *= 1 - profitShare;
    }

    const paybackMonths = positive(operatingProfit) ? capitalForPayback / operatingProfit : null;
    return {
      name: names[index],
      driver: `${units} ${model.unit}`,
      grossSales,
      partnerRevenue,
      operatingProfit,
      operatingMargin: grossSales > 0 ? operatingProfit / grossSales : 0,
      paybackMonths,
    };
  });

  const { pros, cons } = prosAndCons(archetype);
  const grossSalesLabel = archetype === "logistics" ? "GMV ongkir / bulan" : "Omzet kotor / bulan";
  const partnerRevenueLabel = archetype === "logistics" ? "Pendapatan komisi agen" : "Margin kotor setelah HPP";

  const basis = isRangeKnown(franchise.monthlyRevenue) || isRangeKnown(franchise.bepMonths)
    ? "Angka publik brand tetap ditampilkan terpisah. Tabel ini menguji unit economics dengan asumsi operasional yang sama untuk skenario konservatif, dasar, dan optimistis; bila rentang omzet sudah ada, driver skenario dikalibrasi ke rentang tersebut."
    : "Brand belum mempublikasikan omzet/BEP yang cukup untuk dianalisis. Karena itu Cek Bisnis membangun skenario sendiri dari driver operasional, bukan mengisi kolom kosong dengan angka yang seolah-olah resmi.";

  const formula = archetype === "logistics"
    ? "GMV ongkir = paket/hari x ongkir rata-rata x 30; pendapatan agen = GMV x komisi efektif; laba = pendapatan agen - biaya variabel - biaya tetap."
    : `Omzet = ${model.unit} x average ticket x 30; margin kotor = omzet x (1 - HPP); laba = margin kotor - biaya tetap - royalti/bagi hasil yang relevan.`;

  return {
    archetype,
    basis,
    formula,
    grossSalesLabel,
    partnerRevenueLabel,
    startupCapital: capital.range,
    startupCapitalBasis: capital.basis,
    workingCapitalReserve,
    assumptions: [
      ...model.assumptions,
      `Cadangan kas untuk uji payback: ${archetype === "logistics" ? 3 : 2} bulan biaya tetap (~${formatScenarioMoney(workingCapitalReserve)}), agar model tidak menganggap modal pembukaan sebagai seluruh kebutuhan kas.`,
      "Semua hasil adalah screening sebelum pajak penghasilan, bunga/cicilan, dan gaji pemilik kecuali sudah masuk biaya tetap model.",
    ],
    cases,
    pros,
    cons,
    researchLinks: BRAND_RESEARCH[franchise.id] ?? [],
  };
}

export function modelPaybackRange(model: FranchiseScenarioModel): [number, number] | null {
  const values = model.cases
    .map((scenario) => scenario.paybackMonths)
    .filter((value): value is number => value !== null && Number.isFinite(value));
  if (!values.length) return null;
  return [Math.min(...values), Math.max(...values)];
}

export function modelRevenueRange(model: FranchiseScenarioModel): [number, number] {
  return [model.cases[0].grossSales, model.cases[model.cases.length - 1].grossSales];
}
