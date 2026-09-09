import type { Dossier } from "@/financial-models/catalog";
import {
  calculate,
  money,
  percent,
  months,
  type Model,
} from "@/financial-models/engine";
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
    ["HPP / biaya variabel", money(r.cogs)],
    ["Biaya tetap", money(r.fixedOpex)],
    ["Laba operasional", money(r.operatingProfit)],
    ["Arus kas / bulan", money(r.cashFlow)],
    ["Margin operasi", percent(r.operatingMargin)],
    [
      "BEP pendapatan",
      r.breakEvenRevenue === null
        ? "Di luar kapasitas"
        : money(r.breakEvenRevenue),
    ],
    ["Payback", months(r.payback)],
    ["ROI sederhana tahunan", percent(r.annualRoi)],
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
