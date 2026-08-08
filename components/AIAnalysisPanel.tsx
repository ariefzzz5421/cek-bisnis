"use client";

/* eslint-disable @next/next/no-img-element -- official provider marks are remote/non-LCP and intentionally unoptimized */

import { AlertTriangle, Check, Download, LoaderCircle, LockKeyhole, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { AIProviderId, AIProviderPublic, AnalysisScenario } from "@/lib/ai-providers";

type Result = { analysis: string; provider: string; generatedAt: string };

export function AIAnalysisPanel({ scenario }: { scenario: AnalysisScenario }) {
  const [providers, setProviders] = useState<AIProviderPublic[]>([]);
  const [selected, setSelected] = useState<AIProviderId | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    fetch("/api/ai-providers", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        const items = Array.isArray(data.providers) ? data.providers : [];
        setProviders(items);
        setSelected(items.find((item: AIProviderPublic) => item.configured)?.id ?? items[0]?.id ?? null);
      })
      .catch(() => setError("Status provider AI tidak dapat dimuat."))
      .finally(() => setLoadingStatus(false));
  }, []);

  const chosen = providers.find((provider) => provider.id === selected);

  const analyze = async () => {
    if (!chosen?.configured || running) return;
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: chosen.id, scenario }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analisis gagal.");
      setResult(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analisis gagal.");
    } finally {
      setRunning(false);
    }
  };

  const download = () => {
    if (!result) return;
    const file = `# Analisis AI · ${scenario.business}\n\nProvider: ${result.provider}\nLokasi: ${scenario.city}, ${scenario.province}\nDibuat: ${new Date(result.generatedAt).toLocaleString("id-ID")}\n\n${result.analysis}\n\n---\nHasil AI adalah bantuan analisis, bukan jaminan keuntungan.`;
    const url = URL.createObjectURL(new Blob([file], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `cek-bisnis-ai-${scenario.business.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="ai-analysis" id="ai-analysis" aria-labelledby="ai-analysis-title">
      <div className="real-section-head">
        <div><span>SECOND OPINION AI</span><h2 id="ai-analysis-title">Minta AI mengkritik skenario.</h2></div>
        <p>AI membaca angka yang sedang dipilih. API key tetap di server.</p>
      </div>

      <div className="ai-analysis__shell">
        <div className="ai-provider-panel">
          <div className="ai-provider-grid" aria-label="Pilih provider AI">
            {loadingStatus ? <div className="ai-provider-loading"><LoaderCircle size={20} className="is-spinning" /> Memuat provider…</div> : providers.map((provider) => (
              <button
                type="button"
                key={provider.id}
                className={selected === provider.id ? "is-selected" : ""}
                onClick={() => setSelected(provider.id)}
                aria-pressed={selected === provider.id}
              >
                <span className="ai-provider-mark" aria-hidden="true" data-initials={provider.id === "openai" ? "OA" : provider.id === "deepseek" ? "DS" : provider.name.slice(0, 1)}>
                  <img src={provider.logo} alt="" onLoad={(event) => { event.currentTarget.dataset.loaded = "true"; }} onError={(event) => { event.currentTarget.hidden = true; }} />
                </span>
                <span><b>{provider.name}</b><small>{provider.description}</small></span>
                {provider.configured ? <Check size={17} aria-label="Siap digunakan" /> : <LockKeyhole size={16} aria-label="Belum dikonfigurasi" />}
              </button>
            ))}
          </div>

          <div className="ai-scenario-strip">
            <span><small>Usaha</small><b>{scenario.business}</b></span>
            <span><small>Lokasi</small><b>{scenario.city}</b></span>
            <span><small>Skala</small><b>{scenario.scale}</b></span>
          </div>

          <button className="ai-run" type="button" onClick={analyze} disabled={!chosen?.configured || running}>
            {running ? <><LoaderCircle size={19} className="is-spinning" /> Sedang menganalisis…</> : <><Sparkles size={19} /> Analisis dengan {chosen?.name || "AI"}</>}
          </button>
          {!loadingStatus && chosen && !chosen.configured && <p className="ai-config-note"><LockKeyhole size={15} /> Aktifkan <code>AI_ANALYSIS_ENABLED</code>, lalu isi API key dan model {chosen.name} di environment server.</p>}
          <p className="ai-risk-note"><AlertTriangle size={15} /> Jangan kirim data pribadi. Hasil AI bukan jaminan profit.</p>
        </div>

        <div className={`ai-result ${result ? "has-result" : ""}`} aria-live="polite">
          {error ? <div className="ai-result__error"><AlertTriangle size={20} /><b>Analisis belum berhasil</b><p>{error}</p></div> : result ? (
            <>
              <header><span><Check size={17} /> Ringkasan {result.provider}</span><button type="button" onClick={download}><Download size={16} /> Unduh hasil</button></header>
              <pre>{result.analysis}</pre>
            </>
          ) : (
            <div className="ai-result__empty"><Sparkles size={32} /><b>Hasil muncul di sini</b><p>Pilih provider yang sudah aktif, lalu jalankan analisis.</p></div>
          )}
        </div>
      </div>
    </section>
  );
}
