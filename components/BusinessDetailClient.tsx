"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  ImageDown,
  Info,
  MapPin,
  PackageOpen,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { BusinessIcon } from "@/components/BusinessIcon";
import { BusinessMap } from "@/components/BusinessMap";
import {
  calculateMetrics,
  formatMoney,
  rankedCities,
  type Business,
  type City,
  type Source,
} from "@/lib/business-data";

const wrapCanvasText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) => {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;
  words.forEach((word) => {
    const test = `${line}${word} `;
    if (context.measureText(test).width > maxWidth && line) {
      context.fillText(line.trim(), x, cursorY);
      line = `${word} `;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  });
  context.fillText(line.trim(), x, cursorY);
  return cursorY;
};

const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
};

export function BusinessDetailClient({
  business,
  cities,
  sources,
}: {
  business: Business;
  cities: City[];
  sources: Source[];
}) {
  const [selectedCityId, setSelectedCityId] = useState("kediri");
  const city = cities.find((item) => item.id === selectedCityId) ?? cities[0];
  const [targetRevenue, setTargetRevenue] = useState(Math.round(business.targetRevenue * city.demandFactor));

  const selectCity = useCallback((cityId: string) => {
    const nextCity = cities.find((item) => item.id === cityId);
    setSelectedCityId(cityId);
    if (nextCity) {
      setTargetRevenue(Math.round(business.targetRevenue * nextCity.demandFactor));
    }
  }, [business.targetRevenue, cities]);

  const metrics = useMemo(
    () => calculateMetrics(business, city, targetRevenue),
    [business, city, targetRevenue],
  );
  const cityRanking = useMemo(() => rankedCities(business), [business]);
  const maxRevenue = Math.max(180, Math.ceil(business.targetRevenue * 2.5 / 10) * 10);

  const downloadPreview = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1500;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#F4F3EE";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#121617";
    context.fillRect(0, 0, canvas.width, 330);

    context.fillStyle = business.accent;
    roundedRect(context, 72, 68, 102, 102, 22);
    context.fillStyle = "#121617";
    context.font = "900 52px Arial";
    context.textAlign = "center";
    context.fillText("CB", 123, 140);
    context.fillStyle = "#B7F26C";
    for (let index = 0; index < 4; index += 1) {
      roundedRect(context, 82 + index * 22, 76, 18, 15, 6);
    }

    context.textAlign = "left";
    context.fillStyle = "#FFFFFF";
    context.font = "800 34px Arial";
    context.fillText("CEK BISNIS", 202, 112);
    context.fillStyle = "rgba(255,255,255,.55)";
    context.font = "700 18px Arial";
    context.fillText("BUSINESS PREVIEW - JULI 2026", 202, 148);

    context.fillStyle = business.accent;
    context.font = "700 20px Arial";
    context.fillText(business.category.toUpperCase(), 72, 222);
    context.fillStyle = "#FFFFFF";
    context.font = "800 66px Arial";
    context.fillText(business.name, 72, 292);

    context.fillStyle = "#121617";
    context.font = "700 22px Arial";
    context.fillText(`${city.name}, ${city.province}`, 72, 396);
    context.fillStyle = "#6A7272";
    context.font = "400 23px Arial";
    wrapCanvasText(context, business.oneLine, 72, 444, 1020, 34);

    const cards = [
      ["MODAL AWAL", `${formatMoney(metrics.capexLow, 0)} - ${formatMoney(metrics.capexHigh, 0).replace("Rp", "")}`],
      ["OMZET TARGET", `${formatMoney(metrics.monthlyRevenue, 0)} / bulan`],
      ["OMZET BEP", `${formatMoney(metrics.breakEvenRevenue)} / bulan`],
      ["MINIMUM TRAFFIC", `${metrics.traffic} ${business.trafficLabel}`],
    ];

    cards.forEach(([label, value], index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = 72 + column * 530;
      const y = 540 + row * 205;
      context.fillStyle = index === 2 ? business.accent : "#FFFFFF";
      roundedRect(context, x, y, 500, 175, 22);
      context.fillStyle = "#687171";
      context.font = "700 17px Arial";
      context.fillText(label, x + 28, y + 46);
      context.fillStyle = "#121617";
      context.font = "800 31px Arial";
      wrapCanvasText(context, value, x + 28, y + 100, 440, 38);
    });

    context.fillStyle = "#121617";
    roundedRect(context, 72, 978, 1058, 294, 24);
    context.fillStyle = business.accent;
    context.font = "800 21px Arial";
    context.fillText(`SKOR LOKASI ${metrics.opportunity}/100`, 108, 1032);
    context.fillStyle = "#FFFFFF";
    context.font = "800 31px Arial";
    context.fillText("Titik survei yang disarankan", 108, 1081);
    context.font = "400 23px Arial";
    city.hotspots.forEach((hotspot, index) => {
      context.fillStyle = business.accent;
      context.beginPath();
      context.arc(119, 1133 + index * 47, 5, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "rgba(255,255,255,.74)";
      context.fillText(hotspot, 140, 1141 + index * 47);
    });

    context.fillStyle = "#7A8181";
    context.font = "400 17px Arial";
    wrapCanvasText(
      context,
      "Estimasi indikatif. Survei traffic dan pesaing radius lokal minimal 7 hari sebelum menyewa tempat.",
      72,
      1370,
      930,
      26,
    );
    context.fillStyle = "#121617";
    context.font = "700 17px Arial";
    context.fillText("cek-bisnis-indonesia.ariefz.chatgpt.site", 72, 1442);

    const anchor = document.createElement("a");
    anchor.download = `cek-bisnis-${business.slug}-${city.id}.png`;
    anchor.href = canvas.toDataURL("image/png");
    anchor.click();
  };

  return (
    <>
      <section className="detail-hero" style={{ "--accent": business.accent } as React.CSSProperties}>
        <div className="detail-hero-copy">
          <Link className="back-link" href="/#pilih-usaha"><ArrowLeft size={17} /> Semua jenis usaha</Link>
          <div className="detail-title-row">
            <span className="detail-business-icon"><BusinessIcon id={business.id} size={36} /></span>
            <span>{business.category}</span>
          </div>
          <h1>{business.name}</h1>
          <p>{business.description}</p>
          <div className="detail-hero-tags">
            <span><Users size={17} /> {business.staffCount} staf</span>
            <span><MapPin size={17} /> Radius {business.idealRadius}</span>
            <span><Target size={17} /> {business.marginLabel}</span>
          </div>
        </div>
        <div className="detail-hero-card">
          <div className="detail-card-head"><span>PREVIEW AWAL</span><b>{city.name}</b></div>
          <div className="detail-big-number"><small>Modal masuk</small><strong>{formatMoney(metrics.capexLow, 0)}-{formatMoney(metrics.capexHigh, 0).replace("Rp", "")}</strong></div>
          <div className="detail-card-grid">
            <div><small>Omzet target</small><b>{formatMoney(metrics.monthlyRevenue, 0)}</b></div>
            <div><small>Omzet BEP</small><b>{formatMoney(metrics.breakEvenRevenue)}</b></div>
            <div><small>Traffic minimum</small><b>{metrics.traffic} {business.trafficLabel}</b></div>
            <div><small>Skor kota</small><b>{metrics.opportunity}/100</b></div>
          </div>
          <a className="detail-pdf-mini" href={`/downloads/cek-bisnis-${business.slug}-guide.pdf`} download>
            <FileText size={18} /> Unduh full guide <Download size={16} />
          </a>
        </div>
      </section>

      <section className="economics-section" id="simulasi">
        <div className="detail-section-heading">
          <div><span>01 / UNIT ECONOMICS</span><h2>Berapa angka sehatnya?</h2></div>
          <p>Ganti kota dan target omzet. Sewa, gaji, modal, BEP, dan kebutuhan pelanggan akan dihitung ulang.</p>
        </div>

        <div className="economics-shell">
          <aside className="scenario-panel">
            <label htmlFor="detail-city">Lokasi simulasi</label>
            <div className="detail-select-wrap">
              <select id="detail-city" value={selectedCityId} onChange={(event) => selectCity(event.target.value)}>
                {cities.map((item) => <option value={item.id} key={item.id}>{item.name}, {item.province}</option>)}
              </select>
              <ChevronRight size={18} />
            </div>
            <div className="detail-range-head"><label htmlFor="detail-revenue">Target omzet / bulan</label><b>{formatMoney(targetRevenue, 0)}</b></div>
            <input
              id="detail-revenue"
              type="range"
              min="5"
              max={maxRevenue}
              step="1"
              value={targetRevenue}
              onChange={(event) => setTargetRevenue(Number(event.target.value))}
              style={{ "--range-progress": `${((targetRevenue - 5) / (maxRevenue - 5)) * 100}%` } as React.CSSProperties}
            />
            <div className="detail-range-scale"><span>Rp5 jt</span><span>{formatMoney(maxRevenue, 0)}</span></div>
            <div className="scenario-assumptions">
              <div><span>Sewa estimasi</span><b>{formatMoney(metrics.rent)}</b></div>
              <div><span>Payroll {business.staffCount} staf</span><b>{formatMoney(metrics.payroll)}</b></div>
              <div><span>Biaya tetap</span><b>{formatMoney(metrics.fixedCost)}</b></div>
              <div><span>Biaya variabel</span><b>{Math.round(business.variableRate * 100)}% omzet</b></div>
            </div>
          </aside>

          <div className="economics-results">
            <div className="economics-metrics">
              <article><span><WalletCards size={21} /></span><small>CAPEX - modal awal</small><strong>{formatMoney(metrics.capexLow, 0)}-{formatMoney(metrics.capexHigh, 0).replace("Rp", "")}</strong><p>Sudah disesuaikan faktor biaya kota.</p></article>
              <article><span><Zap size={21} /></span><small>OPEX - biaya bulanan</small><strong>{formatMoney(metrics.opex)}</strong><p>Pada target omzet pilihan.</p></article>
              <article className="economics-accent"><span><Target size={21} /></span><small>BEP - omzet minimum</small><strong>{formatMoney(metrics.breakEvenRevenue)}</strong><p>{metrics.traffic} {business.trafficLabel} agar tidak rugi.</p></article>
            </div>
            <div className="profit-verdict">
              <div><small>Estimasi laba operasional</small><strong>{metrics.profit >= 0 ? "+" : ""}{formatMoney(metrics.profit)} / bulan</strong></div>
              <div><small>Estimasi balik modal</small><strong>{Number.isFinite(metrics.payback) ? `${Math.ceil(metrics.payback)} bulan` : "Belum tercapai"}</strong></div>
              <span className={`scenario-health health-${metrics.health.toLowerCase()}`}><i /> Cashflow {metrics.health}</span>
            </div>
            <p className="calculation-note"><Info size={16} /> Laba belum memasukkan cicilan, pajak penghasilan, dan gaji pemilik. Tambahkan buffer modal 15-25%.</p>
          </div>
        </div>
      </section>

      <section className="city-detail-section" id="lokasi">
        <div className="detail-section-heading">
          <div><span>02 / KOTA DAN TITIK RAMAI</span><h2>Di mana peluangnya paling masuk akal?</h2></div>
          <p>Estimasi omzet adalah rentang model untuk format usaha ini, bukan data penjualan outlet aktual.</p>
        </div>
        <div className="detail-map-shell">
          <div className="detail-map-panel">
            <div className="detail-map-toolbar"><span><i /> Peta peluang {business.short}</span><small>Klik titik kota</small></div>
            <BusinessMap business={business} selectedCity={city} onSelectCity={selectCity} />
          </div>
          <aside className="selected-location-card">
            <span>LOKASI TERPILIH</span><h3>{city.name}</h3><p>{city.province}</p>
            <div className="selected-score"><strong>{metrics.opportunity}</strong><small>/100</small></div>
            <div className="selected-location-facts">
              <div><span>Estimasi omzet</span><b>{formatMoney(metrics.revenueLow, 0)}-{formatMoney(metrics.revenueHigh, 0).replace("Rp", "")}</b></div>
              <div><span>Demand</span><b>{city.demandLabel}</b></div>
              <div><span>Kompetisi</span><b>{city.competition}</b></div>
            </div>
            <p className="location-note">{city.note}</p>
            <div className="hotspot-list"><span>Titik survei awal</span>{city.hotspots.map((hotspot) => <div key={hotspot}><MapPin size={15} />{hotspot}</div>)}</div>
          </aside>
        </div>

        <div className="city-ranking-table">
          <div className="ranking-head"><span>RANK</span><span>KOTA</span><span>AREA SURVEI</span><span>EST. OMZET</span><span>SKOR</span></div>
          {cityRanking.slice(0, 8).map((item, index) => {
            const itemMetrics = calculateMetrics(business, item);
            return (
              <button key={item.id} onClick={() => selectCity(item.id)} className={item.id === city.id ? "active" : ""}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span><b>{item.name}</b><small>{item.province}</small></span>
                <span>{item.hotspots.slice(0, 2).join(" - ")}</span>
                <span>{formatMoney(itemMetrics.revenueLow, 0)}-{formatMoney(itemMetrics.revenueHigh, 0).replace("Rp", "")}</span>
                <span><b>{item.scores[business.id]}</b><ArrowRight size={16} /></span>
              </button>
            );
          })}
        </div>
        <p className="model-disclaimer"><ShieldAlert size={17} /> Hotspot adalah shortlist area padat aktivitas. Lakukan hitung traffic per 15 menit di jam pagi, siang, sore, dan akhir pekan.</p>
      </section>

      <section className="business-blueprint-section">
        <div className="detail-section-heading">
          <div><span>03 / BUSINESS BLUEPRINT</span><h2>Apa saja yang harus dibeli dan dijalankan?</h2></div>
          <p>{business.format}</p>
        </div>
        <div className="blueprint-grid">
          <article className="equipment-card">
            <div className="blueprint-card-head"><span><PackageOpen size={21} /> Rencana modal</span><b>{formatMoney(metrics.capexMid, 0)} midpoint</b></div>
            {business.equipment.map((item, index) => (
              <div className="equipment-row" key={item.item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><b>{item.item}</b><p>{item.note}</p></div>
                <strong>{item.range}</strong>
              </div>
            ))}
          </article>
          <article className="ops-card">
            <div className="blueprint-card-head"><span><Clock3 size={21} /> Alur operasi harian</span></div>
            {business.dailyOps.map((item, index) => (
              <div className="ops-step" key={item}><i>{index + 1}</i><span>{item}</span>{index < business.dailyOps.length - 1 && <ChevronRight size={17} />}</div>
            ))}
            <div className="ideal-owner"><Sparkles size={18} /><p><b>Cocok untuk:</b> {business.idealFor}</p></div>
          </article>
        </div>
      </section>

      <section className="validation-section">
        <div className="detail-section-heading">
          <div><span>04 / VALIDASI DAN EKSEKUSI</span><h2>Rencana 90 hari sebelum scale.</h2></div>
          <p>Jangan langsung beli semua alat. Lewati tiga gerbang validasi ini lebih dulu.</p>
        </div>
        <div className="plan-grid">
          {business.plan90.map((phase, index) => (
            <article key={phase.phase}>
              <span className="plan-index">0{index + 1}</span>
              <small>{phase.phase}</small><h3>{phase.title}</h3>
              {phase.actions.map((action) => <div key={action}><Check size={16} />{action}</div>)}
            </article>
          ))}
        </div>
        <div className="validation-grid">
          <article><h3>Checklist sebelum sewa</h3>{business.checklist.map((item) => <div key={item}><Check size={16} />{item}</div>)}</article>
          <article className="risk-card"><h3>Risiko utama</h3>{business.risks.map((item) => <div key={item}><ShieldAlert size={16} />{item}</div>)}</article>
          <article><h3>Izin yang perlu dicek</h3>{business.permits.map((item) => <div key={item}><FileText size={16} />{item}</div>)}</article>
        </div>
      </section>

      <section className="business-download-section" id="download">
        <div className="download-preview-frame">
          <Image
            src={`/previews/${business.slug}.png`}
            alt={`Preview ringkas ${business.name}`}
            width={1200}
            height={1500}
          />
        </div>
        <div className="business-download-copy">
          <span>05 / DOWNLOAD BUSINESS PLAN</span>
          <h2>Simpan rencananya.<br />Bawa saat survei.</h2>
          <p>Pilih PDF untuk panduan lengkap. Pilih image untuk kartu ringkas yang mengikuti kota dan target omzet di atas.</p>
          <div className="business-download-actions">
            <a href={`/downloads/cek-bisnis-${business.slug}-guide.pdf`} download>
              <span><FileText size={24} /></span><div><small>DOWNLOAD VERSI 01</small><b>PDF Full Business Guide</b></div><Download size={19} />
            </a>
            <button type="button" onClick={downloadPreview}>
              <span><ImageDown size={24} /></span><div><small>DOWNLOAD VERSI 02</small><b>Image Preview - {city.name}</b></div><Download size={19} />
            </button>
          </div>
          <p className="download-note"><Info size={15} /> PDF memakai skenario nasional dan ranking 12 kota. Image mengikuti pilihan kota saat ini.</p>
        </div>
      </section>

      <section className="detail-sources">
        <div className="detail-section-heading"><div><span>06 / SUMBER DATA</span><h2>Asumsi yang bisa kamu audit.</h2></div></div>
        <div className="detail-source-grid">
          {sources.map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>
              <span><b>{source.title}</b><small>{source.note}</small></span><ArrowUpRight size={17} />
            </a>
          ))}
        </div>
        <p className="source-risk"><ShieldAlert size={17} /> Data publik menjadi anchor, tetapi harga vendor, sewa, dan penjualan nyata berbeda per titik. Semua keputusan investasi tetap membutuhkan quotation dan survei lapangan.</p>
      </section>

      <section className="detail-next-business">
        <div><span>MASIH MAU MEMBANDINGKAN?</span><h2>Lihat jenis usaha lainnya.</h2></div>
        <Link href="/#pilih-usaha">Kembali ke semua opsi <ArrowUpRight size={20} /></Link>
      </section>
    </>
  );
}
