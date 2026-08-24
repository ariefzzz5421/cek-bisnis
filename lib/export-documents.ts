import {
  formatContractYears,
  formatInvestmentRange,
  formatMonthRange,
  formatRevenueRange,
  franchiseBasisLabel,
  franchiseSectorName,
  type Franchise,
  type FranchiseArticle,
  type FranchiseSource,
} from "@/lib/franchise-data";

export type CompareExportChoice = {
  key: string;
  name: string;
  kind: string;
  sector: string;
  capital: string;
  revenue: string;
  bep: string;
  fee: string;
  recurring: string;
  mechanism: string;
  factors: string[];
  basis: string;
};

const PAPER = "#f6f3e9";
const WHITE = "#fffdf7";
const INK = "#101010";
const MUTED = "#5e5b54";
const LIME = "#c6f24f";
const CYAN = "#7fe3e8";

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

const canvasBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas tidak dapat dikonversi menjadi PNG."));
    }, "image/png", 0.96);
  });

function setFont(ctx: CanvasRenderingContext2D, size: number, weight = 500, family = "Arial, Helvetica, sans-serif") {
  ctx.font = `${weight} ${size}px ${family}`;
}

function wrapCanvas(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const paragraphs = String(text).split(/\n+/);
  const lines: string[] = [];
  paragraphs.forEach((paragraph, paragraphIndex) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    if (paragraphIndex < paragraphs.length - 1) lines.push("");
  });
  return lines.length ? lines : [""];
}

function drawWrapped(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = Number.POSITIVE_INFINITY,
) {
  const lines = wrapCanvas(ctx, text, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function drawCard(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fill = WHITE) {
  ctx.fillStyle = INK;
  ctx.fillRect(x + 8, y + 8, width, height);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, width, height);
}

function drawLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fill = LIME) {
  setFont(ctx, 20, 800);
  const width = Math.ceil(ctx.measureText(text).width) + 32;
  ctx.fillStyle = fill;
  ctx.fillRect(x, y - 25, width, 36);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y - 25, width, 36);
  ctx.fillStyle = INK;
  ctx.fillText(text, x + 16, y);
}

function canvasHeader(ctx: CanvasRenderingContext2D, width: number, subtitle: string) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, ctx.canvas.height);
  ctx.fillStyle = LIME;
  ctx.fillRect(58, 54, 44, 44);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(58, 54, 44, 44);
  ctx.fillStyle = INK;
  setFont(ctx, 26, 900);
  ctx.fillText("CB", 63, 87);
  setFont(ctx, 30, 900);
  ctx.fillText("CEK BISNIS", 120, 88);
  setFont(ctx, 18, 700);
  ctx.fillStyle = MUTED;
  ctx.textAlign = "right";
  ctx.fillText(subtitle.toUpperCase(), width - 58, 84);
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.fillRect(58, 116, width - 116, 4);
}

export async function renderFranchiseSummaryPng({
  franchise,
  article,
}: {
  franchise: Franchise;
  article: FranchiseArticle;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1680;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia.");

  canvasHeader(ctx, canvas.width, "Ringkasan franchise");

  ctx.fillStyle = franchise.brandColor;
  ctx.fillRect(58, 160, 14, 225);
  ctx.fillStyle = INK;
  setFont(ctx, 23, 800);
  ctx.fillText(`${franchiseSectorName(franchise).toUpperCase()} · SEJAK ${franchise.since}`, 96, 194);
  setFont(ctx, 63, 900);
  let y = drawWrapped(ctx, franchise.name, 96, 265, 1000, 68, 2);
  setFont(ctx, 23, 500);
  ctx.fillStyle = MUTED;
  y = drawWrapped(ctx, article.lede, 96, y + 12, 1010, 34, 3);

  const metrics = [
    ["MODAL AWAL", formatInvestmentRange(franchise.investment)],
    ["OMZET / BULAN", formatRevenueRange(franchise.monthlyRevenue)],
    ["BALIK MODAL", formatMonthRange(franchise.bepMonths)],
    ["FRANCHISE FEE", franchise.franchiseFee],
    ["ROYALTI", franchise.royalty],
    ["KONTRAK", formatContractYears(franchise.contractYears)],
  ] as const;

  y += 38;
  const gap = 16;
  const colWidth = (1084 - gap) / 2;
  const cardHeight = 145;
  metrics.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 58 + col * (colWidth + gap);
    const top = y + row * (cardHeight + gap);
    drawCard(ctx, x, top, colWidth, cardHeight, index === 0 ? LIME : WHITE);
    setFont(ctx, 18, 800);
    ctx.fillStyle = MUTED;
    ctx.fillText(label, x + 24, top + 38);
    setFont(ctx, 27, 900);
    ctx.fillStyle = INK;
    drawWrapped(ctx, value, x + 24, top + 82, colWidth - 48, 33, 2);
  });

  y += 3 * (cardHeight + gap) + 22;
  drawCard(ctx, 58, y, 1084, 285, WHITE);
  drawLabel(ctx, "SKEMA KEMITRAAN", 82, y + 48, CYAN);
  setFont(ctx, 24, 600);
  ctx.fillStyle = INK;
  let schemeBottom = drawWrapped(ctx, franchise.scheme, 82, y + 102, 1036, 36, 5);
  setFont(ctx, 18, 700);
  ctx.fillStyle = MUTED;
  ctx.fillText(franchiseBasisLabel(franchise.dataBasis), 82, Math.min(y + 255, schemeBottom + 30));

  y += 315;
  drawCard(ctx, 58, y, 1084, 350, WHITE);
  drawLabel(ctx, "KPI YANG WAJIB DIPANTAU", 82, y + 48, LIME);
  let kpiY = y + 105;
  franchise.kpi.slice(0, 4).forEach((item, index) => {
    ctx.fillStyle = INK;
    ctx.fillRect(82, kpiY - 18, 24, 24);
    ctx.fillStyle = WHITE;
    setFont(ctx, 15, 900);
    ctx.fillText(String(index + 1), 89, kpiY);
    ctx.fillStyle = INK;
    setFont(ctx, 23, 650);
    kpiY = drawWrapped(ctx, item, 128, kpiY, 970, 32, 2) + 18;
  });

  setFont(ctx, 18, 600);
  ctx.fillStyle = MUTED;
  ctx.fillText("Screening awal — validasi proposal, lokasi, traffic, dan kontrak terbaru sebelum investasi.", 58, 1618);
  ctx.fillStyle = INK;
  ctx.fillRect(58, 1640, 1084, 4);

  return canvasBlob(canvas);
}

export async function renderCompareSummaryPng(left: CompareExportChoice, right: CompareExportChoice) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1280;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia.");

  canvasHeader(ctx, canvas.width, "Compare business");
  ctx.fillStyle = INK;
  setFont(ctx, 72, 900);
  ctx.fillText("DUA BISNIS. SATU LAYAR.", 58, 210);
  setFont(ctx, 22, 600);
  ctx.fillStyle = MUTED;
  ctx.fillText("Ringkasan pilihan yang sedang dibandingkan di Cek Bisnis.", 58, 252);

  const gap = 24;
  const columnWidth = (1484 - gap) / 2;
  const top = 300;
  const cardHeight = 845;

  [left, right].forEach((choice, column) => {
    const x = 58 + column * (columnWidth + gap);
    drawCard(ctx, x, top, columnWidth, cardHeight, WHITE);
    drawLabel(ctx, choice.kind.toUpperCase(), x + 28, top + 54, column === 0 ? LIME : CYAN);
    ctx.fillStyle = INK;
    setFont(ctx, 45, 900);
    let y = drawWrapped(ctx, choice.name, x + 28, top + 132, columnWidth - 56, 50, 2);
    setFont(ctx, 20, 650);
    ctx.fillStyle = MUTED;
    ctx.fillText(choice.sector, x + 28, y + 8);
    ctx.fillText(choice.basis, x + 28, y + 40);
    y += 76;

    const rows: Array<[string, string]> = [
      ["Modal awal", choice.capital],
      ["Omzet", choice.revenue],
      ["BEP", choice.bep],
      ["Fee awal", choice.fee],
      ["Biaya berulang", choice.recurring],
    ];
    rows.forEach(([label, value]) => {
      ctx.strokeStyle = "#cfc8b9";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 28, y);
      ctx.lineTo(x + columnWidth - 28, y);
      ctx.stroke();
      y += 32;
      setFont(ctx, 17, 800);
      ctx.fillStyle = MUTED;
      ctx.fillText(label.toUpperCase(), x + 28, y);
      setFont(ctx, 24, 850);
      ctx.fillStyle = INK;
      y = drawWrapped(ctx, value, x + 28, y + 38, columnWidth - 56, 31, 2) + 20;
    });

    setFont(ctx, 18, 800);
    ctx.fillStyle = MUTED;
    ctx.fillText("MEKANISME", x + 28, y + 10);
    setFont(ctx, 20, 600);
    ctx.fillStyle = INK;
    drawWrapped(ctx, choice.mechanism, x + 28, y + 46, columnWidth - 56, 29, 4);
  });

  ctx.fillStyle = INK;
  ctx.fillRect(58, 1195, 1484, 4);
  setFont(ctx, 18, 600);
  ctx.fillStyle = MUTED;
  ctx.fillText("Gunakan sebagai screening. Angka franchise yang belum dipublikasikan tidak diisi dengan tebakan.", 58, 1235);
  return canvasBlob(canvas);
}

/* ---------------------------------------------------------------- PDF */

const ascii = (value: unknown) => String(value ?? "")
  .replace(/[–—]/g, "-")
  .replace(/±/g, "+/-")
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .replace(/…/g, "...")
  .replace(/•/g, "-")
  .replace(/→/g, "->")
  .replace(/·/g, "-")
  .replace(/[^\x20-\x7E\n]/g, " ")
  .replace(/[ \t]+/g, " ")
  .trim();

const pdfEscape = (value: string) => ascii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

function wrapPdf(text: string, fontSize: number, width: number) {
  const maxChars = Math.max(12, Math.floor(width / (fontSize * 0.52)));
  const paragraphs = ascii(text).split(/\n+/);
  const lines: string[] = [];
  paragraphs.forEach((paragraph, pIndex) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    words.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (line && next.length > maxChars) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
    if (pIndex < paragraphs.length - 1) lines.push("");
  });
  return lines.length ? lines : [""];
}

type PdfPage = string[];

class SimplePdf {
  private pages: PdfPage[] = [[]];
  private y = 786;
  private readonly margin = 48;
  private readonly width = 499;

  private page() {
    return this.pages[this.pages.length - 1];
  }

  private ensure(height: number) {
    if (this.y - height >= 58) return;
    this.pages.push([]);
    this.y = 786;
    this.header("CEK BISNIS", "LANJUTAN");
  }

  header(left = "CEK BISNIS", right = "ANALISIS") {
    this.page().push(`0.78 0.95 0.31 rg 48 798 24 24 re f`);
    this.page().push(`0 0 0 RG 1.5 w 48 798 24 24 re S`);
    this.rawText(left, 82, 805, 13, true);
    this.rawText(right, 547 - right.length * 5.8, 806, 8, true);
    this.page().push(`0 0 0 RG 1.4 w 48 788 m 547 788 l S`);
    this.y = 766;
  }

  private rawText(text: string, x: number, y: number, size: number, bold = false) {
    this.page().push(`BT /F${bold ? 2 : 1} ${size} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td (${pdfEscape(text)}) Tj ET`);
  }

  title(text: string) {
    const lines = wrapPdf(text, 24, this.width);
    this.ensure(lines.length * 29 + 12);
    lines.forEach((line) => {
      this.rawText(line, this.margin, this.y, 24, true);
      this.y -= 29;
    });
    this.y -= 8;
  }

  label(text: string) {
    this.ensure(28);
    const value = ascii(text).toUpperCase();
    const boxWidth = Math.min(this.width, Math.max(100, value.length * 6.6 + 22));
    this.page().push(`0.78 0.95 0.31 rg ${this.margin} ${this.y - 6} ${boxWidth.toFixed(1)} 22 re f`);
    this.page().push(`0 0 0 RG 1 w ${this.margin} ${this.y - 6} ${boxWidth.toFixed(1)} 22 re S`);
    this.rawText(value, this.margin + 10, this.y, 8.5, true);
    this.y -= 34;
  }

  h2(text: string) {
    this.ensure(35);
    this.y -= 4;
    this.rawText(ascii(text), this.margin, this.y, 14, true);
    this.y -= 10;
    this.page().push(`0 0 0 RG 0.8 w ${this.margin} ${this.y} m 547 ${this.y} l S`);
    this.y -= 18;
  }

  paragraph(text: string, opts: { bold?: boolean; size?: number; indent?: number } = {}) {
    const size = opts.size ?? 9.4;
    const indent = opts.indent ?? 0;
    const lines = wrapPdf(text, size, this.width - indent);
    const lineHeight = size * 1.48;
    this.ensure(lines.length * lineHeight + 9);
    lines.forEach((line) => {
      this.rawText(line, this.margin + indent, this.y, size, opts.bold ?? false);
      this.y -= lineHeight;
    });
    this.y -= 7;
  }

  bullet(text: string) {
    const size = 9.2;
    const lines = wrapPdf(text, size, this.width - 20);
    this.ensure(lines.length * 13.6 + 5);
    this.rawText("-", this.margin + 3, this.y, size, true);
    lines.forEach((line, index) => {
      this.rawText(line, this.margin + 18, this.y - index * 13.6, size, false);
    });
    this.y -= lines.length * 13.6 + 5;
  }

  metric(label: string, value: string) {
    const valueLines = wrapPdf(value, 10, 330);
    const height = Math.max(26, valueLines.length * 14 + 10);
    this.ensure(height);
    this.rawText(ascii(label).toUpperCase(), this.margin, this.y, 7.5, true);
    valueLines.forEach((line, index) => this.rawText(line, 190, this.y - index * 14, 10, true));
    this.y -= height;
    this.page().push(`0.78 0.76 0.71 RG 0.5 w ${this.margin} ${this.y + 8} m 547 ${this.y + 8} l S`);
  }

  newPage(title?: string) {
    this.pages.push([]);
    this.y = 786;
    this.header("CEK BISNIS", title ?? "ANALISIS");
  }

  toBlob() {
    const objects: string[] = [];
    objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
    objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
    objects[4] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;

    const kids: string[] = [];
    this.pages.forEach((commands, index) => {
      const pageId = 5 + index * 2;
      const contentId = pageId + 1;
      const stream = commands.join("\n");
      kids.push(`${pageId} 0 R`);
      objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
      objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    });
    objects[2] = `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${this.pages.length} >>`;

    const maxId = objects.length - 1;
    let pdf = "%PDF-1.4\n";
    const offsets = new Array<number>(maxId + 1).fill(0);
    for (let id = 1; id <= maxId; id += 1) {
      offsets[id] = pdf.length;
      pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
    }
    const xref = pdf.length;
    pdf += `xref\n0 ${maxId + 1}\n0000000000 65535 f \n`;
    for (let id = 1; id <= maxId; id += 1) {
      pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new Blob([pdf], { type: "application/pdf" });
  }
}

export function buildFranchisePdf({
  franchise,
  article,
  sources,
}: {
  franchise: Franchise;
  article: FranchiseArticle;
  sources: FranchiseSource[];
}) {
  const pdf = new SimplePdf();
  pdf.header("CEK BISNIS", "FRANCHISE");
  pdf.label(`${franchiseSectorName(franchise)} - sejak ${franchise.since}`);
  pdf.title(franchise.name);
  pdf.paragraph(article.lede, { size: 10.2 });

  pdf.h2("Ringkasan angka");
  pdf.metric("Modal awal", formatInvestmentRange(franchise.investment));
  pdf.metric("Omzet / bulan", formatRevenueRange(franchise.monthlyRevenue));
  pdf.metric("Balik modal", formatMonthRange(franchise.bepMonths));
  pdf.metric("Franchise fee", franchise.franchiseFee);
  pdf.metric("Royalti", franchise.royalty);
  pdf.metric("Kontrak", formatContractYears(franchise.contractYears));
  pdf.metric("Basis data", franchiseBasisLabel(franchise.dataBasis));

  pdf.h2("Basis angka");
  pdf.paragraph(franchise.revenueBasis ?? "Angka omzet adalah screening awal dan perlu divalidasi dengan proposal terbaru.");
  pdf.paragraph(franchise.bepBasis ?? "BEP dipengaruhi lokasi, sewa, payroll, HPP, dan volume penjualan.");
  pdf.paragraph(`Catatan investasi: ${franchise.investmentNote}`);

  pdf.newPage("BREAKDOWN");
  article.sections.forEach((section) => {
    pdf.h2(section.heading);
    pdf.paragraph(section.body);
  });

  pdf.h2("Rincian modal awal");
  article.costBreakdown.forEach((row) => {
    pdf.paragraph(`${row.item} — ${row.amount}`, { bold: true });
    pdf.paragraph(row.note, { size: 8.8, indent: 12 });
  });

  pdf.h2("Skema kemitraan");
  pdf.paragraph(franchise.scheme);
  pdf.h2("Penilaian Cek Bisnis");
  pdf.paragraph(article.verdict);

  pdf.newPage("KPI & SYARAT");
  pdf.h2("KPI penentu");
  franchise.kpi.forEach((item) => pdf.bullet(item));
  pdf.h2("Syarat utama");
  franchise.requirements.forEach((item) => pdf.bullet(item));

  pdf.h2("Dokumen dan kontak");
  pdf.paragraph(`Situs / kontak brand: ${franchise.contactUrl ?? franchise.officialUrl}`, { size: 8.6 });
  article.schemeDocs.forEach((doc) => pdf.bullet(`${doc.label}: ${doc.url}`));

  pdf.h2("Sumber angka");
  if (sources.length === 0) pdf.paragraph("Tidak ada sourceIds bersama pada entri ini; cek sourceUrls dan situs brand di halaman web.");
  sources.forEach((source) => pdf.bullet(`${source.title}: ${source.url}`));
  (franchise.sourceUrls ?? []).forEach((url) => pdf.bullet(url));

  pdf.h2("Catatan penggunaan");
  pdf.paragraph("Dokumen ini adalah alat screening, bukan prospektus penawaran waralaba atau jaminan hasil. Minta proposal, kontrak, biaya terbaru, dan lakukan validasi lokasi sebelum membayar apa pun.");
  return pdf.toBlob();
}

export function buildComparePdf(left: CompareExportChoice, right: CompareExportChoice) {
  const pdf = new SimplePdf();
  pdf.header("CEK BISNIS", "COMPARE");
  pdf.label("Compare Business");
  pdf.title(`${left.name} vs ${right.name}`);
  pdf.paragraph("Perbandingan pilihan yang sedang tampil di Cek Bisnis. Gunakan untuk screening sebelum masuk ke analisis detail dan validasi lapangan.");

  const addChoice = (choice: CompareExportChoice, title: string) => {
    pdf.h2(title);
    pdf.metric("Nama", choice.name);
    pdf.metric("Tipe", choice.kind);
    pdf.metric("Sektor", choice.sector);
    pdf.metric("Basis", choice.basis);
    pdf.metric("Modal awal", choice.capital);
    pdf.metric("Omzet", choice.revenue);
    pdf.metric("BEP", choice.bep);
    pdf.metric("Fee awal", choice.fee);
    pdf.metric("Biaya berulang", choice.recurring);
  };

  addChoice(left, "Bisnis A");
  addChoice(right, "Bisnis B");

  pdf.newPage("MEKANISME");
  pdf.h2(`${left.name} - mekanisme`);
  pdf.paragraph(left.mechanism);
  pdf.h2(`${right.name} - mekanisme`);
  pdf.paragraph(right.mechanism);

  pdf.h2(`${left.name} - faktor penentu`);
  left.factors.forEach((item) => pdf.bullet(item));
  pdf.h2(`${right.name} - faktor penentu`);
  right.factors.forEach((item) => pdf.bullet(item));

  pdf.h2("Catatan");
  pdf.paragraph("Perbandingan ini adalah alat screening. Angka franchise yang tidak dipublikasikan brand sengaja ditandai belum tersedia atau minta quotation, bukan diisi dengan tebakan.");
  return pdf.toBlob();
}
