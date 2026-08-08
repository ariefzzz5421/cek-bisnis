"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarClock,
  Check,
  Download,
  FileText,
  Gauge,
  ImageDown,
  Info,
  Percent,
  PieChart,
  PiggyBank,
  ShieldAlert,
  Target,
  Timer,
  TrendingUp,
  Users,
  WalletCards,
  Workflow,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BusinessIcon } from "@/components/BusinessIcon";
import { AIAnalysisPanel } from "@/components/AIAnalysisPanel";
import { EquipmentCatalog } from "@/components/EquipmentCatalog";
import { LocationSurvey } from "@/components/LocationSurvey";
import {
  calculateMetrics,
  formatMoney,
  formatMonths,
  formatPercent,
  formatTicket,
  scenarioRevenue,
  type Business,
  type City,
  type Source,
} from "@/lib/business-data";
import { getBusinessDetail } from "@/lib/business-details";

/** Posisi garis impas pada meter, dalam persen lebar track (1 / 1,6). */
const BEP_MARKER = 62.5;

export function BusinessDetailClient({ business, cities, sources }: { business: Business; cities: City[]; sources: Source[] }) {
  const initialCity = cities.find((item) => item.id === "kediri") ?? cities[0];
  const detail = getBusinessDetail(business.id);
  const initialScale = detail.scales[1] ?? detail.scales[0];
  const [cityId, setCityId] = useState(initialCity.id);
  const [scaleId, setScaleId] = useState(initialScale.id);
  const city = cities.find((item) => item.id === cityId) ?? initialCity;
  const selectedScale = detail.scales.find((item) => item.id === scaleId) ?? initialScale;
  const [targetRevenue, setTargetRevenue] = useState(
    Math.round(((initialScale.revenue[0] + initialScale.revenue[1]) / 2) * initialCity.demandFactor),
  );
  const metrics = calculateMetrics(business, city, targetRevenue, selectedScale.capex);
  const largestScale = detail.scales[detail.scales.length - 1];
  const maxRevenue = Math.max(180, Math.ceil(largestScale.revenue[1] * 1.4 / 10) * 10);
  const rangeProgress = Math.round(((targetRevenue - 5) / (maxRevenue - 5)) * 100);
  const [previewState, setPreviewState] = useState<"idle" | "loading" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const downloadRef = useRef<HTMLElement>(null);
  const [downloadVisible, setDownloadVisible] = useState(false);

  // Kanvas baru digambar saat blok unduhan mendekati layar, supaya halaman
  // tidak menanggung biaya render untuk pengunjung yang tidak scroll ke sana.
  useEffect(() => {
    const node = downloadRef.current;
    if (!node || downloadVisible) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setDownloadVisible(true)),
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [downloadVisible]);

  useEffect(() => {
    if (!downloadVisible) return;
    let url: string | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const { renderBusinessPreview } = await import("@/lib/preview-image");
        const blob = await renderBusinessPreview({ business, city, scale: selectedScale, metrics });
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } catch {
        // Biarkan thumbnail statis yang tampil kalau kanvas gagal.
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [business, city, downloadVisible, metrics, selectedScale]);

  const changeCity = (nextId: string) => {
    const nextCity = cities.find((item) => item.id === nextId);
    setCityId(nextId);
    if (nextCity) {
      setTargetRevenue(Math.round(((selectedScale.revenue[0] + selectedScale.revenue[1]) / 2) * nextCity.demandFactor));
    }
  };

  /**
   * PNG dirender saat diklik, bukan diambil dari berkas statis, supaya isinya
   * mengikuti kota dan skala yang sedang dipilih. Modul kanvasnya diimpor
   * dinamis agar tidak menambah beban bundel halaman.
   */
  const downloadPreview = async () => {
    setPreviewState("loading");
    try {
      const { renderBusinessPreview } = await import("@/lib/preview-image");
      const blob = await renderBusinessPreview({ business, city, scale: selectedScale, metrics });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `cek-bisnis-${business.slug}-${city.id}-ringkasan.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      setPreviewState("idle");
    } catch {
      setPreviewState("error");
    }
  };

  const changeScale = (nextId: string) => {
    const nextScale = detail.scales.find((item) => item.id === nextId);
    if (!nextScale) return;
    setScaleId(nextId);
    setTargetRevenue(Math.round(((nextScale.revenue[0] + nextScale.revenue[1]) / 2) * city.demandFactor));
  };

  return (
    <>
      <section className="photo-detail-hero" style={{ "--accent": business.accent } as React.CSSProperties}>
        <div className="photo-detail-media">
          <Image src={`/businesses/${business.slug}.jpg`} alt={`Contoh nyata ${business.name} di Indonesia`} width={1536} height={1024} priority unoptimized />
          <span>CONTOH FORMAT NYATA</span>
        </div>
        <div className="photo-detail-copy">
          <Link href="/#pilih-usaha"><ArrowLeft size={17} /> Semua usaha</Link>
          <div className="detail-category"><BusinessIcon id={business.id} size={23} />{business.category}</div>
          <h1>{business.name}</h1>
          <p>{business.oneLine}</p>
          <div className="hero-number-grid">
            <div><small>Modal awal</small><b>{formatMoney(metrics.capexLow, 0)}-{formatMoney(metrics.capexHigh, 0).replace("Rp", "")}</b></div>
            <div><small>Target omzet</small><b>{formatMoney(metrics.monthlyRevenue, 0)}/bln</b></div>
            <div><small>Omzet BEP</small><b>{formatMoney(metrics.breakEvenRevenue)}</b></div>
          </div>
          <div className="detail-quick-tags"><span><Users size={16} />{selectedScale.staff}</span><span><Target size={16} />{selectedScale.capacity}</span></div>
          <a className="quick-pdf" href={`/downloads/cek-bisnis-${business.slug}-guide.pdf`} download><FileText size={18} /> Unduh panduan 5 halaman <Download size={17} /></a>
        </div>
      </section>

      <section className="business-scale-section" aria-labelledby={`scale-${business.id}`}>
        <div className="real-section-head">
          <div><span>PILIH SKALA</span><h2 id={`scale-${business.id}`}>Mulai sesuai modal.</h2></div>
          <p>{detail.priceLabel}</p>
        </div>
        <div className="scale-grid">
          {detail.scales.map((scale) => (
            <button type="button" className={scale.id === selectedScale.id ? "active" : ""} key={scale.id} onClick={() => changeScale(scale.id)}>
              <span>{scale.name}</span>
              <strong>{formatMoney(scale.capex[0], 0)}-{formatMoney(scale.capex[1], 0).replace("Rp", "")}</strong>
              <div><small>Kapasitas</small><b>{scale.capacity}</b></div>
              <div><small>Potensi omzet</small><b>{formatMoney(scale.revenue[0], 0)}-{formatMoney(scale.revenue[1], 0).replace("Rp", "")}/bln</b></div>
              <footer><em>{scale.staff}</em><em>{scale.space}</em><em>{scale.bestFor}</em></footer>
            </button>
          ))}
        </div>
      </section>

      <section className="compact-economics" id="simulasi">
        <div className="real-section-head"><div><span>HITUNG ANGKA</span><h2>Ubah skenarionya.</h2></div><p>{selectedScale.name} · baseline kota + target omzet.</p></div>
        <div className="economics-shell">
          <aside className="scenario-panel">
            <label htmlFor="detail-city">Kota pembanding biaya</label>
            <select id="detail-city" value={cityId} onChange={(event) => changeCity(event.target.value)}>
              {cities.map((item) => <option value={item.id} key={item.id}>{item.name}, {item.province}</option>)}
            </select>
            <div className="detail-range-head"><label htmlFor="detail-revenue">Target omzet / bulan</label><b>{formatMoney(targetRevenue, 0)}</b></div>
            <input
              id="detail-revenue"
              type="range"
              min="5"
              max={maxRevenue}
              step="1"
              value={targetRevenue}
              onChange={(event) => setTargetRevenue(Number(event.target.value))}
              /* Isian track digambar lewat gradient, jadi posisinya harus dikirim
                 sebagai variabel CSS. Tanpa ini track terkunci di 50%. */
              style={{ "--range-progress": `${rangeProgress}%` } as React.CSSProperties}
            />
            <div className="scenario-scenarios" role="group" aria-label="Skenario cepat">
              {business.scenarios.map((scenario) => {
                const revenue = Math.round(scenarioRevenue(business, scenario) * city.demandFactor);
                return (
                  <button
                    type="button"
                    key={scenario.name}
                    className={Math.abs(revenue - targetRevenue) <= 1 ? "active" : ""}
                    onClick={() => setTargetRevenue(revenue)}
                  >
                    <span>{scenario.name}</span>
                    <b>{formatMoney(revenue, 0)}</b>
                    <em>{scenario.units} {business.trafficLabel}</em>
                  </button>
                );
              })}
            </div>
            <div className="scenario-assumptions">
              <div><span>Sewa</span><b>{formatMoney(metrics.rent)}</b></div>
              <div><span>Gaji</span><b>{formatMoney(metrics.payroll)}</b></div>
              <div><span>Biaya tetap</span><b>{formatMoney(metrics.fixedCost)}</b></div>
              <div><span>Biaya variabel</span><b>{formatPercent(business.variableRate)}</b></div>
            </div>
          </aside>
          <div className="economics-numbers">
            <div className="compact-metric-grid">
              <article><WalletCards size={21} /><small>CAPEX</small><b>{formatMoney(metrics.capexLow, 0)}-{formatMoney(metrics.capexHigh, 0).replace("Rp", "")}</b></article>
              <article><Zap size={21} /><small>OPEX / bulan</small><b>{formatMoney(metrics.opex)}</b></article>
              <article className="metric-accent"><Target size={21} /><small>Omzet BEP</small><b>{formatMoney(metrics.breakEvenRevenue)}</b></article>
              <article><ArrowUpRight size={21} /><small>Laba operasional</small><b>{metrics.profit >= 0 ? "+" : ""}{formatMoney(metrics.profit)}</b></article>
            </div>

            <div className="bep-meter" role="img" aria-label={`Target omzet ${formatPercent(metrics.bepRatio)} dari omzet BEP`}>
              <div className="bep-meter__head">
                <span>Target vs titik impas</span>
                <b>{formatPercent(metrics.bepRatio)} dari BEP</b>
              </div>
              {/* Skala meter: lebar penuh = 1,6x omzet impas. Karena itu garis
                  impas selalu duduk di 62,5% dan panjang isian memakai skala
                  yang sama, sehingga keduanya bisa dibandingkan langsung. */}
              <div className={`bep-meter__track meter-${metrics.health.toLowerCase()}`}>
                <i style={{ width: `${Math.min(100, metrics.bepRatio * BEP_MARKER)}%` }} />
                <u style={{ left: `${BEP_MARKER}%` }} />
              </div>
              <div className="bep-meter__legend">
                <em>Impas di {formatMoney(metrics.breakEvenRevenue)}</em>
                <em>Target {formatMoney(metrics.monthlyRevenue, 0)}</em>
              </div>
            </div>

            <dl className="economics-extra">
              <div><dt><Gauge size={15} /> Traffic minimum</dt><dd>{metrics.traffic} <small>{business.trafficLabel}</small></dd></div>
              <div><dt><Users size={15} /> Traffic di target</dt><dd>{metrics.targetTraffic} <small>{business.trafficLabel}</small></dd></div>
              <div><dt><CalendarClock size={15} /> Setoran harian</dt><dd>{formatMoney(metrics.dailyRevenue)} <small>per hari</small></dd></div>
              <div><dt><Percent size={15} /> Margin kontribusi</dt><dd>{formatPercent(metrics.contributionMargin)} <small>sebelum biaya tetap</small></dd></div>
              <div><dt><TrendingUp size={15} /> Margin bersih</dt><dd>{formatPercent(metrics.marginRate)} <small>dari omzet</small></dd></div>
              <div><dt><PiggyBank size={15} /> ROI per tahun</dt><dd>{metrics.roiPerYear > 0 ? formatPercent(metrics.roiPerYear) : "-"} <small>atas modal</small></dd></div>
              <div><dt><Building2 size={15} /> Rasio sewa</dt><dd>{formatPercent(metrics.rentToSales)} <small>ideal maks 15%</small></dd></div>
              <div><dt><Timer size={15} /> Balik modal</dt><dd>{formatMonths(metrics.payback)} <small>khas {business.bepMonths[0]}-{business.bepMonths[1]} bln</small></dd></div>
            </dl>

            <div className={`compact-verdict verdict-${metrics.health.toLowerCase()}`}>
              <i /> Cashflow {metrics.health}
              <span>{Number.isFinite(metrics.payback) ? `Balik modal ±${Math.ceil(metrics.payback)} bulan · rentang khas model ini ${business.bepMonths[0]}-${business.bepMonths[1]} bulan` : "Target belum menutup biaya, modal tidak kembali"}</span>
            </div>
            <p className="economics-note"><Info size={15} /> Belum termasuk cicilan, pajak penghasilan, dan gaji pemilik.</p>
          </div>
        </div>
      </section>

      <AIAnalysisPanel scenario={{
        business: business.name,
        category: business.category,
        city: city.name,
        province: city.province,
        scale: selectedScale.name,
        capexLow: metrics.capexLow,
        capexHigh: metrics.capexHigh,
        monthlyRevenue: metrics.monthlyRevenue,
        monthlyOpex: metrics.opex,
        monthlyProfit: metrics.profit,
        breakEvenRevenue: metrics.breakEvenRevenue,
        paybackMonths: Number.isFinite(metrics.payback) ? Math.ceil(metrics.payback) : null,
        trafficTarget: metrics.traffic,
        trafficLabel: business.trafficLabel,
        risks: business.risks,
      }} />

      <section className="detail-live-survey" id="lokasi"><LocationSurvey business={business} /></section>

      <section className="simple-guide">
        <div className="real-section-head"><div><span>ALAT & OPERASI</span><h2>Belanja tanpa tebak-tebakan.</h2></div><p>Delapan kebutuhan utama, biaya, visual, dan vendor yang bisa langsung dicek.</p></div>
        <EquipmentCatalog business={business} />
        <div className="guide-columns">
          <article><div className="guide-title"><Zap size={20} /><h3>Operasi harian</h3></div>{business.dailyOps.map((item, index) => <div className="guide-row compact" key={item}><span>{index + 1}</span><b>{item}</b></div>)}</article>
          <article><div className="guide-title"><Gauge size={20} /><h3>Cek sebelum buka</h3></div>{business.checklist.map((item, index) => <div className="guide-row compact" key={item}><span>{index + 1}</span><b>{item}</b></div>)}</article>
          <article className="risk-guide"><div className="guide-title"><ShieldAlert size={20} /><h3>Waspadai</h3></div>{business.risks.map((item) => <div className="guide-row compact" key={item}><ShieldAlert size={15} /><b>{item}</b></div>)}</article>
        </div>
        <div className="plan-steps">{business.plan90.map((phase, index) => <article key={phase.phase}><span>0{index + 1}</span><small>{phase.phase}</small><h3>{phase.title}</h3>{phase.actions.map((action) => <p key={action}><Check size={15} />{action}</p>)}</article>)}</div>
      </section>

      <section className="scheme-section" id="skema">
        <div className="real-section-head">
          <div><span>SKEMA & KPI</span><h2>Dari mana uangnya datang.</h2></div>
          <p>Model pendapatan, angka yang wajib dipantau, dan berapa lama modal biasanya kembali.</p>
        </div>

        <div className="scheme-grid">
          <article className="scheme-card">
            <div className="scheme-card__head"><Workflow size={20} /><h3>Model pendapatan</h3></div>
            <p className="scheme-model">{business.scheme.model}</p>
            <dl>
              <div><dt>Dasar harga</dt><dd>{business.scheme.priceBasis}</dd></div>
              <div><dt>Siklus kas</dt><dd>{business.scheme.cashCycle}</dd></div>
              <div><dt>Pemicu biaya</dt><dd>{business.scheme.costDrivers.join(" · ")}</dd></div>
            </dl>
          </article>

          <article className="scheme-card">
            <div className="scheme-card__head"><PieChart size={20} /><h3>Komposisi omzet</h3></div>
            <ul className="scheme-streams">
              {business.scheme.streams.map((stream) => (
                <li key={stream.name}>
                  <span>{stream.name}</span>
                  <i><b style={{ width: `${stream.share}%` }} /></i>
                  <em>{stream.share}%</em>
                </li>
              ))}
            </ul>
            <p className="scheme-hint">Pakai komposisi ini untuk menyusun menu atau daftar SKU awal.</p>
          </article>

          <article className="scheme-card scheme-card--bep">
            <div className="scheme-card__head"><Timer size={20} /><h3>Potensi balik modal</h3></div>
            <strong className="scheme-bep">{business.bepMonths[0]}-{business.bepMonths[1]}<small>bulan</small></strong>
            <p>Rentang khas model usaha ini bila omzet menyentuh skenario realistis dan biaya sewa terkendali.</p>
            <div className="scheme-bep__now">
              <span>Simulasi kamu sekarang</span>
              <b>{formatMonths(metrics.payback)}</b>
            </div>
          </article>
        </div>

        <div className="kpi-block">
          <h3 className="kpi-block__title"><Gauge size={18} /> KPI yang wajib dipantau</h3>
          <div className="kpi-table">
            {business.kpi.map((item) => (
              <div className="kpi-row" key={item.label}>
                <span>{item.label}</span>
                <b>{item.target}</b>
                <em>{item.note}</em>
              </div>
            ))}
          </div>
        </div>

        <div className="scenario-block">
          <h3 className="kpi-block__title"><TrendingUp size={18} /> Perkiraan omzet per skenario</h3>
          <p className="scenario-block__note">Dihitung dari {business.trafficLabel} x harga rata-rata {formatTicket(business.avgTicket)} pada baseline {city.name}.</p>
          <div className="scenario-cards">
            {business.scenarios.map((scenario) => {
              const revenue = scenarioRevenue(business, scenario) * city.demandFactor;
              const scenarioMetrics = calculateMetrics(business, city, Math.round(revenue), selectedScale.capex);
              return (
                <article key={scenario.name} className={`scenario-card verdict-${scenarioMetrics.health.toLowerCase()}`}>
                  <span>{scenario.name}</span>
                  <b>{formatMoney(revenue, 0)}<small>/bulan</small></b>
                  <dl>
                    <div><dt>{business.trafficLabel}</dt><dd>{scenario.units}</dd></div>
                    <div><dt>Laba operasional</dt><dd>{scenarioMetrics.profit >= 0 ? "+" : ""}{formatMoney(scenarioMetrics.profit)}</dd></div>
                    <div><dt>Balik modal</dt><dd>{formatMonths(scenarioMetrics.payback)}</dd></div>
                  </dl>
                  <footer>Cashflow {scenarioMetrics.health}</footer>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="simple-business-download" id="download" ref={downloadRef}>
        {/* Thumbnail memakai hasil render yang sama persis dengan berkas yang
            diunduh, jadi yang dilihat pengguna selalu sama dengan yang didapat.
            Berkas statis dipakai sementara kanvas belum selesai menggambar.

            Sengaja <img> biasa, bukan next/image: sumbernya blob: yang dibuat
            saat runtime, dan pipeline next/image menskalakan ulang blob itu
            menjadi gambar kosong. Tidak ada yang bisa dioptimalkan di sini. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl ?? `/previews/${business.slug}.png`}
          alt={`Ringkasan ${business.name} di ${city.name}`}
          width={1200}
          height={1682}
        />
        <div>
          <span>UNDUH RENCANA</span>
          <h2>Bawa saat survei.</h2>
          <a href={`/downloads/cek-bisnis-${business.slug}-guide.pdf`} download><FileText size={22} /><b>PDF panduan 5 halaman</b><Download size={18} /></a>
          <button type="button" onClick={() => void downloadPreview()} disabled={previewState === "loading"}>
            <ImageDown size={22} />
            <b>{previewState === "loading" ? "Menyiapkan gambar..." : "PNG ringkasan 1 gambar"}</b>
            <Download size={18} />
          </button>
          <p className="download-note">
            PNG dibuat langsung dari simulasi yang sedang kamu lihat: skala {selectedScale.name}, kota {city.name}, lengkap dengan skema pendapatan, KPI, dan lama balik modal.
          </p>
          {previewState === "error" && <p className="download-error"><ShieldAlert size={15} /> Gagal membuat gambar di peramban ini. Coba peramban lain atau unduh PDF-nya.</p>}
        </div>
      </section>

      <section className="compact-sources"><span>SUMBER UTAMA</span><div>{sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.id}><b>{source.title}</b><ArrowUpRight size={15} /></a>)}</div><p><ShieldAlert size={16} /> Harga dan permintaan dapat berbeda di setiap titik. Minta quotation dan hitung traffic 7 hari.</p></section>

      <section className="detail-next-business"><div><span>BANDINGKAN PILIHAN LAIN</span><h2>Jangan terpaku satu usaha.</h2></div><Link href="/#pilih-usaha">Lihat semua <ArrowRight size={20} /></Link></section>
    </>
  );
}
