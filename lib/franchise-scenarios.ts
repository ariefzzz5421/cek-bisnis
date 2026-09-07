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
  commercialTerms: string;
};

type OperatingTemplate = {
  fallbackDrivers: [number, number, number];
  ticket: number;
  variableRate: number;
  fixedCost: number;
  unit: string;
  assumptions: string[];
};

type LogisticsTerms =
  | {
      mode: "percentage";
      rates: [number, number, number];
      label: string;
    }
  | {
      mode: "fixed";
      commissionPerPackage: number;
      label: string;
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
      title: "Lion Parcel - ketentuan diskon Mitra POS resmi",
      url: "https://website.lionparcel.com/agen/registration/submit",
    },
    {
      title: "Lion Parcel - pusat informasi mitra 2026",
      url: "https://lionparcel.com/info-mitra/berapa-harga-modal-agen",
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

const DEFAULT_CAPITAL: Record<FranchiseScenarioArchetype, [number, number]> = {
  minimarket: [450, 650],
  beverage: [80, 180],
  food: [120, 250],
  logistics: [15, 30],
  health: [350, 600],
  laundry: [80, 150],
  service: [80, 180],
};

const median = (range: [number, number]) => (range[0] + range[1]) / 2;
const positive = (value: number) => Number.isFinite(value) && value > 0;

export const formatScenarioMoney = (juta: number, digits = 1) => {
  if (!Number.isFinite(juta)) return "-";
  const sign = juta < 0 ? "-" : "";
  const absolute = Math.abs(juta);
  if (absolute >= 1000) {
    const miliar = absolute / 1000;
    return `${sign}Rp${Number(miliar.toFixed(digits)).toLocaleString("id-ID")} M`;
  }
  return `${sign}Rp${Number(absolute.toFixed(digits)).toLocaleString("id-ID")} jt`;
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
  if (/bagi hasil/.test(text) && !/royalti/.test(text)) return 0;
  const explicit = text.match(/royalti[^0-9]{0,18}(\d+(?:[.,]\d+)?)\s*%/);
  if (explicit) return Number(explicit[1].replace(",", ".")) / 100;
  const rates = percentageRates(franchise.royalty).filter((value) => value > 0 && value <= 0.2);
  return rates[0] ?? 0;
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

function parseFixedCommissionPerPackage(text: string) {
  const match = text.match(/rp\s*([0-9][0-9.,]*)\s*(?:\/|per\s*)paket/i);
  if (!match) return null;
  const digits = match[1].replace(/[^0-9]/g, "");
  const rupiah = Number(digits);
  if (!Number.isFinite(rupiah) || rupiah <= 0) return null;
  return rupiah / 1_000_000;
}

function currentCommercialTerms(franchise: Franchise) {
  if (franchise.id === "lion-parcel") {
    return "Tanpa royalti; diskon penjualan resmi berbeda menurut layanan (10%-35%). Opsi pickup dapat mengurangi diskon, sehingga mix layanan wajib dihitung.";
  }
  if (franchise.id === "wahana") {
    return "Tanpa royalti; referensi resmi 2026 menyebut profit per pengiriman hingga 25%.";
  }
  return franchise.royalty;
}

function logisticsTerms(franchise: Franchise): LogisticsTerms {
  if (franchise.id === "lion-parcel") {
    return {
      mode: "percentage",
      rates: [0.2, 0.275, 0.35],
      label: "Lion Parcel mempublikasikan diskon per layanan 10%-35%; model memakai 20% / 27,5% / 35% untuk menguji mix layanan, bukan menganggap semua paket mendapat rate tertinggi.",
    };
  }

  const fixed = parseFixedCommissionPerPackage(franchise.royalty);
  if (fixed !== null) {
    return {
      mode: "fixed",
      commissionPerPackage: fixed,
      label: `Komisi model mengikuti angka yang tersimpan: ${formatScenarioMoney(fixed, 4)} per paket.`,
    };
  }

  if (franchise.id === "wahana") {
    return {
      mode: "percentage",
      rates: [0.2, 0.25, 0.25],
      label: "Referensi resmi 2026 menyebut profit per pengiriman hingga 25%; skenario konservatif memakai 20% dan dua skenario berikutnya 25%.",
    };
  }

  const rates = percentageRates(franchise.royalty).filter((value) => value >= 0.05 && value <= 0.5);
  if (rates.length >= 2) {
    const low = Math.min(...rates);
    const high = Math.max(...rates);
    return {
      mode: "percentage",
      rates: [low, (low + high) / 2, high],
      label: `Komisi model mengikuti rentang yang tersimpan: ${(low * 100).toFixed(0)}%-${(high * 100).toFixed(0)}%.`,
    };
  }
  if (rates.length === 1 && /komisi|diskon|profit/.test(franchise.royalty.toLowerCase())) {
    return {
      mode: "percentage",
      rates: [rates[0], rates[0], rates[0]],
      label: `Komisi model memakai ${(rates[0] * 100).toFixed(1).replace(".0", "")}% sesuai angka yang tersimpan.`,
    };
  }

  return {
    mode: "percentage",
    rates: [0.18, 0.2, 0.22],
    label: "Brand belum mempublikasikan unit commission yang cukup jelas. Model screening memakai 18%-22% dari GMV ongkir dan wajib diganti ketika proposal cabang diterima.",
  };
}

function calibratedDrivers(franchise: Franchise, ticket: number, fallback: [number, number, number]) {
  if (!isRangeKnown(franchise.monthlyRevenue) || ticket <= 0) return fallback;
  const rawLow = rangeLow(franchise.monthlyRevenue);
  const high = rangeHigh(franchise.monthlyRevenue);
  if (rawLow === null || high === null || high <= 0) return fallback;
  const low = rawLow > 0 ? rawLow : high * 0.5;
  return [low, (low + high) / 2, high].map((revenue) => Math.max(1, Math.round(revenue / ticket / 30))) as [number, number, number];
}

function logisticsDrivers(franchise: Franchise, terms: LogisticsTerms): [number, number, number] {
  // Monthly revenue fields for agent networks are not consistently defined as
  // GMV vs partner commission. Never calibrate a percentage-based model to an
  // ambiguous revenue field. A fixed per-package commission is the exception:
  // there we can safely infer package volume from partner income.
  if (terms.mode === "fixed" && isRangeKnown(franchise.monthlyRevenue)) {
    const rawLow = rangeLow(franchise.monthlyRevenue);
    const high = rangeHigh(franchise.monthlyRevenue);
    if (rawLow !== null && high !== null && high > 0 && terms.commissionPerPackage > 0) {
      const low = rawLow > 0 ? rawLow : high * 0.5;
      return [low, (low + high) / 2, high].map((income) =>
        Math.max(1, Math.round(income / terms.commissionPerPackage / 30)),
      ) as [number, number, number];
    }
  }
  return [20, 50, 90];
}

function operatingTemplate(
  franchise: Franchise,
  archetype: FranchiseScenarioArchetype,
  capitalMid: number,
): OperatingTemplate {
  if (archetype === "minimarket") {
    const ticket = 0.045;
    return {
      fallbackDrivers: calibratedDrivers(franchise, ticket, [180, 300, 450]),
      ticket,
      variableRate: 0.87,
      fixedCost: 28 + Math.min(8, capitalMid * 0.01),
      unit: "transaksi/hari",
      assumptions: [
        "Basket rata-rata model Rp45 ribu/transaksi.",
        "Margin kotor model 13% sebelum payroll, sewa, utilitas, susut, dan royalti.",
        "Jika brand punya rentang omzet terkurasi, transaksi/hari dikalibrasi ke rentang itu.",
        "Royalti Alfamart/Indomaret dihitung progresif dari tier publik; minimarket lain memakai screening 2% di atas Rp175 jt omzet.",
      ],
    };
  }

  if (archetype === "beverage") {
    const kopigo = franchise.id === "kopigo";
    const ticket = kopigo ? 0.015 : 0.018;
    return {
      fallbackDrivers: calibratedDrivers(franchise, ticket, kopigo ? [50, 100, 160] : [60, 120, 180]),
      ticket,
      variableRate: kopigo ? 0.38 : 0.43,
      fixedCost: (kopigo ? 8.5 : 10) + Math.min(24, capitalMid * 0.02),
      unit: "cup/hari",
      assumptions: [
        `Average ticket model ${kopigo ? "Rp15 ribu" : "Rp18 ribu"}/cup.`,
        `HPP model ${kopigo ? "38%" : "43%"} omzet${kopigo ? "; input KOPIGO mengikuti simulasi brand" : ""}.`,
        "Jika rentang omzet tersedia, cup/hari dikalibrasi ke rentang tersebut.",
        "Biaya tetap mencakup payroll, sewa, utilitas, software, kebersihan, dan maintenance dasar.",
      ],
    };
  }

  if (archetype === "food") {
    const ticket = 0.028;
    return {
      fallbackDrivers: calibratedDrivers(franchise, ticket, [50, 100, 160]),
      ticket,
      variableRate: 0.5,
      fixedCost: 14 + Math.min(20, capitalMid * 0.015),
      unit: "order/hari",
      assumptions: [
        "Average ticket model Rp28 ribu/order.",
        "HPP + packaging model 50% omzet.",
        "Jika rentang omzet tersedia, order/hari dikalibrasi ke rentang tersebut.",
        "Biaya tetap mencakup staf, sewa, utilitas, maintenance, dan promosi dasar; waste harus diuji saat survei.",
      ],
    };
  }

  if (archetype === "logistics") {
    const terms = logisticsTerms(franchise);
    return {
      fallbackDrivers: logisticsDrivers(franchise, terms),
      ticket: 0.025,
      variableRate: 0.05,
      fixedCost: 4.5,
      unit: "paket/hari",
      assumptions: [
        "Ongkir rata-rata model Rp25 ribu/paket untuk menghitung GMV; ganti dengan mix rute aktual.",
        terms.label,
        "Biaya operasional setelah komisi dimodelkan 5% dari pendapatan agen ditambah Rp4,5 jt biaya tetap/bulan.",
        "Untuk komisi persentase, angka monthly revenue lama tidak dipakai untuk mengkalibrasi GMV karena definisinya bisa omzet ongkir atau pendapatan agen.",
      ],
    };
  }

  if (archetype === "health") {
    const ticket = 0.12;
    return {
      fallbackDrivers: calibratedDrivers(franchise, ticket, [35, 70, 110]),
      ticket,
      variableRate: 0.8,
      fixedCost: 18 + Math.min(18, capitalMid * 0.01),
      unit: "transaksi/hari",
      assumptions: [
        "Basket rata-rata model Rp120 ribu/transaksi.",
        "Gross margin model 20% sebelum payroll, sewa, sistem, shrinkage, dan royalti.",
        "Jika rentang omzet tersedia, transaksi/hari dikalibrasi ke rentang tersebut.",
        "Stok mati, kedaluwarsa, modal kerja obat, dan kewajiban tenaga kefarmasian wajib diuji terpisah.",
      ],
    };
  }

  if (archetype === "laundry") {
    const ticket = 0.01;
    return {
      fallbackDrivers: calibratedDrivers(franchise, ticket, [35, 60, 90]),
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

  const ticket = 0.075;
  return {
    fallbackDrivers: calibratedDrivers(franchise, ticket, [15, 30, 50]),
    ticket,
    variableRate: 0.4,
    fixedCost: 10 + Math.min(14, capitalMid * 0.015),
    unit: "transaksi/hari",
    assumptions: [
      "Average ticket model Rp75 ribu/transaksi untuk jasa umum.",
      "Biaya variabel model 40%; ganti dengan unit economics brand ketika quotation diterima.",
      "Jika rentang omzet tersedia, transaksi/hari dikalibrasi ke rentang tersebut.",
      "Biaya tetap mencakup payroll, sewa, utilitas, sistem, dan maintenance dasar.",
    ],
  };
}

function prosAndCons(archetype: FranchiseScenarioArchetype) {
  if (archetype === "minimarket") return {
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

  if (archetype === "beverage") return {
    pros: [
      "Unit economics mudah diukur lewat cup/hari, average ticket, dan HPP.",
      "Format booth dapat mencapai throughput tinggi dengan ruang relatif kecil.",
      "Menu tambahan dan delivery memberi ruang menaikkan average ticket.",
    ],
    cons: [
      "Lokasi dan tren sangat menentukan; traffic turun langsung memukul utilisasi staf dan sewa.",
      "Ketergantungan bahan baku pusat dapat membatasi fleksibilitas HPP.",
      "Promo platform dan diskon dapat membuat omzet terlihat besar tetapi margin mengecil.",
    ],
  };

  if (archetype === "food") return {
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

  if (archetype === "logistics") return {
    pros: [
      "Model relatif asset-light dan tidak memerlukan stok dagangan besar.",
      "Pendapatan dapat diproyeksikan langsung dari paket/hari dan unit commission.",
      "Bisa mendapatkan pelanggan berulang dari seller lokal dan kebutuhan pickup.",
    ],
    cons: [
      "Komisi per paket tipis; volume adalah penentu utama, bukan sekadar jumlah walk-in.",
      "Ketentuan pickup, cutoff, deposit, eksklusivitas, dan target berbeda menurut jaringan/cabang.",
      "Perubahan subsidi marketplace dapat mengalihkan volume antarkurir dengan cepat.",
    ],
  };

  if (archetype === "health") return {
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

  if (archetype === "laundry") return {
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

export function buildFranchiseScenarioModel(franchise: Franchise): FranchiseScenarioModel {
  const archetype = classify(franchise);
  const capital = startupCapital(franchise, archetype);
  const capMid = median(capital.range);
  const template = operatingTemplate(franchise, archetype, capMid);
  const workingCapitalReserve = template.fixedCost * (archetype === "logistics" ? 3 : 2);
  const capitalForPayback = capMid + workingCapitalReserve;
  const royaltyRate = flatRoyaltyRate(franchise);
  const profitShare = managementProfitShare(franchise);
  const logistics = archetype === "logistics" ? logisticsTerms(franchise) : null;
  const names: FranchiseScenarioCase["name"][] = ["Konservatif", "Dasar", "Optimistis"];

  const cases = template.fallbackDrivers.map((units, index): FranchiseScenarioCase => {
    const grossSales = units * template.ticket * 30;
    let partnerRevenue = grossSales * (1 - template.variableRate);
    let operatingProfit: number;

    if (archetype === "logistics" && logistics) {
      partnerRevenue = logistics.mode === "fixed"
        ? units * 30 * logistics.commissionPerPackage
        : grossSales * logistics.rates[index];
      operatingProfit = partnerRevenue * (1 - template.variableRate) - template.fixedCost;
    } else {
      const royalty = archetype === "minimarket"
        ? minimarketRoyalty(franchise, grossSales)
        : grossSales * royaltyRate;
      operatingProfit = partnerRevenue - template.fixedCost - royalty;
      if (profitShare > 0 && operatingProfit > 0) operatingProfit *= 1 - profitShare;
    }

    return {
      name: names[index],
      driver: `${units} ${template.unit}`,
      grossSales,
      partnerRevenue,
      operatingProfit,
      operatingMargin: grossSales > 0 ? operatingProfit / grossSales : 0,
      paybackMonths: positive(operatingProfit) ? capitalForPayback / operatingProfit : null,
    };
  });

  const { pros, cons } = prosAndCons(archetype);
  const publishedRangeExists = isRangeKnown(franchise.monthlyRevenue) || isRangeKnown(franchise.bepMonths);
  const basis = publishedRangeExists
    ? "Angka publik/terkurasi tetap ditampilkan terpisah. Tabel ini menguji unit economics; untuk non-logistik, driver dikalibrasi ke rentang omzet saat definisinya cukup jelas."
    : "Brand belum mempublikasikan omzet/BEP yang cukup. Cek Bisnis membangun skenario dari driver operasional dan menandainya sebagai model, bukan mengisi kolom kosong seolah-olah angka resmi.";

  const formula = archetype === "logistics"
    ? logistics?.mode === "fixed"
      ? "GMV ongkir = paket/hari x ongkir rata-rata x 30; pendapatan agen = paket x komisi tetap; laba = pendapatan agen - biaya variabel - biaya tetap."
      : "GMV ongkir = paket/hari x ongkir rata-rata x 30; pendapatan agen = GMV x rate komisi/diskon; laba = pendapatan agen - biaya variabel - biaya tetap."
    : `Omzet = ${template.unit} x average ticket x 30; margin kotor = omzet x (1 - HPP); laba = margin kotor - biaya tetap - royalti/bagi hasil yang relevan.`;

  return {
    archetype,
    basis,
    formula,
    grossSalesLabel: archetype === "logistics" ? "GMV ongkir / bulan" : "Omzet kotor / bulan",
    partnerRevenueLabel: archetype === "logistics" ? "Pendapatan komisi agen" : "Margin kotor setelah HPP",
    startupCapital: capital.range,
    startupCapitalBasis: capital.basis,
    workingCapitalReserve,
    assumptions: [
      ...template.assumptions,
      `Cadangan kas untuk uji payback: ${archetype === "logistics" ? 3 : 2} bulan biaya tetap (~${formatScenarioMoney(workingCapitalReserve)}).`,
      "Semua hasil adalah screening sebelum pajak penghasilan, bunga/cicilan, dan gaji pemilik kecuali sudah masuk biaya tetap model.",
    ],
    cases,
    pros,
    cons,
    researchLinks: BRAND_RESEARCH[franchise.id] ?? [],
    commercialTerms: currentCommercialTerms(franchise),
  };
}
