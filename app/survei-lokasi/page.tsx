import type { Metadata } from "next";
import { BrandLogo } from "@/components/BrandLogo";
import { SiteHeader } from "@/components/SiteHeader";
import { SurveyPageClient } from "./SurveyPageClient";

export const metadata: Metadata = {
  title: "Survei Lokasi Usaha Indonesia | Cek Bisnis",
  description: "Pilih usaha dan analisis titik lokasi di seluruh Indonesia dengan data OpenStreetMap dan GeoNames.",
};

export default function SurveyLocationPage() {
  return (
    <main>
      <SiteHeader />
      <SurveyPageClient />
      <footer>
        <BrandLogo />
        <p>Skor lokasi awal. Tetap survei lapangan.</p>
        <span>© 2026</span>
      </footer>
    </main>
  );
}
