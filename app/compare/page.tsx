import type { Metadata } from "next";
import { BusinessCompare } from "@/components/BusinessCompare";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Compare Business - Bandingkan Usaha & Franchise | Cek Bisnis",
  description: "Bandingkan dua usaha atau franchise berdasarkan modal, omzet, BEP, biaya berulang, mekanisme, dan faktor penentu.",
  openGraph: {
    title: "Compare Business | Cek Bisnis",
    description: "Dua bisnis dalam satu layar: modal, omzet, BEP, fee, mekanisme, dan faktor penentu.",
    url: "/compare",
  },
};

export default function ComparePage() {
  return (
    <main className="workbench-page page-plain">
      <SiteHeader />
      <BusinessCompare />
      <SiteFooter />
    </main>
  );
}
