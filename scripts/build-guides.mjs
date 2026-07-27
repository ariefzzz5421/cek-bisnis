/**
 * Membangun panduan PDF 4 halaman untuk setiap model usaha.
 *
 * Sumber data sama persis dengan situs (data/business-data.json + data/business-details.json),
 * jadi angka di PDF tidak akan pernah menyimpang dari angka di web.
 *
 * Alur: data -> HTML (gaya cetak neo-brutalis) -> headless Chrome --print-to-pdf.
 * Tidak ada dependensi npm tambahan; hanya butuh Chrome/Edge terpasang.
 *
 *   node scripts/build-guides.mjs            # semua usaha
 *   node scripts/build-guides.mjs laundry    # satu usaha (pakai id)
 *   node scripts/build-guides.mjs --keep-html
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const outDir = join(publicDir, "downloads");
const workDir = join(root, ".guide-build");

const businessData = JSON.parse(readFileSync(join(root, "data/business-data.json"), "utf8"));
const detailsFile = JSON.parse(readFileSync(join(root, "data/business-details.json"), "utf8"));
const { marketplaces, details } = detailsFile;

const PAGES = 4;
/** Lebar cetak hero ~182 mm dan tile alat 18 mm; ukuran ini setara ~200 dpi. */
const HERO_PX = 1500;
const TILE_PX = 260;

/* ---------------------------------------------------------------- helpers */

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Sama dengan formatMoney() di lib/business-data.ts. */
const money = (value, decimals = 1) => `Rp${Number(value.toFixed(decimals)).toLocaleString("id-ID")} jt`;
const moneyRange = (low, high) => `${money(low, 0)}-${money(high, 0).replace("Rp", "")}`;
/** Harga satuan disimpan dalam juta rupiah; tampilkan sebagai rupiah penuh agar terbaca. */
const rupiah = (juta) => `Rp${Math.round(juta * 1_000_000).toLocaleString("id-ID")}`;
const searchUrl = (store, query) => marketplaces[store].searchUrl.replace("{q}", encodeURIComponent(query));
const fileUrl = (relativePath) => pathToFileURL(join(publicDir, relativePath)).href;

/**
 * Angka baseline nasional: faktor kota semuanya 1, sehingga PDF menampilkan
 * titik awal yang netral dan pembaca menyesuaikan sendiri lewat simulator web.
 */
function baselineMetrics(business) {
  const payroll = business.staffCount * business.staffCostBase;
  const fixedCost = business.fixedBase;
  const breakEvenRevenue = fixedCost / (1 - business.variableRate);
  const monthlyRevenue = business.targetRevenue;
  const profit = monthlyRevenue * (1 - business.variableRate) - fixedCost;
  const capexMid = (business.capex[0] + business.capex[1]) / 2;
  const traffic =
    business.trafficMode === "member"
      ? Math.ceil(breakEvenRevenue / business.avgTicket)
      : Math.ceil(breakEvenRevenue / business.avgTicket / 30);

  return {
    rent: business.rentBase,
    payroll,
    otherFixed: Math.max(0, fixedCost - business.rentBase - payroll),
    fixedCost,
    breakEvenRevenue,
    monthlyRevenue,
    profit,
    traffic,
    payback: profit > 0 ? capexMid / profit : Infinity,
  };
}

/* ------------------------------------------------------------------- CSS */

const styles = `
  @page { size: A4; margin: 0; }

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  :root {
    --ink: #101010;
    --paper: #f6f3e9;
    --paper-2: #ffffff;
    --lime: #c6f24f;
    --orange: #ff9f45;
    --cyan: #7fe3e8;
    --muted: #5d5d55;
    --line: #101010;
    --display: "Arial Black", "Helvetica Neue", Impact, Arial, sans-serif;
    --body: "Segoe UI", Arial, Helvetica, sans-serif;
    --mono: Consolas, "DejaVu Sans Mono", "Courier New", monospace;
  }

  body { background: var(--paper); color: var(--ink); font-family: var(--body); font-size: 9pt; line-height: 1.45; }
  a { color: inherit; text-decoration: none; }
  b, strong { font-weight: 800; }
  h1, h2, h3 { font-family: var(--display); font-weight: 900; letter-spacing: -0.02em; line-height: 1; }

  .page {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 210mm;
    height: 297mm;
    padding: 13mm 14mm 15mm;
    overflow: hidden;
    background: var(--paper);
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }

  /* --- kerangka halaman ------------------------------------------------ */
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 2.5mm;
    border-bottom: 2.4pt solid var(--line);
    font-family: var(--mono);
    font-size: 7pt;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .topbar .mark { display: flex; align-items: center; gap: 2mm; }
  .topbar .dot { width: 3.4mm; height: 3.4mm; background: var(--lime); border: 1.6pt solid var(--line); }
  .pagefoot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 2.5mm;
    border-top: 1.4pt solid var(--line);
    color: var(--muted);
    font-family: var(--mono);
    font-size: 6.6pt;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .pagefoot b { color: var(--ink); }

  .sticker {
    display: inline-block;
    padding: 1.2mm 2.4mm;
    border: 1.8pt solid var(--line);
    background: var(--lime);
    box-shadow: 1.6mm 1.6mm 0 var(--line);
    font-family: var(--mono);
    font-size: 7pt;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .sticker.cyan { background: var(--cyan); }
  .sticker.orange { background: var(--orange); }
  .sticker.flat { box-shadow: none; }

  .sectiontitle { display: flex; align-items: baseline; gap: 3mm; margin: 5mm 0 2.5mm; }
  .sectiontitle h2 { font-size: 15pt; }
  .sectiontitle span { font-family: var(--mono); font-size: 7pt; font-weight: 700; letter-spacing: 0.14em; color: var(--muted); text-transform: uppercase; }

  .box { border: 2pt solid var(--line); background: var(--paper-2); box-shadow: 2mm 2mm 0 var(--line); }
  .box.flat { box-shadow: none; }

  /* --- halaman 1 -------------------------------------------------------- */
  .cover-head { margin-top: 7mm; }
  .cover-head h1 { margin: 3mm 0 2.5mm; font-size: 40pt; }
  .cover-head .lede { max-width: 150mm; font-size: 11pt; line-height: 1.4; font-weight: 600; }
  .hero {
    position: relative;
    height: 72mm;
    margin: 6mm 0;
    overflow: hidden;
    border: 2.4pt solid var(--line);
    box-shadow: 2.6mm 2.6mm 0 var(--line);
  }
  .hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hero .tag { position: absolute; left: 4mm; bottom: 4mm; }

  .numbers { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border: 2.4pt solid var(--line); background: var(--paper-2); box-shadow: 2.6mm 2.6mm 0 var(--line); }
  .numbers > div { padding: 4mm 3.5mm; border-right: 1.6pt solid var(--line); }
  .numbers > div:last-child { border-right: 0; }
  .numbers > div:nth-child(3) { background: var(--lime); }
  .numbers small { display: block; font-family: var(--mono); font-size: 6.4pt; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
  .numbers > div:nth-child(3) small { color: #37451a; }
  .numbers b { display: block; margin-top: 2mm; font-family: var(--display); font-size: 13pt; letter-spacing: -0.03em; }
  .numbers em { display: block; margin-top: 1mm; font-style: normal; font-size: 7.4pt; color: var(--muted); }
  .numbers > div:nth-child(3) em { color: #37451a; }

  .factgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin-top: 6mm; }
  .fact { padding: 3.5mm; border: 1.8pt solid var(--line); background: var(--paper-2); }
  .fact small { display: block; margin-bottom: 1.4mm; font-family: var(--mono); font-size: 6.4pt; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
  .fact p { font-size: 8.6pt; line-height: 1.4; }

  .toc { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-top: 6mm; }
  .toc > div { padding: 3.5mm; border: 2pt solid var(--line); background: var(--paper-2); box-shadow: 2mm 2mm 0 var(--line); }
  .toc .n { display: inline-block; padding: 0.8mm 2mm; background: var(--ink); color: var(--paper); font-family: var(--mono); font-size: 7pt; font-weight: 800; }
  .toc b { display: block; margin: 2mm 0 1.2mm; font-family: var(--display); font-size: 10pt; letter-spacing: -0.02em; }
  .toc em { font-style: normal; font-size: 7.6pt; line-height: 1.35; color: var(--muted); }

  /* --- halaman 2 -------------------------------------------------------- */
  .callout { display: flex; gap: 3mm; padding: 3.5mm; border: 1.8pt solid var(--line); background: var(--cyan); font-size: 8.6pt; font-weight: 600; }
  .callout .k { flex: 0 0 auto; font-family: var(--mono); font-size: 7pt; font-weight: 800; letter-spacing: 0.08em; }

  .scales { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-top: 4mm; }
  .scale { padding: 4mm 3.5mm; border: 2pt solid var(--line); background: var(--paper-2); box-shadow: 2mm 2mm 0 var(--line); }
  .scale h3 { font-size: 11pt; }
  .scale .capex { margin: 2mm 0 3mm; padding-bottom: 2.5mm; border-bottom: 1.6pt solid var(--line); font-family: var(--mono); font-size: 10pt; font-weight: 800; letter-spacing: -0.04em; }
  .scale dl { display: grid; gap: 1.6mm; }
  .scale dl > div { display: flex; justify-content: space-between; gap: 2mm; font-size: 7.6pt; }
  .scale dt { color: var(--muted); }
  .scale dd { font-family: var(--mono); font-weight: 700; text-align: right; }
  .scale .best { margin-top: 3mm; padding-top: 2.5mm; border-top: 1.6pt dashed var(--line); font-size: 7.4pt; font-weight: 700; }

  table { width: 100%; border-collapse: collapse; }
  .table { border: 2pt solid var(--line); background: var(--paper-2); box-shadow: 2mm 2mm 0 var(--line); }
  .table th, .table td { padding: 1.9mm 3mm; border-bottom: 1.2pt solid var(--line); text-align: left; font-size: 8pt; }
  .table th { background: var(--ink); color: var(--paper); font-family: var(--mono); font-size: 6.6pt; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .table tr:last-child td { border-bottom: 0; }
  .table td.num { font-family: var(--mono); font-weight: 700; text-align: right; letter-spacing: -0.02em; }
  .table tr.total td { background: var(--lime); font-weight: 800; }
  .table td .sub { display: block; color: var(--muted); font-size: 7pt; font-weight: 400; }

  /* --- halaman 3 -------------------------------------------------------- */
  .kit { display: grid; gap: 1.4mm; margin-top: 2.2mm; }
  .kititem { display: grid; grid-template-columns: 18mm 1fr; gap: 2.6mm; padding: 1.8mm; border: 1.8pt solid var(--line); background: var(--paper-2); }
  .kitshot { position: relative; height: 18mm; overflow: hidden; border: 1.4pt solid var(--line); }
  .kitshot img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .kitshot span { position: absolute; top: 0; left: 0; padding: 0.6mm 1.4mm; background: var(--ink); color: var(--paper); font-family: var(--mono); font-size: 6pt; font-weight: 800; }
  .kitbody { min-width: 0; }
  .kithead { display: flex; align-items: baseline; justify-content: space-between; gap: 3mm; }
  .kithead h3 { font-size: 10pt; }
  .kithead .price { flex: 0 0 auto; font-family: var(--mono); font-size: 9pt; font-weight: 800; letter-spacing: -0.03em; }
  .kitmeta { margin: 1mm 0 1.2mm; font-family: var(--mono); font-size: 6.8pt; letter-spacing: 0.02em; color: var(--muted); }
  .kitmeta i { font-style: normal; padding: 0.4mm 1.4mm; border: 1.2pt solid var(--line); background: var(--paper-2); color: var(--ink); font-weight: 800; }
  .kitmeta i.req { background: var(--lime); }
  .kittip { margin-bottom: 1.4mm; font-size: 7.4pt; line-height: 1.3; }
  .shops { display: flex; flex-wrap: wrap; align-items: center; gap: 1.6mm; }
  .shops .lbl { font-family: var(--mono); font-size: 6.4pt; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
  .shops a { padding: 0.8mm 2mm; border: 1.4pt solid var(--line); background: var(--paper); font-family: var(--mono); font-size: 6.8pt; font-weight: 800; }
  .shops a.tokopedia { background: var(--lime); }
  .shops a.shopee { background: var(--orange); }
  .shops a.blibli { background: var(--cyan); }
  .shops a.bukalapak { background: #ffb3c7; }

  /* --- halaman 4 -------------------------------------------------------- */
  .cols3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-top: 3mm; }
  .listbox { padding: 3.5mm; border: 1.8pt solid var(--line); background: var(--paper-2); }
  .listbox h3 { margin-bottom: 2.5mm; padding-bottom: 2mm; border-bottom: 1.6pt solid var(--line); font-size: 9.5pt; }
  .listbox li { display: grid; grid-template-columns: 5mm 1fr; gap: 1mm; margin-bottom: 1.8mm; font-size: 7.8pt; line-height: 1.35; list-style: none; }
  .listbox li b { font-family: var(--mono); font-size: 7pt; }
  .listbox.risk { background: #ffe0d6; }

  .phases { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-top: 3mm; }
  .phase { padding: 3.5mm; border: 2pt solid var(--line); background: var(--paper-2); box-shadow: 2mm 2mm 0 var(--line); }
  .phase .n { display: inline-block; padding: 0.8mm 2mm; background: var(--ink); color: var(--paper); font-family: var(--mono); font-size: 7pt; font-weight: 800; }
  .phase small { display: block; margin: 2mm 0 0.8mm; font-family: var(--mono); font-size: 6.6pt; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
  .phase h3 { font-size: 10pt; }
  .phase p { margin-top: 1.6mm; padding-left: 3mm; font-size: 7.6pt; line-height: 1.35; text-indent: -3mm; }

  .sources { display: grid; grid-template-columns: 1fr 1fr; gap: 1.6mm; margin-top: 2.5mm; }
  .sources a { display: block; padding: 1.8mm 2.6mm; border: 1.4pt solid var(--line); background: var(--paper-2); font-size: 7.4pt; }
  .sources a b { display: block; font-size: 7.8pt; }
  .sources a span { color: var(--muted); font-size: 6.8pt; }

  .disclaimer { margin-top: 3mm; padding: 3mm; border: 2pt solid var(--line); background: var(--orange); box-shadow: 2mm 2mm 0 var(--line); font-size: 7.8pt; line-height: 1.35; }
  .disclaimer b { display: block; margin-bottom: 1mm; font-family: var(--display); font-size: 9.5pt; }

  .closing { display: flex; align-items: center; justify-content: space-between; gap: 5mm; margin-top: 3mm; padding: 4mm; border: 2.4pt solid var(--line); background: var(--ink); color: var(--paper); box-shadow: 2.6mm 2.6mm 0 var(--lime); }
  .closing h2 { font-size: 16pt; }
  .closing p { margin-top: 1.6mm; font-size: 8pt; color: #cfcfc4; }
  .closing a { flex: 0 0 auto; padding: 2mm 3.5mm; border: 1.8pt solid var(--paper); background: var(--lime); color: var(--ink); font-family: var(--mono); font-size: 7.6pt; font-weight: 800; }
`;

/* ------------------------------------------------------------------ HTML */

const topbar = (business, label) => `
  <header class="topbar">
    <span class="mark"><i class="dot"></i> Cek Bisnis · Panduan Usaha</span>
    <span>${esc(label)}</span>
  </header>`;

const pagefoot = (business, page) => `
  <footer class="pagefoot">
    <span>cek-bisnis.vercel.app/usaha/${esc(business.slug)}</span>
    <span>Data ${esc(businessData.updatedAt)} · Halaman <b>${page}</b>/${PAGES}</span>
  </footer>`;

function coverPage(business, metrics, assets) {
  return `
  <section class="page">
    ${topbar(business, "01 · Ringkasan")}
    <div class="cover-head">
      <span class="sticker">${esc(business.category)}</span>
      <h1>${esc(business.name)}</h1>
      <p class="lede">${esc(business.oneLine)}</p>
    </div>

    <div class="hero">
      <img src="${assets.hero}" alt="${esc(business.name)}">
      <span class="sticker flat tag">Contoh format nyata</span>
    </div>

    <div class="numbers">
      <div><small>Modal awal</small><b>${esc(moneyRange(business.capex[0], business.capex[1]))}</b><em>Rentang nasional</em></div>
      <div><small>Target omzet</small><b>${esc(money(business.targetRevenue, 0))}</b><em>per bulan</em></div>
      <div><small>Omzet BEP</small><b>${esc(money(metrics.breakEvenRevenue))}</b><em>titik impas</em></div>
      <div><small>Harga rata-rata</small><b>${esc(rupiah(business.avgTicket))}</b><em>per ${esc(business.trafficMode === "member" ? "member/bulan" : "transaksi")}</em></div>
    </div>

    <div class="factgrid">
      <div class="fact"><small>Format standar</small><p>${esc(business.format)}</p></div>
      <div class="fact"><small>Cocok untuk pemilik</small><p>${esc(business.idealFor)}</p></div>
      <div class="fact"><small>Radius ideal</small><p>${esc(business.idealRadius)} · ${esc(business.marginLabel)}</p></div>
      <div class="fact"><small>Sinyal lokasi</small><p>${esc(business.locationSignal)}</p></div>
    </div>

    <div class="factgrid" style="grid-template-columns: 1fr;">
      <div class="fact"><small>Gambaran model</small><p>${esc(business.description)}</p></div>
    </div>

    <div class="toc">
      <div><span class="n">02</span><b>Skala &amp; angka</b><em>Tiga skala modal, biaya bulanan, omzet BEP, dan kota berskor tertinggi.</em></div>
      <div><span class="n">03</span><b>Alat &amp; belanja</b><em>${details[business.id].equipment.length} item wajib beserta foto, harga, dan tautan marketplace yang bisa diklik.</em></div>
      <div><span class="n">04</span><b>Operasi &amp; rencana</b><em>Rutinitas harian, daftar cek, risiko, rencana 90 hari, izin, dan sumber data.</em></div>
    </div>

    ${pagefoot(business, 1)}
  </section>`;
}

function economicsPage(business, detail, metrics, topCities) {
  const scales = detail.scales
    .map(
      (scale) => `
      <div class="scale">
        <h3>${esc(scale.name)}</h3>
        <div class="capex">${esc(moneyRange(scale.capex[0], scale.capex[1]))}</div>
        <dl>
          <div><dt>Kapasitas</dt><dd>${esc(scale.capacity)}</dd></div>
          <div><dt>Omzet</dt><dd>${esc(moneyRange(scale.revenue[0], scale.revenue[1]))}</dd></div>
          <div><dt>Tim</dt><dd>${esc(scale.staff)}</dd></div>
          <div><dt>Luas</dt><dd>${esc(scale.space)}</dd></div>
        </dl>
        <p class="best">Paling pas: ${esc(scale.bestFor)}</p>
      </div>`,
    )
    .join("");

  const cityRows = topCities
    .map(
      (city) => `
      <tr>
        <td><b>${esc(city.name)}</b><span class="sub">${esc(city.province)}</span></td>
        <td>${esc(city.demandLabel)}</td>
        <td>${esc(city.competition)}</td>
        <td class="num">${city.scores[business.id]}</td>
      </tr>`,
    )
    .join("");

  const payback = Number.isFinite(metrics.payback)
    ? `±${Math.ceil(metrics.payback)} bulan`
    : "Belum tertutup di target ini";

  return `
  <section class="page">
    ${topbar(business, "02 · Skala & angka")}

    <div class="sectiontitle"><h2>Pilih skala modal</h2><span>Tiga titik masuk</span></div>
    <div class="callout"><span class="k">HARGA</span><span>${esc(detail.priceLabel)}</span></div>
    <div class="scales">${scales}</div>

    <div class="sectiontitle"><h2>Biaya bulanan baseline</h2><span>Faktor kota = 1,00</span></div>
    <div class="table">
      <table>
        <thead><tr><th>Pos biaya</th><th style="text-align:right">Per bulan</th><th>Catatan</th></tr></thead>
        <tbody>
          <tr><td>Sewa tempat</td><td class="num">${esc(money(metrics.rent))}</td><td>Naik-turun mengikuti kota</td></tr>
          <tr><td>Gaji tim</td><td class="num">${esc(money(metrics.payroll))}</td><td>${business.staffCount} orang</td></tr>
          <tr><td>Biaya tetap lain</td><td class="num">${esc(money(metrics.otherFixed))}</td><td>Listrik, air, internet, perawatan</td></tr>
          <tr><td>Biaya variabel</td><td class="num">${Math.round(business.variableRate * 100)}%</td><td>Dari setiap rupiah omzet</td></tr>
          <tr class="total"><td>Omzet BEP</td><td class="num">${esc(money(metrics.breakEvenRevenue))}</td><td>Minimal ${metrics.traffic.toLocaleString("id-ID")} ${esc(business.trafficLabel)}</td></tr>
          <tr><td>Perkiraan balik modal</td><td class="num">${esc(payback)}</td><td>Pada target ${esc(money(business.targetRevenue, 0))}/bln</td></tr>
        </tbody>
      </table>
    </div>

    <div class="sectiontitle"><h2>Kota dengan skor tertinggi</h2><span>Skor 0-100</span></div>
    <div class="table">
      <table>
        <thead><tr><th>Kota</th><th>Permintaan</th><th>Persaingan</th><th style="text-align:right">Skor</th></tr></thead>
        <tbody>${cityRows}</tbody>
      </table>
    </div>

    ${pagefoot(business, 2)}
  </section>`;
}

function equipmentPage(business, detail, assets) {
  const items = detail.equipment
    .map((item, index) => {
      const shops = item.stores
        .map(
          (store) =>
            `<a class="${store}" href="${esc(searchUrl(store, item.query))}">${esc(marketplaces[store].name)} &#8599;</a>`,
        )
        .join("");

      return `
      <article class="kititem">
        <div class="kitshot">
          <img src="${assets.tiles[index]}" alt="">
          <span>${String(index + 1).padStart(2, "0")}</span>
        </div>
        <div class="kitbody">
          <div class="kithead">
            <h3>${esc(item.item)}</h3>
            <span class="price">${esc(money(item.subtotal[0]))}-${esc(money(item.subtotal[1]).replace("Rp", ""))}</span>
          </div>
          <p class="kitmeta"><i class="${item.priority === "Wajib" ? "req" : ""}">${esc(item.priority)}</i> &nbsp; ${esc(item.qty)} &nbsp;·&nbsp; ${esc(item.unitCost)} / unit</p>
          <p class="kittip">${esc(item.buyingTip)}</p>
          <div class="shops"><span class="lbl">Cari “${esc(item.query)}”</span>${shops}</div>
        </div>
      </article>`;
    })
    .join("");

  const totalLow = detail.equipment.reduce((sum, item) => sum + item.subtotal[0], 0);
  const totalHigh = detail.equipment.reduce((sum, item) => sum + item.subtotal[1], 0);

  return `
  <section class="page">
    ${topbar(business, "03 · Alat & belanja")}

    <div class="sectiontitle"><h2>Daftar belanja lengkap</h2><span>Setiap nama toko bisa diklik</span></div>
    <div class="callout"><span class="k">CATATAN</span><span>Harga adalah estimasi Cek Bisnis. Tautan membuka hasil pencarian marketplace, jadi harga dan stok selalu yang terbaru. Minta quotation sebelum transfer.</span></div>

    <div class="kit">${items}</div>

    <div class="table" style="margin-top:2mm">
      <table>
        <tbody>
          <tr class="total">
            <td>Total estimasi alat &amp; perlengkapan (${detail.equipment.length} item)</td>
            <td class="num">${esc(money(totalLow, 0))} - ${esc(money(totalHigh, 0))}</td>
          </tr>
        </tbody>
      </table>
    </div>

    ${pagefoot(business, 3)}
  </section>`;
}

function operationsPage(business, sources) {
  const list = (items, ordered) =>
    items
      .map((item, index) => `<li><b>${ordered ? String(index + 1).padStart(2, "0") : "!"}</b><span>${esc(item)}</span></li>`)
      .join("");

  const phases = business.plan90
    .map(
      (phase, index) => `
      <div class="phase">
        <span class="n">0${index + 1}</span>
        <small>${esc(phase.phase)}</small>
        <h3>${esc(phase.title)}</h3>
        ${phase.actions.map((action) => `<p>— ${esc(action)}</p>`).join("")}
      </div>`,
    )
    .join("");

  const sourceLinks = sources
    .map(
      (source) => `<a href="${esc(source.url)}"><b>${esc(source.title)} &#8599;</b><span>${esc(source.note)}</span></a>`,
    )
    .join("");

  return `
  <section class="page">
    ${topbar(business, "04 · Operasi & rencana")}

    <div class="sectiontitle"><h2>Jalankan dan jaga</h2><span>Harian, cek awal, risiko</span></div>
    <div class="cols3">
      <div class="listbox"><h3>Operasi harian</h3><ul>${list(business.dailyOps, true)}</ul></div>
      <div class="listbox"><h3>Cek sebelum buka</h3><ul>${list(business.checklist, true)}</ul></div>
      <div class="listbox risk"><h3>Waspadai</h3><ul>${list(business.risks, false)}</ul></div>
    </div>

    <div class="sectiontitle"><h2>Rencana 90 hari</h2><span>Dari validasi ke repeat order</span></div>
    <div class="phases">${phases}</div>

    <div class="sectiontitle"><h2>Izin &amp; sumber data</h2><span>Semua tautan bisa diklik</span></div>
    <div class="listbox" style="margin-bottom:3mm"><ul>${list(business.permits, true)}</ul></div>
    <div class="sources">${sourceLinks}</div>

    <div class="disclaimer">
      <b>Ini alat screening, bukan jaminan untung.</b>
      ${esc(businessData.methodNote)}
    </div>

    <div class="closing">
      <div>
        <h2>Hitung dulu. Baru buka.</h2>
        <p>Ubah kota, skala, dan target omzet secara langsung, lalu uji lokasi di peta interaktif Indonesia.</p>
      </div>
      <a href="https://cek-bisnis.vercel.app/usaha/${esc(business.slug)}">Buka simulasi &#8599;</a>
    </div>

    ${pagefoot(business, 4)}
  </section>`;
}

function buildHtml(business, assets) {
  const detail = details[business.id];
  const metrics = baselineMetrics(business);
  const topCities = [...businessData.cities].sort((a, b) => b.scores[business.id] - a.scores[business.id]).slice(0, 6);
  const sources = businessData.sources.filter((source) => business.sourceIds.includes(source.id));

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Cek Bisnis — Panduan ${esc(business.name)}</title>
  <style>${styles}</style>
</head>
<body>
  ${coverPage(business, metrics, assets)}
  ${economicsPage(business, detail, metrics, topCities)}
  ${equipmentPage(business, detail, assets)}
  ${operationsPage(business, sources)}
</body>
</html>`;
}

/* ---------------------------------------------------------------- Chrome */

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error("Chrome/Edge tidak ditemukan. Set CHROME_PATH ke lokasi browser-nya.");
  }
  return found;
}

/**
 * Chrome menyematkan gambar ke PDF pada resolusi aslinya, dan background-image atlas
 * ikut tersalin utuh untuk SETIAP tile - satu panduan bisa membengkak sampai ~2 MB.
 * Di sini Chrome dipakai sebagai alat potong: hero dan 8 tile alat digambar ulang ke
 * canvas berukuran cetak, lalu dikembalikan sebagai data URI JPEG.
 */
function rasterizeAssets(chrome, business) {
  const htmlPath = join(workDir, `${business.slug}.assets.html`);
  const heroUrl = fileUrl(`businesses/${business.slug}.jpg`);
  const atlasUrl = fileUrl(`equipment/${business.slug}-atlas.webp`);

  const html = `<!doctype html><meta charset="utf-8"><pre id="out"></pre><script>
    const draw = (image, sx, sy, sw, sh, width, height) => {
      const canvas = Object.assign(document.createElement("canvas"), { width, height });
      canvas.getContext("2d").drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
      return canvas.toDataURL("image/jpeg", 0.82);
    };
    const load = (src) => new Promise((done, fail) => {
      const image = new Image();
      image.onload = () => done(image);
      image.onerror = () => fail(new Error("gagal memuat " + src));
      image.src = src;
    });
    (async () => {
      const hero = await load(${JSON.stringify(heroUrl)});
      const atlas = await load(${JSON.stringify(atlasUrl)});
      const tileW = atlas.naturalWidth / 4;
      const tileH = atlas.naturalHeight / 2;
      const tiles = [];
      for (let i = 0; i < 8; i += 1) {
        tiles.push(draw(atlas, (i % 4) * tileW, i < 4 ? 0 : tileH, tileW, tileH, ${TILE_PX}, ${TILE_PX}));
      }
      const ratio = hero.naturalHeight / hero.naturalWidth;
      document.getElementById("out").textContent = JSON.stringify({
        hero: draw(hero, 0, 0, hero.naturalWidth, hero.naturalHeight, ${HERO_PX}, Math.round(${HERO_PX} * ratio)),
        tiles,
      });
    })();
  <\/script>`;

  writeFileSync(htmlPath, html, "utf8");
  const dom = execFileSync(
    chrome,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      // Tanpa ini canvas dianggap "tainted" dan toDataURL() ditolak untuk gambar file://.
      "--allow-file-access-from-files",
      "--virtual-time-budget=20000",
      "--dump-dom",
      pathToFileURL(htmlPath).href,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 256 * 1024 * 1024 },
  );
  rmSync(htmlPath, { force: true });

  const payload = /<pre id="out">([\s\S]*?)<\/pre>/.exec(dom)?.[1];
  if (!payload) throw new Error(`Gagal menyiapkan gambar untuk ${business.name}.`);
  return JSON.parse(payload.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"'));
}

/**
 * Halaman PDF punya tinggi tetap dan `overflow: hidden`, jadi konten yang kepanjangan
 * akan terpotong diam-diam. Cek ini menjalankan Chrome sekali lagi untuk mengukur
 * setiap halaman dan memberi peringatan sebelum file dianggap benar.
 */
function checkOverflow(chrome, htmlPath) {
  const probe = `${htmlPath.replace(/\.html$/, "")}.probe.html`;
  const measure = `<script>document.title=[...document.querySelectorAll('.page')]
    .map((p,i)=>p.scrollHeight>p.clientHeight?(i+1)+':+'+(p.scrollHeight-p.clientHeight)+'px':'')
    .filter(Boolean).join(', ')||'ok';<\/script>`;

  writeFileSync(probe, `${readFileSync(htmlPath, "utf8")}${measure}`, "utf8");
  const dom = execFileSync(
    chrome,
    ["--headless", "--disable-gpu", "--no-sandbox", "--virtual-time-budget=6000", "--dump-dom", pathToFileURL(probe).href],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 },
  );
  rmSync(probe, { force: true });

  const title = /<title>([^<]*)<\/title>/.exec(dom)?.[1] ?? "ok";
  return title === "ok" ? null : title;
}

function printToPdf(chrome, htmlPath, pdfPath) {
  execFileSync(
    chrome,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--no-pdf-header-footer",
      "--generate-pdf-document-outline",
      "--virtual-time-budget=10000",
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: "pipe" },
  );
}

/* ------------------------------------------------------------------ main */

const args = process.argv.slice(2);
const keepHtml = args.includes("--keep-html");
const wanted = args.filter((arg) => !arg.startsWith("--"));
const targets = wanted.length
  ? businessData.businesses.filter((business) => wanted.includes(business.id) || wanted.includes(business.slug))
  : businessData.businesses;

if (!targets.length) {
  console.error(`Tidak ada usaha yang cocok. Pilihan: ${businessData.businesses.map((b) => b.id).join(", ")}`);
  process.exit(1);
}

const chrome = findChrome();
mkdirSync(outDir, { recursive: true });
mkdirSync(workDir, { recursive: true });

let overflowing = 0;

for (const business of targets) {
  const htmlPath = join(workDir, `${business.slug}.html`);
  const pdfPath = join(outDir, `cek-bisnis-${business.slug}-guide.pdf`);

  writeFileSync(htmlPath, buildHtml(business, rasterizeAssets(chrome, business)), "utf8");
  const overflow = checkOverflow(chrome, htmlPath);
  printToPdf(chrome, htmlPath, pdfPath);

  const kb = Math.round(readFileSync(pdfPath).length / 1024);
  const status = overflow ? `POTONG halaman ${overflow}` : "ok";
  if (overflow) overflowing += 1;
  console.log(`${overflow ? "!! " : "ok "} ${business.name.padEnd(20)} ${String(kb).padStart(5)} KB  ${status}`);
}

if (!keepHtml) rmSync(workDir, { recursive: true, force: true });
console.log(`\nSelesai: ${targets.length} panduan, ${PAGES} halaman per file.`);

if (overflowing) {
  console.error(`\n${overflowing} panduan punya halaman yang terpotong. Rapikan CSS/konten lalu jalankan ulang.`);
  process.exit(1);
}
