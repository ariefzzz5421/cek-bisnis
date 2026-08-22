/**
 * Menyiapkan berkas logo merek waralaba di `public/brands/franchises/`
 * dan membangkitkan `lib/brand-logo-assets.ts`.
 *
 * Dua sumber:
 *   1. Berkas yang sudah ada di repo (diunggah manual).
 *   2. Paket npm `idn-finlogos`, koleksi SVG merek Indonesia. Aset SVG-nya
 *      berlisensi CC BY-NC 4.0 (kurasi), sedangkan merek dagangnya tetap
 *      milik pemiliknya masing-masing. Lihat public/brands/franchises/README.md.
 *
 * Jalankan: node scripts/import-brand-logos.mjs
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "brands", "franchises");
const GENERATED = path.join(ROOT, "lib", "brand-logo-assets.ts");

const PACKAGE = "idn-finlogos@2.5.0";

/** id merek di data kita -> nama ikon di paket idn-finlogos. */
const FROM_PACKAGE = {
  indomaret: "indomaret",
  alfamidi: "alfamidi",
  lawson: "lawson",
  yomart: "yomart",
  familymart: "familymart",
  // Catatan: ikon bernama "212" di paket itu milik Bank Woori Saudara (kode
  // bank 212), bukan 212 Mart. Jangan dipetakan ke sini.
  omi: "indogrosir",
  jne: "jne",
  sicepat: "sicepat",
  "lion-parcel": "lionparcel",
  "ninja-xpress": "ninja-xpress",
  anteraja: "anteraja",
  wahana: "wahana-express",
};

/** id merek -> berkas yang sudah lebih dulu ada di repo. */
const ALREADY_IN_REPO = {
  alfamart: "alfamart.png",
  "ayam-geprek-sai": "ayam-geprek-sai.webp",
  "baba-rafi": "baba-rafi.png",
  bingxue: "bingxue-user.webp",
  "doyan-ayam": "doyan-ayam.webp",
  "es-teh-indonesia": "esteh-indonesia.svg",
  "geprek-bensu": "geprek-bensu.webp",
  "janji-jiwa": "janji-jiwa.webp",
  jnt: "jnt-express.webp",
  kopigo: "kopigo.svg",
  mrklin: "mr-klin.webp",
  "nyoklat-klasik": "nyoklat-klasik.webp",
  "point-coffee": "point-coffee.webp",
  sabana: "sabana.webp",
  "tahu-go": "tahu-go.webp",
  "teh-poci": "esteh-poci.png",
};

/**
 * Ikon di paket itu ditujukan untuk ditempel inline ke dalam DOM, jadi tag
 * `<svg>`-nya tidak membawa `xmlns` maupun ukuran. Berkas seperti itu bukan
 * dokumen SVG yang sah, dan browser menolak merendernya lewat `<img>` — yang
 * terlihat sebagai logo yang diam-diam jatuh ke monogram. Di sini keduanya
 * ditambahkan supaya berkasnya berdiri sendiri.
 */
function standalone(svg) {
  return svg.replace(/<svg\b([^>]*)>/, (tag, attrs) => {
    let out = attrs;
    if (!/\bxmlns=/.test(out)) out = ` xmlns="http://www.w3.org/2000/svg"${out}`;
    const viewBox = out.match(/viewBox\s*=\s*"([^"]+)"/i);
    if (viewBox && !/\bwidth=/.test(out)) {
      const [, , width, height] = viewBox[1].trim().split(/[\s,]+/);
      out = `${out} width="${width}" height="${height}"`;
    }
    return `<svg${out}>`;
  });
}

function fetchPackageIcons() {
  const work = mkdtempSync(path.join(tmpdir(), "idn-logos-"));
  try {
    const tarball = execFileSync("npm", ["pack", PACKAGE, "--silent"], {
      cwd: work,
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .pop();
    execFileSync("tar", ["xf", tarball], { cwd: work });
    const icons = path.join(work, "package", "dist", "icons");
    for (const [id, icon] of Object.entries(FROM_PACKAGE)) {
      const source = readFileSync(path.join(icons, `${icon}.svg`), "utf8");
      writeFileSync(path.join(OUT_DIR, `${id}.svg`), standalone(source), "utf8");
    }
    // Simpan berkas lisensi aset agar ketentuannya ikut terbawa di repo.
    copyFileSync(path.join(work, "package", "LICENSE-ASSETS"), path.join(OUT_DIR, "LICENSE-ASSETS.txt"));
    console.log(`Menyalin ${Object.keys(FROM_PACKAGE).length} logo dari ${PACKAGE}.`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/* ---------- pembacaan dimensi intrinsik ---------- */

function svgSize(buf) {
  const head = buf.toString("utf8", 0, 2048);
  const viewBox = head.match(/viewBox\s*=\s*"([^"]+)"/i);
  if (viewBox) {
    const parts = viewBox[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) return { width: parts[2], height: parts[3] };
  }
  const w = head.match(/\bwidth\s*=\s*"([\d.]+)/i);
  const h = head.match(/\bheight\s*=\s*"([\d.]+)/i);
  if (w && h) return { width: Number(w[1]), height: Number(h[1]) };
  return null;
}

function pngSize(buf) {
  // IHDR selalu chunk pertama: 8 byte signature, 4 byte panjang, 4 byte tipe.
  if (buf.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function webpSize(buf) {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return {
      width: 1 + buf.readUIntLE(24, 3),
      height: 1 + buf.readUIntLE(27, 3),
    };
  }
  if (chunk === "VP8 ") {
    // Frame header lossy: 3 byte tag, 3 byte start code, lalu 2x16 bit dimensi.
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  return null;
}

function intrinsicSize(file) {
  const buf = readFileSync(path.join(OUT_DIR, file));
  const ext = path.extname(file).toLowerCase();
  const size = ext === ".svg" ? svgSize(buf) : ext === ".png" ? pngSize(buf) : webpSize(buf);
  if (!size) throw new Error(`Tidak bisa membaca dimensi ${file}`);
  return size;
}

/* ---------- keluaran ---------- */

function writeGenerated() {
  const entries = { ...ALREADY_IN_REPO };
  for (const id of Object.keys(FROM_PACKAGE)) entries[id] = `${id}.svg`;

  const known = new Set(readdirSync(OUT_DIR));
  const rows = Object.keys(entries)
    .sort()
    .map((id) => {
      const file = entries[id];
      if (!known.has(file)) throw new Error(`Berkas hilang: ${file} (untuk ${id})`);
      const { width, height } = intrinsicSize(file);
      return `  "${id}": { file: "${file}", width: ${width}, height: ${height} },`;
    });

  const body = `/**
 * DIBANGKITKAN OTOMATIS oleh scripts/import-brand-logos.mjs. Jangan diedit manual.
 *
 * Dimensi intrinsik dipakai agar logo berbentuk wordmark (jauh lebih lebar
 * daripada tinggi) mendapat ubin yang lebih lebar, bukan diperkecil sampai
 * tidak terbaca di dalam kotak persegi.
 *
 * Sumber dan lisensi tiap berkas: public/brands/franchises/README.md
 */

export type BrandLogoAsset = {
  /** Nama berkas di dalam public/brands/franchises/. */
  file: string;
  width: number;
  height: number;
};

export const brandLogoAssets: Record<string, BrandLogoAsset> = {
${rows.join("\n")}
};
`;

  writeFileSync(GENERATED, body, "utf8");
  console.log(`Menulis ${GENERATED} (${rows.length} logo).`);
}

fetchPackageIcons();
writeGenerated();
