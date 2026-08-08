import { NextRequest, NextResponse } from "next/server";
import { aiProviders, runAIAnalysis, type AIProviderId, type AnalysisScenario } from "@/lib/ai-providers";

export const dynamic = "force-dynamic";

const buckets = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;

const isFiniteNumber = (value: unknown) => typeof value === "number" && Number.isFinite(value);

function validScenario(value: unknown): value is AnalysisScenario {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return ["business", "category", "city", "province", "scale", "trafficLabel"].every((key) => typeof item[key] === "string" && String(item[key]).length <= 120)
    && ["capexLow", "capexHigh", "monthlyRevenue", "monthlyOpex", "monthlyProfit", "breakEvenRevenue", "trafficTarget"].every((key) => isFiniteNumber(item[key]))
    && (item.paybackMonths === null || isFiniteNumber(item.paybackMonths))
    && Array.isArray(item.risks) && item.risks.length <= 8 && item.risks.every((risk) => typeof risk === "string" && risk.length <= 240);
}

function limited(ip: string) {
  const now = Date.now();
  const recent = (buckets.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= LIMIT) return true;
  recent.push(now);
  buckets.set(ip, recent);
  return false;
}

export async function POST(request: NextRequest) {
  if (process.env.AI_ANALYSIS_ENABLED !== "true") return NextResponse.json({ error: "Analisis AI belum diaktifkan oleh pemilik situs." }, { status: 503 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "Batas analisis tercapai. Coba lagi dalam 10 menit." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const provider = body?.provider as AIProviderId;
  if (!provider || !(provider in aiProviders)) return NextResponse.json({ error: "Provider AI tidak valid." }, { status: 400 });
  if (!validScenario(body?.scenario)) return NextResponse.json({ error: "Data skenario tidak lengkap." }, { status: 400 });
  if (!aiProviders[provider].configured) return NextResponse.json({ error: `${aiProviders[provider].name} belum dikonfigurasi.` }, { status: 503 });

  try {
    const analysis = await runAIAnalysis(provider, body.scenario);
    if (!analysis) throw new Error("Provider tidak mengembalikan ringkasan.");
    return NextResponse.json({ analysis, provider: aiProviders[provider].name, generatedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analisis gagal.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
