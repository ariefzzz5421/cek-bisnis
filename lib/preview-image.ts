import type { Business, BusinessMetrics, City } from "@/lib/business-data";
import { formatMoney, formatMonths, formatPercent, formatTicket } from "@/lib/business-data";
import type { BusinessScale } from "@/lib/business-details";

/**
 * Membangun kartu ringkasan satu gambar untuk sebuah model usaha.
 *
 * Gambar dirender di sisi klien lewat <canvas>, bukan diambil dari berkas statis,
 * supaya isinya mengikuti kota dan skala yang sedang dipilih pengguna. Foto usaha
 * berasal dari origin yang sama sehingga kanvas tidak ikut ter-taint dan
 * toBlob() tetap boleh dipanggil.
 */

const W = 1200;
/* Tinggi disetel agar bayangan kartu rencana 90 hari masih punya ruang
 * sebelum bidang kaki halaman. */
const H = 1682;

const COLORS = {
  paper: "#f5f1e4",
  paper2: "#ffffff",
  ink: "#0d0d0d",
  ink2: "#1f1f1f",
  muted: "#5f5f56",
  accent: "#c9f531",
  accentSoft: "#eafdb8",
  cyan: "#7de8ef",
  cyanSoft: "#d9fafc",
  pear: "#ffd93d",
  pearSoft: "#fff3c4",
  coralSoft: "#ffe2da",
  successSoft: "#d8f5cf",
};

/**
 * next/font membuat nama family acak, jadi nama literal tidak bisa dipakai di
 * kanvas. Nilainya dibaca dari variabel CSS yang sama dengan yang dipakai situs,
 * dengan fallback aman kalau variabelnya belum sempat termuat.
 */
function resolveFonts() {
  const style = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
  const read = (name: string, fallback: string) => {
    const value = style?.getPropertyValue(name).trim();
    return value ? `${value}, ${fallback}` : fallback;
  };
  return {
    sans: read("--font-plus-jakarta", "'Segoe UI', Arial, sans-serif"),
    mono: read("--font-jetbrains-mono", "Consolas, monospace"),
  };
}

let SANS = "'Segoe UI', Arial, sans-serif";
let MONO = "Consolas, monospace";

type Ctx = CanvasRenderingContext2D;

const font = (size: number, weight = 400, family = SANS) => `${weight} ${size}px ${family}`;

/** Kotak bergaris tinta dengan bayangan keras, elemen dasar tampilan situs. */
function box(ctx: Ctx, x: number, y: number, w: number, h: number, fill: string, shadow = 6) {
  if (shadow > 0) {
    ctx.fillStyle = COLORS.ink;
    ctx.fillRect(x + shadow, y + shadow, w, h);
  }
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
}

/** Menulis teks yang dibungkus otomatis; mengembalikan tinggi total terpakai. */
function wrap(ctx: Ctx, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 99) {
  const words = text.split(" ");
  let line = "";
  let lines = 0;
  let cursorY = y;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      if (lines + 1 >= maxLines) {
        // Sisa teks dipangkas dengan elipsis daripada meluber keluar kotak.
        let clipped = line;
        while (ctx.measureText(`${clipped}...`).width > maxWidth && clipped.length > 1) {
          clipped = clipped.slice(0, -1);
        }
        ctx.fillText(`${clipped}...`, x, cursorY);
        return cursorY + lineHeight - y;
      }
      ctx.fillText(line, x, cursorY);
      cursorY += lineHeight;
      lines += 1;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cursorY);
    cursorY += lineHeight;
  }
  return cursorY - y;
}

/** Label monospace kapital di dalam blok warna. */
function kicker(ctx: Ctx, text: string, x: number, y: number, bg: string) {
  ctx.font = font(15, 800, MONO);
  const padX = 12;
  const w = ctx.measureText(text).width + padX * 2;
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, 30);
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, 28);
  ctx.fillStyle = COLORS.ink;
  ctx.fillText(text, x + padX, y + 21);
  return w;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

/** Menggambar gambar dengan perilaku object-fit: cover di dalam kotak. */
function drawCover(ctx: Ctx, image: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / image.width, h / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

export type PreviewInput = {
  business: Business;
  city: City;
  scale: BusinessScale;
  metrics: BusinessMetrics;
};

export async function renderBusinessPreview({ business, city, scale, metrics }: PreviewInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia di peramban ini.");

  const fonts = resolveFonts();
  SANS = fonts.sans;
  MONO = fonts.mono;
  // Tunggu webfont siap; tanpa ini kanvas bisa menggambar dengan fallback.
  await document.fonts?.ready;

  const photo = await loadImage(`/businesses/${business.slug}.jpg`);

  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";

  const M = 56;
  const inner = W - M * 2;

  /* ------------------------------------------------------------ kepala */
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(0, 0, W, 96);
  ctx.fillStyle = COLORS.accent;
  ctx.fillRect(M, 26, 44, 44);
  ctx.fillStyle = COLORS.ink;
  ctx.font = font(20, 800, MONO);
  ctx.fillText("CB", M + 7, 55);
  ctx.fillStyle = COLORS.paper;
  ctx.font = font(24, 800, SANS);
  ctx.fillText("CEK BISNIS", M + 60, 48);
  ctx.fillStyle = "#a5a59a";
  ctx.font = font(14, 500, MONO);
  ctx.fillText(`RINGKASAN USAHA · ${city.name.toUpperCase()}`, M + 60, 70);
  ctx.textAlign = "right";
  ctx.fillStyle = COLORS.accent;
  ctx.font = font(14, 700, MONO);
  ctx.fillText("cek-bisnis.vercel.app", W - M, 60);
  ctx.textAlign = "left";

  let y = 96;

  /* -------------------------------------------------------------- foto */
  const photoH = 300;
  if (photo) {
    drawCover(ctx, photo, 0, y, W, photoH);
  } else {
    ctx.fillStyle = COLORS.cyanSoft;
    ctx.fillRect(0, y, W, photoH);
  }
  // Gradasi gelap agar judul di atas foto tetap terbaca apa pun fotonya.
  const shade = ctx.createLinearGradient(0, y, 0, y + photoH);
  shade.addColorStop(0, "rgba(13,13,13,0.15)");
  shade.addColorStop(1, "rgba(13,13,13,0.86)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, y, W, photoH);

  kicker(ctx, business.category.toUpperCase(), M, y + photoH - 132, COLORS.accent);
  ctx.fillStyle = "#ffffff";
  ctx.font = font(58, 800, SANS);
  ctx.fillText(business.name, M, y + photoH - 62);
  ctx.fillStyle = "#e6e6dd";
  ctx.font = font(19, 500, SANS);
  wrap(ctx, business.oneLine, M, y + photoH - 28, inner - 40, 24, 1);

  y += photoH + 34;

  /* ---------------------------------------------------- empat angka inti */
  const cardW = (inner - 3 * 14) / 4;
  const cardH = 116;
  const tiles: { label: string; value: string; bg: string }[] = [
    { label: "MODAL AWAL", value: `${formatMoney(metrics.capexLow, 0)}-${formatMoney(metrics.capexHigh, 0).replace("Rp", "")}`, bg: COLORS.paper2 },
    { label: "OMZET TARGET", value: `${formatMoney(metrics.monthlyRevenue, 0)}/bln`, bg: COLORS.cyanSoft },
    { label: "OMZET BEP", value: formatMoney(metrics.breakEvenRevenue), bg: COLORS.accentSoft },
    { label: "TRAFFIC MIN", value: `${metrics.traffic}`, bg: COLORS.pearSoft },
  ];

  tiles.forEach((tile, index) => {
    const x = M + index * (cardW + 14);
    box(ctx, x, y, cardW, cardH, tile.bg, 5);
    ctx.fillStyle = COLORS.muted;
    ctx.font = font(13, 700, MONO);
    ctx.fillText(tile.label, x + 16, y + 32);
    ctx.fillStyle = COLORS.ink;
    ctx.font = font(cardW > 250 ? 27 : 24, 800, MONO);
    // Angka panjang dikecilkan bertahap supaya tidak menabrak tepi kartu.
    let size = 27;
    while (ctx.measureText(tile.value).width > cardW - 32 && size > 15) {
      size -= 1;
      ctx.font = font(size, 800, MONO);
    }
    ctx.fillText(tile.value, x + 16, y + 76);
    if (index === 3) {
      ctx.fillStyle = COLORS.muted;
      ctx.font = font(12, 500, SANS);
      ctx.fillText(business.trafficLabel, x + 16, y + 98);
    }
  });

  y += cardH + 34;

  /* ----------------------------------------------------- skema pendapatan */
  const schemeH = 258;
  box(ctx, M, y, inner, schemeH, COLORS.paper2, 6);
  let sy = y + 40;
  kicker(ctx, "SKEMA PENDAPATAN", M + 24, sy - 22, COLORS.cyan);
  sy += 34;

  ctx.fillStyle = COLORS.ink;
  ctx.font = font(26, 800, SANS);
  sy += wrap(ctx, business.scheme.model, M + 24, sy, inner - 48, 32, 2);

  sy += 8;
  ctx.fillStyle = COLORS.muted;
  ctx.font = font(14, 500, SANS);
  sy += wrap(ctx, `Dasar harga: ${business.scheme.priceBasis}`, M + 24, sy, inner - 48, 20, 2);
  sy += wrap(ctx, `Siklus kas: ${business.scheme.cashCycle}`, M + 24, sy, inner - 48, 20, 2);

  // Komposisi omzet sebagai batang bertumpuk.
  sy += 16;
  ctx.fillStyle = COLORS.ink;
  ctx.font = font(13, 700, MONO);
  ctx.fillText("KOMPOSISI OMZET", M + 24, sy);
  sy += 14;

  const barW = inner - 48;
  const barColors = [COLORS.accent, COLORS.cyan, COLORS.pear];
  let barX = M + 24;
  business.scheme.streams.forEach((stream, index) => {
    const w = (stream.share / 100) * barW;
    ctx.fillStyle = barColors[index % barColors.length];
    ctx.fillRect(barX, sy, w, 26);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(barX + 1, sy + 1, w - 2, 24);
    ctx.fillStyle = COLORS.ink;
    ctx.font = font(13, 800, MONO);
    if (w > 46) ctx.fillText(`${stream.share}%`, barX + 8, sy + 18);
    barX += w;
  });

  sy += 40;
  ctx.font = font(13, 500, SANS);
  let legendX = M + 24;
  business.scheme.streams.forEach((stream, index) => {
    ctx.fillStyle = barColors[index % barColors.length];
    ctx.fillRect(legendX, sy - 10, 12, 12);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(legendX + 0.75, sy - 9.25, 10.5, 10.5);
    ctx.fillStyle = COLORS.ink2;
    const label = stream.name.length > 34 ? `${stream.name.slice(0, 33)}...` : stream.name;
    ctx.fillText(label, legendX + 18, sy);
    legendX += ctx.measureText(label).width + 44;
  });

  y += schemeH + 30;

  /* ---------------------------------------------------------- blok BEP */
  const bepH = 190;
  const bepW = inner * 0.46;
  box(ctx, M, y, bepW, bepH, COLORS.accent, 6);
  kicker(ctx, "BALIK MODAL", M + 24, y + 22, COLORS.paper2);
  ctx.fillStyle = COLORS.ink;
  ctx.font = font(66, 800, MONO);
  const bepText = `${business.bepMonths[0]}-${business.bepMonths[1]}`;
  // Lebarnya harus diukur selagi font besar masih aktif, kalau tidak label
  // "bulan" akan ditumpuk di atas angkanya.
  const bepWidth = ctx.measureText(bepText).width;
  ctx.fillText(bepText, M + 24, y + 116);
  ctx.font = font(20, 700, SANS);
  ctx.fillText("bulan", M + 34 + bepWidth, y + 116);
  ctx.font = font(14, 500, SANS);
  wrap(ctx, "Rentang khas model usaha ini bila omzet menyentuh skenario realistis.", M + 24, y + 146, bepW - 48, 19, 2);

  // Simulasi milik pengguna sendiri, di samping rentang umum.
  const simX = M + bepW + 20;
  const simW = inner - bepW - 20;
  box(ctx, simX, y, simW, bepH, COLORS.paper2, 6);
  kicker(ctx, `SIMULASI ${city.name.toUpperCase()}`, simX + 24, y + 22, COLORS.pear);

  const rows: [string, string][] = [
    ["Balik modal simulasi", formatMonths(metrics.payback)],
    ["Laba operasional", `${metrics.profit >= 0 ? "+" : ""}${formatMoney(metrics.profit)}/bln`],
    ["Margin bersih", formatPercent(metrics.marginRate)],
    ["Skala", scale.name],
  ];
  let ry = y + 84;
  rows.forEach(([label, value]) => {
    ctx.fillStyle = COLORS.muted;
    ctx.font = font(14, 500, SANS);
    ctx.fillText(label, simX + 24, ry);
    ctx.textAlign = "right";
    ctx.fillStyle = COLORS.ink;
    ctx.font = font(16, 800, MONO);
    ctx.fillText(value, simX + simW - 24, ry);
    ctx.textAlign = "left";
    ctx.strokeStyle = "rgba(13,13,13,0.18)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(simX + 24, ry + 10);
    ctx.lineTo(simX + simW - 24, ry + 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ry += 30;
  });

  y += bepH + 30;

  /* ------------------------------------------------------------ KPI inti */
  const kpiH = 250;
  box(ctx, M, y, inner, kpiH, COLORS.cyanSoft, 6);
  kicker(ctx, "KPI YANG WAJIB DIPANTAU", M + 24, y + 22, COLORS.paper2);

  let ky = y + 86;
  business.kpi.slice(0, 4).forEach((item) => {
    ctx.fillStyle = COLORS.ink;
    ctx.font = font(17, 700, SANS);
    ctx.fillText(item.label, M + 24, ky);
    ctx.textAlign = "right";
    ctx.font = font(17, 800, MONO);
    ctx.fillText(item.target, W - M - 24, ky);
    ctx.textAlign = "left";
    ctx.fillStyle = COLORS.muted;
    ctx.font = font(13, 500, SANS);
    wrap(ctx, item.note, M + 24, ky + 19, inner - 260, 17, 1);
    ky += 44;
  });

  y += kpiH + 30;

  /* ----------------------------------------------------- rencana 90 hari */
  const planH = 172;
  const planW = (inner - 2 * 14) / 3;
  const planColors = [COLORS.paper2, COLORS.pearSoft, COLORS.successSoft];

  business.plan90.slice(0, 3).forEach((phase, index) => {
    const x = M + index * (planW + 14);
    box(ctx, x, y, planW, planH, planColors[index], 5);
    ctx.fillStyle = COLORS.ink;
    ctx.fillRect(x + planW - 46, y, 46, 34);
    ctx.fillStyle = COLORS.paper;
    ctx.font = font(16, 800, MONO);
    ctx.fillText(`0${index + 1}`, x + planW - 34, y + 23);

    ctx.fillStyle = COLORS.muted;
    ctx.font = font(12, 700, MONO);
    ctx.fillText(phase.phase.toUpperCase(), x + 18, y + 34);
    ctx.fillStyle = COLORS.ink;
    ctx.font = font(19, 800, SANS);
    const titleH = wrap(ctx, phase.title, x + 18, y + 60, planW - 70, 22, 2);

    ctx.fillStyle = COLORS.ink2;
    ctx.font = font(13, 500, SANS);
    let py = y + 60 + titleH + 8;
    phase.actions.slice(0, 3).forEach((action) => {
      py += wrap(ctx, `· ${action}`, x + 18, py, planW - 36, 18, 1);
    });
  });

  y += planH;

  /* ---------------------------------------------------------- kaki halaman */
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(0, H - 118, W, 118);
  ctx.fillStyle = COLORS.accent;
  ctx.font = font(15, 800, MONO);
  ctx.fillText(`HARGA RATA-RATA ${formatTicket(business.avgTicket)} · ${business.trafficLabel.toUpperCase()}`, M, H - 74);
  ctx.fillStyle = "#a5a59a";
  ctx.font = font(13, 500, SANS);
  wrap(
    ctx,
    "Estimasi indikatif untuk penyaringan awal, bukan jaminan keuntungan. Survei traffic dan pesaing radius lokal minimal 7 hari sebelum menyewa tempat.",
    M,
    H - 48,
    inner,
    18,
    2,
  );

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Gagal membuat gambar."))), "image/png");
  });
}
