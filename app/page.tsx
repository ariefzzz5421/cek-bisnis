import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  FileText,
  ImageDown,
  Info,
  MapPin,
  ShieldAlert,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { BusinessIcon } from "@/components/BusinessIcon";
import { SiteHeader } from "@/components/SiteHeader";
import { businessData, businesses, cities, formatMoney } from "@/lib/business-data";

const cityAverages = cities
  .map((city) => ({
    ...city,
    average: Math.round(Object.values(city.scores).reduce((sum, score) => sum + score, 0) / Object.values(city.scores).length),
    costIndex: Math.round(((city.wageFactor + city.rentFactor) / 2) * 100),
  }))
  .sort((a, b) => b.average - a.average);

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="landing-hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="landing-hero-copy">
          <div className="eyebrow"><span className="live-dot" /> Data Indonesia - diperbarui {businessData.updatedAt}</div>
          <h1>Jangan buka usaha<br />hanya karena <em>kelihatan ramai.</em></h1>
          <p>
            Pilih jenis usaha, cek modal awal, biaya bulanan, omzet minimum,
            kota paling cocok, dan rencana 90 hari sebelum uang benar-benar keluar.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" href="#pilih-usaha">Pilih jenis usaha <ArrowDown size={19} /></Link>
            <Link className="button-ghost" href="#metode"><Info size={18} /> Lihat dasar datanya</Link>
          </div>
          <div className="hero-proof">
            <div><strong>7</strong><span>panduan usaha</span></div>
            <div><strong>12</strong><span>kota pembanding</span></div>
            <div><strong>2</strong><span>format download</span></div>
          </div>
        </div>

        <div className="landing-hero-visual">
          <div className="hero-brand-lockup">
            <BrandLogo large />
            <span>BUSINESS FEASIBILITY LAB</span>
          </div>
          <div className="decision-card">
            <div className="decision-head">
              <span>PILIHAN CEPAT</span>
              <b>Mulai dari budget kamu</b>
            </div>
            {businesses.slice(0, 4).map((business) => (
              <Link href={`/usaha/${business.slug}`} key={business.id}>
                <span className="decision-icon" style={{ background: business.accent }}><BusinessIcon id={business.id} size={20} /></span>
                <span><small>{business.category}</small><b>{business.name}</b></span>
                <span className="decision-capex">{formatMoney(business.capex[0], 0)}+</span>
                <ArrowRight size={17} />
              </Link>
            ))}
            <Link className="decision-more" href="#pilih-usaha">Lihat semua 7 usaha <ArrowDown size={16} /></Link>
          </div>
          <div className="hero-badge hero-badge-a"><FileText size={16} /> PDF plan siap unduh</div>
          <div className="hero-badge hero-badge-b"><MapPin size={16} /> Skor 12 kota</div>
        </div>
      </section>

      <section className="business-directory" id="pilih-usaha">
        <div className="section-heading directory-heading">
          <div>
            <span className="section-kicker">01 / PILIH JENIS USAHA</span>
            <h2>Satu pilihan, satu halaman analisis lengkap.</h2>
          </div>
          <p>Setiap halaman berisi unit economics, ranking kota, estimasi omzet, alat yang dibutuhkan, risiko, rencana 90 hari, PDF, dan kartu preview.</p>
        </div>

        <div className="business-directory-grid">
          {businesses.map((business, index) => (
            <Link className="directory-card" href={`/usaha/${business.slug}`} key={business.id} style={{ "--accent": business.accent } as React.CSSProperties}>
              <div className="directory-card-top">
                <span className="directory-number">0{index + 1}</span>
                <span className="directory-icon"><BusinessIcon id={business.id} size={28} /></span>
              </div>
              <span className="directory-category">{business.category}</span>
              <h3>{business.name}</h3>
              <p>{business.oneLine}</p>
              <div className="directory-metrics">
                <div><small>Modal awal</small><b>{formatMoney(business.capex[0], 0)}-{formatMoney(business.capex[1], 0).replace("Rp", "")}</b></div>
                <div><small>Target omzet</small><b>{formatMoney(business.targetRevenue, 0)} / bln</b></div>
              </div>
              <span className="directory-link">Buka analisis <ArrowUpRight size={17} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="city-overview" id="kota">
        <div className="section-heading city-heading">
          <div>
            <span className="section-kicker">02 / KOTA DAN LOKASI RAMAI</span>
            <h2>Kota ramai belum tentu paling untung.</h2>
          </div>
          <p>Skor kota menimbang demand, daya beli, biaya masuk, dan tekanan kompetisi. Indeks biaya nasional = 100.</p>
        </div>

        <div className="city-board">
          <div className="city-board-intro">
            <MapPin size={24} />
            <h3>Radar peluang Indonesia</h3>
            <p>Pilih usaha terlebih dahulu untuk melihat ranking yang spesifik dan estimasi omzet per kota.</p>
            <div className="city-legend"><i /> Peluang tinggi <i /> Peluang sehat <i /> Perlu validasi</div>
          </div>
          <div className="city-list">
            {cityAverages.slice(0, 8).map((city, index) => (
              <article key={city.id}>
                <span className="city-rank">{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{city.name}</h3><p>{city.hotspots.slice(0, 2).join(" - ")}</p></div>
                <div className="city-index"><small>Biaya</small><b>{city.costIndex}</b></div>
                <div className="city-score"><small>Skor umum</small><b>{city.average}</b></div>
              </article>
            ))}
          </div>
        </div>
        <p className="model-disclaimer"><ShieldAlert size={17} /> Area ramai di atas adalah shortlist survei, bukan traffic live. Hitung pejalan, kendaraan, kos, rumah, dan pesaing selama minimal 7 hari.</p>
      </section>

      <section className="download-explainer">
        <div className="download-copy">
          <span className="section-kicker">03 / BAWA PULANG RENCANANYA</span>
          <h2>Bukan cuma lihat.<br />Bisa langsung dipakai.</h2>
          <p>Setiap jenis usaha punya dua file yang siap diunduh setelah kamu memilih kota dan skenario omzet.</p>
        </div>
        <div className="download-cards">
          <article>
            <span className="download-icon"><FileText size={28} /></span>
            <div><small>VERSI 01</small><h3>PDF Full Business Guide</h3></div>
            <p>Modal, OPEX, BEP, alat, SOP harian, ranking kota, risiko, izin, dan rencana 90 hari.</p>
            <span className="file-meta">6 halaman - A4 - siap cetak</span>
          </article>
          <article>
            <span className="download-icon"><ImageDown size={28} /></span>
            <div><small>VERSI 02</small><h3>Image Business Preview</h3></div>
            <p>Kartu ringkas 1200 x 1500 berisi angka utama dan kota pilihan untuk dibagikan atau disimpan.</p>
            <span className="file-meta">PNG - kota menyesuaikan</span>
          </article>
        </div>
      </section>

      <section className="method-section landing-method" id="metode">
        <div className="method-intro">
          <span className="section-kicker">04 / METODE DAN SUMBER</span>
          <h2>Angka yang bisa dibongkar,<br />bukan janji manis.</h2>
          <p>{businessData.methodNote}</p>
        </div>
        <div className="formula-grid">
          <article><span>01</span><WalletCards size={24} /><h3>CAPEX</h3><p>Alat, fit-out, deposit, stok awal, dan kas kerja.</p></article>
          <article><span>02</span><BarChart3 size={24} /><h3>OPEX</h3><p>Biaya tetap ditambah biaya variabel pada omzet terpilih.</p></article>
          <article><span>03</span><Target size={24} /><h3>BEP omzet</h3><p>Biaya tetap dibagi margin kontribusi bisnis.</p></article>
          <article><span>04</span><Sparkles size={24} /><h3>Skor kota</h3><p>Demand, daya beli, biaya, dan kompetisi lokal.</p></article>
        </div>
        <div className="source-strip">
          {businessData.sources.slice(0, 5).map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>
              <CheckCircle2 size={16} /><span><b>{source.title}</b><small>{source.note}</small></span><ArrowUpRight size={16} />
            </a>
          ))}
        </div>
      </section>

      <section className="closing-section landing-closing">
        <div><span>SUDAH SIAP MEMILIH?</span><h2>Hitung dulu.<br />Baru buka.</h2></div>
        <Link href="#pilih-usaha">Pilih usaha <ArrowUpRight size={21} /></Link>
        <div className="closing-logo"><BrandLogo large /></div>
      </section>

      <footer>
        <BrandLogo />
        <p>Preview unit economics UMKM Indonesia - bukan jaminan keuntungan.</p>
        <span>© 2026</span>
      </footer>
    </main>
  );
}
