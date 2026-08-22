"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
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
import { BrandLogo } from "@/components/BrandLogo";
import {
  franchiseBasisLabel,
  franchiseCategories,
  franchiseData,
  franchiseSectorName,
  franchiseSectors,
  formatInvestment,
  formatInvestmentRange,
  formatMonthRange,
  formatRevenueRange,
  getFranchiseSources,
  rangeLow,
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

/** Jumlah merek per sektor, dihitung sekali dari data penuh (bukan hasil filter). */
const sectorCounts: Record<string, number> = franchiseData.franchises.reduce<Record<string, number>>(
  (acc, franchise) => ({ ...acc, [franchise.category]: (acc[franchise.category] ?? 0) + 1 }),
  {},
);

export function FranchiseBrowser() {
  const [category, setCategory] = useState<string>("all");
  const [sector, setSector] = useState<string>("all");
  const [budget, setBudget] = useState<string>("all");
  const [sort, setSort] = useState<FranchiseSort>("modal-asc");
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const maxBudget = BUDGETS.find((item) => item.id === budget)?.max ?? null;
    const filtered = franchiseData.franchises.filter((franchise) => {
      if (category !== "all" && franchise.category !== category) return false;
      if (sector !== "all" && franchiseSectorName(franchise) !== sector) return false;
      // Unknown quotation tidak dipaksa masuk filter anggaran karena angka belum tersedia.
      const low = rangeLow(franchise.investment);
      if (maxBudget !== null && (low === null || low > maxBudget)) return false;
      return true;
    });
    return sortFranchises(filtered, sort);
  }, [budget, category, sector, sort]);

  const cheapest = useMemo(
    () => sortFranchises(franchiseData.franchises, "modal-asc").find((item) => rangeLow(item.investment) !== null),
    [],
  );
  const fastest = useMemo(
    () => sortFranchises(franchiseData.franchises, "bep-asc").find((item) => rangeLow(item.bepMonths) !== null),
    [],
  );

  const cheapestLow = cheapest ? rangeLow(cheapest.investment) : null;
  const fastestBep = fastest ? rangeLow(fastest.bepMonths) : null;

  return (
    <>
      <section className="franchise-hero" aria-labelledby="franchise-title">
        <div className="franchise-hero__copy">
          <p className="workbench-kicker"><span aria-hidden="true" /> Data waralaba · diperbarui {franchiseData.updatedAt}</p>
          <h1 id="franchise-title">Beli sistem,<br />bukan cuma merek.</h1>
          <p>
            Modal awal, franchise fee, royalti, skema kemitraan, sektor, dan rentang balik modal dari {franchiseData.franchises.length} waralaba
            Indonesia — dengan metric resmi dipisahkan dari estimasi.
          </p>
          <div className="workbench-hero__actions">
            <Link className="workbench-button workbench-button--primary" href="/compare"><ArrowLeftRight size={18} aria-hidden="true" /> Bandingkan dua bisnis</Link>
            <Link className="workbench-button workbench-button--quiet" href="/usaha">Lihat usaha mandiri <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
          <dl className="workbench-proof">
            <div><dt>Merek dibandingkan</dt><dd>{franchiseData.franchises.length}</dd></div>
            <div><dt>Modal terkecil</dt><dd>{cheapestLow === null ? "-" : formatInvestment(cheapestLow)}</dd></div>
            <div><dt>BEP tercepat</dt><dd>{fastestBep === null ? "-" : `${fastestBep} bln`}</dd></div>
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
          <div><p>DAFTAR WARALABA</p><h2 id="franchise-list-title">Saring sesuai modal dan sektor.</h2></div>
          <p>Klik satu kartu untuk membuka skema kemitraan, KPI, syarat, sumber data, dan halaman resmi brand.</p>
        </header>

        <div className="franchise-filters">
          <div className="franchise-filter-group" role="group" aria-label="Filter kategori">
            <button type="button" className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>
              Semua <em>{franchiseData.franchises.length}</em>
            </button>
            {franchiseCategories.map((item) => (
              <button type="button" key={item.id} className={category === item.id ? "active" : ""} onClick={() => setCategory(item.id)}>
                {item.name} <em>{sectorCounts[item.id] ?? 0}</em>
              </button>
            ))}
          </div>
          <div className="franchise-filter-selects">
            <label>
              <span>Sektor</span>
              <select value={sector} onChange={(event) => setSector(event.target.value)}>
                <option value="all">Semua sektor</option>
                {franchiseSectors.map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
            </label>
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
          <p className="franchise-empty">Tidak ada waralaba di filter itu. Longgarkan anggaran atau pilih sektor lain.</p>
        )}
      </section>

      <section className="franchise-compare" aria-labelledby="franchise-compare-title">
        <header className="workbench-section-heading">
          <div><p>TABEL PEMBANDING</p><h2 id="franchise-compare-title">Semua angka dalam satu tabel.</h2></div>
          <p>Modal, sektor, fee, royalti, omzet, dan BEP berdampingan. Geser ke samping di layar kecil.</p>
        </header>
        <div className="franchise-table-wrap">
          <table className="franchise-table">
            <caption className="visually-hidden">Perbandingan modal, sektor, fee, royalti, omzet, dan balik modal waralaba Indonesia</caption>
            <thead>
              <tr>
                <th scope="col">Merek</th>
                <th scope="col">Sektor</th>
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
                    <Link className="franchise-table__brand" href={`/franchise/${franchise.id}`}>
                      <BrandLogo franchise={franchise} name={franchise.name} size={30} />
                      {franchise.name}
                    </Link>
                  </th>
                  <td>{franchiseSectorName(franchise)}</td>
                  <td className="num">{formatInvestmentRange(franchise.investment)}</td>
                  <td>{franchise.franchiseFee}</td>
                  <td>{franchise.royalty}</td>
                  <td className="num">{formatRevenueRange(franchise.monthlyRevenue)}</td>
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
        <BrandLogo franchise={franchise} name={franchise.name} size={56} />
        <div>
          <h3>{franchise.name}</h3>
          <p>{franchiseSectorName(franchise)} · sejak {franchise.since} · {franchise.outlets}</p>
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
        Omzet / skenario <b>{formatRevenueRange(franchise.monthlyRevenue)}</b> per bulan
      </p>

      <div className="franchise-card__actions">
        <button type="button" className="franchise-card__toggle" onClick={onToggle} aria-expanded={open}>
          {open ? "Tutup ringkas" : "Lihat ringkas"}
        </button>
        <Link className="franchise-card__more" href={`/franchise/${franchise.id}`}>
          Analisis lengkap <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {open && (
        <div className="franchise-card__detail">
          <p><b>{franchiseBasisLabel(franchise.dataBasis)}</b></p>
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
            <Link href={`/franchise/${franchise.id}`}>Baca analisis lengkap <ArrowRight size={14} aria-hidden="true" /></Link>
            <a href={franchise.contactUrl ?? franchise.officialUrl} target="_blank" rel="noreferrer">Hubungi brand <ArrowUpRight size={14} aria-hidden="true" /></a>
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
