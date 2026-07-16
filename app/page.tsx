"use client";

import {
  ArrowDown,
  ArrowUpRight,
  BarChart3,
  Calculator,
  Check,
  ChevronRight,
  Coffee,
  Dumbbell,
  Gamepad2,
  Info,
  MapPin,
  PackageOpen,
  RefreshCw,
  Scissors,
  ShieldAlert,
  Shirt,
  ShoppingBasket,
  Sparkles,
  Store,
  Target,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";

type BusinessId =
  | "laundry"
  | "kelontong"
  | "franchise"
  | "game"
  | "gym"
  | "coffee"
  | "barber";

type Business = {
  id: BusinessId;
  name: string;
  short: string;
  category: string;
  summary: string;
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
  capexSplit: { label: string; value: number; color: string }[];
};

type City = {
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
  scores: Record<BusinessId, number>;
};

const businesses: Business[] = [
  {
    id: "laundry",
    name: "Laundry Kiloan",
    short: "Laundry",
    category: "Jasa harian",
    summary: "2 washer + 2 dryer, layanan kiloan dan antar-jemput radius dekat.",
    capex: [70, 110],
    fixedBase: 15,
    rentBase: 3.2,
    staffCount: 2,
    staffCostBase: 3.4,
    variableRate: 0.25,
    avgTicket: 0.04,
    targetRevenue: 32,
    trafficMode: "daily",
    trafficLabel: "order/hari",
    marginLabel: "Margin kontribusi 75%",
    idealRadius: "1–2 km",
    locationSignal: "Kost, kampus, perumahan padat, akses motor mudah",
    capexSplit: [
      { label: "Mesin & utilitas", value: 0.54, color: "#b7f26c" },
      { label: "Renovasi", value: 0.17, color: "#5ce1e6" },
      { label: "Deposit sewa", value: 0.12, color: "#f4b860" },
      { label: "Peralatan", value: 0.09, color: "#aa8cff" },
      { label: "Kas awal", value: 0.08, color: "#ff7d7d" },
    ],
  },
  {
    id: "kelontong",
    name: "Toko Kelontong",
    short: "Kelontong",
    category: "Retail kebutuhan",
    summary: "Toko 35–50 m² dengan stok kebutuhan harian dan pembayaran digital.",
    capex: [55, 130],
    fixedBase: 10.8,
    rentBase: 3,
    staffCount: 1,
    staffCostBase: 3.3,
    variableRate: 0.84,
    avgTicket: 0.045,
    targetRevenue: 92,
    trafficMode: "daily",
    trafficLabel: "struk/hari",
    marginLabel: "Margin kontribusi 16%",
    idealRadius: "300–700 m",
    locationSignal: "Perumahan, jalan pulang kerja, jauh dari minimarket besar",
    capexSplit: [
      { label: "Stok awal", value: 0.53, color: "#b7f26c" },
      { label: "Rak & pendingin", value: 0.2, color: "#5ce1e6" },
      { label: "Deposit sewa", value: 0.12, color: "#f4b860" },
      { label: "POS & CCTV", value: 0.08, color: "#aa8cff" },
      { label: "Kas awal", value: 0.07, color: "#ff7d7d" },
    ],
  },
  {
    id: "franchise",
    name: "Franchise Minuman",
    short: "Franchise",
    category: "F&B cepat saji",
    summary: "Booth minuman 12–20 m² dengan paket brand, alat, dan stok pembuka.",
    capex: [35, 80],
    fixedBase: 13,
    rentBase: 4,
    staffCount: 2,
    staffCostBase: 3.2,
    variableRate: 0.38,
    avgTicket: 0.018,
    targetRevenue: 36,
    trafficMode: "daily",
    trafficLabel: "cup/hari",
    marginLabel: "Margin kontribusi 62%",
    idealRadius: "500 m",
    locationSignal: "Sekolah, pasar, jalan ramai sore, tenant mix makanan",
    capexSplit: [
      { label: "Paket kemitraan", value: 0.42, color: "#b7f26c" },
      { label: "Booth & renovasi", value: 0.22, color: "#5ce1e6" },
      { label: "Deposit sewa", value: 0.16, color: "#f4b860" },
      { label: "Stok awal", value: 0.11, color: "#aa8cff" },
      { label: "Kas awal", value: 0.09, color: "#ff7d7d" },
    ],
  },
  {
    id: "game",
    name: "Rental Game PS5",
    short: "Game",
    category: "Hiburan lokal",
    summary: "6 station PS5, TV 4K, kursi nyaman, jaringan, dan snack counter.",
    capex: [100, 180],
    fixedBase: 15.5,
    rentBase: 4,
    staffCount: 2,
    staffCostBase: 3.3,
    variableRate: 0.12,
    avgTicket: 0.035,
    targetRevenue: 29,
    trafficMode: "daily",
    trafficLabel: "sesi/hari",
    marginLabel: "Margin kontribusi 88%",
    idealRadius: "1–3 km",
    locationSignal: "Kampus, sekolah, kos pria, parkir dan buka malam",
    capexSplit: [
      { label: "Konsol & game", value: 0.47, color: "#b7f26c" },
      { label: "TV & audio", value: 0.23, color: "#5ce1e6" },
      { label: "Interior", value: 0.14, color: "#f4b860" },
      { label: "Jaringan & CCTV", value: 0.08, color: "#aa8cff" },
      { label: "Kas awal", value: 0.08, color: "#ff7d7d" },
    ],
  },
  {
    id: "gym",
    name: "Gym Komunitas",
    short: "Sport",
    category: "Fitness & member",
    summary: "Studio 120–180 m² untuk strength training dan kelas komunitas kecil.",
    capex: [180, 420],
    fixedBase: 28,
    rentBase: 8,
    staffCount: 4,
    staffCostBase: 3.6,
    variableRate: 0.15,
    avgTicket: 0.325,
    targetRevenue: 48,
    trafficMode: "member",
    trafficLabel: "member aktif",
    marginLabel: "Margin kontribusi 85%",
    idealRadius: "3–5 km",
    locationSignal: "Kantor, perumahan muda, parkir cukup, kompetitor tidak premium",
    capexSplit: [
      { label: "Alat fitness", value: 0.55, color: "#b7f26c" },
      { label: "Renovasi", value: 0.2, color: "#5ce1e6" },
      { label: "Deposit sewa", value: 0.1, color: "#f4b860" },
      { label: "Locker & sistem", value: 0.08, color: "#aa8cff" },
      { label: "Kas awal", value: 0.07, color: "#ff7d7d" },
    ],
  },
  {
    id: "coffee",
    name: "Coffee Booth",
    short: "Coffee",
    category: "F&B independen",
    summary: "Booth kopi take-away dengan espresso machine, grinder, dan 8–12 kursi.",
    capex: [45, 100],
    fixedBase: 15,
    rentBase: 4.5,
    staffCount: 2,
    staffCostBase: 3.4,
    variableRate: 0.35,
    avgTicket: 0.026,
    targetRevenue: 38,
    trafficMode: "daily",
    trafficLabel: "order/hari",
    marginLabel: "Margin kontribusi 65%",
    idealRadius: "500 m–1 km",
    locationSignal: "Kantor, kampus, arus komuter, titik nongkrong malam",
    capexSplit: [
      { label: "Mesin & grinder", value: 0.4, color: "#b7f26c" },
      { label: "Booth & interior", value: 0.24, color: "#5ce1e6" },
      { label: "Deposit sewa", value: 0.15, color: "#f4b860" },
      { label: "Stok & alat kecil", value: 0.12, color: "#aa8cff" },
      { label: "Kas awal", value: 0.09, color: "#ff7d7d" },
    ],
  },
  {
    id: "barber",
    name: "Barbershop 2 Kursi",
    short: "Barber",
    category: "Jasa personal",
    summary: "Dua kursi potong, satu wash station, ruang tunggu, dan sistem booking.",
    capex: [60, 140],
    fixedBase: 17,
    rentBase: 4,
    staffCount: 2,
    staffCostBase: 4.2,
    variableRate: 0.12,
    avgTicket: 0.05,
    targetRevenue: 31,
    trafficMode: "daily",
    trafficLabel: "pelanggan/hari",
    marginLabel: "Margin kontribusi 88%",
    idealRadius: "1–2 km",
    locationSignal: "Perumahan, kampus, akses parkir, visibilitas jalan",
    capexSplit: [
      { label: "Interior & kursi", value: 0.4, color: "#b7f26c" },
      { label: "Alat barber", value: 0.2, color: "#5ce1e6" },
      { label: "Deposit sewa", value: 0.16, color: "#f4b860" },
      { label: "AC, POS & signage", value: 0.14, color: "#aa8cff" },
      { label: "Kas awal", value: 0.1, color: "#ff7d7d" },
    ],
  },
];

const cities: City[] = [
  {
    id: "kediri",
    name: "Kediri",
    province: "Jawa Timur",
    lat: -7.848,
    lng: 112.0178,
    wageFactor: 0.82,
    rentFactor: 0.72,
    capexFactor: 0.9,
    demandFactor: 0.82,
    demandLabel: "Stabil, sensitif harga",
    competition: "Sedang-rendah",
    note: "Biaya masuk ringan; menang lewat lokasi dekat permukiman dan layanan konsisten.",
    scores: { laundry: 83, kelontong: 87, franchise: 74, game: 78, gym: 67, coffee: 73, barber: 82 },
  },
  {
    id: "surabaya",
    name: "Surabaya",
    province: "Jawa Timur",
    lat: -7.2575,
    lng: 112.7521,
    wageFactor: 1.2,
    rentFactor: 1.28,
    capexFactor: 1.12,
    demandFactor: 1.16,
    demandLabel: "Tinggi dan beragam",
    competition: "Tinggi",
    note: "Volume pasar besar, tetapi sewa dan kompetisi memaksa positioning lebih tajam.",
    scores: { laundry: 82, kelontong: 72, franchise: 85, game: 83, gym: 86, coffee: 86, barber: 81 },
  },
  {
    id: "jakarta",
    name: "Jakarta",
    province: "DKI Jakarta",
    lat: -6.2088,
    lng: 106.8456,
    wageFactor: 1.48,
    rentFactor: 1.65,
    capexFactor: 1.3,
    demandFactor: 1.35,
    demandLabel: "Sangat tinggi",
    competition: "Sangat tinggi",
    note: "Tiket jual lebih tinggi, tetapi salah pilih titik cepat membakar modal sewa.",
    scores: { laundry: 84, kelontong: 65, franchise: 83, game: 78, gym: 88, coffee: 84, barber: 82 },
  },
  {
    id: "bandung",
    name: "Bandung",
    province: "Jawa Barat",
    lat: -6.9175,
    lng: 107.6191,
    wageFactor: 1.08,
    rentFactor: 1.15,
    capexFactor: 1.08,
    demandFactor: 1.14,
    demandLabel: "Tinggi, muda",
    competition: "Tinggi",
    note: "Pasar muda kuat; konsep visual dan komunitas lebih penting daripada sekadar murah.",
    scores: { laundry: 85, kelontong: 70, franchise: 87, game: 87, gym: 85, coffee: 90, barber: 84 },
  },
  {
    id: "yogyakarta",
    name: "Yogyakarta",
    province: "DI Yogyakarta",
    lat: -7.7956,
    lng: 110.3695,
    wageFactor: 0.76,
    rentFactor: 0.92,
    capexFactor: 0.96,
    demandFactor: 1.02,
    demandLabel: "Muda, sangat sensitif harga",
    competition: "Tinggi",
    note: "Basis mahasiswa besar; volume bagus, tetapi harga dan musim libur perlu dihitung.",
    scores: { laundry: 91, kelontong: 78, franchise: 86, game: 90, gym: 78, coffee: 88, barber: 83 },
  },
  {
    id: "malang",
    name: "Malang",
    province: "Jawa Timur",
    lat: -7.9666,
    lng: 112.6326,
    wageFactor: 0.9,
    rentFactor: 0.88,
    capexFactor: 0.96,
    demandFactor: 1,
    demandLabel: "Tumbuh, pasar pelajar",
    competition: "Sedang-tinggi",
    note: "Kampus dan kos membentuk demand kuat untuk jasa praktis dan hiburan.",
    scores: { laundry: 90, kelontong: 79, franchise: 85, game: 89, gym: 80, coffee: 86, barber: 84 },
  },
  {
    id: "semarang",
    name: "Semarang",
    province: "Jawa Tengah",
    lat: -6.9667,
    lng: 110.4167,
    wageFactor: 1,
    rentFactor: 1,
    capexFactor: 1,
    demandFactor: 1.05,
    demandLabel: "Stabil, kota pekerja",
    competition: "Sedang-tinggi",
    note: "Pasar keluarga dan pekerja mendukung usaha repeat-order dengan lokasi praktis.",
    scores: { laundry: 84, kelontong: 80, franchise: 82, game: 80, gym: 82, coffee: 81, barber: 83 },
  },
  {
    id: "solo",
    name: "Solo",
    province: "Jawa Tengah",
    lat: -7.5755,
    lng: 110.8243,
    wageFactor: 0.84,
    rentFactor: 0.78,
    capexFactor: 0.92,
    demandFactor: 0.9,
    demandLabel: "Stabil, value-driven",
    competition: "Sedang",
    note: "Biaya relatif sehat; produk harus terasa worth it dan membangun pelanggan tetap.",
    scores: { laundry: 84, kelontong: 86, franchise: 78, game: 81, gym: 72, coffee: 79, barber: 84 },
  },
  {
    id: "medan",
    name: "Medan",
    province: "Sumatera Utara",
    lat: 3.5952,
    lng: 98.6722,
    wageFactor: 1,
    rentFactor: 1.02,
    capexFactor: 1.04,
    demandFactor: 1.08,
    demandLabel: "Tinggi, komunal",
    competition: "Sedang-tinggi",
    note: "Pasar besar dan sosial; rekomendasi mulut ke mulut sangat berpengaruh.",
    scores: { laundry: 80, kelontong: 82, franchise: 86, game: 82, gym: 83, coffee: 85, barber: 86 },
  },
  {
    id: "makassar",
    name: "Makassar",
    province: "Sulawesi Selatan",
    lat: -5.1477,
    lng: 119.4327,
    wageFactor: 0.98,
    rentFactor: 0.98,
    capexFactor: 1.05,
    demandFactor: 1.06,
    demandLabel: "Tinggi, kota hub",
    competition: "Sedang",
    note: "Kota hub memberi demand luas; suplai dan logistik alat perlu buffer lebih besar.",
    scores: { laundry: 81, kelontong: 84, franchise: 85, game: 81, gym: 84, coffee: 84, barber: 85 },
  },
  {
    id: "denpasar",
    name: "Denpasar",
    province: "Bali",
    lat: -8.65,
    lng: 115.2167,
    wageFactor: 1.02,
    rentFactor: 1.35,
    capexFactor: 1.15,
    demandFactor: 1.2,
    demandLabel: "Tinggi, campuran lokal-wisata",
    competition: "Tinggi",
    note: "Potensi tiket tinggi, tetapi sewa dan seasonality membuat kas cadangan wajib.",
    scores: { laundry: 88, kelontong: 72, franchise: 84, game: 74, gym: 89, coffee: 91, barber: 86 },
  },
  {
    id: "balikpapan",
    name: "Balikpapan",
    province: "Kalimantan Timur",
    lat: -1.2379,
    lng: 116.8529,
    wageFactor: 1.22,
    rentFactor: 1.18,
    capexFactor: 1.15,
    demandFactor: 1.1,
    demandLabel: "Daya beli relatif kuat",
    competition: "Sedang",
    note: "Daya beli menarik, namun ongkos logistik dan tenaga kerja menaikkan titik impas.",
    scores: { laundry: 82, kelontong: 80, franchise: 84, game: 82, gym: 87, coffee: 85, barber: 84 },
  },
];

const iconMap = {
  laundry: Shirt,
  kelontong: ShoppingBasket,
  franchise: Store,
  game: Gamepad2,
  gym: Dumbbell,
  coffee: Coffee,
  barber: Scissors,
};

const money = (value: number, decimals = 1) => {
  const rounded = Number(value.toFixed(decimals));
  return `Rp${rounded.toLocaleString("id-ID")} jt`;
};

const scoreTone = (score: number) =>
  score >= 84 ? "#b7f26c" : score >= 76 ? "#f4c95d" : "#ff8a77";

function MarketMap({ business, selectedCity, onSelectCity }: {
  business: Business;
  selectedCity: City;
  onSelectCity: (cityId: string) => void;
}) {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);

  useEffect(() => {
    let active = true;

    import("leaflet").then((L) => {
      if (!active || !mapElement.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(mapElement.current, {
          center: [-3.4, 117.8],
          zoom: 4,
          minZoom: 4,
          maxZoom: 12,
          zoomControl: false,
          scrollWheelZoom: false,
        });
        L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      markerLayerRef.current?.remove();
      markerLayerRef.current = L.layerGroup().addTo(mapRef.current);

      cities.forEach((city) => {
        const score = city.scores[business.id];
        const isSelected = city.id === selectedCity.id;
        const marker = L.circleMarker([city.lat, city.lng], {
          radius: isSelected ? 12 : 6 + (score - 60) / 6,
          color: isSelected ? "#ffffff" : scoreTone(score),
          weight: isSelected ? 3 : 2,
          fillColor: scoreTone(score),
          fillOpacity: isSelected ? 0.95 : 0.78,
        });
        marker.bindTooltip(
          `<strong>${city.name}</strong><br/>Skor peluang ${score}/100`,
          { direction: "top", offset: [0, -8] },
        );
        marker.on("click", () => onSelectCity(city.id));
        marker.addTo(markerLayerRef.current!);
      });
    });

    return () => {
      active = false;
    };
  }, [business, selectedCity.id, onSelectCity]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div className="map-canvas" ref={mapElement} aria-label="Peta peluang usaha di Indonesia" />;
}

export default function Home() {
  const [selectedBusinessId, setSelectedBusinessId] = useState<BusinessId>("laundry");
  const [selectedCityId, setSelectedCityId] = useState("kediri");
  const business = businesses.find((item) => item.id === selectedBusinessId)!;
  const city = cities.find((item) => item.id === selectedCityId)!;
  const [targetRevenue, setTargetRevenue] = useState(business.targetRevenue);

  useEffect(() => {
    setTargetRevenue(Math.round(business.targetRevenue * city.demandFactor));
  }, [business, city.demandFactor]);

  const metrics = useMemo(() => {
    const payrollBase = business.staffCount * business.staffCostBase;
    const otherFixed = business.fixedBase - business.rentBase - payrollBase;
    const rent = business.rentBase * city.rentFactor;
    const payroll = payrollBase * city.wageFactor;
    const fixedCost = Math.max(1, otherFixed + rent + payroll);
    const capexLow = business.capex[0] * city.capexFactor;
    const capexHigh = business.capex[1] * city.capexFactor;
    const capexMid = (capexLow + capexHigh) / 2;
    const breakEvenRevenue = fixedCost / (1 - business.variableRate);
    const opex = fixedCost + targetRevenue * business.variableRate;
    const profit = targetRevenue * (1 - business.variableRate) - fixedCost;
    const traffic = business.trafficMode === "member"
      ? Math.ceil(breakEvenRevenue / business.avgTicket)
      : Math.ceil(breakEvenRevenue / business.avgTicket / 30);
    const payback = profit > 0 ? capexMid / profit : Infinity;
    const health = targetRevenue >= breakEvenRevenue * 1.2
      ? "Sehat"
      : targetRevenue >= breakEvenRevenue
        ? "Tipis"
        : "Rugi";

    return {
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
  }, [business, city, targetRevenue]);

  const BusinessIcon = iconMap[business.id];
  const maxRevenue = Math.max(160, Math.ceil(business.targetRevenue * 2.3 / 10) * 10);
  const cashflow = Array.from({ length: 12 }, (_, index) => {
    const ramp = 0.54 + index * 0.055;
    return (targetRevenue * ramp) * (1 - business.variableRate) - metrics.fixedCost;
  });
  const maxCash = Math.max(...cashflow.map((item) => Math.abs(item)), 1);

  const resetScenario = () => {
    setSelectedBusinessId("laundry");
    setSelectedCityId("kediri");
    setTargetRevenue(32);
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Cek Bisnis beranda">
          <span className="brand-mark"><BarChart3 size={17} /></span>
          <span>CEK BISNIS</span>
        </a>
        <nav className="nav-links" aria-label="Navigasi utama">
          <a href="#simulator">Simulator</a>
          <a href="#peta">Peta pasar</a>
          <a href="#metode">Metode</a>
        </nav>
        <a className="nav-cta" href="#simulator">Mulai cek <ArrowDown size={15} /></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow glow-one" aria-hidden="true" />
        <div className="hero-glow glow-two" aria-hidden="true" />

        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> Data Indonesia · Update Juli 2026</div>
          <h1>Uji idemu sebelum<br /><em>uangmu habis.</em></h1>
          <p>
            Preview realistis untuk UMKM: modal awal, biaya bulanan, omzet minimum,
            titik impas, dan kecocokan lokasi—dalam satu simulasi.
          </p>
          <div className="hero-actions">
            <a className="button-primary" href="#simulator">Cek ide bisnis <ChevronRight size={18} /></a>
            <a className="button-ghost" href="#metode"><Info size={17} /> Lihat cara hitung</a>
          </div>
          <div className="hero-proof">
            <div><strong>7</strong><span>model usaha</span></div>
            <div><strong>12</strong><span>kota pembanding</span></div>
            <div><strong>100%</strong><span>asumsi terbuka</span></div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Ringkasan simulasi Cek Bisnis">
          <div className="orbit orbit-a" aria-hidden="true" />
          <div className="orbit orbit-b" aria-hidden="true" />
          <div className="floating-pill pill-a"><Shirt size={16} /> Laundry <b>83</b></div>
          <div className="floating-pill pill-b"><Gamepad2 size={16} /> Game <b>78</b></div>
          <div className="floating-pill pill-c"><Coffee size={16} /> Coffee <b>73</b></div>

          <div className="hero-card">
            <div className="hero-card-top">
              <span>SKENARIO TERPILIH</span>
              <span className="status-chip"><span /> Layak diuji</span>
            </div>
            <div className="hero-card-business">
              <div className="icon-tile"><Shirt size={24} /></div>
              <div><small>Jasa harian</small><h3>Laundry Kiloan</h3></div>
            </div>
            <div className="hero-card-metrics">
              <div><small>CAPEX</small><b>Rp63–99 jt</b></div>
              <div><small>BEP OMZET</small><b>Rp17,7 jt</b></div>
            </div>
            <div className="mini-chart" aria-hidden="true">
              {[28, 35, 32, 44, 51, 58, 64, 71, 77, 82, 88, 94].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="hero-card-foot">
              <span><MapPin size={14} /> Kediri, Jawa Timur</span>
              <b>83/100</b>
            </div>
          </div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span>CAPEX</span><i /> <span>OPEX</span><i /> <span>BREAK-EVEN</span><i />
          <span>TRAFFIC MINIMUM</span><i /> <span>LOCATION FIT</span><i /> <span>CASHFLOW</span><i />
          <span>CAPEX</span><i /> <span>OPEX</span><i /> <span>BREAK-EVEN</span><i />
          <span>TRAFFIC MINIMUM</span><i /> <span>LOCATION FIT</span><i /> <span>CASHFLOW</span><i />
        </div>
      </div>

      <section className="simulator-section" id="simulator">
        <div className="section-heading">
          <div>
            <span className="section-kicker">01 / PILIH USAHA</span>
            <h2>Bisnis apa yang mau kamu cek?</h2>
          </div>
          <button className="reset-button" onClick={resetScenario}><RefreshCw size={15} /> Reset skenario</button>
        </div>

        <div className="business-picker" role="list" aria-label="Pilihan model usaha">
          {businesses.map((item) => {
            const Icon = iconMap[item.id];
            const active = item.id === selectedBusinessId;
            return (
              <button
                className={`business-option ${active ? "active" : ""}`}
                key={item.id}
                onClick={() => setSelectedBusinessId(item.id)}
                aria-pressed={active}
              >
                <span className="option-icon"><Icon size={22} /></span>
                <span><small>{item.category}</small><b>{item.short}</b></span>
                {active && <Check className="option-check" size={16} />}
              </button>
            );
          })}
        </div>

        <div className="simulator-grid">
          <aside className="control-panel">
            <div className="selected-business">
              <div className="selected-icon"><BusinessIcon size={28} /></div>
              <div>
                <span>{business.category}</span>
                <h3>{business.name}</h3>
              </div>
            </div>
            <p className="business-summary">{business.summary}</p>

            <label className="field-label" htmlFor="city-select">
              <span><MapPin size={15} /> Lokasi simulasi</span>
              <small>Pengaruh sewa & gaji</small>
            </label>
            <div className="select-wrap">
              <select id="city-select" value={selectedCityId} onChange={(event) => setSelectedCityId(event.target.value)}>
                {cities.map((item) => <option value={item.id} key={item.id}>{item.name}, {item.province}</option>)}
              </select>
              <ChevronRight size={17} />
            </div>

            <div className="range-head">
              <label htmlFor="revenue-range"><Target size={15} /> Target omzet / bulan</label>
              <strong>{money(targetRevenue, 0)}</strong>
            </div>
            <input
              id="revenue-range"
              className="revenue-range"
              type="range"
              min="5"
              max={maxRevenue}
              step="1"
              value={targetRevenue}
              onChange={(event) => setTargetRevenue(Number(event.target.value))}
              style={{ "--range-progress": `${((targetRevenue - 5) / (maxRevenue - 5)) * 100}%` } as React.CSSProperties}
            />
            <div className="range-scale"><span>Rp5 jt</span><span>{money(maxRevenue, 0)}</span></div>

            <div className="assumption-box">
              <div><span>Sewa estimasi</span><b>{money(metrics.rent)}</b></div>
              <div><span>Tim</span><b>{business.staffCount} orang · {money(metrics.payroll)}</b></div>
              <div><span>Radius ideal</span><b>{business.idealRadius}</b></div>
            </div>

            <div className="risk-note">
              <ShieldAlert size={18} />
              <p><b>Jangan langsung sewa.</b> Validasi traffic 7 hari dan cek pesaing dalam radius {business.idealRadius}.</p>
            </div>
          </aside>

          <div className="result-panel">
            <div className="result-topline">
              <div><span>HASIL SIMULASI</span><small>{business.name} · {city.name}</small></div>
              <span className={`health health-${metrics.health.toLowerCase()}`}><i /> Cashflow {metrics.health}</span>
            </div>

            <div className="metric-grid">
              <article className="metric-card capex-card">
                <div className="metric-icon"><WalletCards size={20} /></div>
                <span>CAPEX · Modal awal</span>
                <strong>{money(metrics.capexLow, 0)}–{money(metrics.capexHigh, 0).replace("Rp", "")}</strong>
                <small>Termasuk alat, fit-out, deposit, dan kas awal</small>
              </article>
              <article className="metric-card">
                <div className="metric-icon"><Zap size={20} /></div>
                <span>OPEX · Biaya bulanan</span>
                <strong>{money(metrics.opex)}</strong>
                <small>Pada target omzet {money(targetRevenue, 0)}</small>
              </article>
              <article className="metric-card metric-accent">
                <div className="metric-icon"><Target size={20} /></div>
                <span>BEP · Omzet minimum</span>
                <strong>{money(metrics.breakEvenRevenue)}</strong>
                <small>{metrics.traffic} {business.trafficLabel} agar tidak rugi</small>
              </article>
            </div>

            <div className="result-detail-grid">
              <article className="chart-card">
                <div className="card-heading">
                  <div><span>ALOKASI MODAL</span><h4>CAPEX breakdown</h4></div>
                  <PackageOpen size={19} />
                </div>
                <div className="stacked-bar" aria-label="Distribusi modal awal">
                  {business.capexSplit.map((item) => (
                    <span key={item.label} style={{ width: `${item.value * 100}%`, background: item.color }} />
                  ))}
                </div>
                <div className="legend-list">
                  {business.capexSplit.map((item) => (
                    <div key={item.label}>
                      <span><i style={{ background: item.color }} />{item.label}</span>
                      <b>{money(metrics.capexMid * item.value)}</b>
                    </div>
                  ))}
                </div>
              </article>

              <article className="chart-card cash-card">
                <div className="card-heading">
                  <div><span>PROYEKSI 12 BULAN</span><h4>Ramp-up cashflow</h4></div>
                  <span className={`profit-chip ${metrics.profit < 0 ? "negative" : ""}`}>
                    {metrics.profit >= 0 ? "+" : ""}{money(metrics.profit)} / bln
                  </span>
                </div>
                <div className="cash-chart" aria-label="Proyeksi laba operasional 12 bulan">
                  <div className="zero-line" />
                  {cashflow.map((value, index) => (
                    <div className="cash-column" key={index}>
                      <span
                        className={value >= 0 ? "positive" : "negative"}
                        style={{ height: `${18 + (Math.abs(value) / maxCash) * 60}%` }}
                        title={`Bulan ${index + 1}: ${money(value)}`}
                      />
                      <small>{index + 1}</small>
                    </div>
                  ))}
                </div>
                <div className="payback-row">
                  <div><span>Estimasi balik modal</span><strong>{Number.isFinite(metrics.payback) ? `${Math.ceil(metrics.payback)} bulan` : "Belum tercapai"}</strong></div>
                  <p>Jika omzet target tercapai stabil setelah masa ramp-up.</p>
                </div>
              </article>
            </div>

            <div className="verdict-bar">
              <div className="verdict-score">
                <span>SKOR PELUANG</span>
                <strong style={{ color: scoreTone(metrics.opportunity) }}>{metrics.opportunity}</strong><small>/100</small>
              </div>
              <div className="verdict-copy">
                <b>{metrics.opportunity >= 84 ? "Menarik untuk divalidasi" : metrics.opportunity >= 76 ? "Layak dengan lokasi tepat" : "Perlu diferensiasi kuat"}</b>
                <span>{business.locationSignal}</span>
              </div>
              <a href="#peta">Cek petanya <ArrowDown size={15} /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="map-section" id="peta">
        <div className="section-heading map-heading">
          <div>
            <span className="section-kicker">02 / PETA PASAR</span>
            <h2>Di kota mana idemu lebih masuk akal?</h2>
          </div>
          <p>Skor relatif berdasarkan proxy demand, biaya, daya beli, dan tekanan kompetisi. Klik titik kota untuk membandingkan.</p>
        </div>

        <div className="map-shell">
          <div className="map-panel">
            <div className="map-toolbar">
              <span><span className="map-live" /> Peluang {business.short}</span>
              <div className="map-legend"><i className="high" /> Tinggi <i className="medium" /> Sedang <i className="low" /> Waspada</div>
            </div>
            <MarketMap business={business} selectedCity={city} onSelectCity={setSelectedCityId} />
          </div>

          <aside className="location-card">
            <div className="location-top">
              <div><span>LOKASI TERPILIH</span><h3>{city.name}</h3><p>{city.province}</p></div>
              <div className="score-ring" style={{ "--score": `${metrics.opportunity * 3.6}deg`, "--score-color": scoreTone(metrics.opportunity) } as React.CSSProperties}>
                <span>{metrics.opportunity}</span>
              </div>
            </div>
            <div className="location-facts">
              <div><span><Users size={16} /> Demand</span><b>{city.demandLabel}</b></div>
              <div><span><WalletCards size={16} /> Indeks biaya</span><b>{Math.round(((city.rentFactor + city.wageFactor) / 2) * 100)} <small>/ nasional 100</small></b></div>
              <div><span><Store size={16} /> Kompetisi</span><b>{city.competition}</b></div>
            </div>
            <div className="location-insight">
              <Sparkles size={18} />
              <p>{city.note}</p>
            </div>
            <div className="location-ranking">
              <span>Ranking kota untuk {business.short}</span>
              {[...cities]
                .sort((a, b) => b.scores[business.id] - a.scores[business.id])
                .slice(0, 4)
                .map((item, index) => (
                  <button key={item.id} onClick={() => setSelectedCityId(item.id)}>
                    <i>{index + 1}</i><span>{item.name}</span><b>{item.scores[business.id]}</b><ChevronRight size={15} />
                  </button>
                ))}
            </div>
          </aside>
        </div>
        <p className="map-disclaimer"><Info size={14} /> Peta memakai OpenStreetMap. Skor adalah model indikatif, bukan hitungan live jumlah outlet; tetap lakukan survei radius lokal.</p>
      </section>

      <section className="method-section" id="metode">
        <div className="method-intro">
          <span className="section-kicker">03 / CARA HITUNG</span>
          <h2>Angka yang bisa kamu bongkar,<br />bukan janji manis.</h2>
          <p>
            Semua hasil berasal dari model unit economics sederhana. Kamu bisa mengubah omzet,
            kota, dan model usaha untuk melihat sensitivitasnya.
          </p>
        </div>
        <div className="formula-grid">
          <article>
            <span>01</span><Calculator size={21} />
            <h3>CAPEX</h3>
            <p>Alat + renovasi + deposit sewa + stok pembuka + kas kerja awal.</p>
          </article>
          <article>
            <span>02</span><WalletCards size={21} />
            <h3>OPEX</h3>
            <p>Biaya tetap + biaya variabel sesuai target omzet per bulan.</p>
          </article>
          <article>
            <span>03</span><Target size={21} />
            <h3>BEP omzet</h3>
            <p>Biaya tetap ÷ margin kontribusi. Belum memasukkan cicilan dan pajak.</p>
          </article>
          <article>
            <span>04</span><MapPin size={21} />
            <h3>Skor lokasi</h3>
            <p>35% demand, 25% daya beli, 20% efisiensi biaya, 20% tekanan pesaing.</p>
          </article>
        </div>

        <div className="sources-card">
          <div className="sources-heading">
            <div><span>SUMBER & ASUMSI</span><h3>Rujukan publik, diperbarui 16 Juli 2026</h3></div>
            <a href="https://www.bps.go.id/id/publication/2025/02/28/8cfe1a589ad3693396d3db9f/statistik-indonesia-2025.html" target="_blank" rel="noreferrer">Buka BPS <ArrowUpRight size={15} /></a>
          </div>
          <div className="source-list">
            <a href="https://www.bps.go.id/id/publication/2025/02/28/8cfe1a589ad3693396d3db9f/statistik-indonesia-2025.html" target="_blank" rel="noreferrer">
              <span>BPS · Statistik Indonesia 2025</span><small>Kepadatan dan profil wilayah</small><ArrowUpRight size={15} />
            </a>
            <a href="https://www.bps.go.id/id/pressrelease/2026/05/05/2574/tingkat-pengangguran-terbuka--tpt--sebesar-4-68-persen--rata-rata-upah-buruh-sebesar-3-29-juta-rupiah-.html" target="_blank" rel="noreferrer">
              <span>BPS · Sakernas Februari 2026</span><small>Rata-rata upah buruh Rp3,29 juta</small><ArrowUpRight size={15} />
            </a>
            <a href="https://www.esdm.go.id/id/media-center/arsip-berita/jaga-daya-beli-menteri-esdm-tarif-listrik-tidak-naik" target="_blank" rel="noreferrer">
              <span>ESDM · Tarif listrik Q3 2026</span><small>Tarif Juli–September tidak naik</small><ArrowUpRight size={15} />
            </a>
            <a href="https://www.bi.go.id/id/publikasi/laporan/Pages/LPI_2025.aspx" target="_blank" rel="noreferrer">
              <span>Bank Indonesia · LPI 2025</span><small>Konsumsi dan konteks ekonomi</small><ArrowUpRight size={15} />
            </a>
            <a href="https://oss.go.id/" target="_blank" rel="noreferrer">
              <span>OSS RBA</span><small>NIB dan perizinan berbasis risiko</small><ArrowUpRight size={15} />
            </a>
            <a href="https://blog.playstation.com/2026/04/27/for-southeast-asia-new-price-changes-for-ps5-ps5-pro-and-playstation-portal-remote-player/" target="_blank" rel="noreferrer">
              <span>Sony PlayStation · Mei 2026</span><small>Harga resmi PS5 Indonesia</small><ArrowUpRight size={15} />
            </a>
          </div>
          <div className="source-warning">
            <ShieldAlert size={18} />
            <p><b>⚠️ Risk:</b> Ini alat screening awal, bukan jaminan untung. Harga alat, sewa, upah, pajak, dan demand nyata dapat berbeda. Tambahkan buffer modal 15–25% dan survei lokasi sebelum kontrak.</p>
          </div>
        </div>
      </section>

      <section className="closing-section">
        <div>
          <span>SUDAH PUNYA IDE?</span>
          <h2>Hitung dulu.<br />Baru buka.</h2>
        </div>
        <a href="#simulator">Mulai simulasi <ArrowUpRight size={20} /></a>
        <div className="closing-orb" aria-hidden="true"><BarChart3 size={76} /></div>
      </section>

      <footer>
        <div className="brand"><span className="brand-mark"><BarChart3 size={17} /></span><span>CEK BISNIS</span></div>
        <p>Preview unit economics UMKM Indonesia · Bukan nasihat keuangan.</p>
        <span>© 2026</span>
      </footer>
    </main>
  );
}
