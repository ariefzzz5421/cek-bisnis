import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Store } from "lucide-react";
import { BusinessIcon } from "@/components/BusinessIcon";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { businesses, formatMoney } from "@/lib/business-data";
import { formatInvestment, franchises } from "@/lib/franchise-data";

export const metadata: Metadata = {
  title: "Jenis Usaha - Bandingkan Model Bisnis Indonesia | Cek Bisnis",
  description: "Pilih model usaha mandiri atau franchise, lalu buka simulasi modal, target omzet, biaya, BEP, KPI, dan lokasi.",
  openGraph: { title: "Jenis Usaha | Cek Bisnis", url: "/usaha" },
};

const franchiseEntryCost = Math.min(...franchises.filter((item) => item.investment[0] > 0).map((item) => item.investment[0]));
const franchiseSample = businesses.find((business) => business.id === "franchise") ?? businesses[0];

export default function BusinessIndexPage() {
  return (
    <main className="workbench-page">
      <SiteHeader />
      <section className="business-browser" aria-labelledby="business-index-title">
        <header className="workbench-section-heading">
          <div><p>JENIS USAHA</p><h1 id="business-index-title">Pilih model yang mau diuji.</h1></div>
          <p>Setiap halaman berisi modal, biaya, target omzet, BEP, KPI, risiko, dan simulasi lokasi. Setelah itu kamu bisa membandingkannya langsung.</p>
        </header>

        <div className="workbench-hero__actions" style={{ marginBottom: 28 }}>
          <Link className="workbench-button workbench-button--primary" href="/compare">Bandingkan dua bisnis <ArrowRight size={18} aria-hidden="true" /></Link>
          <Link className="workbench-button workbench-button--quiet" href="/franchise">Lihat semua franchise</Link>
        </div>

        <div className="business-browser__grid">
          {businesses.map((business, index) => (
            <article className={`business-browser__item ${index === 0 || index === 4 ? "is-wide" : ""}`} key={business.id}>
              <Link href={`/usaha/${business.slug}`} aria-label={`Buka analisis ${business.name}`}>
                <div className="business-browser__media">
                  <Image src={`/businesses/${business.slug}.jpg`} alt={`Contoh ${business.name} di Indonesia`} width={720} height={480} unoptimized />
                  <span><BusinessIcon id={business.id} size={18} /> {business.category}</span>
                </div>
                <div className="business-browser__body">
                  <div><h2>{business.name}</h2><p>{business.oneLine}</p></div>
                  <dl>
                    <div><dt>Modal mulai</dt><dd>{formatMoney(business.capex[0], 0)}</dd></div>
                    <div><dt>Target omzet</dt><dd>{formatMoney(business.targetRevenue, 0)}/bln</dd></div>
                  </dl>
                  <span className="business-browser__action">Analisis usaha <ArrowUpRight size={17} aria-hidden="true" /></span>
                </div>
              </Link>
            </article>
          ))}

          <article className="business-browser__item business-browser__item--franchise">
            <Link href="/franchise" aria-label="Buka daftar franchise Indonesia">
              <div className="business-browser__media">
                <Image src={`/businesses/${franchiseSample.slug}.jpg`} alt="Gerai franchise di Indonesia" width={720} height={480} unoptimized />
                <span><Store size={18} aria-hidden="true" /> Franchise & kemitraan</span>
              </div>
              <div className="business-browser__body">
                <div><h2>Franchise</h2><p>{franchises.length} brand dengan sektor, modal, fee, royalty, omzet, dan BEP yang bisa dibandingkan.</p></div>
                <dl>
                  <div><dt>Modal terendah terpublikasi</dt><dd>{formatInvestment(franchiseEntryCost)}</dd></div>
                  <div><dt>Brand dibandingkan</dt><dd>{franchises.length}</dd></div>
                </dl>
                <span className="business-browser__action">Lihat franchise <ArrowUpRight size={17} aria-hidden="true" /></span>
              </div>
            </Link>
          </article>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
