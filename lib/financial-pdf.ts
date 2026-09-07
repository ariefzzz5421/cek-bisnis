import {
  calculateMetrics,
  formatMoney,
  formatMonths,
  formatPercent,
  formatTicket,
  scenarioRevenue,
  type Business,
  type BusinessMetrics,
  type City,
  type Source,
} from "@/lib/business-data";
import type { BusinessScale } from "@/lib/business-details";
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
import {
  buildFranchiseScenarioModel,
  formatScenarioMoney,
  formatScenarioPayback,
} from "@/lib/franchise-scenarios";

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

const pdfEscape = (value: string) => ascii(value)
  .replace(/\\/g, "\\\\")
  .replace(/\(/g, "\\(")
  .replace(/\)/g, "\\)");

function wrapPdf(text: string, fontSize: number, width: number) {
  const maxChars = Math.max(12, Math.floor(width / (fontSize * 0.51)));
  const paragraphs = ascii(text).split(/\n+/);
  const lines: string[] = [];
  paragraphs.forEach((paragraph, paragraphIndex) => {
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
    if (paragraphIndex < paragraphs.length - 1) lines.push("");
  });
  return lines.length ? lines : [""];
}

type PdfPage = string[];
type Ink = "ink" | "muted" | "white";

class FinancialPdf {
  private pages: PdfPage[] = [[]];
  private y = 770;
  private readonly margin = 48;
  private readonly contentWidth = 499;
  private continuationLabel = "ANALISIS";

  private page() {
    return this.pages[this.pages.length - 1];
  }

  private color(ink: Ink) {
    if (ink === "white") return "1 1 1 rg";
    if (ink === "muted") return "0.34 0.34 0.34 rg";
    return "0.06 0.06 0.06 rg";
  }

  private rawText(text: string, x: number, y: number, size: number, bold = false, ink: Ink = "ink") {
    // Explicitly set a normal text fill color for every text operation. This
    // prevents text inheriting a previous accent fill (the old PDF bug that
    // made complete documents lime green in Chrome's PDF viewer).
    this.page().push(`${this.color(ink)} BT /F${bold ? 2 : 1} ${size} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td (${pdfEscape(text)}) Tj ET`);
  }

  private ensure(height: number) {
    if (this.y - height >= 54) return;
    this.pages.push([]);
    this.y = 770;
    this.header(this.continuationLabel);
  }

  header(right = "ANALISIS") {
    this.continuationLabel = right;
    this.page().push("0.08 0.08 0.08 rg 48 798 24 24 re f");
    this.rawText("CEK BISNIS", 82, 805, 13, true);
    this.rawText(ascii(right).toUpperCase(), 547 - Math.min(190, ascii(right).length * 5.1), 806, 8, true, "muted");
    this.page().push("0.12 0.12 0.12 RG 1.2 w 48 788 m 547 788 l S");
    this.y = 766;
  }

  kicker(text: string) {
    this.ensure(30);
    const value = ascii(text).toUpperCase();
    const width = Math.min(this.contentWidth, Math.max(110, value.length * 5.8 + 24));
    this.page().push(`0.93 0.93 0.93 rg ${this.margin} ${this.y - 7} ${width.toFixed(1)} 22 re f`);
    this.page().push(`0.72 0.72 0.72 RG 0.7 w ${this.margin} ${this.y - 7} ${width.toFixed(1)} 22 re S`);
    this.rawText(value, this.margin + 10, this.y, 8.2, true);
    this.y -= 34;
  }

  title(text: string) {
    const lines = wrapPdf(text, 24, this.contentWidth);
    this.ensure(lines.length * 29 + 12);
    lines.forEach((line) => {
      this.rawText(line, this.margin, this.y, 24, true);
      this.y -= 29;
    });
    this.y -= 7;
  }

  h2(text: string) {
    this.ensure(38);
    this.y -= 3;
    this.rawText(ascii(text), this.margin, this.y, 14, true);
    this.y -= 10;
    this.page().push(`0.24 0.24 0.24 RG 0.8 w ${this.margin} ${this.y} m 547 ${this.y} l S`);
    this.y -= 18;
  }

  h3(text: string) {
    this.ensure(28);
    this.rawText(ascii(text), this.margin, this.y, 10.8, true);
    this.y -= 18;
  }

  paragraph(text: string, opts: { bold?: boolean; size?: number; indent?: number; muted?: boolean } = {}) {
    const size = opts.size ?? 9.4;
    const indent = opts.indent ?? 0;
    const lines = wrapPdf(text, size, this.contentWidth - indent);
    const lineHeight = size * 1.47;
    this.ensure(lines.length * lineHeight + 8);
    lines.forEach((line) => {
      this.rawText(line, this.margin + indent, this.y, size, opts.bold ?? false, opts.muted ? "muted" : "ink");
      this.y -= lineHeight;
    });
    this.y -= 7;
  }

  bullet(text: string) {
    const size = 9.1;
    const lines = wrapPdf(text, size, this.contentWidth - 22);
    this.ensure(lines.length * 13.5 + 5);
    this.rawText("-", this.margin + 3, this.y, size, true);
    lines.forEach((line, index) => {
      this.rawText(line, this.margin + 18, this.y - index * 13.5, size);
    });
    this.y -= lines.length * 13.5 + 5;
  }

  metric(label: string, value: string, note?: string) {
    const valueLines = wrapPdf(value, 10, 330);
    const noteLines = note ? wrapPdf(note, 7.6, 330) : [];
    const height = Math.max(28, valueLines.length * 14 + noteLines.length * 10.5 + 11);
    this.ensure(height);
    this.rawText(ascii(label).toUpperCase(), this.margin, this.y, 7.4, true, "muted");
    valueLines.forEach((line, index) => this.rawText(line, 190, this.y - index * 14, 10, true));
    let noteY = this.y - valueLines.length * 14;
    noteLines.forEach((line) => {
      this.rawText(line, 190, noteY, 7.6, false, "muted");
      noteY -= 10.5;
    });
    this.y -= height;
    this.page().push(`0.78 0.78 0.78 RG 0.45 w ${this.margin} ${this.y + 8} m 547 ${this.y + 8} l S`);
  }

  callout(text: string) {
    const lines = wrapPdf(text, 8.8, this.contentWidth - 24);
    const height = Math.max(42, lines.length * 13 + 22);
    this.ensure(height + 10);
    this.page().push(`0.95 0.95 0.95 rg ${this.margin} ${this.y - height + 9} ${this.contentWidth} ${height} re f`);
    this.page().push(`0.72 0.72 0.72 RG 0.7 w ${this.margin} ${this.y - height + 9} ${this.contentWidth} ${height} re S`);
    lines.forEach((line, index) => this.rawText(line, this.margin + 12, this.y - 10 - index * 13, 8.8, index === 0));
    this.y -= height + 10;
  }

  newPage(label = "ANALISIS") {
    this.pages.push([]);
    this.y = 770;
    this.header(label);
  }

  toBlob() {
    const objects: string[] = [];
    objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
    objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

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

export function buildFranchiseResearchPdf({
  franchise,
  article,
  sources,
}: {
  franchise: Franchise;
  article: FranchiseArticle;
  sources: FranchiseSource[];
}) {
  const model = buildFranchiseScenarioModel(franchise);
  const pdf = new FinancialPdf();
  pdf.header("FRANCHISE");
  pdf.kicker(`${franchiseSectorName(franchise)} - sejak ${franchise.since}`);
  pdf.title(franchise.name);
  pdf.paragraph(article.lede, { size: 10.1 });
  pdf.callout("Pemisahan data: angka brand/publik ditulis sebagai data publik. Angka yang tidak dipublikasikan tidak disamarkan sebagai fakta; Cek Bisnis menghitung skenario sendiri dan menandainya sebagai model.");

  pdf.h2("Ringkasan angka publik");
  pdf.metric("Modal awal", formatInvestmentRange(franchise.investment), franchise.investmentNote);
  pdf.metric("Omzet / bulan", formatRevenueRange(franchise.monthlyRevenue), franchise.revenueBasis);
  pdf.metric("Balik modal", formatMonthRange(franchise.bepMonths), franchise.bepBasis);
  pdf.metric("Franchise fee", franchise.franchiseFee);
  pdf.metric("Royalti / bagi hasil", franchise.royalty);
  pdf.metric("Kontrak", formatContractYears(franchise.contractYears));
  pdf.metric("Basis data", franchiseBasisLabel(franchise.dataBasis));

  pdf.h2("Model finansial Cek Bisnis");
  pdf.metric(
    "Modal model",
    `${formatScenarioMoney(model.startupCapital[0])} - ${formatScenarioMoney(model.startupCapital[1])}`,
    model.startupCapitalBasis,
  );
  pdf.paragraph(model.basis);
  pdf.paragraph(model.formula, { bold: true });
  model.assumptions.forEach((item) => pdf.bullet(item));

  pdf.newPage("SKENARIO");
  pdf.h2("Tiga skenario operasional");
  model.cases.forEach((scenario) => {
    pdf.h3(`${scenario.name} - ${scenario.driver}`);
    pdf.metric(model.grossSalesLabel, formatScenarioMoney(scenario.grossSales));
    pdf.metric(model.partnerRevenueLabel, formatScenarioMoney(scenario.partnerRevenue));
    pdf.metric("Laba operasional", formatScenarioMoney(scenario.operatingProfit));
    pdf.metric("Margin operasional", `${(scenario.operatingMargin * 100).toFixed(1).replace(".", ",")}%`);
    pdf.metric("Payback model", formatScenarioPayback(scenario.paybackMonths));
  });

  pdf.h2("Kelebihan");
  model.pros.forEach((item) => pdf.bullet(item));
  pdf.h2("Kekurangan / risiko");
  model.cons.forEach((item) => pdf.bullet(item));

  pdf.newPage("BREAKDOWN");
  article.sections.forEach((section) => {
    pdf.h2(section.heading);
    pdf.paragraph(section.body);
  });

  pdf.h2("Rincian modal awal");
  article.costBreakdown.forEach((row) => {
    pdf.paragraph(`${row.item} - ${row.amount}`, { bold: true });
    pdf.paragraph(row.note, { size: 8.7, indent: 12, muted: true });
  });

  pdf.h2("Skema kemitraan");
  pdf.paragraph(franchise.scheme);
  pdf.h2("Penilaian Cek Bisnis");
  pdf.paragraph(article.verdict);

  pdf.newPage("KPI & VALIDASI");
  pdf.h2("KPI penentu");
  franchise.kpi.forEach((item) => pdf.bullet(item));
  pdf.h2("Syarat utama");
  franchise.requirements.forEach((item) => pdf.bullet(item));

  pdf.h2("Dokumen dan kontak");
  pdf.paragraph(`Situs / kontak brand: ${franchise.contactUrl ?? franchise.officialUrl}`, { size: 8.5 });
  article.schemeDocs.forEach((doc) => pdf.bullet(`${doc.label}: ${doc.url}`));

  pdf.h2("Sumber data brand / publik");
  if (sources.length === 0 && (franchise.sourceUrls ?? []).length === 0) {
    pdf.paragraph("Tidak ada sourceIds bersama pada entri ini. Gunakan situs resmi brand dan tautan riset model di bawah untuk validasi lanjutan.");
  }
  sources.forEach((source) => pdf.bullet(`${source.title}: ${source.url}`));
  (franchise.sourceUrls ?? []).forEach((url) => pdf.bullet(url));

  if (model.researchLinks.length > 0) {
    pdf.h2("Sumber tambahan untuk model");
    model.researchLinks.forEach((source) => pdf.bullet(`${source.title}: ${source.url}`));
  }

  pdf.h2("Catatan penggunaan");
  pdf.paragraph("Dokumen ini adalah alat screening, bukan prospektus penawaran waralaba dan bukan jaminan hasil. Sebelum membayar, minta quotation, kontrak, biaya berulang, data outlet pembanding, dan lakukan hitung traffic minimal 7 hari di lokasi target.");
  return pdf.toBlob();
}

export function buildBusinessResearchPdf({
  business,
  city,
  scale,
  metrics,
  sources,
}: {
  business: Business;
  city: City;
  scale: BusinessScale;
  metrics: BusinessMetrics;
  sources: Source[];
}) {
  const pdf = new FinancialPdf();
  pdf.header("USAHA");
  pdf.kicker(`${business.category} - ${city.name}, ${city.province}`);
  pdf.title(business.name);
  pdf.paragraph(business.description, { size: 10 });
  pdf.callout(`Skenario aktif: ${scale.name}. Semua angka diturunkan dari driver usaha, biaya kota pembanding, dan target omzet - bukan angka keuntungan yang dijanjikan.`);

  pdf.h2("Ringkasan finansial");
  pdf.metric("CAPEX", `${formatMoney(metrics.capexLow, 0)} - ${formatMoney(metrics.capexHigh, 0).replace("Rp", "")}`, `${scale.space}; ${scale.staff}; ${scale.capacity}`);
  pdf.metric("Omzet / bulan", formatMoney(metrics.monthlyRevenue, 0));
  pdf.metric("OPEX / bulan", formatMoney(metrics.opex));
  pdf.metric("Laba operasional", formatMoney(metrics.profit));
  pdf.metric("Omzet BEP", formatMoney(metrics.breakEvenRevenue));
  pdf.metric("Balik modal", formatMonths(metrics.payback));
  pdf.metric("Margin operasional", formatPercent(metrics.marginRate, 1));
  pdf.metric("ROI tahunan", metrics.roiPerYear > 0 ? formatPercent(metrics.roiPerYear, 1) : "-", "ROI sederhana = laba operasional 12 bulan / modal tengah; sebelum pajak, bunga, dan gaji pemilik.");

  pdf.h2("Unit economics");
  pdf.paragraph(`Average ticket: ${formatTicket(business.avgTicket)}. Margin kontribusi: ${formatPercent(metrics.contributionMargin, 1)}. Biaya variabel: ${formatPercent(business.variableRate, 1)} omzet.`);
  pdf.metric("Biaya tetap", formatMoney(metrics.fixedCost));
  pdf.metric("Sewa", formatMoney(metrics.rent), `Rasio sewa terhadap penjualan: ${formatPercent(metrics.rentToSales, 1)}.`);
  pdf.metric("Payroll", formatMoney(metrics.payroll));
  pdf.metric("Setoran harian", formatMoney(metrics.dailyRevenue));
  pdf.metric("Traffic target", `${metrics.targetTraffic} ${business.trafficLabel}`);
  pdf.metric("Traffic minimum BEP", `${metrics.traffic} ${business.trafficLabel}`);
  pdf.paragraph("Formula: laba = omzet x (1 - biaya variabel) - biaya tetap. Omzet BEP = biaya tetap / margin kontribusi. Payback = modal tengah / laba operasional bulanan.", { bold: true });

  pdf.newPage("SKENARIO");
  pdf.h2("Konservatif, dasar, optimistis");
  business.scenarios.forEach((scenario) => {
    const revenue = scenarioRevenue(business, scenario) * city.demandFactor;
    const scenarioMetrics = calculateMetrics(business, city, Math.round(revenue), scale.capex);
    pdf.h3(`${scenario.name} - ${scenario.units} ${business.trafficLabel}`);
    pdf.metric("Omzet", formatMoney(revenue, 0));
    pdf.metric("Laba operasional", formatMoney(scenarioMetrics.profit));
    pdf.metric("Margin", formatPercent(scenarioMetrics.marginRate, 1));
    pdf.metric("Balik modal", formatMonths(scenarioMetrics.payback));
    pdf.metric("Status cashflow", scenarioMetrics.health);
  });

  pdf.h2("Model pendapatan");
  pdf.paragraph(business.scheme.model);
  pdf.metric("Dasar harga", business.scheme.priceBasis);
  pdf.metric("Siklus kas", business.scheme.cashCycle);
  pdf.paragraph(`Pemicu biaya: ${business.scheme.costDrivers.join(", ")}.`);
  business.scheme.streams.forEach((stream) => pdf.bullet(`${stream.name}: ${stream.share}% dari komposisi omzet model.`));

  pdf.h2("Kelebihan");
  pdf.bullet(`Cocok untuk: ${business.idealFor}.`);
  pdf.bullet(`Sinyal lokasi utama: ${business.locationSignal}.`);
  pdf.bullet(`Model pendapatan terukur dari ${business.trafficLabel}, average ticket, margin kontribusi, dan biaya tetap.`);
  pdf.h2("Kekurangan / risiko");
  business.risks.forEach((item) => pdf.bullet(item));

  pdf.newPage("OPERASI & KPI");
  pdf.h2("KPI yang wajib dipantau");
  business.kpi.forEach((item) => pdf.bullet(`${item.label}: target ${item.target}. ${item.note}`));

  pdf.h2("Peralatan utama");
  business.equipment.slice(0, 10).forEach((item) => {
    pdf.paragraph(`${item.item} - ${item.range}`, { bold: true });
    pdf.paragraph(item.note, { size: 8.6, indent: 12, muted: true });
  });

  pdf.h2("Operasi harian");
  business.dailyOps.forEach((item) => pdf.bullet(item));
  pdf.h2("Checklist sebelum buka");
  business.checklist.forEach((item) => pdf.bullet(item));

  pdf.newPage("90 HARI & SUMBER");
  pdf.h2("Rencana 90 hari");
  business.plan90.forEach((phase) => {
    pdf.h3(`${phase.phase} - ${phase.title}`);
    phase.actions.forEach((action) => pdf.bullet(action));
  });

  pdf.h2("Sumber model");
  if (sources.length === 0) pdf.paragraph("Tidak ada sumber terhubung pada entri usaha ini; angka tetap harus diuji dengan quotation lokal dan survei lapangan.");
  sources.forEach((source) => {
    pdf.paragraph(source.title, { bold: true, size: 8.8 });
    if (source.note) pdf.paragraph(source.note, { size: 8.1, muted: true });
    pdf.paragraph(source.url, { size: 7.8, muted: true });
  });

  pdf.h2("Kesimpulan screening");
  pdf.paragraph(
    metrics.profit > 0
      ? `Pada skenario ${scale.name} di ${city.name}, model menghasilkan laba operasional ${formatMoney(metrics.profit)} per bulan dan payback ${formatMonths(metrics.payback)}. Validasi paling penting berikutnya adalah traffic nyata, sewa final, harga vendor, dan kapasitas operasional.`
      : `Pada skenario ${scale.name} di ${city.name}, target omzet belum menutup seluruh biaya model. Jangan lanjut hanya karena modal awal terlihat murah; naikkan traffic/ticket atau turunkan fixed cost sebelum investasi.`,
    { bold: true },
  );
  pdf.paragraph("Dokumen ini adalah model keputusan, bukan jaminan laba. Pajak penghasilan, bunga/cicilan, gaji pemilik, kejadian luar biasa, dan perubahan harga belum tentu tercakup penuh.");
  return pdf.toBlob();
}
