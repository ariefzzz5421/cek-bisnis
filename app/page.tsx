import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, FileText, ImageDown, Map, ShieldAlert } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { BusinessTour } from "@/components/BusinessTour";
import { SiteHeader } from "@/components/SiteHeader";
import { businessData, businesses, formatMoney } from "@/lib/business-data";
import { placesMeta } from "@/lib/location-survey";

const workflow = [
  { number: "1.0", label: "Pilih usaha", href: "#pilih-usaha" },
  { number: "2.0", label: "Baca angka", href: "#cara-kerja" },
  { number: "3.0", label: "Survei kota", href: "#lokasi" },
  { number: "4.0", label: "Simpan rencana", href: "#simpan-rencana" },
];

export default function Home() {
  return (
    <main className="decision-page">
      <SiteHeader landing />

      <section className="decision-hero" aria-labelledby="decision-title">
        <div className="decision-hero__copy">
          <p className="decision-meta"><span aria-hidden="true" /> Data Indonesia · {businessData.updatedAt}</p>
          <h1 id="decision-title">Lihat usahanya.<br />Hitung risikonya.</h1>
          <p className="decision-lede">Modal, biaya, BEP, dan lokasi—sebelum uang keluar.</p>
          <Link className="decision-primary" href="#pilih-usaha">
            Mulai analisis usaha <ArrowRight size={19} aria-hidden="true" />
          </Link>
        </div>

        <nav className="workflow-index" aria-label="Tahapan analisis usaha">
          {workflow.map((step) => (
            <a href={step.href} key={step.number}>
              <span>{step.number}</span>
              <b>{step.label}</b>
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          ))}
        </nav>

        <div className="decision-proof" aria-label="Cakupan Cek Bisnis">
          <div><strong>{businesses.length}</strong><span>model usaha</span></div>
          <div><strong>{placesMeta.count}</strong><span>kota &amp; kabupaten</span></div>
          <div><strong>2</strong><span>format unduhan</span></div>
        </div>
      </section>

      <section className="workflow-stage business-ledger" id="pilih-usaha" aria-labelledby="business-ledger-title">
        <header className="stage-heading">
          <p><span>1.0</span> Pilih usaha</p>
          <div>
            <h2 id="business-ledger-title">Bandingkan sebelum memilih.</h2>
            <p>Tujuh model usaha dengan modal awal dan target omzet yang bisa langsung dibuka analisisnya.</p>
          </div>
        </header>

        <div className="ledger-head" aria-hidden="true">
          <span>Usaha</span><span>Modal awal</span><span>Target omzet</span><span>Aksi</span>
        </div>
        <div className="ledger-body">
          {businesses.map((business, index) => (
            <article className="ledger-row" key={business.id}>
              <div className="ledger-business">
                <span className="ledger-number">{String(index + 1).padStart(2, "0")}</span>
                <Image
                  src={`/businesses/${business.slug}.jpg`}
                  alt={`Contoh ${business.name} di Indonesia`}
                  width={240}
                  height={160}
                  unoptimized
                />
                <div>
                  <small>{business.category}</small>
                  <h3>{business.name}</h3>
                  <p>{business.oneLine}</p>
                </div>
              </div>
              <div className="ledger-metric"><small>Modal awal</small><strong>{formatMoney(business.capex[0], 0)}+</strong></div>
              <div className="ledger-metric"><small>Target omzet</small><strong>{formatMoney(business.targetRevenue, 0)}/bln</strong></div>
              <Link className="ledger-action" href={`/usaha/${business.slug}`} aria-label={`Buka analisis ${business.name}`}>
                Buka analisis <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-stage analysis-stage" id="cara-kerja" aria-labelledby="analysis-stage-title">
        <header className="stage-heading stage-heading--dark">
          <p><span>2.0</span> Baca angka</p>
          <div>
            <h2 id="analysis-stage-title">Tahu apa yang harus dicapai.</h2>
            <p>Setiap usaha diringkas menjadi empat keputusan utama, bukan laporan yang panjang.</p>
          </div>
        </header>

        <div className="analysis-layout">
          <div className="analysis-checklist">
            <div><span>01</span><strong>Modal awal</strong><p>Peralatan, renovasi, stok, dan biaya pembukaan.</p></div>
            <div><span>02</span><strong>Biaya bulanan</strong><p>Sewa, tenaga kerja, utilitas, dan biaya variabel.</p></div>
            <div><span>03</span><strong>Batas BEP</strong><p>Omzet dan pelanggan minimum agar biaya tertutup.</p></div>
            <div><span>04</span><strong>Risiko lokasi</strong><p>Permintaan, biaya kota, dan pesaing di sekitar titik.</p></div>
          </div>
          <figure className="analysis-tour">
            <BusinessTour />
            <figcaption>Preview nyata tujuh model usaha Indonesia.</figcaption>
          </figure>
        </div>
      </section>

      <section className="workflow-stage location-stage" id="lokasi" aria-labelledby="location-stage-title">
        <header className="stage-heading">
          <p><span>3.0</span> Survei seluruh Indonesia</p>
          <div>
            <h2 id="location-stage-title">Lokasi mengubah hasil.</h2>
            <p>Pilih kota atau titik usaha, lalu lihat skor peluang, pesaing sekitar, dan estimasi omzetnya.</p>
          </div>
        </header>

        <div className="location-layout">
          <div className="location-map" aria-hidden="true">
            <div className="location-map__grid" />
            <Map size={250} strokeWidth={0.7} />
            <span className="location-pin location-pin--kediri"><i /> Kediri</span>
            <span className="location-pin location-pin--medan"><i /> Medan</span>
            <span className="location-pin location-pin--makassar"><i /> Makassar</span>
          </div>
          <div className="location-brief">
            <strong>{placesMeta.count}</strong>
            <p>kota dan kabupaten tersedia untuk dibandingkan.</p>
            <ul>
              <li><Check size={17} aria-hidden="true" /> Top usaha dan skor setiap kota</li>
              <li><Check size={17} aria-hidden="true" /> Pesaing sekitar dari OpenStreetMap</li>
              <li><Check size={17} aria-hidden="true" /> Estimasi omzet berdasarkan lokasi</li>
            </ul>
            <Link className="decision-secondary" href="/survei-lokasi">
              Buka peta Indonesia <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="workflow-stage download-stage" id="simpan-rencana" aria-labelledby="download-stage-title">
        <header className="stage-heading">
          <p><span>4.0</span> Simpan rencana</p>
          <div>
            <h2 id="download-stage-title">Bawa hasilnya saat survei.</h2>
            <p>Pilih usaha terlebih dahulu. Setiap halaman analisis menyediakan dua file siap unduh.</p>
          </div>
        </header>

        <div className="download-list">
          <article>
            <FileText size={28} aria-hidden="true" />
            <div><small>PDF · 3 HALAMAN</small><h3>Panduan usaha</h3><p>Angka, alat, operasi, risiko, dan rencana 90 hari.</p></div>
            <span>Tersedia per usaha</span>
          </article>
          <article>
            <ImageDown size={28} aria-hidden="true" />
            <div><small>PNG · PREVIEW</small><h3>Kartu ringkas</h3><p>Modal, BEP, omzet, dan traffic minimum.</p></div>
            <span>Tersedia per usaha</span>
          </article>
        </div>
        <Link className="download-next" href="#pilih-usaha">Pilih usaha untuk mengunduh <ArrowRight size={18} aria-hidden="true" /></Link>
      </section>

      <section className="evidence-section" id="data" aria-labelledby="evidence-title">
        <div className="evidence-intro">
          <p>Dasar data</p>
          <h2 id="evidence-title">Bisa dicek. Tetap perlu survei.</h2>
          <p><ShieldAlert size={18} aria-hidden="true" /> Estimasi awal bukan jaminan untung.</p>
        </div>
        <div className="evidence-links">
          {businessData.sources.slice(0, 5).map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>
              <Check size={15} aria-hidden="true" />
              <span><b>{source.title}</b><small>{source.note}</small></span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ))}
          <a href={placesMeta.sourceUrl} target="_blank" rel="noreferrer">
            <Check size={15} aria-hidden="true" />
            <span><b>GeoNames Indonesia</b><small>{placesMeta.count} kota/kabupaten · {placesMeta.license}</small></span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="decision-closing" aria-labelledby="closing-title">
        <p>Mulai dari satu pilihan.</p>
        <h2 id="closing-title">Hitung dulu.<br />Baru buka.</h2>
        <Link className="decision-primary decision-primary--light" href="#pilih-usaha">
          Mulai analisis usaha <ArrowRight size={19} aria-hidden="true" />
        </Link>
      </section>

      <footer className="decision-footer">
        <BrandLogo />
        <p>Estimasi awal UMKM Indonesia. Bukan jaminan untung.</p>
        <div><Link href="/survei-lokasi">Survei lokasi</Link><a href="#data">Dasar data</a><span>© 2026</span></div>
      </footer>

      <aside className="mobile-analysis-cta" aria-label="Mulai analisis usaha">
        <span>Pilih satu usaha untuk mulai.</span>
        <a href="#pilih-usaha">Mulai analisis <ArrowRight size={17} aria-hidden="true" /></a>
      </aside>
    </main>
  );
}
