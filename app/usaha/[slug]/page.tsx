import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusinessDetailClient } from "@/components/BusinessDetailClient";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { businesses, cities, getBusiness, getBusinessSources } from "@/lib/business-data";

type PageProps = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => businesses.map((business) => ({ slug: business.slug }));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = getBusiness(slug);
  if (!business) return { title: "Usaha tidak ditemukan - Cek Bisnis" };
  return {
    title: `${business.name} - Modal, OPEX, BEP dan Survei Lokasi | Cek Bisnis`,
    description: `Panduan ringkas ${business.name}: modal, biaya bulanan, omzet BEP, survei lokasi Indonesia, PDF dan preview image.`,
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
      <SiteFooter compact />
    </main>
  );
}
