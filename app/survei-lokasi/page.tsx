import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
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
      <SiteFooter compact />
    </main>
  );
}
