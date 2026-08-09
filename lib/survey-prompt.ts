import type { Business } from "@/lib/business-data";
import { formatMoney } from "@/lib/business-data";
import type { IndonesiaPlace, LocationSurveyResult } from "@/lib/location-survey";

export type AssistantId = "claude" | "chatgpt" | "gemini";

export type Assistant = {
  id: AssistantId;
  name: string;
  logo: string;
  /**
   * `null` berarti layanan itu tidak menerima prompt lewat parameter URL, jadi
   * kita hanya bisa membuka halamannya dan mengandalkan papan klip.
   */
  urlTemplate: string | null;
  homeUrl: string;
};

export const ASSISTANTS: Assistant[] = [
  { id: "claude", name: "Claude", logo: "/brands/ai/anthropic.svg", urlTemplate: "https://claude.ai/new?q={q}", homeUrl: "https://claude.ai/new" },
  { id: "chatgpt", name: "ChatGPT", logo: "/brands/ai/openai.svg", urlTemplate: "https://chatgpt.com/?q={q}", homeUrl: "https://chatgpt.com/" },
  { id: "gemini", name: "Gemini", logo: "/brands/ai/gemini.svg", urlTemplate: null, homeUrl: "https://gemini.google.com/app" },
];

/**
 * Beberapa layanan memotong prompt yang terlalu panjang di query string, jadi
 * teksnya dijaga tetap ringkas dan daftar POI dibatasi.
 */
const MAX_POIS = 8;

export type SurveyPromptInput = {
  business: Business;
  place: IndonesiaPlace;
  lat: number;
  lng: number;
  radius: number;
  result: LocationSurveyResult | null;
};

/**
 * Menyusun prompt yang berdiri sendiri: seluruh angka survei ikut ditulis agar
 * asisten tidak perlu menebak konteks dan tidak perlu membuka situs ini.
 */
export function buildSurveyPrompt({ business, place, lat, lng, radius, result }: SurveyPromptInput): string {
  const lines: string[] = [];

  lines.push(
    `Saya sedang menilai kelayakan lokasi untuk usaha "${business.name}" di Indonesia. Bertindaklah sebagai analis lokasi ritel yang skeptis dan berbasis angka.`,
    "",
    "## Titik yang dinilai",
    `- Kota/kabupaten terdekat: ${place.name}, ${place.province}`,
    `- Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    `- Radius survei: ${radius} m`,
    `- Populasi kota (GeoNames): ${place.population > 0 ? place.population.toLocaleString("id-ID") : "tidak tersedia"}`,
    "",
    "## Profil model usaha",
    `- Format: ${business.format}`,
    `- Modal awal: ${formatMoney(business.capex[0], 0)} - ${formatMoney(business.capex[1], 0)}`,
    `- Target omzet acuan: ${formatMoney(business.targetRevenue, 0)} per bulan`,
    `- Biaya variabel: ${Math.round(business.variableRate * 100)}% dari omzet`,
    `- Satuan traffic: ${business.trafficLabel}`,
    `- Radius pasar ideal: ${business.idealRadius}`,
    `- Sinyal lokasi yang dicari: ${business.locationSignal}`,
    `- Balik modal khas model ini: ${business.bepMonths[0]}-${business.bepMonths[1]} bulan`,
  );

  if (result) {
    const competitors = result.pois.filter((poi) => poi.category === "competitor").slice(0, MAX_POIS);
    const anchors = result.pois.filter((poi) => poi.category === "anchor").slice(0, MAX_POIS);

    lines.push(
      "",
      "## Hasil pembacaan OpenStreetMap di radius tersebut",
      `- Skor awal internal: ${result.score}/100 (kepadatan data peta ${result.coverage}%)`,
      `- Pesaing sejenis: ${result.competitorCount}`,
      `- Pemicu ramai (sekolah, pasar, kantor, transit): ${result.anchorCount}`,
      `- Bangunan terpetakan: ${result.buildingCount}`,
      `- Ruas akses utama: ${result.accessCount}`,
      `- Estimasi omzet model: ${formatMoney(result.estimatedRevenueLow, 0)} - ${formatMoney(result.estimatedRevenueHigh, 0)} per bulan`,
      `- Rincian skor: permintaan ${result.components.demand}, kompetisi ${result.components.competition}, kepadatan ${result.components.density}, akses ${result.components.access}, ukuran pasar ${result.components.market}`,
    );

    if (competitors.length > 0) {
      lines.push("", "### Pesaing terdekat");
      competitors.forEach((poi) => lines.push(`- ${poi.name} (${Math.round(poi.distance * 1000)} m)`));
    }
    if (anchors.length > 0) {
      lines.push("", "### Pemicu ramai terdekat");
      anchors.forEach((poi) => lines.push(`- ${poi.name} (${Math.round(poi.distance * 1000)} m)`));
    }
  } else {
    lines.push("", "## Catatan", "Survei OpenStreetMap belum dijalankan untuk titik ini, jadi belum ada hitungan pesaing dan pemicu ramai.");
  }

  lines.push(
    "",
    "## Yang saya minta",
    "1. Nilai kelayakan titik ini untuk model usaha tersebut, sebutkan alasannya dengan angka.",
    "2. Sebutkan tiga risiko terbesar yang tidak terlihat dari data peta, khusus untuk lokasi ini.",
    "3. Susun rencana verifikasi lapangan 7 hari: apa yang dihitung, jam berapa, dan berapa targetnya.",
    "4. Perkirakan traffic harian minimum agar usaha ini impas di lokasi ini, lalu bandingkan dengan estimasi di atas.",
    "5. Tutup dengan satu rekomendasi: lanjut, negosiasi ulang sewa, atau cari titik lain.",
    "",
    "Gunakan data lokal Indonesia bila kamu punya. Kalau ada asumsi yang kamu buat, tulis eksplisit sebagai asumsi.",
  );

  return lines.join("\n");
}

/**
 * URL untuk membuka asisten dengan prompt terisi. Jika layanan tidak mendukung
 * prefill, kembalikan halaman utamanya saja — pemanggil sudah menyalin prompt
 * ke papan klip lebih dulu.
 */
export function assistantUrl(assistant: Assistant, prompt: string): string {
  if (!assistant.urlTemplate) return assistant.homeUrl;
  return assistant.urlTemplate.replace("{q}", encodeURIComponent(prompt));
}
