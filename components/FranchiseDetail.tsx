import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgePercent,
  Building2,
  CheckCircle2,
  FileText,
  Gauge,
  Handshake,
  Info,
  ScrollText,
  ShieldAlert,
  Timer,
  Wallet,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import {
  formatContractYears,
  formatInvestmentRange,
  formatMonthRange,
  formatRevenueRange,
  franchiseBasisLabel,
  franchiseData,
  franchiseSectorName,
  franchises,
  midInvestment,
  type Franchise,
  type FranchiseArticle,
  type FranchiseSource,
} from "@/lib/franchise-data";

const CURRENT_PROSPECTUS_NOTE =
  "Menurut Pasal 5 PP 35/2024 tentang Waralaba, prospektus penawaran waralaba harus diberikan kepada calon penerima paling lambat 14 hari kalender sebelum penandatanganan perjanjian. Dokumen itu umumnya tidak diunduh bebas, jadi tautan di bawah mengarah ke halaman kemitraan resmi tempat kamu bisa memintanya.";

export function FranchiseDetail({
  franchise,
  article,
  sources,
}: {
  franchise: Franchise;
  article: FranchiseArticle;
  sources: FranchiseSource[];
}) {
  // Merek lain di kategori yang sama, diurutkan dari modal terdekat.
  const related = franchises
    .filter((item) => item.id !== franchise.id && item.category === franchise.category)
    .sort((a, b) => Math.abs(midInvestment(a) - midInvestment(franchise)) - Math.abs(midInvestment(b) - midInvestment(franchise)))
    .slice(0, 3);

  return (
    <>
      <section className="franchise-detail-hero" style={{ "--brand": franchise.brandColor } as React.CSSProperties}>
        <Link className="franchise-detail-back" href="/franchise"><ArrowLeft size={17} aria-hidden="true" /> Semua waralaba</Link>
        <div className="franchise-detail-lockup">
          <BrandLogo franchise={franchise} name={franchise.name} size={78} />
          <div>
            <p>{franchiseSectorName(franchise)} · sejak {franchise.since} · {franchise.outlets}</p>
            <h1>{franchise.name}</h1>
          </div>
        </div>
        <p className="franchise-detail-lede">{article.lede}</p>

        <dl className="franchise-detail-numbers">
          <div><dt><Wallet size={15} aria-hidden="true" /> Modal awal</dt><dd>{formatInvestmentRange(franchise.investment)}</dd></div>
          <div><dt><Handshake size={15} aria-hidden="true" /> Franchise fee</dt><dd>{franchise.franchiseFee}</dd></div>
          <div><dt><BadgePercent size={15} aria-hidden="true" /> Royalti</dt><dd>{franchise.royalty}</dd></div>
          <div><dt><Building2 size={15} aria-hidden="true" /> Omzet / bulan</dt><dd>{formatRevenueRange(franchise.monthlyRevenue)}</dd></div>
          <div><dt><Timer size={15} aria-hidden="true" /> Balik modal</dt><dd>{formatMonthRange(franchise.bepMonths)}</dd></div>
          <div><dt><ScrollText size={15} aria-hidden="true" /> Kontrak</dt><dd>{formatContractYears(franchise.contractYears)}</dd></div>
        </dl>
      </section>

      <article className="franchise-article">
        <div className="franchise-article__body">
          <section>
            <h2>Basis angka</h2>
            <p><b>{franchiseBasisLabel(franchise.dataBasis)}.</b> {franchise.revenueBasis ?? "Angka omzet dipakai sebagai screening awal dan harus divalidasi dengan proposal terbaru."}</p>
            <p>{franchise.bepBasis ?? "Rentang BEP bukan jaminan dan sangat dipengaruhi lokasi, biaya sewa, payroll, HPP, serta volume penjualan."}</p>
          </section>

          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}

          <section>
            <h2>Rincian modal awal</h2>
            <div className="franchise-cost-table">
              <table>
                <thead>
                  <tr><th scope="col">Komponen</th><th scope="col">Perkiraan</th><th scope="col">Catatan</th></tr>
                </thead>
                <tbody>
                  {article.costBreakdown.map((row) => (
                    <tr key={row.item}>
                      <th scope="row">{row.item}</th>
                      <td className="num">{row.amount}</td>
                      <td>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="franchise-article__note"><Info size={15} aria-hidden="true" /> {franchise.investmentNote}</p>
          </section>

          <section>
            <h2>Skema kemitraan singkat</h2>
            <p>{franchise.scheme}</p>
          </section>

          <section className="franchise-verdict">
            <h2>Penilaian Cek Bisnis</h2>
            <p>{article.verdict}</p>
          </section>
        </div>

        <aside className="franchise-article__side">
          <div className="franchise-side-card">
            <h3><Gauge size={17} aria-hidden="true" /> KPI penentu</h3>
            <ul>{franchise.kpi.map((item) => <li key={item}><CheckCircle2 size={14} aria-hidden="true" />{item}</li>)}</ul>
          </div>

          <div className="franchise-side-card">
            <h3><CheckCircle2 size={17} aria-hidden="true" /> Syarat utama</h3>
            <ul>{franchise.requirements.map((item) => <li key={item}><CheckCircle2 size={14} aria-hidden="true" />{item}</li>)}</ul>
          </div>

          <div className="franchise-side-card franchise-side-card--docs">
            <h3><FileText size={17} aria-hidden="true" /> Skema resmi & kontak brand</h3>
            <p>{CURRENT_PROSPECTUS_NOTE}</p>
            <div className="franchise-doc-links">
              <a href={franchise.contactUrl ?? franchise.officialUrl} target="_blank" rel="noreferrer">
                <ArrowUpRight size={15} aria-hidden="true" />
                <span>Hubungi / buka situs resmi {franchise.name}</span>
              </a>
              {article.schemeDocs.map((doc) => (
                <a href={doc.url} target="_blank" rel="noreferrer" key={doc.url}>
                  {doc.kind === "pdf" ? <FileText size={15} aria-hidden="true" /> : <ArrowUpRight size={15} aria-hidden="true" />}
                  <span>{doc.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="franchise-side-card franchise-side-card--sources">
            <h3><ShieldAlert size={17} aria-hidden="true" /> Sumber angka</h3>
            <ul>
              {sources.map((source) => (
                <li key={source.id}>
                  <a href={source.url} target="_blank" rel="noreferrer">{source.title} <ArrowUpRight size={13} aria-hidden="true" /></a>
                </li>
              ))}
            </ul>
            <p className="franchise-side-card__disclaimer">{franchiseData.disclaimer}</p>
          </div>
        </aside>
      </article>

      {related.length > 0 && (
        <section className="franchise-related">
          <div className="real-section-head">
            <div><span>BANDINGKAN</span><h2>Merek lain di kategori yang sama.</h2></div>
            <p>Modal yang berdekatan, skema yang bisa jadi sangat berbeda.</p>
          </div>
          <div className="franchise-related__grid">
            {related.map((item) => (
              <Link href={`/franchise/${item.id}`} key={item.id}>
                <BrandLogo franchise={item} name={item.name} size={48} />
                <div>
                  <b>{item.name}</b>
                  <small>{formatInvestmentRange(item.investment)} · BEP {formatMonthRange(item.bepMonths)}</small>
                </div>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="detail-next-business">
        <div><span>MASIH MENIMBANG?</span><h2>Bandingkan dengan bisnis lain.</h2></div>
        <Link href="/compare">Buka compare business <ArrowRight size={20} aria-hidden="true" /></Link>
      </section>
    </>
  );
}
