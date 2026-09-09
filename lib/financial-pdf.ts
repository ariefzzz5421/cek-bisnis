import type {
  Business,
  BusinessMetrics,
  City,
  Source,
} from "@/lib/business-data";
import type { BusinessScale } from "@/lib/business-details";
import type {
  Franchise,
  FranchiseArticle,
  FranchiseSource,
} from "@/lib/franchise-data";
import {
  getDossier,
  sourceList,
  confidence,
  type Dossier,
} from "@/financial-models/catalog";
import {
  calculate,
  scenarios,
  sensitivity,
  viability,
  money,
  percent,
  months,
  withOverrides,
  type Model,
} from "@/financial-models/engine";
import { labels, evidenceLabels } from "@/financial-models/labels";
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

const ascii = (value: unknown) =>
  String(value ?? "")
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

const pdfEscape = (value: string) =>
  ascii(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

function wrapPdf(text: string, fontSize: number, width: number) {
  const maxChars = Math.max(12, Math.floor(width / (fontSize * 0.51)));
  const paragraphs = ascii(text).split(/\n+/);
  const lines: string[] = [];
  paragraphs.forEach((paragraph, paragraphIndex) => {
    const words = paragraph
      .split(/\s+/)
      .filter(Boolean)
      .flatMap((word) =>
        word.length > maxChars
          ? (word.match(new RegExp(".{1," + maxChars + "}", "g")) ?? [word])
          : [word],
      );
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

  private rawText(
    text: string,
    x: number,
    y: number,
    size: number,
    bold = false,
    ink: Ink = "ink",
  ) {
    // Always set fill before text. The previous generator only reset stroke,
    // so text inherited the lime rectangle fill in Chrome's PDF viewer.
    this.page().push(
      `${this.color(ink)} BT /F${bold ? 2 : 1} ${size} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td (${pdfEscape(text)}) Tj ET`,
    );
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
    this.rawText(
      ascii(right).toUpperCase(),
      547 - Math.min(190, ascii(right).length * 5.1),
      806,
      8,
      true,
      "muted",
    );
    this.page().push("0.12 0.12 0.12 RG 1.2 w 48 788 m 547 788 l S");
    this.y = 766;
  }

  kicker(text: string) {
    this.ensure(30);
    const value = ascii(text).toUpperCase();
    const width = Math.min(
      this.contentWidth,
      Math.max(110, value.length * 5.8 + 24),
    );
    this.page().push(
      `0.93 0.93 0.93 rg ${this.margin} ${this.y - 7} ${width.toFixed(1)} 22 re f`,
    );
    this.page().push(
      `0.72 0.72 0.72 RG 0.7 w ${this.margin} ${this.y - 7} ${width.toFixed(1)} 22 re S`,
    );
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
    this.page().push(
      `0.24 0.24 0.24 RG 0.8 w ${this.margin} ${this.y} m 547 ${this.y} l S`,
    );
    this.y -= 18;
  }

  h3(text: string) {
    this.ensure(28);
    this.rawText(ascii(text), this.margin, this.y, 10.8, true);
    this.y -= 18;
  }

  paragraph(
    text: string,
    opts: {
      bold?: boolean;
      size?: number;
      indent?: number;
      muted?: boolean;
    } = {},
  ) {
    const size = opts.size ?? 9.4;
    const indent = opts.indent ?? 0;
    const lines = wrapPdf(text, size, this.contentWidth - indent);
    const lineHeight = size * 1.47;
    this.ensure(lines.length * lineHeight + 8);
    lines.forEach((line) => {
      this.rawText(
        line,
        this.margin + indent,
        this.y,
        size,
        opts.bold ?? false,
        opts.muted ? "muted" : "ink",
      );
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
    const height = Math.max(
      28,
      valueLines.length * 14 + noteLines.length * 10.5 + 11,
    );
    this.ensure(height);
    this.rawText(
      ascii(label).toUpperCase(),
      this.margin,
      this.y,
      7.4,
      true,
      "muted",
    );
    valueLines.forEach((line, index) =>
      this.rawText(line, 190, this.y - index * 14, 10, true),
    );
    let noteY = this.y - valueLines.length * 14;
    noteLines.forEach((line) => {
      this.rawText(line, 190, noteY, 7.6, false, "muted");
      noteY -= 10.5;
    });
    this.y -= height;
    this.page().push(
      `0.78 0.78 0.78 RG 0.45 w ${this.margin} ${this.y + 8} m 547 ${this.y + 8} l S`,
    );
  }

  callout(text: string) {
    const lines = wrapPdf(text, 8.8, this.contentWidth - 24);
    const height = Math.max(42, lines.length * 13 + 22);
    this.ensure(height + 10);
    this.page().push(
      `0.95 0.95 0.95 rg ${this.margin} ${this.y - height + 9} ${this.contentWidth} ${height} re f`,
    );
    this.page().push(
      `0.72 0.72 0.72 RG 0.7 w ${this.margin} ${this.y - height + 9} ${this.contentWidth} ${height} re S`,
    );
    lines.forEach((line, index) =>
      this.rawText(
        line,
        this.margin + 12,
        this.y - 10 - index * 13,
        8.8,
        index === 0,
      ),
    );
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
      const footer = `0.34 0.34 0.34 rg BT /F1 8 Tf 48 28 Td (CEK BISNIS ESTIMATE - ${index + 1} / ${this.pages.length}) Tj ET`;
      const stream = [...commands, footer].join("\n");
      kids.push(`${pageId} 0 R`);
      objects[pageId] =
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
      objects[contentId] =
        `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
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

export function buildDossierPdf(d: Dossier, model: Model = d.model) {
  const r = calculate(model),
    pdf = new FinancialPdf(),
    conf = confidence({ ...d, model });
  pdf.header("FINANCIAL RESEARCH / 1.0");
  pdf.kicker("CEK BISNIS ESTIMATE");
  pdf.title(d.name);
  pdf.paragraph(
    "Lokasi: " +
      model.location +
      " | Ditinjau: " +
      conf.lastResearched +
      " | Data confidence: " +
      conf.label,
  );
  pdf.callout(d.research.note);
  pdf.h2("Executive summary");
  const a = viability(model);
  pdf.paragraph(a.label + ". " + a.reason + " " + a.note);
  pdf.metric(
    "Total modal",
    money(r.capital),
    "CAPEX + fee + deposit + stok awal + cadangan kas.",
  );
  pdf.metric(
    "Pendapatan / bulan",
    money(r.revenue),
    r.gmv !== null
      ? "Pendapatan komisi agen, bukan GMV ongkir."
      : "Penjualan model.",
  );
  if (r.gmv !== null)
    pdf.metric(
      "GMV ongkir",
      money(r.gmv),
      "Nilai pengiriman milik jaringan, bukan penghasilan agen.",
    );
  pdf.metric(
    "Laba operasional",
    money(r.operatingProfit),
    "EBITDA-like, sebelum pajak/cicilan.",
  );
  pdf.metric(
    "Arus kas",
    money(r.cashFlow),
    "Setelah cadangan pajak/cicilan/penggantian aset yang diinput.",
  );
  pdf.metric("Margin operasi", percent(r.operatingMargin));
  pdf.metric("Payback", months(r.payback));
  pdf.metric(
    "ROI sederhana / tahun",
    percent(r.annualRoi),
    "12 x arus kas bulanan / total modal; bukan IRR atau jaminan.",
  );
  pdf.newPage("FAKTA & SUMBER");
  pdf.h2("Official / public data");
  if (!d.research.facts.length)
    pdf.paragraph(
      "Usaha independen. Unit economics seluruhnya estimasi; sumber industri hanya konteks komponen.",
    );
  d.research.facts.forEach((f) =>
    pdf.metric(
      f.label,
      f.value === null
        ? "UNKNOWN"
        : String(f.value) + (f.unit ? " " + f.unit : ""),
      evidenceLabels[f.type] +
        ": " +
        f.note +
        (f.sourceId ? " [" + f.sourceId + "]" : ""),
    ),
  );
  pdf.newPage("ASUMSI");
  pdf.h2("Asumsi model");
  pdf.paragraph(
    "Uang: rupiah penuh. Rasio: 20% = 0.20. Nol pada fee yang belum diketahui bukan klaim bebas biaya. Input pengguna menggantikan status data resmi.",
  );
  Object.entries(model.inputs).forEach(([key, i]) =>
    pdf.metric(
      labels[key as keyof typeof labels],
      String(i.value),
      evidenceLabels[i.type] +
        " | " +
        i.note +
        (i.sourceIds.length ? " | " + i.sourceIds.join(", ") : ""),
    ),
  );
  pdf.paragraph(
    "Kapasitas: " +
      model.capacity +
      " " +
      model.unit +
      ". " +
      model.capacityNote,
  );
  if (model.royaltyTiers)
    pdf.paragraph(
      "Royalti progresif: " +
        model.royaltyTiers
          .map(
            (t) =>
              money(t.from) +
              " sampai " +
              (t.to === null ? "seterusnya" : money(t.to)) +
              " = " +
              percent(t.rate),
          )
          .join("; "),
    );
  pdf.newPage("PERHITUNGAN");
  pdf.h2("Rumus pendapatan");
  pdf.paragraph(
    model.inputs.units.value +
      " " +
      model.unit +
      " x " +
      model.inputs.ticket.value +
      " Rp x " +
      (model.mode === "membership" ? 1 : model.inputs.days.value) +
      " periode = " +
      money(r.grossSales) +
      (r.gmv !== null ? " GMV" : " penjualan"),
  );
  if (r.gmv !== null)
    pdf.paragraph(
      model.mode === "commission-fixed"
        ? "Paket x " +
            money(model.inputs.commissionFixed.value) +
            " komisi per paket x hari = " +
            money(r.revenue)
        : money(r.gmv) +
            " x " +
            percent(model.inputs.commissionRate.value) +
            " = " +
            money(r.revenue) +
            " pendapatan komisi.",
    );
  pdf.paragraph(
    "HPP = pendapatan x " +
      percent(model.inputs.cogsRate.value) +
      " + unit bulanan x " +
      money(model.inputs.unitCost.value) +
      ". Laba kotor = pendapatan - HPP.",
  );
  pdf.paragraph(
    "Payroll = staf x gaji x (1 + cadangan benefit) + kompensasi pemilik. Laba operasi = laba kotor - biaya tetap - royalti - bagi laba positif.",
  );
  pdf.paragraph(
    "Arus kas = laba operasi - cadangan pajak atas laba positif - cicilan - cadangan aset. Modal = peralatan + renovasi + fee + deposit + stok + cadangan bulan x OPEX tetap.",
  );
  for (const [k, v] of [
    ["CAPEX", money(r.capex)],
    ["Fee", money(r.entryFee)],
    ["Deposit", money(r.deposit)],
    ["Modal kerja", money(r.workingCapital)],
    ["HPP", money(r.cogs)],
    ["Laba kotor", money(r.grossProfit)],
    ["Margin kotor", percent(r.grossMargin)],
    ["OPEX tetap", money(r.fixedOpex)],
    ["Total biaya incl HPP", money(r.totalOpex)],
    [
      "BEP pendapatan",
      r.breakEvenRevenue === null
        ? "Di luar kapasitas"
        : money(r.breakEvenRevenue),
    ],
    [
      "BEP volume",
      r.breakEvenUnits === null
        ? "Di luar kapasitas"
        : Math.ceil(r.breakEvenUnits) + " " + model.unit,
    ],
    ["ROI bulanan", percent(r.monthlyRoi)],
    ["Pendapatan / modal", percent(r.revenueToCapital)],
    ["Sewa / pendapatan", percent(r.rentToSales)],
    ["Payroll / pendapatan", percent(r.payrollToSales)],
    ["Marketing / pendapatan", percent(r.marketingToSales)],
    ["Rasio variabel", percent(r.variableCostRatio)],
    ["Margin of safety", percent(r.marginOfSafety)],
  ])
    pdf.metric(k, v);
  pdf.h2("Struktur biaya");
  r.costs.forEach((c) => pdf.metric(c.name, money(c.value)));
  pdf.newPage("SKENARIO");
  pdf.h2("Konservatif / dasar / optimistis");
  scenarios(model).forEach((s) => {
    pdf.h3(
      s.name +
        " - " +
        Math.round(s.model.inputs.units.value) +
        " " +
        model.unit,
    );
    pdf.paragraph(s.rationale);
    pdf.metric("Pendapatan", money(s.result.revenue));
    pdf.metric("Laba operasi", money(s.result.operatingProfit));
    pdf.metric("Margin", percent(s.result.operatingMargin));
    pdf.metric("Payback", months(s.result.payback));
  });
  pdf.h2("Sensitivitas volume");
  sensitivity(model).forEach((s) =>
    pdf.metric(
      Math.round(s.change * 100) + "% volume",
      s.result
        ? money(s.result.operatingProfit) + " laba operasi"
        : "Melampaui kapasitas",
    ),
  );
  pdf.paragraph(
    "Harga tetap. Biaya variabel mengikuti volume; biaya tetap tidak berubah. BEP dicari numerik dengan royalti progresif bila berlaku. Payback = pembulatan ke atas total modal / arus kas positif; jika negatif tidak tercapai.",
  );
  pdf.newPage("RISIKO & KPI");
  for (const [title, items] of [
    ["Keunggulan", d.pros],
    ["Kelemahan", d.cons],
    ["Risiko operasional", d.operationalRisks],
    ["Risiko keuangan", d.financialRisks],
  ] as [string, string[]][]) {
    pdf.h2(title);
    items.forEach((i) => pdf.bullet(i));
  }
  pdf.h2("Lokasi & eksekusi");
  pdf.paragraph(d.locationDependency);
  pdf.paragraph(d.executionDifficulty);
  pdf.h2("KPI");
  pdf.bullet(
    "Ukur transaksi, nilai struk, HPP/waste, utilisasi, payroll dan kas aktual setiap hari. Bandingkan volume dengan BEP " +
      (r.breakEvenUnits === null
        ? "di luar kapasitas"
        : Math.ceil(r.breakEvenUnits) + " " + model.unit) +
      ".",
  );
  pdf.h2("Batasan");
  model.limitations.forEach((i) => pdf.bullet(i));
  pdf.newPage("REFERENSI");
  pdf.h2("Sumber");
  sourceList(d).forEach((s) => {
    pdf.h3(s.title);
    pdf.paragraph(
      s.publisher +
        " | " +
        evidenceLabels[s.sourceType] +
        " | Terbit " +
        (s.publishedAt ?? "tidak tersedia") +
        " | Tinjau " +
        (s.lastVerifiedAt ?? "belum berhasil"),
    );
    pdf.paragraph("Mendukung: " + s.supports + " | Status: " + s.status);
    pdf.paragraph(s.url, { size: 7.5 });
  });
  pdf.h2("Koreksi audit");
  d.research.corrections.forEach((i) => pdf.bullet(i));
  pdf.callout(
    "DISCLAIMER: Model edukasi perencanaan, bukan rekomendasi investasi, penawaran franchise atau jaminan profit. Validasi kontrak, biaya setempat, pajak dan kapasitas sebelum keputusan. Sumber resmi tidak memverifikasi seluruh asumsi model.",
  );
  return pdf.toBlob();
}
export function buildFranchiseResearchPdf({
  franchise,
}: {
  franchise: Franchise;
  article: FranchiseArticle;
  sources: FranchiseSource[];
}) {
  return buildDossierPdf(getDossier(franchise.id));
}
export function buildBusinessResearchPdf({
  business,
  city,
  metrics,
}: {
  business: Business;
  city: City;
  scale: BusinessScale;
  metrics: BusinessMetrics;
  sources: Source[];
}) {
  const d = getDossier(business.id),
    m = withOverrides(d.model, {
      units: Math.min(
        d.model.capacity,
        (metrics.monthlyRevenue * 1e6) /
          (d.model.inputs.ticket.value *
            (d.model.mode === "membership" ? 1 : d.model.inputs.days.value)),
      ),
    });
  m.location = city.name + " - biaya nasional belum disurvei";
  return buildDossierPdf(d, m);
}
