export type AIProviderId = "openai" | "anthropic" | "gemini" | "deepseek";

export type AIProviderPublic = {
  id: AIProviderId;
  name: string;
  logo: string;
  configured: boolean;
  description: string;
};

type ProviderConfig = AIProviderPublic & { apiKey?: string; model?: string };

const enabled = process.env.AI_ANALYSIS_ENABLED === "true";

export const aiProviders: Record<AIProviderId, ProviderConfig> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    logo: "https://openai.com/favicon.svg",
    description: "Ringkasan keputusan dan risiko utama.",
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL,
    configured: enabled && Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL),
  },
  anthropic: {
    id: "anthropic",
    name: "Claude",
    logo: "/brands/ai/anthropic.svg",
    description: "Kritik asumsi dan blind spot operasional.",
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL,
    configured: enabled && Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_MODEL),
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    logo: "/brands/ai/gemini.svg",
    description: "Rencana tindakan dan pertanyaan survei.",
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL,
    configured: enabled && Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL),
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    logo: "/brands/ai/deepseek.svg",
    description: "Analisis efisiensi modal dan titik impas.",
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: process.env.DEEPSEEK_MODEL,
    configured: enabled && Boolean(process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_MODEL),
  },
};

export const publicAIProviders = (): AIProviderPublic[] =>
  Object.values(aiProviders).map(({ id, name, logo, configured, description }) => ({ id, name, logo, configured, description }));

export type AnalysisScenario = {
  business: string;
  category: string;
  city: string;
  province: string;
  scale: string;
  capexLow: number;
  capexHigh: number;
  monthlyRevenue: number;
  monthlyOpex: number;
  monthlyProfit: number;
  breakEvenRevenue: number;
  paybackMonths: number | null;
  trafficTarget: number;
  trafficLabel: string;
  risks: string[];
};

const rupiah = (million: number) => `Rp${million.toLocaleString("id-ID", { maximumFractionDigits: 1 })} juta`;

export function buildAnalysisPrompt(scenario: AnalysisScenario) {
  return `Kamu adalah analis UMKM Indonesia yang konservatif. Analisis skenario berikut tanpa menjanjikan keuntungan dan tanpa mengarang data eksternal.

USAHA: ${scenario.business} (${scenario.category})
LOKASI: ${scenario.city}, ${scenario.province}
SKALA: ${scenario.scale}
CAPEX: ${rupiah(scenario.capexLow)}-${rupiah(scenario.capexHigh)}
OMZET TARGET: ${rupiah(scenario.monthlyRevenue)}/bulan
OPEX: ${rupiah(scenario.monthlyOpex)}/bulan
LABA OPERASIONAL: ${rupiah(scenario.monthlyProfit)}/bulan
OMZET BEP: ${rupiah(scenario.breakEvenRevenue)}/bulan
PAYBACK: ${scenario.paybackMonths ? `${scenario.paybackMonths} bulan` : "belum tercapai"}
TRAFFIC MINIMUM: ${scenario.trafficTarget} ${scenario.trafficLabel}
RISIKO AWAL: ${scenario.risks.join("; ")}

Jawab dalam Bahasa Indonesia, maksimal 450 kata, dengan format tepat:
## Keputusan singkat
(LAYAK DIUJI / REVISI DULU / RISIKO TINGGI) dan satu alasan utama.
## Angka yang paling menentukan
3 bullet singkat.
## Risiko dan mitigasi
3 bullet: risiko — tindakan.
## Tes lapangan 7 hari
4 langkah yang bisa dilakukan pemula.
## Batas berhenti
1 kondisi angka yang membuat rencana harus dihentikan atau diubah.

Tegaskan bahwa hasil ini adalah bantuan analisis, bukan jaminan profit.`;
}

const requestJson = async (url: string, init: RequestInit) => {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(45000) });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = json?.error?.message || json?.message || `Provider mengembalikan HTTP ${response.status}`;
    throw new Error(String(message).slice(0, 240));
  }
  return json;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? value as Record<string, unknown> : {};

const collectText = (value: unknown): string => {
  if (!Array.isArray(value)) return "";
  return value.flatMap((item) => {
    const record = asRecord(item);
    if (typeof record.text === "string") return [record.text];
    const nested = collectText(record.content);
    return nested ? [nested] : [];
  }).join("\n");
};

export async function runAIAnalysis(providerId: AIProviderId, scenario: AnalysisScenario) {
  const provider = aiProviders[providerId];
  if (!provider?.configured || !provider.apiKey || !provider.model) throw new Error("Provider belum dikonfigurasi.");
  const prompt = buildAnalysisPrompt(scenario);

  if (providerId === "openai") {
    const json = await requestJson("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${provider.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: provider.model, input: prompt, max_output_tokens: 1000 }),
    });
    return typeof json.output_text === "string" ? json.output_text : collectText(json.output);
  }

  if (providerId === "anthropic") {
    const json = await requestJson("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": provider.apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({ model: provider.model, max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
    });
    return collectText(json.content);
  }

  if (providerId === "gemini") {
    const json = await requestJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(provider.model)}:generateContent?key=${encodeURIComponent(provider.apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 1000 } }),
    });
    const candidate = asRecord(Array.isArray(json.candidates) ? json.candidates[0] : null);
    return collectText(asRecord(candidate.content).parts);
  }

  const json = await requestJson("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${provider.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: provider.model, max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
  });
  const choice = asRecord(Array.isArray(json.choices) ? json.choices[0] : null);
  const content = asRecord(choice.message).content;
  return typeof content === "string" ? content : "";
}
