import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { BusinessDetailClient } from "@/components/BusinessDetailClient";
import { SiteHeader } from "@/components/SiteHeader";
import { businesses, cities, getBusiness, getBusinessSources } from "@/lib/business-data";

type PageProps = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => businesses.map((business) => ({ slug: business.slug }));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = getBusiness(slug);
  if (!business) return { title: "Usaha tidak ditemukan - Cek Bisnis" };
  return {
    title: `${business.name} - Modal, OPEX, BEP dan Kota Terbaik | Cek Bisnis`,
    description: `Panduan lengkap ${business.name}: estimasi modal, biaya bulanan, omzet BEP, ranking kota Indonesia, rencana 90 hari, PDF dan preview image.`,
  };
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getBusiness(slug);
  if (!business) notFound();

  return (
    <main className="business-detail-page">
      <SiteHeader />
      <BusinessDetailClient business={business} cities={cities} sources={getBusinessSources(business)} />
      <footer>
        <BrandLogo />
        <p>Estimasi screening awal - bukan jaminan keuntungan.</p>
        <span>© 2026</span>
      </footer>
    </main>
  );
}
