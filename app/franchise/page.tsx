import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { FranchiseBrowser } from "@/components/FranchiseBrowser";
import { franchiseData } from "@/lib/franchise-data";

export const metadata: Metadata = {
  title: "20 Franchise Indonesia - Modal, Skema Kemitraan, dan BEP | Cek Bisnis",
  description:
    "Bandingkan 20 waralaba populer di Indonesia: modal awal, franchise fee, royalti, skema kemitraan, perkiraan omzet, dan rentang balik modal.",
  openGraph: {
    title: "20 Franchise Indonesia - Modal, Skema, dan BEP",
    description: "Modal awal, franchise fee, royalti, dan rentang balik modal dari 20 waralaba populer Indonesia.",
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
        <span>Bandingkan {franchiseData.franchises.length} waralaba.</span>
        <a href="#daftar-franchise">Lihat daftar</a>
      </aside>
    </main>
  );
}
