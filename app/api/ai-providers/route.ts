import { NextResponse } from "next/server";
import { publicAIProviders } from "@/lib/ai-providers";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ providers: publicAIProviders(), enabled: process.env.AI_ANALYSIS_ENABLED === "true" });
}
