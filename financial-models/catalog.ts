import businessFile from "../data/business-data.json";
import baseFile from "../data/franchise-data.json";
import extraFile from "../data/franchise-extra.json";
import {
  calculate,
  input,
  type Archetype,
  type InputKey,
  type Inputs,
  type Model,
} from "./engine";
import {
  getResearch,
  industrySources,
  RESEARCH_DATE,
  type Research,
} from "../research/registry";

export type Dossier = {
  id: string;
  name: string;
  kind: "business" | "franchise";
  href: string;
  model: Model;
  research: Research;
  pros: string[];
  cons: string[];
  operationalRisks: string[];
  financialRisks: string[];
  locationDependency: string;
  executionDifficulty: string;
};
type Profile = {
  archetype: Archetype;
  unit: string;
  drivers: [number, number, number];
  capacity: number;
  ticket: number;
  cogsRate: number;
  unitCost: number;
  employees: number;
  salary: number;
  rent: number;
  utilities: number;
  equipment: number;
  fitout: number;
  inventory: number;
  marketing: number;
  maintenance: number;
  other: number;
  note: string;
  pros: string[];
  cons: string[];
};
const profiles: Record<string, Profile> = {
  retail: {
    archetype: "retail",
    unit: "transaksi/hari",
    drivers: [150, 250, 380],
    capacity: 500,
    ticket: 45000,
    cogsRate: 0.84,
    unitCost: 0,
    employees: 4,
    salary: 3500000,
    rent: 7000000,
    utilities: 2500000,
    equipment: 160000000,
    fitout: 100000000,
    inventory: 120000000,
    marketing: 1000000,
    maintenance: 700000,
    other: 800000,
    note: "Minimarket 80–120 m²; margin 16% asumsi bauran barang, belum termasuk royalti dan susut tambahan.",
    pros: [
      "Pembelian kebutuhan rutin dapat mendorong kunjungan ulang.",
      "Bauran SKU memungkinkan pengujian margin per kategori.",
    ],
    cons: [
      "Persediaan lambat laku mengunci kas dan meningkatkan kedaluwarsa.",
      "Margin tipis membuat selisih kas dan shrinkage langsung menggerus laba.",
    ],
  },
  restaurant: {
    archetype: "restaurant",
    unit: "transaksi/hari",
    drivers: [60, 100, 160],
    capacity: 220,
    ticket: 22000,
    cogsRate: 0.45,
    unitCost: 0,
    employees: 4,
    salary: 3300000,
    rent: 5000000,
    utilities: 1800000,
    equipment: 70000000,
    fitout: 65000000,
    inventory: 10000000,
    marketing: 1500000,
    maintenance: 600000,
    other: 700000,
    note: "Restoran cepat saji kecil dengan 4 staf; food cost 45% mencakup kemasan dan waste asumsi.",
    pros: [
      "Menu inti dapat distandardisasi dan dijual melalui beberapa kanal.",
      "Repeat order dapat diukur melalui kasir.",
    ],
    cons: [
      "Makanan tidak terjual menjadi waste hari itu.",
      "Jam makan terkonsentrasi; kapasitas dapur dan kecepatan layanan menentukan konversi.",
    ],
  },
  beverage: {
    archetype: "beverage",
    unit: "cup/hari",
    drivers: [45, 85, 140],
    capacity: 200,
    ticket: 18000,
    cogsRate: 0.42,
    unitCost: 0,
    employees: 2,
    salary: 3300000,
    rent: 3500000,
    utilities: 900000,
    equipment: 45000000,
    fitout: 25000000,
    inventory: 5000000,
    marketing: 800000,
    maintenance: 400000,
    other: 400000,
    note: "Gerai minuman kecil; ticket dan HPP adalah bauran menu asumsi, bukan statistik brand.",
    pros: [
      "Resep dan porsi terukur memudahkan kontrol bahan.",
      "Format ringkas menekan kebutuhan ruang.",
    ],
    cons: [
      "Promosi aplikasi dan kemasan bisa menaikkan biaya efektif per cup.",
      "Traffic sekolah/kantor turun saat libur; survei jam ramai diperlukan.",
    ],
  },
  kiosk: {
    archetype: "kiosk",
    unit: "transaksi/hari",
    drivers: [30, 55, 85],
    capacity: 120,
    ticket: 10000,
    cogsRate: 0.45,
    unitCost: 0,
    employees: 1,
    salary: 3300000,
    rent: 1500000,
    utilities: 400000,
    equipment: 12000000,
    fitout: 4000000,
    inventory: 2000000,
    marketing: 300000,
    maintenance: 200000,
    other: 200000,
    note: "Booth satu operator; kebutuhan biaya pemilik tetap dihitung terpisah.",
    pros: [
      "Ruang dan inventaris relatif terbatas.",
      "Menu singkat mempercepat pelatihan operator.",
    ],
    cons: [
      "Satu operator absen dapat menghentikan penjualan.",
      "Lokasi tertutup hujan atau akses parkir buruk mengurangi transaksi.",
    ],
  },
  laundry: {
    archetype: "laundry",
    unit: "kg/hari",
    drivers: [45, 80, 120],
    capacity: 150,
    ticket: 8000,
    cogsRate: 0,
    unitCost: 2200,
    employees: 2,
    salary: 3300000,
    rent: 2500000,
    utilities: 500000,
    equipment: 65000000,
    fitout: 12000000,
    inventory: 2000000,
    marketing: 400000,
    maintenance: 600000,
    other: 400000,
    note: "2 pasang mesin; kapasitas efektif 150 kg/hari asumsi dibatasi finishing. Rp2.200/kg mencakup bahan, air, energi produksi dan kemasan; utilitas tetap hanya lampu/internet.",
    pros: [
      "Pelanggan rumah tangga dapat kembali secara berkala.",
      "Volume kg dan biaya per kg dapat dicatat setiap hari.",
    ],
    cons: [
      "Mesin berhenti membuat order menumpuk dan memicu kompensasi.",
      "Bottleneck setrika/finishing dapat lebih rendah dari kapasitas mesin.",
    ],
  },
  courier: {
    archetype: "courier",
    unit: "paket/hari",
    drivers: [30, 60, 100],
    capacity: 180,
    ticket: 20000,
    cogsRate: 0,
    unitCost: 350,
    employees: 1,
    salary: 3300000,
    rent: 2000000,
    utilities: 500000,
    equipment: 10000000,
    fitout: 3000000,
    inventory: 0,
    marketing: 300000,
    maintenance: 200000,
    other: 300000,
    note: "Counter kecil satu staf plus pemilik; ongkir rata-rata Rp20.000 dan komisi 20% merupakan asumsi mix kiriman. Rp350/paket untuk bahan admin/packing ringan.",
    pros: [
      "Tidak perlu membeli stok barang dagangan.",
      "Seller berulang dapat memberi volume terjadwal.",
    ],
    cons: [
      "GMV ongkir sebagian besar milik jaringan, bukan penghasilan agen.",
      "Perubahan layanan, diskon dan jadwal pickup langsung memengaruhi komisi.",
    ],
  },
  pharmacy: {
    archetype: "pharmacy",
    unit: "transaksi/hari",
    drivers: [45, 75, 115],
    capacity: 160,
    ticket: 65000,
    cogsRate: 0.76,
    unitCost: 0,
    employees: 3,
    salary: 4500000,
    rent: 5000000,
    utilities: 1100000,
    equipment: 60000000,
    fitout: 70000000,
    inventory: 160000000,
    marketing: 500000,
    maintenance: 400000,
    other: 1500000,
    note: "Apotek lingkungan; payroll 3 orang rata-rata Rp4,5 juta adalah anggaran termasuk tenaga profesional, bukan standar gaji/izin. Jadwal apoteker harus divalidasi.",
    pros: [
      "Kebutuhan kesehatan berulang mendukung pembelian rutin.",
      "Bauran resep dan OTC dapat dianalisis per kategori.",
    ],
    cons: [
      "Stok kedaluwarsa mengikat kas dan tidak seluruhnya bisa diretur.",
      "Kewajiban apoteker, penyimpanan dan perizinan membatasi penghematan biaya.",
    ],
  },
  optical: {
    archetype: "service",
    unit: "pesanan/hari",
    drivers: [3, 6, 10],
    capacity: 16,
    ticket: 450000,
    cogsRate: 0.55,
    unitCost: 0,
    employees: 2,
    salary: 4000000,
    rent: 5000000,
    utilities: 700000,
    equipment: 85000000,
    fitout: 70000000,
    inventory: 90000000,
    marketing: 1000000,
    maintenance: 500000,
    other: 600000,
    note: "Optik kecil; ticket mencakup frame dan lensa, penjualan lumpy dan kebutuhan tenaga terampil.",
    pros: [
      "Penjualan lensa/frame menyediakan bauran harga.",
      "Layanan pemeriksaan dapat membangun pelanggan ulang.",
    ],
    cons: [
      "Inventaris frame lambat laku menahan kas.",
      "Kesalahan ukuran resep menimbulkan remake dan retur.",
    ],
  },
  barber: {
    archetype: "service",
    unit: "pelanggan/hari",
    drivers: [10, 18, 26],
    capacity: 32,
    ticket: 55000,
    cogsRate: 0.12,
    unitCost: 0,
    employees: 2,
    salary: 4400000,
    rent: 3000000,
    utilities: 800000,
    equipment: 40000000,
    fitout: 25000000,
    inventory: 1500000,
    marketing: 500000,
    maintenance: 400000,
    other: 400000,
    note: "2 kursi, 8 jam, kapasitas maksimum 32 haircut pada 30 menit; istirahat mengurangi kapasitas nyata. Gaji tetap tanpa komisi barber tambahan.",
    pros: [
      "Bahan habis pakai relatif kecil per layanan.",
      "Pelanggan dapat kembali kepada barber yang konsisten.",
    ],
    cons: [
      "Barber keluar dapat membawa pelanggan dan mengurangi kapasitas.",
      "Kursi kosong tetap menanggung gaji dan sewa.",
    ],
  },
  game: {
    archetype: "service",
    unit: "sesi/hari",
    drivers: [12, 22, 32],
    capacity: 36,
    ticket: 40000,
    cogsRate: 0.05,
    unitCost: 0,
    employees: 1,
    salary: 3300000,
    rent: 3000000,
    utilities: 1300000,
    equipment: 80000000,
    fitout: 18000000,
    inventory: 0,
    marketing: 300000,
    maintenance: 900000,
    other: 500000,
    note: "6 station × 12 jam / sesi 2 jam = maksimum 36 sesi/hari; hak penggunaan komersial game wajib dikonfirmasi.",
    pros: [
      "Slot waktu memungkinkan perhitungan utilisasi jelas.",
      "Reservasi dapat mengurangi station kosong pada jam ramai.",
    ],
    cons: [
      "Konsol/controller aus dan harus diganti.",
      "Harga konsol tidak mencakup lisensi game untuk pemakaian komersial.",
    ],
  },
  membership: {
    archetype: "membership",
    unit: "member aktif/bulan",
    drivers: [100, 170, 250],
    capacity: 300,
    ticket: 275000,
    cogsRate: 0.08,
    unitCost: 0,
    employees: 3,
    salary: 3600000,
    rent: 6500000,
    utilities: 2200000,
    equipment: 180000000,
    fitout: 50000000,
    inventory: 0,
    marketing: 1000000,
    maintenance: 1500000,
    other: 700000,
    note: "Gym komunitas; member aktif adalah pelanggan bulanan, bukan kunjungan harian. Kapasitas 300 harus diuji dengan okupansi jam puncak.",
    pros: [
      "Membership memberi jadwal pendapatan berulang.",
      "Retensi bisa diukur tiap kohort bulanan.",
    ],
    cons: [
      "Churn membuat penjualan baru hanya mengganti member keluar.",
      "Kerusakan alat serta keselamatan pengguna menuntut maintenance rutin.",
    ],
  },
  automotive: {
    archetype: "automotive",
    unit: "job/hari",
    drivers: [5, 10, 16],
    capacity: 20,
    ticket: 150000,
    cogsRate: 0.5,
    unitCost: 0,
    employees: 2,
    salary: 4000000,
    rent: 3000000,
    utilities: 800000,
    equipment: 55000000,
    fitout: 20000000,
    inventory: 15000000,
    marketing: 300000,
    maintenance: 700000,
    other: 500000,
    note: "Bengkel motor 2 bay; ticket jasa+suku cadang dan kapasitas tergantung jenis servis.",
    pros: ["Perawatan berkala menghasilkan repeat customer."],
    cons: ["Diagnosis salah memicu pengerjaan ulang dan klaim."],
  },
};
const businessProfile: Record<string, string> = {
  laundry: "laundry",
  kelontong: "retail",
  franchise: "beverage",
  game: "game",
  gym: "membership",
  coffee: "beverage",
  barber: "barber",
  angkringan: "kiosk",
};
const brandProfile: Record<string, string> = {
  alfamart: "retail",
  indomaret: "retail",
  mixue: "beverage",
  "es-teh-indonesia": "beverage",
  "teh-poci": "kiosk",
  "janji-jiwa": "beverage",
  "point-coffee": "beverage",
  "fore-coffee": "beverage",
  "rocket-chicken": "restaurant",
  sabana: "kiosk",
  "geprek-bensu": "restaurant",
  "baba-rafi": "kiosk",
  "mie-gacoan": "restaurant",
  "apotek-k24": "pharmacy",
  jnt: "courier",
  sicepat: "courier",
  "simply-fresh": "laundry",
  laundryklin: "laundry",
  mrklin: "laundry",
  miniso: "retail",
  kopigo: "beverage",
  bingxue: "beverage",
  "ayam-geprek-sai": "restaurant",
  "nyoklat-klasik": "kiosk",
  "tahu-go": "kiosk",
  "doyan-ayam": "restaurant",
  alfamidi: "retail",
  lawson: "retail",
  omi: "retail",
  "212-mart": "retail",
  basmalah: "retail",
  dbesto: "restaurant",
  hisana: "kiosk",
  jne: "courier",
  "lion-parcel": "courier",
  "ninja-xpress": "courier",
  anteraja: "courier",
  wahana: "courier",
  "kimia-farma": "pharmacy",
  "century-pharma": "pharmacy",
  pasfarma: "pharmacy",
  "optik-loka": "optical",
  "viva-generik": "pharmacy",
  farmapoint: "pharmacy",
  haus: "beverage",
  yomart: "retail",
  familymart: "retail",
  "apotek-f21": "pharmacy",
  "griya-farma": "pharmacy",
  "optik-melawai": "optical",
};
function buildModel(id: string, name: string, p: Profile): Model {
  const values: Record<InputKey, number> = {
    units: p.drivers[1],
    ticket: p.ticket,
    days: 30,
    commissionRate: 0.2,
    commissionFixed: 2500,
    cogsRate: p.cogsRate,
    unitCost: p.unitCost,
    employees: p.employees,
    salary: p.salary,
    payrollLoad: 0.12,
    ownerPay: 1500000,
    rent: p.rent,
    utilities: p.utilities,
    logistics: p.archetype === "courier" ? 400000 : 0,
    marketing: p.marketing,
    maintenance: p.maintenance,
    other: p.other,
    royaltyRate: 0,
    recurringFee: 0,
    profitShare: 0,
    equipment: p.equipment,
    fitout: p.fitout,
    entryFee: 0,
    deposit: p.rent * 2,
    inventory: p.inventory,
    reserveMonths: 3,
    taxReserve: 0,
    debtService: 0,
    replacementReserve: 0,
  };
  const notes: Partial<Record<InputKey, string>> = {
    units: p.note,
    ticket: "Bauran harga asumsi; validasi struk dan menu sekitar lokasi.",
    days: "30 hari/bulan steady-state, tidak mengasumsikan pertumbuhan.",
    salary:
      "Anggaran per staf; bandingkan UMK/keahlian lokal. BPS nasional hanya konteks.",
    payrollLoad:
      "Cadangan benefit/THR 12% asumsi perencanaan, bukan tarif kewajiban hukum.",
    ownerPay:
      "Imbalan waktu pemilik Rp1,5 juta/bulan sebagai asumsi biaya; sesuaikan jam kerja.",
    rent: "Sewa bulanan asumsi lokasi lingkungan; belum merupakan survei properti.",
    deposit: "Deposit sewa 2 bulan, asumsi terpisah dari biaya sewa bulanan.",
    inventory:
      "Persediaan awal di modal kerja; HPP bulanan tetap dihitung saat terjual, bukan beban awal dua kali.",
    reserveMonths:
      "Cadangan 3 bulan biaya tetap; bukan biaya tambahan bulanan.",
    equipment: "Anggaran alat/setup format pembanding. Belum quotation vendor.",
    fitout: "Anggaran interior dan instalasi; belum RAB lokasi.",
    entryFee:
      "Belum ada fee terverifikasi di model default; nol adalah asumsi biaya minimum, bukan klaim bebas biaya.",
    royaltyRate:
      "Nol hanya asumsi sampai proposal diterima; uji sensitivitas fee. Lihat fakta publik.",
    taxReserve: "0: model sebelum pajak penghasilan; bukan bebas pajak.",
    debtService: "0: asumsi modal sendiri, belum cicilan.",
    replacementReserve:
      "0: belum cadangan penggantian aset besar; maintenance rutin sudah dihitung.",
    profitShare:
      "0: belum pembagian laba pihak manajemen, kecuali input eksplisit.",
    utilities: "Anggaran tetap; konsumsi dan golongan tarif wajib divalidasi.",
    commissionRate: "Asumsi 20% dari nilai ongkir; bukan rate kontrak brand.",
    commissionFixed:
      "Asumsi Rp2.500/paket, tidak dipakai untuk model persentase.",
    unitCost:
      p.archetype === "laundry" ? p.note : "Biaya per unit di luar rasio HPP.",
    cogsRate:
      "Rasio HPP model mencakup pembelian bahan/barang dan waste dasar.",
    recurringFee:
      "0: biaya sistem/perpanjangan belum diketahui; tambahkan setelah quotation.",
  };
  const inputs = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      input(
        value,
        notes[key as InputKey] ??
          "Anggaran Cek Bisnis untuk format usaha ini; sesuaikan quotation.",
        ["salary", "payrollLoad"].includes(key)
          ? ["bps-wage"]
          : key === "utilities"
            ? ["esdm-electricity"]
            : [],
      ),
    ]),
  ) as Inputs;
  const mode =
    p.archetype === "courier"
      ? "commission-rate"
      : p.archetype === "membership"
        ? "membership"
        : "sales";
  const model: Model = {
    id,
    name,
    archetype: p.archetype,
    mode,
    unit: p.unit,
    location: "Asumsi nasional — lokasi lingkungan, belum survei",
    inputs,
    capacity: p.capacity,
    capacityNote: p.note,
    scenarios: [
      {
        id: "conservative",
        name: "Konservatif",
        overrides: { units: p.drivers[0] },
        rationale: "Volume rendah; biaya tetap dan harga tetap.",
      },
      {
        id: "base",
        name: "Dasar",
        overrides: { units: p.drivers[1] },
        rationale: "Hipotesis volume kerja, bukan hasil observasi outlet.",
      },
      {
        id: "optimistic",
        name: "Optimistis",
        overrides: { units: p.drivers[2] },
        rationale:
          "Volume lebih tinggi, masih dalam batas kapasitas; tanpa menaikkan harga atau komisi.",
      },
    ],
    limitations: [
      "Steady-state: volume tetap, tanpa ramp-up, inflasi atau nilai jual kembali aset.",
      "Cash flow setelah biaya model; belum pajak, cicilan dan penggantian aset besar kecuali diisi.",
      "Fee/komisi yang belum diketahui harus diganti dengan kontrak sebelum keputusan.",
      "Pendapatan asumsi net pajak penjualan; settlement platform belum dimodelkan terpisah.",
    ],
  };
  return model;
}
function calibrate(id: string, m: Model) {
  const set = (
    key: InputKey,
    value: number,
    note: string,
    official = false,
  ) => {
    m.inputs[key] = input(
      value,
      note,
      official ? [`brand-${id}`] : [],
      official ? "official" : "estimate",
    );
  };
  if (id === "alfamart") {
    set(
      "equipment",
      405000000,
      "Sisa alokasi paket Rp450 juta setelah fee Rp45 juta; mencakup seluruh instalasi paket, bukan harga mesin saja.",
    );
    set(
      "fitout",
      0,
      "Instalasi paket sudah masuk alokasi setup; biaya tambahan lokasi belum diketahui.",
    );
    set(
      "entryFee",
      45000000,
      "Termasuk paket Rp450 juta; dipecah tanpa double count.",
      true,
    );
    m.royaltyTiers = [
      { from: 0, to: 150e6, rate: 0 },
      { from: 150e6, to: 175e6, rate: 0.01 },
      { from: 175e6, to: 200e6, rate: 0.02 },
      { from: 200e6, to: 250e6, rate: 0.03 },
      { from: 250e6, to: null, rate: 0.04 },
    ];
    m.limitations.push(
      "Royalti Alfamart progresif resmi, belum pajak atas royalti. Model memilih paket 36 rak; stok awal tambahan asumsi karena cakupan publik tidak eksplisit.",
    );
  }
  if (id === "teh-poci") {
    set(
      "equipment",
      8000000,
      "Modal contoh brand Paket Roda Kecil, dipakai sebagai biaya paket/setup.",
      true,
    );
    set("fitout", 1000000, "Instalasi lokal tambahan asumsi.");
    set("ticket", 5000, "Asumsi harga cup untuk rekonstruksi volume.");
    set(
      "cogsRate",
      0.4,
      "Rasio 4,2/10,5 juta diturunkan dari contoh brand; tetap estimasi saat dipakai untuk outlet lain.",
    );
    m.scenarios.forEach((s, i) => {
      s.overrides.units = [50, 70, 100][i];
    });
    set("units", 70, "Hipotesis 70 cup/hari, bukan penjualan aktual.");
  }
  if (id === "kopigo") {
    set(
      "equipment",
      50000000,
      "Paket normal termasuk alat, lisensi dan bahan awal.",
      true,
    );
    set("fitout", 10000000, "Tambahan renovasi lokasi asumsi.");
    set(
      "inventory",
      0,
      "Bahan awal termasuk paket; modal kerja kas tetap terpisah.",
    );
    set(
      "ticket",
      15000,
      "Rata-rata model dalam rentang menu publik; bukan harga rata-rata aktual.",
    );
    set(
      "recurringFee",
      500000,
      "Cadangan software/perpanjangan Rp500 ribu; tarif aktual belum terkonfirmasi.",
    );
  }
  if (id === "sabana") {
    set(
      "equipment",
      22000000,
      "Paket kemitraan resmi, bukan harga alat terpisah.",
      true,
    );
    set("royaltyRate", 0, "FAQ resmi menyatakan free royalty.", true);
    set("ticket", 15000, "Bauran makanan/kombinasi asumsi.");
  }
  if (id === "nyoklat-klasik") {
    set(
      "equipment",
      14000000,
      "Paket Container, termasuk booth/peralatan.",
      true,
    );
    set("royaltyRate", 0, "Free royalty dalam daftar paket.", true);
  }
  if (id === "mrklin") {
    set(
      "equipment",
      95870000,
      "Paket Bronze 4 mesin; harga publik dapat berubah.",
      true,
    );
  }
  if (id === "farmapoint") {
    set(
      "entryFee",
      80000000,
      "Listing pihak ketiga; belum jelas termasuk paket, dimodelkan tambahan konservatif.",
    );
  }
  if (id === "sicepat") {
    m.mode = "commission-fixed";
    m.limitations.push(
      "Rp2.500/paket adalah asumsi yang belum terverifikasi; lakukan uji komisi dengan kontrak cabang.",
    );
  }
  if (id === "kelontong") {
    set(
      "deposit",
      4000000,
      "Asumsi deposit 2 bulan dari sewa toko kecil Rp2 juta.",
    );
    set(
      "utilities",
      1000000,
      "Listrik toko kecil + kulkas, anggaran bukan tagihan aktual.",
    );
    set("employees", 1, "Satu staf plus waktu pemilik.");
    set("rent", 2000000, "Toko lingkungan kecil, asumsi.");
    set("equipment", 18000000, "Rak/kulkas/POS anggaran.");
    set("fitout", 7000000, "Instalasi toko kecil.");
    set("inventory", 45000000, "Stok awal asumsi.");
    m.scenarios.forEach((s, i) => {
      s.overrides.units = [45, 75, 110][i];
    });
    set("units", 75, "Hipotesis pelanggan harian.");
  }
  if (id === "angkringan") {
    set("ticket", 12000, "Rata-rata pembelian asumsi.");
    set("cogsRate", 0.55, "HPP dan waste 55% asumsi.");
    set("rent", 900000, "Tempat gerobak lingkungan, asumsi.");
  }
  if (id === "coffee")
    set("ticket", 28000, "Bauran coffee booth independen, asumsi menu.");
  return m;
}
export const franchiseRows = [
  ...new Map(
    [...baseFile.franchises, ...extraFile.franchises].map((f) => [f.id, f]),
  ).values(),
];
export const dossiers: Dossier[] = [
  ...franchiseRows.map((f) => {
    const p = profiles[brandProfile[f.id]];
    if (!p) throw new Error(`Missing explicit financial profile: ${f.id}`);
    const research = getResearch(f.id, f.name, f.officialUrl);
    const model = calibrate(f.id, buildModel(f.id, f.name, p));
    return {
      id: f.id,
      name: f.name,
      kind: "franchise" as const,
      href: `/franchise/${f.id}`,
      model,
      research,
      pros: p.pros,
      cons: p.cons,
      operationalRisks: [
        ...p.cons,
        `${f.name}: persetujuan lokasi, pasokan dan hak wilayah harus diperiksa langsung.`,
      ],
      financialRisks: [
        "Fee yang belum dikonfirmasi dapat menambah modal dan memperpanjang payback.",
        "Tiga bulan cadangan tidak menjamin cukup jika volume gagal mencapai BEP.",
      ],
      locationDependency:
        p.archetype === "courier"
          ? "Hitung seller aktif, paket aktual dan jadwal pickup; jumlah penduduk bukan volume paket."
          : "Ukur transaksi pada jam operasi, akses/parkir dan kompetitor dengan menu/harga sebanding.",
      executionDifficulty: ["pharmacy", "restaurant"].includes(p.archetype)
        ? "Tinggi — staf terampil, stok dan kepatuhan operasional."
        : "Menengah — kontrol kas, layanan dan utilisasi harian.",
    };
  }),
  ...businessFile.businesses.map((b) => {
    const p = profiles[businessProfile[b.id]];
    const model = calibrate(b.id, buildModel(b.id, b.name, p));
    const research: Research = {
      status: "open",
      note: "Semua unit economics usaha mandiri adalah estimasi Cek Bisnis. Harga vendor dan statistik publik hanya mendukung komponen tertentu, bukan laba usaha.",
      facts: [],
      sources: industrySources.filter((s) => b.sourceIds.includes(s.id)),
      corrections: [
        "Rentang balik modal lama dihentikan; hasil kini dihitung dari cash flow dan total modal.",
        "Faktor demand/capex kota tidak digunakan sebagai proyeksi otomatis.",
      ],
    };
    return {
      id: b.id,
      name: b.name,
      kind: "business" as const,
      href: `/usaha/${b.slug}`,
      model,
      research,
      pros: p.pros,
      cons: p.cons,
      operationalRisks: [...p.cons, ...b.risks],
      financialRisks: [
        "Modal kerja dan kompensasi pemilik memengaruhi hasil.",
        "Omzet rendah dapat menghabiskan cadangan kas sebelum bisnis stabil.",
      ],
      locationDependency: b.locationSignal,
      executionDifficulty: p.note,
    };
  }),
];
export const getDossier = (id: string) => {
  const d = dossiers.find((d) => d.id === id);
  if (!d) throw new Error(`Unknown dossier ${id}`);
  return d;
};
export const sourceList = (d: Dossier) => [
  ...new Map(
    [
      ...d.research.sources,
      ...industrySources.filter((s) =>
        Object.values(d.model.inputs).some((i) => i.sourceIds.includes(s.id)),
      ),
    ].map((s) => [s.id, s]),
  ).values(),
];
export const confidence = (d: Dossier) => {
  const critical = [
    "units",
    "ticket",
    "cogsRate",
    "equipment",
    "entryFee",
    "salary",
    "rent",
    "royaltyRate",
    "commissionRate",
  ] as InputKey[];
  const count = critical.filter((k) =>
    ["official", "verified"].includes(d.model.inputs[k].type),
  ).length;
  return {
    label: count >= 7 ? "Tinggi" : count >= 3 ? "Menengah" : "Rendah",
    reason: `${count}/${critical.length} input kritis model didukung publikasi langsung/pihak ketiga. Volume dan biaya lokal tetap perlu survei.`,
    lastResearched: RESEARCH_DATE,
  };
};
export const modelSummary = (id: string) => calculate(getDossier(id).model);
