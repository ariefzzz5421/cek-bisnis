import type { Dossier } from "@/financial-models/catalog";
import {
  calculate,
  money,
  percent,
  months,
  type Model,
} from "@/financial-models/engine";
import { brandLogoAssets } from "@/lib/brand-logo-assets";

async function drawBrandLogo(
  context: CanvasRenderingContext2D,
  d: Dossier,
) {
  if (d.kind !== "franchise") return;
  const asset = brandLogoAssets[d.id];
  if (!asset) return;
  try {
    const response = await fetch(`/brands/franchises/${asset.file}`);
    if (!response.ok) return;
    const source = URL.createObjectURL(await response.blob());
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error("Logo tidak dapat dibaca"));
        element.src = source;
      });
      const ratio = Math.min(180 / image.naturalWidth, 64 / image.naturalHeight);
      context.drawImage(
        image,
        1070 - image.naturalWidth * ratio,
        38,
        image.naturalWidth * ratio,
        image.naturalHeight * ratio,
      );
    } finally {
      URL.revokeObjectURL(source);
    }
  } catch {
    // The financial summary remains downloadable when a brand asset is unavailable.
  }
}
export async function renderModelPng(d: Dossier, m: Model): Promise<Blob> {
  const r = calculate(m),
    canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1400;
  const c = canvas.getContext("2d");
  if (!c) throw new Error("Canvas tidak tersedia");
  c.fillStyle = "#fff";
  c.fillRect(0, 0, 1200, 1400);
  c.fillStyle = "#193853";
  c.fillRect(0, 0, 1200, 12);
  c.font = "bold 24px sans-serif";
  c.fillText("CEK BISNIS / FINANCIAL RESEARCH", 64, 75);
  await drawBrandLogo(c, d);
  c.font = "bold 42px sans-serif";
  c.fillText(d.name, 64, 145, 1060);
  c.font = "20px sans-serif";
  c.fillStyle = "#526172";
  c.fillText(
    "CEK BISNIS ESTIMATE · bukan performa outlet / rekomendasi",
    64,
    188,
  );
  c.fillText(m.location, 64, 225, 1060);
  const rows = [
    ["Total modal", money(r.capital)],
    ["Pendapatan / bulan", money(r.revenue)],
    ...(r.gmv !== null
      ? [["GMV ongkir (bukan pendapatan)", money(r.gmv)]]
      : []),
    ["Laba operasional", money(r.operatingProfit)],
    ["Arus kas / bulan", money(r.cashFlow)],
    ["Margin operasi", percent(r.operatingMargin)],
    [
      "BEP minimum",
      r.breakEvenUnits === null
        ? "Di luar kapasitas"
        : `${Math.ceil(r.breakEvenUnits)} ${m.unit}`,
    ],
    ["Payback", months(r.payback)],
    ["Status model", r.operatingProfit > 0 ? "Laba pada asumsi dasar" : "Belum layak pada asumsi dasar"],
  ];
  rows.forEach(([label, value], i) => {
    const y = 295 + i * 66;
    c.fillStyle = "#e3e8ed";
    c.fillRect(64, y + 20, 1072, 1);
    c.fillStyle = "#526172";
    c.font = "22px sans-serif";
    c.fillText(label, 64, y);
    c.fillStyle = "#182532";
    c.font = "bold 26px sans-serif";
    c.textAlign = "right";
    c.fillText(value, 1136, y);
    c.textAlign = "left";
  });
  c.font = "21px sans-serif";
  c.fillStyle = "#182532";
  let y = 1120;
  for (const t of [
    `Asumsi: ${m.inputs.units.value} ${m.unit} × ${money(m.inputs.ticket.value)}`,
    `Hari operasi ${m.inputs.days.value} · Sewa ${money(m.inputs.rent.value)} / bulan`,
    m.mode === "commission-rate"
      ? `Komisi estimasi ${percent(m.inputs.commissionRate.value)}`
      : m.mode === "commission-fixed"
        ? `Komisi estimasi ${money(m.inputs.commissionFixed.value)} / paket`
        : "Volume tetap; tanpa ramp-up atau pertumbuhan.",
    `Model sebelum pajak/cicilan kecuali input diubah.`,
    `Sumber dan seluruh asumsi: unduh laporan PDF yang sama.`,
    `Ditinjau 8 September 2026 · cek-bisnis.vercel.app${d.href}`,
  ]) {
    c.fillText(t, 64, y, 1072);
    y += 37;
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Ekspor gagal"))),
      "image/png",
    ),
  );
}
