"use client";

import { Download, FileText, ImageDown, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import type { Franchise, FranchiseArticle, FranchiseSource } from "@/lib/franchise-data";

export function FranchiseDownload({
  franchise,
  article,
  sources,
}: {
  franchise: Franchise;
  article: FranchiseArticle;
  sources: FranchiseSource[];
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "png" | "pdf" | "error">("idle");

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const { renderFranchiseSummaryPng } = await import("@/lib/export-documents");
        const blob = await renderFranchiseSummaryPng({ franchise, article });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch {
        // Tombol tetap bisa dicoba manual. Preview bukan syarat untuk halaman.
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [article, franchise]);

  const downloadPng = async () => {
    setState("png");
    try {
      const { downloadBlob, renderFranchiseSummaryPng } = await import("@/lib/export-documents");
      const blob = await renderFranchiseSummaryPng({ franchise, article });
      downloadBlob(blob, `cek-bisnis-${franchise.id}-ringkasan.png`);
      setState("idle");
    } catch {
      setState("error");
    }
  };

  const downloadPdf = async () => {
    setState("pdf");
    try {
      const { buildFranchiseResearchPdf, downloadBlob } = await import("@/lib/financial-pdf");
      const blob = buildFranchiseResearchPdf({ franchise, article, sources });
      downloadBlob(blob, `cek-bisnis-${franchise.id}-analisis-lengkap.pdf`);
      setState("idle");
    } catch {
      setState("error");
    }
  };

  return (
    <section className="simple-business-download franchise-download" id="download">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt={`Ringkasan ${franchise.name}`}
          width={1200}
          height={1680}
        />
      ) : (
        <div className="franchise-download__preview-placeholder" aria-hidden="true">
          <span>CEK BISNIS</span>
          <b>{franchise.name}</b>
          <small>Preview ringkasan sedang disiapkan…</small>
        </div>
      )}

      <div>
        <span>UNDUH ANALISIS</span>
        <h2>Simpan sebelum hubungi brand.</h2>
        <button type="button" onClick={() => void downloadPdf()} disabled={state === "pdf" || state === "png"}>
          <FileText size={22} />
          <b>{state === "pdf" ? "Menyiapkan PDF..." : "PDF analisis lengkap"}</b>
          <Download size={18} />
        </button>
        <button type="button" onClick={() => void downloadPng()} disabled={state === "pdf" || state === "png"}>
          <ImageDown size={22} />
          <b>{state === "png" ? "Menyiapkan PNG..." : "PNG ringkasan 1 gambar"}</b>
          <Download size={18} />
        </button>
        <p className="download-note">
          PDF memakai teks hitam/abu normal dan memisahkan angka publik dari skenario Cek Bisnis. Isinya mencakup breakdown modal, tiga skenario finansial, laba/payback, kelebihan-kekurangan, KPI, syarat, dokumen, dan sumber.
        </p>
        {state === "error" && (
          <p className="download-error"><ShieldAlert size={15} /> Gagal membuat file di peramban ini. Coba ulang atau gunakan Chrome terbaru.</p>
        )}
      </div>
    </section>
  );
}
