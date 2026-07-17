import type { BusinessId } from "@/lib/business-data";

export type BusinessScale = {
  id: string;
  name: string;
  capex: [number, number];
  capacity: string;
  revenue: [number, number];
  staff: string;
  space: string;
  bestFor: string;
};

export type DetailedEquipment = {
  item: string;
  qty: string;
  unitCost: string;
  subtotal: [number, number];
  priority: "Wajib" | "Pendukung";
};

export type BusinessDetail = {
  imagePosition: string;
  imageAlt: string;
  priceLabel: string;
  scales: BusinessScale[];
  equipment: DetailedEquipment[];
};

export const businessDetails: Record<BusinessId, BusinessDetail> = {
  laundry: {
    imagePosition: "0% 0%",
    imageAlt: "Mesin cuci, pengering, timbangan, setrika, keranjang dan meja lipat untuk laundry kiloan",
    priceLabel: "Harga jual umum Rp7.000-Rp12.000/kg; express biasanya 1,5-2x tarif reguler.",
    scales: [
      { id: "starter", name: "Starter 1 set", capex: [48, 72], capacity: "35-55 kg/hari", revenue: [18, 30], staff: "1-2 orang", space: "20-30 m²", bestFor: "Permukiman padat" },
      { id: "standard", name: "Standar 2 set", capex: [80, 125], capacity: "75-110 kg/hari", revenue: [32, 55], staff: "2-3 orang", space: "35-55 m²", bestFor: "Kos dan kampus" },
      { id: "volume", name: "Volume 3 set", capex: [120, 185], capacity: "120-170 kg/hari", revenue: [50, 82], staff: "3-4 orang", space: "55-80 m²", bestFor: "Hub laundry + antar" },
    ],
    equipment: [
      { item: "Washer komersial 12-15 kg", qty: "2 unit", unitCost: "Rp15-22 jt", subtotal: [30, 44], priority: "Wajib" },
      { item: "Dryer gas/listrik 15 kg", qty: "2 unit", unitCost: "Rp16-24 jt", subtotal: [32, 48], priority: "Wajib" },
      { item: "Setrika uap + boiler", qty: "1 set", unitCost: "Rp3-6 jt", subtotal: [3, 6], priority: "Wajib" },
      { item: "Timbangan digital 40 kg", qty: "2 unit", unitCost: "Rp0,45-0,9 jt", subtotal: [0.9, 1.8], priority: "Wajib" },
      { item: "Meja sortir dan lipat", qty: "2 unit", unitCost: "Rp0,8-1,8 jt", subtotal: [1.6, 3.6], priority: "Wajib" },
      { item: "Keranjang, rak, hanger", qty: "1 paket", unitCost: "Rp2-4 jt", subtotal: [2, 4], priority: "Wajib" },
      { item: "POS, printer label, CCTV", qty: "1 paket", unitCost: "Rp3-6 jt", subtotal: [3, 6], priority: "Pendukung" },
      { item: "Plumbing, ventilasi, signage", qty: "1 paket", unitCost: "Rp8-16 jt", subtotal: [8, 16], priority: "Wajib" },
    ],
  },
  kelontong: {
    imagePosition: "33.333% 0%",
    imageAlt: "Rak barang, etalase, pendingin, kasir, pemindai barcode dan stok awal toko kelontong",
    priceLabel: "Margin campuran umumnya 10-22%; stok cepat laku lebih penting daripada jumlah SKU.",
    scales: [
      { id: "rumah", name: "Warung rumah", capex: [25, 45], capacity: "250-450 transaksi/bln", revenue: [22, 38], staff: "1 orang", space: "12-20 m²", bestFor: "RT/perumahan" },
      { id: "standard", name: "Toko standar", capex: [60, 110], capacity: "35-65 transaksi/hari", revenue: [55, 95], staff: "2 orang", space: "35-60 m²", bestFor: "Jalan lingkungan" },
      { id: "modern", name: "Kelontong modern", capex: [120, 220], capacity: "70-120 transaksi/hari", revenue: [100, 180], staff: "3-4 orang", space: "70-110 m²", bestFor: "Kawasan padat" },
    ],
    equipment: [
      { item: "Stok FMCG pembuka", qty: "350-700 SKU", unitCost: "Campuran", subtotal: [30, 70], priority: "Wajib" },
      { item: "Rak gondola dinding/tengah", qty: "8-14 unit", unitCost: "Rp0,8-1,8 jt", subtotal: [8, 20], priority: "Wajib" },
      { item: "Etalase kaca + meja kasir", qty: "2 unit", unitCost: "Rp1,8-4 jt", subtotal: [3.6, 8], priority: "Wajib" },
      { item: "Chiller minuman", qty: "1 unit", unitCost: "Rp4-8 jt", subtotal: [4, 8], priority: "Pendukung" },
      { item: "Freezer frozen food", qty: "1 unit", unitCost: "Rp3,5-7 jt", subtotal: [3.5, 7], priority: "Pendukung" },
      { item: "POS + barcode + printer", qty: "1 set", unitCost: "Rp3-7 jt", subtotal: [3, 7], priority: "Wajib" },
      { item: "CCTV 4 kamera", qty: "1 set", unitCost: "Rp2,5-5 jt", subtotal: [2.5, 5], priority: "Wajib" },
      { item: "Lampu, signage, renovasi", qty: "1 paket", unitCost: "Rp5-12 jt", subtotal: [5, 12], priority: "Wajib" },
    ],
  },
  franchise: {
    imagePosition: "66.667% 0%",
    imageAlt: "Booth minuman, mesin sealer, blender, chiller, botol sirup, gelas dan kasir digital",
    priceLabel: "Harga jual Rp8.000-Rp25.000/cup; cek royalty, bahan wajib, dan minimum order.",
    scales: [
      { id: "cart", name: "Cart ringkas", capex: [25, 45], capacity: "35-60 cup/hari", revenue: [15, 28], staff: "1 orang", space: "4-8 m²", bestFor: "Depan minimarket" },
      { id: "standard", name: "Booth standar", capex: [45, 85], capacity: "60-110 cup/hari", revenue: [28, 55], staff: "2 orang", space: "12-20 m²", bestFor: "Sekolah dan pasar" },
      { id: "kiosk", name: "Kios premium", capex: [85, 150], capacity: "110-180 cup/hari", revenue: [50, 90], staff: "3 orang", space: "25-40 m²", bestFor: "Mall dan foodcourt" },
    ],
    equipment: [
      { item: "Lisensi/paket kemitraan", qty: "1 kontrak", unitCost: "Rp15-35 jt", subtotal: [15, 35], priority: "Wajib" },
      { item: "Booth + signage", qty: "1 set", unitCost: "Rp8-18 jt", subtotal: [8, 18], priority: "Wajib" },
      { item: "Cup sealer", qty: "1 unit", unitCost: "Rp1,8-4,5 jt", subtotal: [1.8, 4.5], priority: "Wajib" },
      { item: "Blender heavy duty", qty: "2 unit", unitCost: "Rp1-2,5 jt", subtotal: [2, 5], priority: "Wajib" },
      { item: "Undercounter chiller", qty: "1 unit", unitCost: "Rp3,5-7 jt", subtotal: [3.5, 7], priority: "Wajib" },
      { item: "Water filter + sink", qty: "1 set", unitCost: "Rp1,5-4 jt", subtotal: [1.5, 4], priority: "Wajib" },
      { item: "POS + printer", qty: "1 set", unitCost: "Rp2-5 jt", subtotal: [2, 5], priority: "Pendukung" },
      { item: "Bahan dan kemasan awal", qty: "500-1.000 cup", unitCost: "Campuran", subtotal: [3, 7], priority: "Wajib" },
    ],
  },
  game: {
    imagePosition: "100% 0%",
    imageAlt: "Konsol game, televisi, controller, kursi gaming, router, UPS dan rak snack rental game",
    priceLabel: "Tarif umum Rp15.000-Rp35.000/jam per station; utilisasi malam adalah kunci.",
    scales: [
      { id: "starter", name: "3 station", capex: [55, 90], capacity: "24-36 jam sewa/hari", revenue: [18, 30], staff: "1 orang", space: "35-50 m²", bestFor: "Dekat sekolah" },
      { id: "standard", name: "6 station", capex: [105, 190], capacity: "48-72 jam sewa/hari", revenue: [32, 58], staff: "2 orang", space: "70-100 m²", bestFor: "Kampus dan kos" },
      { id: "arena", name: "10 station", capex: [190, 320], capacity: "80-120 jam sewa/hari", revenue: [55, 95], staff: "3 orang", space: "120-170 m²", bestFor: "Komunitas kota" },
    ],
    equipment: [
      { item: "PS5 Disc/Digital", qty: "6 unit", unitCost: "Rp10-11,4 jt", subtotal: [60, 68.4], priority: "Wajib" },
      { item: "TV 43-50 inci low-latency", qty: "6 unit", unitCost: "Rp4-6,5 jt", subtotal: [24, 39], priority: "Wajib" },
      { item: "Controller cadangan", qty: "6 unit", unitCost: "Rp1,1-1,5 jt", subtotal: [6.6, 9], priority: "Wajib" },
      { item: "Sofa/kursi + meja station", qty: "6 set", unitCost: "Rp1,5-3 jt", subtotal: [9, 18], priority: "Wajib" },
      { item: "Router, switch, kabel", qty: "1 paket", unitCost: "Rp2-5 jt", subtotal: [2, 5], priority: "Wajib" },
      { item: "UPS dan stabilizer", qty: "3-6 unit", unitCost: "Rp0,9-1,8 jt", subtotal: [3, 9], priority: "Pendukung" },
      { item: "CCTV + booking POS", qty: "1 paket", unitCost: "Rp3-7 jt", subtotal: [3, 7], priority: "Pendukung" },
      { item: "Game legal dan akun", qty: "10-18 judul", unitCost: "Campuran", subtotal: [6, 14], priority: "Wajib" },
    ],
  },
  gym: {
    imagePosition: "0% 100%",
    imageAlt: "Squat rack, bench, barbell, dumbbell, treadmill, lantai karet dan loker untuk gym komunitas",
    priceLabel: "Membership Rp180.000-Rp450.000/bulan; retensi member lebih penting daripada alat terbanyak.",
    scales: [
      { id: "studio", name: "Strength studio", capex: [95, 180], capacity: "100-180 member", revenue: [25, 45], staff: "2-3 orang", space: "70-110 m²", bestFor: "Komunitas strength" },
      { id: "standard", name: "Gym komunitas", capex: [220, 480], capacity: "200-350 member", revenue: [50, 95], staff: "4 orang", space: "120-180 m²", bestFor: "Perumahan muda" },
      { id: "full", name: "Gym lengkap", capex: [480, 850], capacity: "400-650 member", revenue: [95, 175], staff: "6-8 orang", space: "250-400 m²", bestFor: "Kota besar" },
    ],
    equipment: [
      { item: "Squat rack + bench", qty: "4 set", unitCost: "Rp7-15 jt", subtotal: [28, 60], priority: "Wajib" },
      { item: "Barbell + bumper plate", qty: "4 paket", unitCost: "Rp6-12 jt", subtotal: [24, 48], priority: "Wajib" },
      { item: "Dumbbell 2,5-30 kg + rak", qty: "1 set", unitCost: "Rp18-38 jt", subtotal: [18, 38], priority: "Wajib" },
      { item: "Cable/multi station", qty: "2 unit", unitCost: "Rp18-40 jt", subtotal: [36, 80], priority: "Wajib" },
      { item: "Treadmill komersial", qty: "3 unit", unitCost: "Rp18-35 jt", subtotal: [54, 105], priority: "Pendukung" },
      { item: "Lantai karet + cermin", qty: "120-180 m²", unitCost: "Campuran", subtotal: [25, 55], priority: "Wajib" },
      { item: "Locker, shower, reception", qty: "1 paket", unitCost: "Rp20-45 jt", subtotal: [20, 45], priority: "Pendukung" },
      { item: "Access control + CCTV", qty: "1 paket", unitCost: "Rp8-18 jt", subtotal: [8, 18], priority: "Wajib" },
    ],
  },
  coffee: {
    imagePosition: "33.333% 100%",
    imageAlt: "Mesin espresso, grinder, filter air, chiller, tamper, milk pitcher, gelas dan POS coffee booth",
    priceLabel: "Harga jual Rp18.000-Rp35.000/cup; targetkan bahan baku 30-38% dari omzet.",
    scales: [
      { id: "cart", name: "Coffee cart", capex: [28, 55], capacity: "35-60 cup/hari", revenue: [22, 38], staff: "1 orang", space: "6-12 m²", bestFor: "Office lobby" },
      { id: "standard", name: "Booth espresso", capex: [55, 120], capacity: "60-110 cup/hari", revenue: [40, 75], staff: "2 orang", space: "20-35 m²", bestFor: "Kampus dan kantor" },
      { id: "shop", name: "Mini coffee shop", capex: [130, 260], capacity: "110-180 cup/hari", revenue: [75, 135], staff: "3-4 orang", space: "55-90 m²", bestFor: "Kota lifestyle" },
    ],
    equipment: [
      { item: "Espresso machine 2 group", qty: "1 unit", unitCost: "Rp12-28 jt", subtotal: [12, 28], priority: "Wajib" },
      { item: "Coffee grinder", qty: "2 unit", unitCost: "Rp3-7 jt", subtotal: [6, 14], priority: "Wajib" },
      { item: "Water filter", qty: "1 set", unitCost: "Rp2-5 jt", subtotal: [2, 5], priority: "Wajib" },
      { item: "Undercounter chiller", qty: "1 unit", unitCost: "Rp4-9 jt", subtotal: [4, 9], priority: "Wajib" },
      { item: "Tamper, pitcher, scale", qty: "1 paket", unitCost: "Rp2-4,5 jt", subtotal: [2, 4.5], priority: "Wajib" },
      { item: "POS + printer", qty: "1 set", unitCost: "Rp2,5-6 jt", subtotal: [2.5, 6], priority: "Pendukung" },
      { item: "Booth, plumbing, listrik", qty: "1 paket", unitCost: "Rp12-28 jt", subtotal: [12, 28], priority: "Wajib" },
      { item: "Beans, susu, cup awal", qty: "1 paket", unitCost: "Rp4-8 jt", subtotal: [4, 8], priority: "Wajib" },
    ],
  },
  barber: {
    imagePosition: "66.667% 100%",
    imageAlt: "Dua kursi barber, cermin, workstation, clipper, gunting, sisir, sterilizer dan wash basin",
    priceLabel: "Harga jasa Rp35.000-Rp90.000; kapasitas realistis 8-12 pelanggan per kursi per hari.",
    scales: [
      { id: "solo", name: "Solo 1 kursi", capex: [28, 55], capacity: "8-12 pelanggan/hari", revenue: [15, 28], staff: "1 barber", space: "18-30 m²", bestFor: "Mulai dari pelanggan sendiri" },
      { id: "standard", name: "Standar 2 kursi", capex: [65, 145], capacity: "16-24 pelanggan/hari", revenue: [30, 55], staff: "2 barber", space: "35-60 m²", bestFor: "Perumahan dan kampus" },
      { id: "premium", name: "Premium 4 kursi", capex: [150, 280], capacity: "32-48 pelanggan/hari", revenue: [65, 120], staff: "4-5 orang", space: "80-120 m²", bestFor: "Kota besar" },
    ],
    equipment: [
      { item: "Kursi barber hidrolik", qty: "2 unit", unitCost: "Rp7-14 jt", subtotal: [14, 28], priority: "Wajib" },
      { item: "Cermin + workstation", qty: "2 set", unitCost: "Rp2-5 jt", subtotal: [4, 10], priority: "Wajib" },
      { item: "Clipper profesional", qty: "4 unit", unitCost: "Rp1,2-2,8 jt", subtotal: [4.8, 11.2], priority: "Wajib" },
      { item: "Trimmer/shaver", qty: "4 unit", unitCost: "Rp0,8-2 jt", subtotal: [3.2, 8], priority: "Wajib" },
      { item: "Gunting, sisir, cape", qty: "2 paket", unitCost: "Rp1-2,5 jt", subtotal: [2, 5], priority: "Wajib" },
      { item: "UV sterilizer + sanitasi", qty: "2 set", unitCost: "Rp0,8-1,8 jt", subtotal: [1.6, 3.6], priority: "Wajib" },
      { item: "Wash basin + water heater", qty: "1 set", unitCost: "Rp6-12 jt", subtotal: [6, 12], priority: "Pendukung" },
      { item: "AC, waiting bench, signage", qty: "1 paket", unitCost: "Rp10-24 jt", subtotal: [10, 24], priority: "Pendukung" },
    ],
  },
};

export const getBusinessDetail = (id: BusinessId) => businessDetails[id];
