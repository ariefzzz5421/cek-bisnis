import {
  calculateMetrics,
  cities,
  getBusiness,
  getBusinessSources,
} from "@/lib/business-data";
import { getBusinessDetail } from "@/lib/business-details";
import { buildBusinessResearchPdf } from "@/lib/financial-pdf";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const business = getBusiness(slug);
  if (!business) return new Response("Usaha tidak ditemukan", { status: 404 });

  const detail = getBusinessDetail(business.id);
  const url = new URL(request.url);
  const cityId = url.searchParams.get("city");
  const scaleId = url.searchParams.get("scale");
  const revenueParam = Number(url.searchParams.get("revenue"));

  const city = cities.find((item) => item.id === cityId)
    ?? cities.find((item) => item.id === "kediri")
    ?? cities[0];
  const scale = detail.scales.find((item) => item.id === scaleId)
    ?? detail.scales[1]
    ?? detail.scales[0];
  const baselineRevenue = Math.round(((scale.revenue[0] + scale.revenue[1]) / 2) * city.demandFactor);
  const targetRevenue = Number.isFinite(revenueParam) && revenueParam > 0 ? revenueParam : baselineRevenue;
  const metrics = calculateMetrics(business, city, targetRevenue, scale.capex);

  const blob = buildBusinessResearchPdf({
    business,
    city,
    scale,
    metrics,
    sources: getBusinessSources(business),
  });
  const body = await blob.arrayBuffer();

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cek-bisnis-${business.slug}-${city.id}-analisis.pdf"`,
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
