import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, FileText, ImageDown, MapPinned, ShieldCheck } from "lucide-react";
import { BusinessIcon } from "@/components/BusinessIcon";
import { BusinessTour } from "@/components/BusinessTour";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { businessData, businesses, formatMoney } from "@/lib/business-data";
import { indonesiaPlaces, placesMeta, scorePlaceForBusiness } from "@/lib/location-survey";

const featured = businesses[0];
const mapPlaces = ["Kediri", "Bandung", "Makassar"].map((name) => indonesiaPlaces.find((place) => place.name === name)).filter(Boolean);

export default function Home() {
  return (
    <main className="workbench-page">
      <SiteHeader landing />

      <section className="workbench-hero" aria-labelledby="workbench-title">
        <div className="workbench-hero__copy">
          <div className="hum-process" aria-label="Alur analisis Cek Bisnis">
            <span><i />01 Pilih</span><b />
            <span><i />02 Hitung</span><b />
            <span><i />03 Lokasi</span><b />
            <span><i />04 Rencana</span>
          </div>
          <p className="workbench-kicker"><span aria-hidden="true" /> Data Indonesia · diperbarui {businessData.updatedAt}</p>
          <h1 id="workbench-title">Sebelum buka usaha,<br />buka angkanya.</h1>
          <p>Bandingkan modal, biaya bulanan, omzet BEP, alat, dan lokasi untuk tujuh model UMKM Indonesia.</p>
          <div className="workbench-hero__actions">
            <Link className="workbench-button workbench-button--primary" href="#pilih-usaha">Mulai analisis <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link className="workbench-button workbench-button--quiet" href="/survei-lokasi"><MapPinned size={18} aria-hidden="true" /> Peta usaha Indonesia</Link>
          </div>
          <dl className="workbench-proof">
            <div><dt>Model usaha</dt><dd>{businesses.length}</dd></div>
            <div><dt>Kota & kabupaten</dt><dd>{placesMeta.count}</dd></div>
            <div><dt>Format unduhan</dt><dd>PDF + PNG</dd></div>
          </dl>
        </div>

        <div className="workbench-preview" aria-label="Contoh ringkasan analisis Laundry Kiloan">
          <div className="hum-character" aria-hidden="true"><i /><i /><i /></div>
          <div className="workbench-preview__bar"><span>Ringkasan keputusan</span><i>Siap dihitung</i></div>
          <div className="workbench-preview__business">
            <Image src={`/businesses/${featured.slug}.jpg`} alt={`Contoh ${featured.name}`} width={640} height={420} priority unoptimized />
            <div><small>{featured.category}</small><h2>{featured.name}</h2><p>{featured.oneLine}</p></div>
          </div>
          <div className="workbench-preview__metrics">
            <div><small>Modal awal</small><b>{formatMoney(featured.capex[0], 0)}-{formatMoney(featured.capex[1], 0).replace("Rp", "")}</b></div>
            <div><small>Target omzet</small><b>{formatMoney(featured.targetRevenue, 0)}/bln</b></div>
            <div><small>Harga rata-rata</small><b>{formatMoney(featured.avgTicket)}</b></div>
          </div>
          <Link href={`/usaha/${featured.slug}`}>Buka simulasi lengkap <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="business-browser" id="pilih-usaha" aria-labelledby="business-browser-title">
        <header className="workbench-section-heading">
          <div><p>1.0 · PILIH MODEL USAHA</p><h2 id="business-browser-title">Mulai dari usaha yang kamu pahami.</h2></div>
          <p>Setiap analisis berisi tiga skala modal, simulasi kota, daftar alat lengkap, dan rencana yang bisa diunduh.</p>
        </header>

        <div className="business-browser__grid">
          {businesses.map((business, index) => (
            <article className={`business-browser__item ${index === 0 || index === 4 ? "is-wide" : ""}`} key={business.id}>
              <Link href={`/usaha/${business.slug}`} aria-label={`Buka analisis ${business.name}`}>
                <div className="business-browser__media">
                  <Image src={`/businesses/${business.slug}.jpg`} alt={`Contoh nyata ${business.name} di Indonesia`} width={720} height={480} unoptimized />
                  <span><BusinessIcon id={business.id} size={18} /> {business.category}</span>
                </div>
                <div className="business-browser__body">
                  <div><h3>{business.name}</h3><p>{business.oneLine}</p></div>
                  <dl>
                    <div><dt>Modal mulai</dt><dd>{formatMoney(business.capex[0], 0)}</dd></div>
                    <div><dt>Target omzet</dt><dd>{formatMoney(business.targetRevenue, 0)}/bln</dd></div>
                  </dl>
                  <span className="business-browser__action">Analisis usaha <ArrowUpRight size={17} aria-hidden="true" /></span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="decision-workspace" aria-labelledby="decision-workspace-title">
        <div className="decision-workspace__copy">
          <p>2.0 · HITUNG ANGKA</p>
          <h2 id="decision-workspace-title">Satu layar untuk keputusan utama.</h2>
          <p>Tidak perlu membaca laporan panjang. Fokus pada empat hal yang menentukan usaha bisa bertahan.</p>
          <ul>
            <li><Check size={17} aria-hidden="true" /><span><b>Modal awal</b> — alat, renovasi, stok, dan pembukaan.</span></li>
            <li><Check size={17} aria-hidden="true" /><span><b>Biaya bulanan</b> — sewa, gaji, utilitas, dan bahan.</span></li>
            <li><Check size={17} aria-hidden="true" /><span><b>Omzet BEP</b> — target minimum agar biaya tertutup.</span></li>
            <li><Check size={17} aria-hidden="true" /><span><b>Risiko lokasi</b> — permintaan, pesaing, dan akses.</span></li>
          </ul>
        </div>
        <figure className="decision-workspace__tour">
          <BusinessTour />
          <figcaption>Preview contoh tujuh format usaha.</figcaption>
        </figure>
      </section>

      <section className="map-workspace" aria-labelledby="map-workspace-title">
        <div className="map-workspace__panel">
          <div className="map-workspace__mesh" aria-hidden="true" />
          <MapPinned size={72} aria-hidden="true" />
          {mapPlaces.map((place, index) => place && <span className={`map-workspace__pin map-workspace__pin--${["one", "two", "three"][index]}`} key={place.id}>{place.name} <b>{scorePlaceForBusiness(place, featured.id)}</b></span>)}
        </div>
        <div className="map-workspace__copy">
          <p>3.0 · UJI LOKASI</p>
          <h2 id="map-workspace-title">Kota yang berbeda, hasilnya berbeda.</h2>
          <p>Cari kota atau klik titik di peta. Sistem membaca populasi, peran kota, pesaing, pemicu ramai, bangunan, dan akses dari GeoNames serta OpenStreetMap.</p>
          <dl><div><dt>Wilayah tersedia</dt><dd>{placesMeta.count}</dd></div><div><dt>Radius titik</dt><dd>500 m–1,5 km</dd></div></dl>
          <Link className="workbench-button workbench-button--primary" href="/survei-lokasi">Jalankan survei lokasi <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="download-workspace" aria-labelledby="download-workspace-title">
        <header className="workbench-section-heading">
          <div><p>4.0 · AMBIL RENCANA</p><h2 id="download-workspace-title">Panduan siap survei.</h2></div>
          <p>Pilih usaha terlebih dahulu. Dua file tersedia langsung dari halaman analisis.</p>
        </header>
        <div className="download-workspace__rows">
          <article><FileText size={24} aria-hidden="true" /><div><small>PDF · 3 HALAMAN</small><h3>Panduan usaha lengkap</h3><p>Modal, alat, operasi, risiko, dan rencana 90 hari.</p></div><span>Tersedia per usaha</span></article>
          <article><ImageDown size={24} aria-hidden="true" /><div><small>PNG · PREVIEW</small><h3>Kartu angka utama</h3><p>Modal, omzet, BEP, dan traffic minimum dalam satu gambar.</p></div><span>Tersedia per usaha</span></article>
        </div>
      </section>

      <section className="data-workspace" id="data" aria-labelledby="data-workspace-title">
        <div>
          <ShieldCheck size={28} aria-hidden="true" />
          <p>DASAR DATA</p>
          <h2 id="data-workspace-title">Bisa dicek. Tetap perlu survei.</h2>
          <span>Estimasi adalah alat screening awal, bukan jaminan keuntungan.</span>
        </div>
        <nav aria-label="Sumber data utama">
          {businessData.sources.slice(0, 5).map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>
              <span><b>{source.title}</b><small>{source.note}</small></span><ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ))}
          <a href={placesMeta.sourceUrl} target="_blank" rel="noreferrer"><span><b>GeoNames Indonesia</b><small>{placesMeta.count} kota dan kabupaten · {placesMeta.license}</small></span><ArrowUpRight size={16} /></a>
        </nav>
      </section>

      <section className="workbench-closing" aria-labelledby="workbench-closing-title">
        <p>Pilih satu usaha. Uji angkanya.</p>
        <h2 id="workbench-closing-title">Hitung dulu.<br />Baru buka.</h2>
        <Link className="workbench-button workbench-button--light" href="#pilih-usaha">Mulai analisis <ArrowRight size={18} aria-hidden="true" /></Link>
      </section>

      <SiteFooter />
      <aside className="workbench-mobile-cta" aria-label="Mulai analisis usaha"><span>Pilih usaha untuk mulai.</span><a href="#pilih-usaha">Mulai analisis <ArrowRight size={17} /></a></aside>
    </main>
  );
}
