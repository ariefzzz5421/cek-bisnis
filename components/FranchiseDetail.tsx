import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { getDossier } from "@/financial-models/catalog";
import type {
  Franchise,
  FranchiseArticle,
  FranchiseSource,
} from "@/lib/franchise-data";
export function FranchiseDetail({
  franchise: f,
}: {
  franchise: Franchise;
  article: FranchiseArticle;
  sources: FranchiseSource[];
}) {
  const d = getDossier(f.id);
  return (
    <div className="fi-page">
      <header className="fi-business-header">
        <Link href="/franchise">← Riset franchise</Link>
        <div className="fi-brand-title">
          <BrandLogo franchise={f} name={f.name} />
          <div>
            <span className="fi-eyebrow">
              {d.model.archetype} / RESEARCH DOSSIER
            </span>
            <h1>{f.name}</h1>
          </div>
        </div>
        <p>
          {d.research.status === "closed"
            ? "Kemitraan tidak dibuka. Model pembanding industri, bukan penawaran brand."
            : d.research.status === "unconfirmed"
              ? "Ketersediaan kemitraan belum terkonfirmasi. Minta proposal langsung sebelum menilai paket."
              : "Pelajari mekanisme pendapatan, kebutuhan modal dan batas kelayakan."}
        </p>
        <div className="fi-header-links">
          <a href={f.officialUrl} target="_blank" rel="noreferrer">
            Situs brand ↗
          </a>
          <Link href="/compare">Bandingkan usaha</Link>
          <a href="#assumptions">Ubah asumsi ↓</a>
        </div>
      </header>
      <FinancialDashboard dossier={d} />
    </div>
  );
}
