import type { Metadata } from "next";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { businessData } from "@/lib/business-data";
import { franchiseData } from "@/lib/franchise-data";

export const metadata: Metadata = {
  title: "Dasar Data & Metodologi | Cek Bisnis",
  description: "Sumber dan metodologi yang digunakan Cek Bisnis untuk model usaha, franchise, biaya, omzet, BEP, dan screening lokasi.",
  openGraph: { title: "Dasar Data & Metodologi | Cek Bisnis", url: "/data" },
};

export default function DataPage() {
  return (
    <main className="workbench-page page-plain">
      <SiteHeader />
      <section className="data-workspace" aria-labelledby="data-page-title">
        <div>
          <ShieldCheck size={34} aria-hidden="true" />
          <p>DASAR DATA</p>
          <h1 id="data-page-title">Angka boleh dipakai. Asalnya harus jelas.</h1>
          <span>{businessData.methodNote}</span>
          <span>{franchiseData.note}</span>
        </div>
        <nav aria-label="Sumber data usaha dan franchise">
          {businessData.sources.map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={`business-${source.id}`}>
              <span><b>{source.title}</b><small>{source.note}</small></span><ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ))}
          {franchiseData.sources.map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={`franchise-${source.id}`}>
              <span><b>{source.title}</b><small>Sumber franchise / kemitraan</small></span><ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </section>
      <section className="workbench-closing" aria-labelledby="data-closing-title">
        <p>Prinsip metodologi</p>
        <h2 id="data-closing-title">Kalau brand tidak publish,<br />jangan mengarang.</h2>
      </section>
      <SiteFooter />
    </main>
  );
}
