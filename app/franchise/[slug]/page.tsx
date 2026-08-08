import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FranchiseDetail } from "@/components/FranchiseDetail";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  formatInvestmentRange,
  franchises,
  getFranchise,
  getFranchiseArticle,
  getFranchiseSources,
} from "@/lib/franchise-data";

type PageProps = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => franchises.map((franchise) => ({ slug: franchise.id }));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const franchise = getFranchise(slug);
  if (!franchise) return { title: "Waralaba tidak ditemukan - Cek Bisnis" };

  const modal = formatInvestmentRange(franchise.investment);
  return {
    title: `Franchise ${franchise.name} - Modal ${modal}, Skema dan BEP | Cek Bisnis`,
    description: `Rincian kemitraan ${franchise.name}: modal awal ${modal}, franchise fee ${franchise.franchiseFee}, royalti ${franchise.royalty}, KPI, syarat, dan rentang balik modal.`,
    openGraph: {
      title: `Franchise ${franchise.name} - Modal, Skema dan BEP`,
      description: `Modal awal ${modal}. Rincian skema kemitraan, KPI, syarat, dan sumber data.`,
      url: `/franchise/${franchise.id}`,
    },
  };
}

export default async function FranchiseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const franchise = getFranchise(slug);
  if (!franchise) notFound();

  const article = getFranchiseArticle(franchise.id);
  if (!article) notFound();

  return (
    <main className="business-detail-page">
      <SiteHeader />
      <FranchiseDetail franchise={franchise} article={article} sources={getFranchiseSources(franchise)} />
      <SiteFooter compact />
    </main>
  );
}
