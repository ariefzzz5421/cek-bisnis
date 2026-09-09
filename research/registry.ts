import type { EvidenceType } from "../financial-models/engine";
export const RESEARCH_DATE = "2026-09-08";
export type ResearchSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: EvidenceType;
  publishedAt: string | null;
  lastVerifiedAt: string | null;
  supports: string;
  status: "reviewed" | "limited" | "unavailable";
};
export type Fact = {
  label: string;
  value: number | string | null;
  unit?: string;
  type: EvidenceType;
  sourceId?: string;
  note: string;
};
export type Research = {
  status: "open" | "closed" | "unconfirmed";
  note: string;
  sources: ResearchSource[];
  facts: Fact[];
  corrections: string[];
};
const urls: Record<string, string> = {
  alfamart: "https://waralaba.alfamart.co.id/about/memiliki-alfamart",
  indomaret:
    "https://www.indomaret.co.id/wp-content/uploads/2025/02/pdf/BrosurIndomaret-2026.pdf",
  "fore-coffee":
    "https://fore.coffee/id/menjawab-pertanyaan-yang-sering-kami-terima-apakah-fore-coffee-membuka-franchise/",
  "point-coffee": "https://pointcoffee.id/",
  sabana: "https://sabana.co.id/?page_id=10",
  "teh-poci": "https://estehpoci.id/jadi-juragan",
  kopigo: "https://kemitraan.kopigo.id/",
  "nyoklat-klasik": "https://nyoklatklasik.co.id/paket/",
  "lion-parcel": "https://lionparcel.com/info-mitra/berapa-harga-modal-agen",
  jne: "https://www.jne.co.id/agent",
  wahana: "https://wahana.com/promo-buka-agen-awal-tahun-2026",
  mrklin: "https://mrklinlaundry.com/",
  pasfarma: "https://apotekpas.com/detail-kemitraan/",
  "viva-generik": "https://shop.vivaapotek.co.id/about-us",
  "century-pharma": "https://century-pharma.com/",
};
const unavailable = new Set([
  "mixue",
  "es-teh-indonesia",
  "janji-jiwa",
  "geprek-bensu",
  "sicepat",
  "laundryklin",
  "tahu-go",
  "lawson",
  "basmalah",
  "dbesto",
  "hisana",
  "optik-loka",
  "haus",
  "yomart",
  "familymart",
  "apotek-f21",
]);
const confirmed = new Set([
  "alfamart",
  "indomaret",
  "teh-poci",
  "sabana",
  "kopigo",
  "nyoklat-klasik",
  "baba-rafi",
  "jne",
  "wahana",
  "simply-fresh",
  "mrklin",
  "bingxue",
  "ayam-geprek-sai",
  "doyan-ayam",
  "omi",
  "pasfarma",
  "lion-parcel",
]);
const notes: Record<string, string> = {
  "fore-coffee":
    "Fore menyatakan tidak membuka franchise atau kemitraan (13 Juli 2026). Simulasi hanya kedai kopi pembanding, bukan penawaran Fore.",
  "mie-gacoan":
    "Situs yang tersimpan menampilkan halaman under construction. Paket waralaba publik dan rentang Rp125–400 juta tidak terverifikasi; model hanya restoran mi pembanding.",
  "point-coffee":
    "Situs menjelaskan jaringan kopi made-to-order. Tidak ditemukan penawaran franchise mandiri pada halaman yang ditinjau.",
  kopigo:
    "Paket situs berubah menjadi Rp30/40/50 juta dengan all-in Rp40–80 juta. Penawaran promosi bersyarat; angka laba leaderboard lama tidak dipakai.",
  "teh-poci":
    "Situs menampilkan simulasi modal Rp8 juta. Label ROI dalam bulan sebenarnya payback; baris optimistis mencantumkan 2,1 bulan walaupun pembagian modal/laba tidak cocok. Model dihitung sendiri.",
  "lion-parcel":
    "Artikel resmi 18 Februari 2026 terakses tetapi isi finansial tidak terambil; formulir ketentuan membutuhkan JavaScript. Rate 20% model adalah asumsi, bukan komisi kontrak.",
  wahana:
    "Promo Rp1,3 juta berasal dari publikasi 31 Desember 2025. Masa berlaku tidak terkonfirmasi; jangan gunakan promosi sebagai harga saat ini. Klaim hingga 25% merupakan batas atas.",
  jne: "Sumber resmi menyebut biaya perlengkapan dan jaminan bergantung cabang. Peralatan/ruang 12 m² dijelaskan; beberapa spesifikasi sistem lama sehingga konfirmasi ulang.",
  jnt: "Halaman resmi menjelaskan layanan pengiriman, bukan kontrak keagenan 20% universal. Nominal paket dan komisi lama dikarantina.",
  sicepat:
    "Klaim Rp2.500/paket belum terverifikasi. Model memakai komisi tetap berlabel estimasi; satuannya tidak diperlakukan sebagai persen.",
  indomaret:
    "Brosur resmi 2026 tersedia sebagai PDF gambar. Angka dalam arsip belum ditranskripsi ulang dengan bukti; input model tetap estimasi sampai konfirmasi.",
  alfamart:
    "Situs memuat paket Rp300–500 juta di luar properti dan fee Rp45 juta termasuk paket. Luas contoh 30–100 m² berbeda dengan syarat umum 100 m² area sales; konfirmasi format.",
  mrklin:
    "Alamat situs lama gagal; situs aktif mrklinlaundry.com menampilkan Bronze 2 mesin Rp59,87 juta dan 4 mesin Rp95,87 juta. Klaim payback promosi tidak dipakai sebagai hasil.",
  "viva-generik":
    "Merek berubah menjadi VIVA Apotek pada 2022 menurut halaman perusahaan. Hak kemitraan publik belum terkonfirmasi.",
  farmapoint:
    "Portal pameran mencantumkan modal minimal Rp350 juta dan fee Rp80 juta. Ini listing pihak ketiga, belum jelas apakah fee termasuk modal; model memisahkannya secara konservatif.",
  "griya-farma":
    "Halaman perusahaan dapat dibuka tetapi publikasi yang terlihat lama. Royalti 1,5% dari profit dalam arsip tidak dipakai sebagai fakta terverifikasi.",
  miniso:
    "Situs global tidak membuktikan paket waralaba Indonesia atau bagi hasil harian. Simulasi retail pembanding, bukan penawaran merek.",
  "kimia-farma":
    "Situs korporasi tidak cukup untuk membuktikan fee/royalti unit mitra. Model apotek perlu quotation dan rincian izin serta apoteker.",
  bingxue:
    "Halaman kemitraan tersedia; margin 60% yang pernah dicantumkan tidak ditemukan dalam teks yang ditinjau. HPP model adalah asumsi.",
};
function fact(
  label: string,
  value: number | string,
  unit: string,
  sourceId: string,
  note: string,
): Fact {
  return { label, value, unit, type: "official", sourceId, note };
}
const publicFacts: Record<string, Fact[]> = {
  alfamart: [
    fact(
      "Paket gerai baru minimum",
      300000000,
      "IDR",
      "brand-alfamart",
      "Contoh 9 rak, 30 m²; di luar properti, konfirmasi kelayakan format.",
    ),
    fact(
      "Paket 45 rak",
      500000000,
      "IDR",
      "brand-alfamart",
      "100 m² area sales; di luar properti.",
    ),
    fact(
      "Fee termasuk paket",
      45000000,
      "IDR",
      "brand-alfamart",
      "Masa 5 tahun; jangan dijumlahkan lagi dengan paket.",
    ),
    fact(
      "Durasi fee",
      5,
      "tahun",
      "brand-alfamart",
      "Bukan jaminan perpanjangan.",
    ),
    fact(
      "Royalti",
      "Progresif: 0% s.d. Rp150 jt; 1%/2%/3%/4% per lapisan berikutnya.",
      "",
      "brand-alfamart",
      "Batas Rp175/200/250 juta; belum termasuk pajak.",
    ),
  ],
  "fore-coffee": [
    fact(
      "Status kemitraan",
      "Tidak dibuka",
      "",
      "brand-fore-coffee",
      "Pernyataan perusahaan 13 Juli 2026.",
    ),
  ],
  "teh-poci": [
    fact(
      "Modal contoh brand",
      8000000,
      "IDR",
      "brand-teh-poci",
      "Simulasi Paket Roda Kecil; bukan quotation semua format.",
    ),
    fact(
      "Omzet contoh brand",
      10500000,
      "IDR/bulan",
      "brand-teh-poci",
      "Simulasi pemasaran, bukan penjualan outlet yang diaudit.",
    ),
    fact(
      "Biaya variabel contoh",
      4200000,
      "IDR/bulan",
      "brand-teh-poci",
      "Bahan, ongkir, kemasan untuk contoh omzet Rp10,5 juta.",
    ),
  ],
  kopigo: [
    fact(
      "Paket normal",
      50000000,
      "IDR",
      "brand-kopigo",
      "Paket awal termasuk perlengkapan; tidak menambahkan harga mesin dua kali.",
    ),
    fact(
      "Total modal publik",
      "Rp40–80 juta",
      "IDR",
      "brand-kopigo",
      "Rentang bergantung tier dan promosi.",
    ),
    fact(
      "Lisensi paket",
      3,
      "tahun",
      "brand-kopigo",
      "Software premium 1 tahun; perpanjangan perlu quotation.",
    ),
  ],
  sabana: [
    fact(
      "Paket kemitraan",
      22000000,
      "IDR",
      "brand-sabana",
      "Di luar biaya lokal yang tidak dijelaskan.",
    ),
    fact(
      "Royalti",
      0,
      "rasio",
      "brand-sabana",
      "FAQ menyebut tidak bagi hasil; pembelian bahan dari pusat.",
    ),
  ],
  "nyoklat-klasik": [
    fact(
      "Paket Silver",
      12000000,
      "IDR",
      "brand-nyoklat-klasik",
      "Harga publik tanpa tanggal berlaku; konfirmasi.",
    ),
    fact(
      "Paket Minibar",
      17000000,
      "IDR",
      "brand-nyoklat-klasik",
      "Termasuk booth dan perlengkapan yang dirinci.",
    ),
    fact(
      "Royalti",
      0,
      "rasio",
      "brand-nyoklat-klasik",
      "Free royalty tertulis pada paket.",
    ),
  ],
  mrklin: [
    fact(
      "Bronze 2 mesin",
      59870000,
      "IDR",
      "brand-mrklin",
      "Satu washer + satu dryer; harga promosi perlu konfirmasi.",
    ),
    fact(
      "Bronze 4 mesin",
      95870000,
      "IDR",
      "brand-mrklin",
      "Dua washer + dua dryer.",
    ),
  ],
  jne: [
    fact(
      "Luas minimum",
      12,
      "m²",
      "brand-jne",
      "Ukuran 3×4 m; kios khusus menyesuaikan.",
    ),
    fact(
      "Jarak counter",
      1,
      "km",
      "brand-jne",
      "Syarat halaman keagenan; persetujuan cabang tetap diperlukan.",
    ),
  ],
  wahana: [
    fact(
      "Komisi maksimum publik",
      0.25,
      "rasio",
      "brand-wahana",
      "Hingga 25%; bukan rate yang dijamin untuk semua kiriman.",
    ),
  ],
  farmapoint: [
    {
      label: "Modal minimum listing",
      value: 350000000,
      unit: "IDR",
      type: "verified",
      sourceId: "brand-farmapoint",
      note: "Listing WaralabaKu; bukan quotation resmi. Fee Rp80 juta tercantum terpisah, cakupan belum jelas.",
    },
  ],
};
export function getResearch(id: string, name: string, url: string): Research {
  const status =
    id === "fore-coffee"
      ? "closed"
      : confirmed.has(id)
        ? "open"
        : "unconfirmed";
  const note =
    notes[id] ??
    (unavailable.has(id)
      ? "Sumber lama tidak dapat diperiksa lengkap. Tidak ada nominal kontrak yang dianggap resmi; model format usaha menggunakan asumsi terbuka."
      : "Halaman perusahaan ditinjau untuk konteks usaha. Nominal investasi, laba, kontrak dan biaya outlet belum memiliki bukti memadai; simulasi bukan quotation merek.");
  const source: ResearchSource = {
    id: `brand-${id}`,
    title: `${name} — ${confirmed.has(id) ? "informasi kemitraan" : "halaman perusahaan / penelusuran"}`,
    publisher: name,
    url: urls[id] ?? url,
    sourceType: id === "farmapoint" ? "verified" : "official",
    publishedAt:
      id === "wahana"
        ? "2025-12-31"
        : id === "fore-coffee"
          ? "2026-07-13"
          : id === "lion-parcel"
            ? "2026-02-18"
            : null,
    lastVerifiedAt: unavailable.has(id) ? null : RESEARCH_DATE,
    supports: note,
    status: unavailable.has(id)
      ? "unavailable"
      : publicFacts[id]
        ? "reviewed"
        : "limited",
  };
  const facts = publicFacts[id] ?? [];
  return {
    status,
    note,
    sources: [source],
    facts: [
      ...facts,
      ...[
        "Fee franchise terpisah",
        "Kontrak terkini",
        "Ukuran outlet wajib",
        "Laba aktual outlet",
        "Komisi / royalti kontrak",
      ]
        .filter(
          (label) =>
            !(
              id === "alfamart" &&
              [
                "Fee franchise terpisah",
                "Kontrak terkini",
                "Komisi / royalti kontrak",
              ].includes(label)
            ) &&
            !(id === "kopigo" && label === "Kontrak terkini") &&
            !(id === "jne" && label === "Ukuran outlet wajib") &&
            !(
              ["sabana", "nyoklat-klasik"].includes(id) &&
              label === "Komisi / royalti kontrak"
            ),
        )
        .map((label) => ({
          label,
          value: null,
          type: "unknown" as const,
          note: "Belum cukup bukti untuk menetapkan nilai resmi. Periksa fakta publik di atas dan gunakan asumsi model di bawah.",
        })),
    ],
    corrections: [
      "Rentang omzet/payback arsip tidak dipakai sebagai fakta atau target kalibrasi.",
      note,
    ],
  };
}
export const industrySources: ResearchSource[] = [
  {
    id: "bps-wage",
    title: "Sakernas Februari 2026",
    publisher: "BPS",
    url: "https://www.bps.go.id/id/pressrelease/2026/05/05/2574/tingkat-pengangguran-terbuka--tpt--sebesar-4-68-persen--rata-rata-upah-buruh-sebesar-3-29-juta-rupiah-.html",
    sourceType: "official",
    publishedAt: "2026-05-05",
    lastVerifiedAt: RESEARCH_DATE,
    status: "reviewed",
    supports:
      "Rata-rata upah nasional Rp3,29 juta; konteks saja, bukan UMK atau gaji wajib suatu kota.",
  },
  {
    id: "esdm-electricity",
    title: "Tarif listrik triwulan III 2026",
    publisher: "ESDM",
    url: "https://www.esdm.go.id/id/media-center/arsip-berita/jaga-daya-beli-menteri-esdm-tarif-listrik-tidak-naik",
    sourceType: "official",
    publishedAt: null,
    lastVerifiedAt: RESEARCH_DATE,
    status: "reviewed",
    supports:
      "Kebijakan tarif tidak naik; jumlah tagihan usaha tetap asumsi konsumsi, bukan angka resmi PLN.",
  },
  {
    id: "sony-ps5",
    title: "Harga PS5 Indonesia mulai Mei 2026",
    publisher: "Sony Interactive Entertainment",
    url: "https://blog.playstation.com/2026/03/27/20260327-ps/",
    sourceType: "official",
    publishedAt: "2026-04-27",
    lastVerifiedAt: RESEARCH_DATE,
    status: "reviewed",
    supports:
      "PS5 disc Rp11.399.000; harga perangkat saja, tidak termasuk TV, lisensi komersial atau interior.",
  },
  {
    id: "laundry-package",
    title: "Paket mesin laundry IFBC 2026",
    publisher: "IFBC",
    url: "https://infofranchiseexpo.com/id/pusat-mesin-laundry-tawarkan-paket-usaha-laundry-self-service-dan-kiloan-di-ifbc-2026-ice-bsd/",
    sourceType: "verified",
    publishedAt: null,
    lastVerifiedAt: RESEARCH_DATE,
    status: "reviewed",
    supports:
      "Konteks paket mesin laundry; kapasitas efektif tergantung load, siklus, pengeringan dan setrika.",
  },
  {
    id: "gym-package",
    title: "Paket gym komersial",
    publisher: "Beyond Strength",
    url: "https://beyondstrength.id/paket-gym",
    sourceType: "official",
    publishedAt: null,
    lastVerifiedAt: RESEARCH_DATE,
    status: "reviewed",
    supports:
      "Harga penawaran alat vendor; bukan total investasi gym atau ramalan pendapatan.",
  },
];
