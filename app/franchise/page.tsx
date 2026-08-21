import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { FranchiseBrowser } from "@/components/FranchiseBrowser";
import { franchiseData } from "@/lib/franchise-data";

export const metadata: Metadata = {
  title: "Franchise Indonesia - Modal, Sektor, Omzet dan BEP | Cek Bisnis",
  description:
    "Bandingkan franchise Indonesia berdasarkan sektor, modal awal, franchise fee, royalti, skema kemitraan, omzet, BEP, dan sumber resmi brand.",
  openGraph: {
    title: "Franchise Indonesia - Modal, Sektor, Omzet dan BEP",
    description: "Bandingkan franchise berdasarkan sektor dan economics, dengan data resmi dipisahkan dari estimasi screening.",
    url: "/franchise",
  },
};

export default function FranchisePage() {
  return (
    <main className="workbench-page">
      <SiteHeader />
      <FranchiseBrowser />
      <SiteFooter />
      <aside className="workbench-mobile-cta" aria-label="Bandingkan franchise">
        <span>{franchiseData.franchises.length} waralaba tersedia.</span>
        <Link href="/compare">Bandingkan</Link>
      </aside>
    </main>
  );
}
