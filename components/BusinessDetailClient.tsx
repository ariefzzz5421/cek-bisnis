"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Download, FileText, ImageDown, Info, PackageOpen, ShieldAlert, Target, Users, WalletCards, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { BusinessIcon } from "@/components/BusinessIcon";
import { LocationSurvey } from "@/components/LocationSurvey";
import { calculateMetrics, formatMoney, type Business, type City, type Source } from "@/lib/business-data";

export function BusinessDetailClient({ business, cities, sources }: { business: Business; cities: City[]; sources: Source[] }) {
  const initialCity = cities.find((item) => item.id === "kediri") ?? cities[0];
  const [cityId, setCityId] = useState(initialCity.id);
  const city = cities.find((item) => item.id === cityId) ?? initialCity;
  const [targetRevenue, setTargetRevenue] = useState(Math.round(business.targetRevenue * city.demandFactor));
  const metrics = useMemo(() => calculateMetrics(business, city, targetRevenue), [business, city, targetRevenue]);
  const maxRevenue = Math.max(180, Math.ceil(business.targetRevenue * 2.5 / 10) * 10);

  const changeCity = (nextId: string) => {
    const nextCity = cities.find((item) => item.id === nextId);
    setCityId(nextId);
    if (nextCity) setTargetRevenue(Math.round(business.targetRevenue * nextCity.demandFactor));
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
          <div className="detail-quick-tags"><span><Users size={16} />{business.staffCount} staf</span><span><Target size={16} />{metrics.traffic} {business.trafficLabel}</span></div>
          <a className="quick-pdf" href={`/downloads/cek-bisnis-${business.slug}-guide.pdf`} download><FileText size={18} /> Unduh panduan 3 halaman <Download size={17} /></a>
        </div>
      </section>

      <section className="compact-economics" id="simulasi">
        <div className="real-section-head"><div><span>01 · HITUNG ANGKA</span><h2>Ubah skenarionya.</h2></div><p>Baseline kota + target omzet.</p></div>
        <div className="economics-shell">
          <aside className="scenario-panel">
            <label htmlFor="detail-city">Kota pembanding biaya</label>
            <select id="detail-city" value={cityId} onChange={(event) => changeCity(event.target.value)}>
              {cities.map((item) => <option value={item.id} key={item.id}>{item.name}, {item.province}</option>)}
            </select>
            <div className="detail-range-head"><label htmlFor="detail-revenue">Target omzet / bulan</label><b>{formatMoney(targetRevenue, 0)}</b></div>
            <input id="detail-revenue" type="range" min="5" max={maxRevenue} step="1" value={targetRevenue} onChange={(event) => setTargetRevenue(Number(event.target.value))} />
            <div className="scenario-assumptions">
              <div><span>Sewa</span><b>{formatMoney(metrics.rent)}</b></div>
              <div><span>Gaji</span><b>{formatMoney(metrics.payroll)}</b></div>
              <div><span>Biaya tetap</span><b>{formatMoney(metrics.fixedCost)}</b></div>
              <div><span>Biaya variabel</span><b>{Math.round(business.variableRate * 100)}%</b></div>
            </div>
          </aside>
          <div className="compact-metric-grid">
            <article><WalletCards size={21} /><small>CAPEX</small><b>{formatMoney(metrics.capexLow, 0)}-{formatMoney(metrics.capexHigh, 0).replace("Rp", "")}</b></article>
            <article><Zap size={21} /><small>OPEX / bulan</small><b>{formatMoney(metrics.opex)}</b></article>
            <article className="metric-accent"><Target size={21} /><small>Omzet BEP</small><b>{formatMoney(metrics.breakEvenRevenue)}</b></article>
            <article><ArrowUpRight size={21} /><small>Laba operasional</small><b>{metrics.profit >= 0 ? "+" : ""}{formatMoney(metrics.profit)}</b></article>
            <div className={`compact-verdict verdict-${metrics.health.toLowerCase()}`}><i /> Cashflow {metrics.health}<span>{Number.isFinite(metrics.payback) ? `Balik modal ±${Math.ceil(metrics.payback)} bulan` : "Target belum menutup modal"}</span></div>
            <p><Info size={15} /> Belum termasuk cicilan, pajak penghasilan, dan gaji pemilik.</p>
          </div>
        </div>
      </section>

      <section className="detail-live-survey" id="lokasi"><LocationSurvey business={business} /></section>

      <section className="simple-guide">
        <div className="real-section-head"><div><span>02 · CARA MULAI</span><h2>Yang penting saja.</h2></div><p>{business.format}</p></div>
        <div className="guide-columns">
          <article><div className="guide-title"><PackageOpen size={20} /><h3>Beli</h3></div>{business.equipment.map((item, index) => <div className="guide-row" key={item.item}><span>{index + 1}</span><b>{item.item}</b><em>{item.range}</em></div>)}</article>
          <article><div className="guide-title"><Zap size={20} /><h3>Jalankan</h3></div>{business.dailyOps.map((item, index) => <div className="guide-row compact" key={item}><span>{index + 1}</span><b>{item}</b></div>)}</article>
          <article className="risk-guide"><div className="guide-title"><ShieldAlert size={20} /><h3>Waspadai</h3></div>{business.risks.map((item) => <div className="guide-row compact" key={item}><ShieldAlert size={15} /><b>{item}</b></div>)}</article>
        </div>
        <div className="plan-steps">{business.plan90.map((phase, index) => <article key={phase.phase}><span>0{index + 1}</span><small>{phase.phase}</small><h3>{phase.title}</h3>{phase.actions.map((action) => <p key={action}><Check size={15} />{action}</p>)}</article>)}</div>
      </section>

      <section className="simple-business-download" id="download">
        <Image src={`/previews/${business.slug}.png`} alt={`Preview ${business.name}`} width={1200} height={1500} unoptimized />
        <div><span>03 · DOWNLOAD</span><h2>Bawa saat survei.</h2><a href={`/downloads/cek-bisnis-${business.slug}-guide.pdf`} download><FileText size={22} /><b>PDF panduan 3 halaman</b><Download size={18} /></a><a href={`/previews/${business.slug}.png`} download><ImageDown size={22} /><b>PNG preview usaha</b><Download size={18} /></a></div>
      </section>

      <section className="compact-sources"><span>SUMBER UTAMA</span><div>{sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.id}><b>{source.title}</b><ArrowUpRight size={15} /></a>)}</div><p><ShieldAlert size={16} /> Harga dan permintaan dapat berbeda di setiap titik. Minta quotation dan hitung traffic 7 hari.</p></section>

      <section className="detail-next-business"><div><span>BANDINGKAN PILIHAN LAIN</span><h2>Jangan terpaku satu usaha.</h2></div><Link href="/#pilih-usaha">Lihat semua <ArrowRight size={20} /></Link></section>
    </>
  );
}
