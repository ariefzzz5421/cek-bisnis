"use client";

/* eslint-disable @next/next/no-img-element -- official AI marks use mixed local and remote sources */

import { Check, ClipboardCopy, Sparkles } from "lucide-react";
import { useState } from "react";
import { ASSISTANTS, assistantUrl, buildSurveyPrompt, type Assistant, type SurveyPromptInput } from "@/lib/survey-prompt";

/**
 * Mengirim konteks survei ke asisten AI pilihan pengguna.
 *
 * Situs ini statis dan tidak memegang kunci API mana pun, jadi hand-off-nya
 * dilakukan di sisi klien: prompt lengkap disalin ke papan klip lalu asisten
 * dibuka di tab baru. Claude dan ChatGPT menerima prompt lewat parameter URL;
 * Gemini belum, karena itu papan klip selalu diisi sebagai jalur cadangan.
 */
export function SurveyAiHandoff(props: SurveyPromptInput) {
  const [copied, setCopied] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      return true;
    } catch {
      return false;
    }
  };

  const openAssistant = async (assistant: Assistant) => {
    const prompt = buildSurveyPrompt(props);
    const ok = await copyPrompt(prompt);
    setFailed(!ok && !assistant.urlTemplate);
    setCopied(assistant.id);
    window.setTimeout(() => setCopied(null), 2600);
    window.open(assistantUrl(assistant, prompt), "_blank", "noopener,noreferrer");
  };

  const justCopy = async () => {
    const ok = await copyPrompt(buildSurveyPrompt(props));
    setFailed(!ok);
    setCopied(ok ? "clipboard" : null);
    window.setTimeout(() => setCopied(null), 2600);
  };

  return (
    <div className="survey-ai">
      <div className="survey-ai__head">
        <Sparkles size={17} aria-hidden="true" />
        <div>
          <b>Lanjutkan analisis dengan AI</b>
          <span>Prompt berisi seluruh angka survei ini akan disalin, lalu asisten terbuka di tab baru.</span>
        </div>
      </div>

      <div className="survey-ai__buttons">
        {ASSISTANTS.map((assistant) => (
          <button type="button" key={assistant.id} onClick={() => void openAssistant(assistant)}>
            {copied === assistant.id
              ? <Check size={15} aria-hidden="true" />
              : <img src={assistant.logo} alt="" width="18" height="18" onError={(event) => { event.currentTarget.hidden = true; }} />}
            {assistant.name}
          </button>
        ))}
        <button type="button" className="survey-ai__copy" onClick={() => void justCopy()}>
          {copied === "clipboard" ? <Check size={15} aria-hidden="true" /> : <ClipboardCopy size={15} aria-hidden="true" />}
          {copied === "clipboard" ? "Tersalin" : "Salin prompt"}
        </button>
      </div>

      {copied && copied !== "clipboard" && (
        <p className="survey-ai__hint" role="status">
          Prompt tersalin. Kalau kolom chat masih kosong, tempel dengan Ctrl+V atau Cmd+V.
        </p>
      )}
      {failed && (
        <p className="survey-ai__hint survey-ai__hint--warn" role="status">
          Browser menolak akses papan klip. Buka asistennya lalu ketik ulang pertanyaanmu secara manual.
        </p>
      )}
    </div>
  );
}
