"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgePercent,
  Building2,
  CheckCircle2,
  Gauge,
  Handshake,
  Info,
  ShieldAlert,
  Timer,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { FranchiseLogo } from "@/components/FranchiseLogo";
import {
  franchiseCategories,
  franchiseCategoryName,
  franchiseData,
  formatInvestment,
  formatInvestmentRange,
  formatMonthRange,
  getFranchiseSources,
  sortFranchises,
  type Franchise,
  type FranchiseSort,
} from "@/lib/franchise-data";

const SORTS: { id: FranchiseSort; label: string }[] = [
  { id: "modal-asc", label: "Modal terkecil" },
  { id: "modal-desc", label: "Modal terbesar" },
  { id: "bep-asc", label: "Balik modal tercepat" },
  { id: "nama", label: "Nama A-Z" },
];

/** Batas anggaran dalam juta rupiah; `null` berarti tanpa batas. */
const BUDGETS: { id: string; label: string; max: number | null }[] = [
  { id: "all", label: "Semua modal", max: null },
  { id: "50", label: "Di bawah Rp50 jt", max: 50 },
  { id: "150", label: "Di bawah Rp150 jt", max: 150 },
  { id: "500", label: "Di bawah Rp500 jt", max: 500 },
];

export function FranchiseBrowser() {
  const [category, setCategory] = useState<string>("all");
  const [budget, setBudget] = useState<string>("all");
  const [sort, setSort] = useState<FranchiseSort>("modal-asc");
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const maxBudget = BUDGETS.find((item) => item.id === budget)?.max ?? null;
    const filtered = franchiseData.franchises.filter((franchise) => {
      if (category !== "all" && franchise.category !== category) return false;
      // Sebuah paket dianggap masuk anggaran bila batas bawahnya terjangkau.
      if (maxBudget !== null && franchise.investment[0] > maxBudget) return false;
      return true;
    });
    return sortFranchises(filtered, sort);
  }, [budget, category, sort]);

  const cheapest = useMemo(
    () => sortFranchises(franchiseData.franchises, "modal-asc")[0],
    [],
  );
  const fastest = useMemo(
    () => sortFranchises(franchiseData.franchises, "bep-asc")[0],
    [],
  );

  return (
    <>
      <section className="franchise-hero" aria-labelledby="franchise-title">
        <div className="franchise-hero__copy">
          <p className="workbench-kicker"><span aria-hidden="true" /> Data waralaba · diperbarui {franchiseData.updatedAt}</p>
          <h1 id="franchise-title">Beli sistem,<br />bukan cuma merek.</h1>
          <p>
            Modal awal, franchise fee, royalti, skema kemitraan, dan rentang balik modal dari {franchiseData.franchises.length} waralaba
            populer Indonesia — disusun agar bisa dibandingkan berdampingan.
          </p>
          <div className="workbench-hero__actions">
            <a className="workbench-button workbench-button--primary" href="#daftar-franchise">Bandingkan daftar <ArrowRight size={18} aria-hidden="true" /></a>
            <Link className="workbench-button workbench-button--quiet" href="/#pilih-usaha">Bandingkan usaha mandiri</Link>
          </div>
          <dl className="workbench-proof">
            <div><dt>Merek dibandingkan</dt><dd>{franchiseData.franchises.length}</dd></div>
            <div><dt>Modal terkecil</dt><dd>{formatInvestment(cheapest.investment[0])}</dd></div>
            <div><dt>BEP tercepat</dt><dd>{fastest.bepMonths[0]} bln</dd></div>
          </dl>
        </div>

        <aside className="franchise-hero__note">
          <div className="franchise-hero__note-head"><Info size={20} aria-hidden="true" /><b>Baca ini dulu</b></div>
          <p>{franchiseData.note}</p>
          <p className="franchise-hero__disclaimer"><ShieldAlert size={15} aria-hidden="true" /> {franchiseData.disclaimer}</p>
        </aside>
      </section>

      <section className="franchise-browser" id="daftar-franchise" aria-labelledby="franchise-list-title">
        <header className="workbench-section-heading">
          <div><p>DAFTAR WARALABA</p><h2 id="franchise-list-title">Saring sesuai modal yang ada.</h2></div>
          <p>Klik satu kartu untuk membuka skema kemitraan, KPI, syarat, dan sumber datanya.</p>
        </header>

        <div className="franchise-filters">
          <div className="franchise-filter-group" role="group" aria-label="Filter kategori">
            <button type="button" className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>Semua</button>
            {franchiseCategories.map((item) => (
              <button type="button" key={item.id} className={category === item.id ? "active" : ""} onClick={() => setCategory(item.id)}>
                {item.name}
              </button>
            ))}
          </div>
          <div className="franchise-filter-selects">
            <label>
              <span>Anggaran</span>
              <select value={budget} onChange={(event) => setBudget(event.target.value)}>
                {BUDGETS.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span>Urutkan</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as FranchiseSort)}>
                {SORTS.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
              </select>
            </label>
          </div>
        </div>

        <p className="franchise-count" aria-live="polite">{visible.length} waralaba cocok dengan filter ini.</p>

        <div className="franchise-grid">
          {visible.map((franchise) => (
            <FranchiseCard
              key={franchise.id}
              franchise={franchise}
              open={openId === franchise.id}
              onToggle={() => setOpenId(openId === franchise.id ? null : franchise.id)}
            />
          ))}
        </div>

        {visible.length === 0 && (
          <p className="franchise-empty">Tidak ada waralaba di rentang itu. Longgarkan anggaran atau pilih kategori lain.</p>
        )}
      </section>

      <section className="franchise-compare" aria-labelledby="franchise-compare-title">
        <header className="workbench-section-heading">
          <div><p>TABEL PEMBANDING</p><h2 id="franchise-compare-title">Semua angka dalam satu tabel.</h2></div>
          <p>Modal, fee, royalti, perkiraan omzet, dan BEP berdampingan. Geser ke samping di layar kecil.</p>
        </header>
        <div className="franchise-table-wrap">
          <table className="franchise-table">
            <caption className="visually-hidden">Perbandingan modal, fee, royalti, omzet, dan balik modal waralaba Indonesia</caption>
            <thead>
              <tr>
                <th scope="col">Merek</th>
                <th scope="col">Kategori</th>
                <th scope="col">Modal awal</th>
                <th scope="col">Franchise fee</th>
                <th scope="col">Royalti</th>
                <th scope="col">Omzet / bulan</th>
                <th scope="col">BEP</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((franchise) => (
                <tr key={franchise.id}>
                  <th scope="row">
                    <span className="franchise-table__brand">
                      <FranchiseLogo franchise={franchise} size={30} />
                      {franchise.name}
                    </span>
                  </th>
                  <td>{franchiseCategoryName(franchise.category)}</td>
                  <td className="num">{formatInvestmentRange(franchise.investment)}</td>
                  <td>{franchise.franchiseFee}</td>
                  <td>{franchise.royalty}</td>
                  <td className="num">{formatInvestmentRange(franchise.monthlyRevenue)}</td>
                  <td className="num">{formatMonthRange(franchise.bepMonths)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="franchise-sources" aria-labelledby="franchise-sources-title">
        <div>
          <ShieldAlert size={26} aria-hidden="true" />
          <p>SUMBER DATA</p>
          <h2 id="franchise-sources-title">Bisa ditelusuri.</h2>
          <span>Minta prospektus penawaran waralaba resmi dan Surat Tanda Pendaftaran Waralaba sebelum membayar apa pun.</span>
        </div>
        <nav aria-label="Sumber data waralaba">
          {franchiseData.sources.map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>
              <span>{source.title}</span><ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </section>
    </>
  );
}

function FranchiseCard({ franchise, open, onToggle }: { franchise: Franchise; open: boolean; onToggle: () => void }) {
  const sources = getFranchiseSources(franchise);

  return (
    <article className={`franchise-card ${open ? "is-open" : ""}`}>
      <div className="franchise-card__top" style={{ "--brand": franchise.brandColor } as React.CSSProperties}>
        <FranchiseLogo franchise={franchise} />
        <div>
          <h3>{franchise.name}</h3>
          <p>{franchiseCategoryName(franchise.category)} · sejak {franchise.since} · {franchise.outlets}</p>
        </div>
      </div>

      <dl className="franchise-card__numbers">
        <div><dt><Wallet size={14} aria-hidden="true" /> Modal awal</dt><dd>{formatInvestmentRange(franchise.investment)}</dd></div>
        <div><dt><Timer size={14} aria-hidden="true" /> Balik modal</dt><dd>{formatMonthRange(franchise.bepMonths)}</dd></div>
        <div><dt><Handshake size={14} aria-hidden="true" /> Franchise fee</dt><dd>{franchise.franchiseFee}</dd></div>
        <div><dt><BadgePercent size={14} aria-hidden="true" /> Royalti</dt><dd>{franchise.royalty}</dd></div>
      </dl>

      <p className="franchise-card__revenue">
        <Building2 size={15} aria-hidden="true" />
        Perkiraan omzet <b>{formatInvestmentRange(franchise.monthlyRevenue)}</b> per bulan
      </p>

      <button type="button" className="franchise-card__toggle" onClick={onToggle} aria-expanded={open}>
        {open ? "Tutup detail" : "Lihat skema & KPI"}
        <ArrowRight size={16} aria-hidden="true" />
      </button>

      {open && (
        <div className="franchise-card__detail">
          <h4>Skema kemitraan</h4>
          <p>{franchise.scheme}</p>
          <p className="franchise-card__investnote">{franchise.investmentNote}</p>

          <h4><Gauge size={15} aria-hidden="true" /> KPI penentu</h4>
          <ul className="franchise-card__list">
            {franchise.kpi.map((item) => <li key={item}><CheckCircle2 size={14} aria-hidden="true" />{item}</li>)}
          </ul>

          <h4>Syarat utama</h4>
          <ul className="franchise-card__list">
            {franchise.requirements.map((item) => <li key={item}><CheckCircle2 size={14} aria-hidden="true" />{item}</li>)}
          </ul>

          <div className="franchise-card__foot">
            <a href={franchise.officialUrl} target="_blank" rel="noreferrer">Situs resmi <ArrowUpRight size={14} aria-hidden="true" /></a>
            <span>Kontrak {franchise.contractYears} tahun</span>
          </div>

          {sources.length > 0 && (
            <p className="franchise-card__sources">
              Sumber: {sources.map((source, index) => (
                <span key={source.id}>
                  {index > 0 && ", "}
                  <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                </span>
              ))}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
