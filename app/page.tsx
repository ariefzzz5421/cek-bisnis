import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Download, FileText, ImageDown, Map, MapPin, ShieldAlert } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { BusinessIcon } from "@/components/BusinessIcon";
import { BusinessTour } from "@/components/BusinessTour";
import { SiteHeader } from "@/components/SiteHeader";
import { businessData, businesses, formatMoney } from "@/lib/business-data";
import { placesMeta } from "@/lib/location-survey";

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="real-hero">
        <div className="real-hero-copy">
          <span className="eyebrow"><i /> DATA INDONESIA · {businessData.updatedAt}</span>
          <h1>Lihat usahanya.<br /><em>Hitung risikonya.</em></h1>
          <p>Modal, biaya, BEP, dan lokasi—sebelum uang keluar.</p>
          <div className="hero-actions">
            <Link className="button-primary" href="#pilih-usaha">Pilih usaha <ArrowRight size={19} /></Link>
            <Link className="button-ghost" href="/survei-lokasi"><MapPin size={18} /> Survei lokasi</Link>
          </div>
          <div className="real-proof">
            <div><strong>7</strong><span>usaha</span></div>
            <div><strong>{placesMeta.count}</strong><span>kota & kabupaten</span></div>
            <div><strong>2</strong><span>file unduhan</span></div>
          </div>
        </div>
        <BusinessTour />
      </section>

      <section className="real-business-section" id="pilih-usaha">
        <div className="real-section-head">
          <div><span>01 · PILIH USAHA</span><h2>Mulai dari satu model.</h2></div>
          <p>Angka utama. Contoh nyata. Panduan singkat.</p>
        </div>
        <div className="real-business-grid">
          {businesses.map((business, index) => (
            <Link className="real-business-card" href={`/usaha/${business.slug}`} key={business.id} style={{ "--accent": business.accent } as React.CSSProperties}>
              <div className="business-photo">
                <Image src={`/businesses/${business.slug}.jpg`} alt={`Contoh nyata ${business.name} di Indonesia`} width={1536} height={1024} unoptimized />
                <span><BusinessIcon id={business.id} size={22} /> 0{index + 1}</span>
              </div>
              <div className="business-card-body">
                <small>{business.category}</small>
                <h3>{business.name}</h3>
                <p>{business.oneLine}</p>
                <div><span><small>Modal</small><b>{formatMoney(business.capex[0], 0)}+</b></span><span><small>Target</small><b>{formatMoney(business.targetRevenue, 0)}/bln</b></span></div>
                <em>Buka analisis <ArrowUpRight size={16} /></em>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="map-cta" id="lokasi">
        <div className="map-cta-copy">
          <span>02 · SURVEI SELURUH INDONESIA</span>
          <h2>Cari kota.<br />Klik lokasi.<br />Lihat skor.</h2>
          <ul>
            <li><Check size={17} /> Pesaing nyata di peta</li>
            <li><Check size={17} /> Pemicu ramai dan akses</li>
            <li><Check size={17} /> Estimasi omzet model</li>
          </ul>
          <Link href="/survei-lokasi">Buka peta Indonesia <ArrowRight size={19} /></Link>
        </div>
        <div className="map-cta-visual">
          <div className="map-grid-lines" />
          <Map size={210} strokeWidth={0.75} />
          <div className="map-pin-demo pin-a"><i /> Kediri</div>
          <div className="map-pin-demo pin-b"><i /> Makassar</div>
          <div className="map-pin-demo pin-c"><i /> Medan</div>
          <p><ShieldAlert size={16} /> Skor awal, bukan traffic live.</p>
        </div>
      </section>

      <section className="simple-download" id="download">
        <div><span>03 · SIMPAN RENCANA</span><h2>Dua file. Langsung pakai.</h2></div>
        <article><FileText size={28} /><div><small>PDF · 3 HALAMAN</small><h3>Panduan usaha</h3><p>Angka, alat, operasi, dan rencana 90 hari.</p></div><Download size={20} /></article>
        <article><ImageDown size={28} /><div><small>PNG · PREVIEW</small><h3>Kartu ringkas</h3><p>Modal, BEP, omzet, dan traffic minimum.</p></div><Download size={20} /></article>
      </section>

      <section className="data-strip" id="data">
        <div><span>DASAR DATA</span><h2>Bisa dicek. Tetap perlu survei.</h2></div>
        <div className="data-links">
          {businessData.sources.slice(0, 5).map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.id}><Check size={15} /><span><b>{source.title}</b><small>{source.note}</small></span><ArrowUpRight size={15} /></a>
          ))}
          <a href={placesMeta.sourceUrl} target="_blank" rel="noreferrer"><Check size={15} /><span><b>GeoNames Indonesia</b><small>{placesMeta.count} kota/kabupaten · {placesMeta.license}</small></span><ArrowUpRight size={15} /></a>
        </div>
      </section>

      <section className="real-closing"><div><span>SUDAH PUNYA CALON USAHA?</span><h2>Hitung dulu.<br />Baru buka.</h2></div><Link href="#pilih-usaha">Mulai cek <ArrowUpRight size={20} /></Link></section>

      <footer><BrandLogo /><p>Estimasi awal UMKM Indonesia. Bukan jaminan untung.</p><span>© 2026</span></footer>
    </main>
  );
}
