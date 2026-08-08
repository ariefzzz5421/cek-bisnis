/**
 * Membangun aset gambar untuk model usaha yang belum punya foto lapangan.
 *
 * Tujuh model usaha pertama memakai foto nyata. Untuk model yang fotonya belum
 * tersedia, skrip ini menggambar ilustrasi datar bergaya neo-brutalis memakai
 * palet situs, sehingga hasilnya terlihat disengaja dan bukan foto stok yang
 * tidak nyambung.
 *
 * Alurnya sama dengan build-guides.mjs: HTML berisi kode canvas -> headless
 * Chrome -> toDataURL() dibaca lewat --dump-dom. Tanpa dependensi npm tambahan.
 *
 *   node scripts/build-illustrations.mjs angkringan
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const workDir = join(root, ".illustration-build");

const HERO = { width: 1536, height: 1024 };
/** Atlas alat: 4 kolom x 2 baris, dibaca lewat background-position di UI. */
const TILE = 260;
const ATLAS = { cols: 4, rows: 2 };

const PALETTE = {
  ink: "#0d0d0d",
  paper: "#f5f1e4",
  paper2: "#ffffff",
  accent: "#c9f531",
  pear: "#ffd93d",
  cyan: "#7de8ef",
  coral: "#ff7a5c",
  night: "#141b2e",
  night2: "#22304f",
  wood: "#b06a34",
  wood2: "#8a4f24",
  ember: "#ff7a1a",
};

/* ------------------------------------------------------------------ scenes */

/**
 * Setiap scene adalah fungsi yang dijalankan DI DALAM browser, jadi isinya
 * harus mandiri: tidak boleh menutup variabel dari modul ini selain `P`
 * (palet) yang dikirim sebagai argumen.
 */
const scenes = {
  angkringan: {
    hero: `(ctx, W, H, P) => {
      // Langit malam
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, P.night);
      sky.addColorStop(0.62, P.night2);
      sky.addColorStop(1, "#2f2013");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

      // Siluet kota di kejauhan
      ctx.fillStyle = "rgba(8,12,22,0.72)";
      let x = -40;
      while (x < W + 60) {
        const w = 70 + ((x * 37) % 90);
        const h = 110 + ((x * 53) % 190);
        ctx.fillRect(x, H * 0.52 - h, w, h);
        for (let wy = 0; wy < h - 30; wy += 34) {
          for (let wx = 10; wx < w - 16; wx += 26) {
            if ((wx * wy + x) % 7 < 3) {
              ctx.fillStyle = "rgba(255,217,61,0.5)";
              ctx.fillRect(x + wx, H * 0.52 - h + wy + 12, 9, 12);
              ctx.fillStyle = "rgba(8,12,22,0.72)";
            }
          }
        }
        x += w + 18;
      }

      // Jalan
      ctx.fillStyle = "#1b1710"; ctx.fillRect(0, H * 0.72, W, H * 0.28);
      ctx.strokeStyle = "rgba(245,241,228,0.18)"; ctx.lineWidth = 5; ctx.setLineDash([44, 34]);
      ctx.beginPath(); ctx.moveTo(0, H * 0.88); ctx.lineTo(W, H * 0.88); ctx.stroke(); ctx.setLineDash([]);

      // Cahaya lampu gantung
      const glow = ctx.createRadialGradient(W * 0.44, H * 0.36, 20, W * 0.44, H * 0.36, W * 0.42);
      glow.addColorStop(0, "rgba(255,217,61,0.42)");
      glow.addColorStop(1, "rgba(255,217,61,0)");
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

      const baseY = H * 0.74;
      const cartX = W * 0.24, cartW = W * 0.44, cartH = H * 0.26;

      // Terpal / atap
      ctx.fillStyle = P.coral;
      ctx.beginPath();
      ctx.moveTo(cartX - 70, H * 0.28);
      ctx.lineTo(cartX + cartW + 70, H * 0.28);
      ctx.lineTo(cartX + cartW + 30, H * 0.36);
      ctx.lineTo(cartX - 30, H * 0.36);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = P.ink; ctx.lineWidth = 7; ctx.stroke();
      // Rumbai terpal
      for (let i = 0; i < 14; i++) {
        const fx = cartX - 30 + i * ((cartW + 60) / 13);
        ctx.fillStyle = i % 2 ? P.pear : P.paper;
        ctx.beginPath(); ctx.moveTo(fx, H * 0.36); ctx.lineTo(fx + 20, H * 0.36); ctx.lineTo(fx + 10, H * 0.40);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.stroke();
      }

      // Tiang
      ctx.fillStyle = P.wood2;
      ctx.fillRect(cartX - 44, H * 0.36, 16, baseY - H * 0.36 + 40);
      ctx.fillRect(cartX + cartW + 28, H * 0.36, 16, baseY - H * 0.36 + 40);
      ctx.strokeStyle = P.ink; ctx.lineWidth = 5;
      ctx.strokeRect(cartX - 44, H * 0.36, 16, baseY - H * 0.36 + 40);
      ctx.strokeRect(cartX + cartW + 28, H * 0.36, 16, baseY - H * 0.36 + 40);

      // Lampu bohlam
      for (let i = 0; i < 5; i++) {
        const lx = cartX + 40 + i * (cartW / 4.4);
        ctx.strokeStyle = P.ink; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(lx, H * 0.36); ctx.lineTo(lx, H * 0.395); ctx.stroke();
        ctx.beginPath(); ctx.arc(lx, H * 0.413, 16, 0, Math.PI * 2);
        ctx.fillStyle = P.pear; ctx.fill(); ctx.stroke();
      }

      // Badan gerobak
      ctx.fillStyle = P.wood;
      ctx.fillRect(cartX, baseY - cartH, cartW, cartH);
      ctx.strokeStyle = P.ink; ctx.lineWidth = 8;
      ctx.strokeRect(cartX, baseY - cartH, cartW, cartH);
      // Papan kayu
      ctx.strokeStyle = "rgba(13,13,13,0.35)"; ctx.lineWidth = 4;
      for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(cartX, baseY - cartH + (cartH / 6) * i);
        ctx.lineTo(cartX + cartW, baseY - cartH + (cartH / 6) * i);
        ctx.stroke();
      }
      // Meja saji
      ctx.fillStyle = P.paper;
      ctx.fillRect(cartX - 26, baseY - cartH - 26, cartW + 52, 30);
      ctx.strokeStyle = P.ink; ctx.lineWidth = 8;
      ctx.strokeRect(cartX - 26, baseY - cartH - 26, cartW + 52, 30);

      // Bakul nasi kucing
      for (let i = 0; i < 3; i++) {
        const bx = cartX + 40 + i * 110;
        ctx.fillStyle = P.pear;
        ctx.beginPath(); ctx.ellipse(bx, baseY - cartH - 40, 44, 22, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 6; ctx.stroke();
      }
      // Toples gorengan
      for (let i = 0; i < 2; i++) {
        const gx = cartX + cartW - 130 + i * 78;
        ctx.fillStyle = "rgba(215,240,245,0.9)";
        ctx.fillRect(gx, baseY - cartH - 82, 58, 56);
        ctx.strokeStyle = P.ink; ctx.lineWidth = 6;
        ctx.strokeRect(gx, baseY - cartH - 82, 58, 56);
        ctx.fillStyle = P.ember;
        for (let k = 0; k < 4; k++) {
          ctx.beginPath(); ctx.arc(gx + 16 + (k % 2) * 24, baseY - cartH - 44 - Math.floor(k / 2) * 20, 9, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Anglo dan sate
      const ax = cartX + cartW + 90;
      ctx.fillStyle = "#3a3a3a"; ctx.fillRect(ax, baseY - 92, 130, 70);
      ctx.strokeStyle = P.ink; ctx.lineWidth = 7; ctx.strokeRect(ax, baseY - 92, 130, 70);
      const emberGrad = ctx.createLinearGradient(ax, baseY - 92, ax, baseY - 60);
      emberGrad.addColorStop(0, P.ember); emberGrad.addColorStop(1, "#c22a00");
      ctx.fillStyle = emberGrad; ctx.fillRect(ax + 10, baseY - 84, 110, 24);
      for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = "#f2d0a0"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(ax + 16 + i * 18, baseY - 96); ctx.lineTo(ax + 16 + i * 18, baseY - 128); ctx.stroke();
        ctx.fillStyle = "#8a4f24";
        ctx.fillRect(ax + 11 + i * 18, baseY - 126, 11, 22);
        ctx.strokeStyle = P.ink; ctx.lineWidth = 3;
        ctx.strokeRect(ax + 11 + i * 18, baseY - 126, 11, 22);
      }
      // Asap
      ctx.strokeStyle = "rgba(245,241,228,0.28)"; ctx.lineWidth = 7;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(ax + 30 + i * 34, baseY - 140);
        ctx.quadraticCurveTo(ax + 10 + i * 34, baseY - 200, ax + 42 + i * 34, baseY - 250);
        ctx.stroke();
      }

      // Kursi panjang dan pengunjung
      const benchY = baseY + 46;
      ctx.fillStyle = P.wood2; ctx.fillRect(cartX - 10, benchY, cartW * 0.72, 20);
      ctx.strokeStyle = P.ink; ctx.lineWidth = 7; ctx.strokeRect(cartX - 10, benchY, cartW * 0.72, 20);
      for (const lx of [cartX + 10, cartX + cartW * 0.6]) {
        ctx.fillStyle = P.wood2; ctx.fillRect(lx, benchY + 20, 14, 52);
        ctx.strokeRect(lx, benchY + 20, 14, 52);
      }
      const people = [
        { x: cartX + 70, c: P.cyan },
        { x: cartX + 190, c: P.accent },
        { x: cartX + 300, c: P.paper },
      ];
      for (const p of people) {
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, benchY - 96, 30, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = P.ink; ctx.lineWidth = 7; ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p.x - 40, benchY);
        ctx.lineTo(p.x - 26, benchY - 68);
        ctx.lineTo(p.x + 26, benchY - 68);
        ctx.lineTo(p.x + 40, benchY);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }

      // Butiran film supaya tidak terlihat seperti vektor kosong
      const img = ctx.getImageData(0, 0, W, H);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * 26;
        d[i] = Math.max(0, Math.min(255, d[i] + n));
        d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
        d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
      }
      ctx.putImageData(img, 0, 0);
    }`,
    /** Delapan ubin alat, urutannya harus sama dengan data equipment. */
    tiles: `(ctx, S, P, index) => {
      const bg = [P.paper2, P.cyan, P.pear, P.paper, P.accent, P.coral, P.paper2, P.cyan][index];
      ctx.fillStyle = bg; ctx.fillRect(0, 0, S, S);
      ctx.strokeStyle = P.ink; ctx.lineWidth = 10; ctx.strokeRect(5, 5, S - 10, S - 10);
      const cx = S / 2, cy = S / 2;
      ctx.lineWidth = 9; ctx.strokeStyle = P.ink; ctx.lineJoin = "round";

      const box = (x, y, w, h, fill) => { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); };
      const circle = (x, y, r, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); };

      if (index === 0) {            // gerobak
        box(cx - 82, cy - 20, 164, 74, P.wood);
        box(cx - 96, cy - 36, 192, 20, P.paper);
        circle(cx - 48, cy + 68, 20, P.ink);
        circle(cx + 48, cy + 68, 20, P.ink);
        ctx.beginPath(); ctx.moveTo(cx - 96, cy - 62); ctx.lineTo(cx + 96, cy - 62); ctx.lineTo(cx + 74, cy - 40); ctx.lineTo(cx - 74, cy - 40); ctx.closePath();
        ctx.fillStyle = P.coral; ctx.fill(); ctx.stroke();
      } else if (index === 1) {     // kursi panjang
        box(cx - 92, cy - 14, 184, 22, P.wood);
        box(cx - 74, cy + 8, 16, 62, P.wood2);
        box(cx + 58, cy + 8, 16, 62, P.wood2);
        box(cx - 92, cy - 74, 184, 16, P.wood2);
      } else if (index === 2) {     // anglo arang
        box(cx - 74, cy - 16, 148, 70, "#3a3a3a");
        ctx.fillStyle = P.ember; ctx.fillRect(cx - 60, cy - 6, 120, 22); ctx.strokeRect(cx - 60, cy - 6, 120, 22);
        for (let i = 0; i < 5; i++) {
          ctx.strokeStyle = P.ink; ctx.lineWidth = 7;
          ctx.beginPath(); ctx.moveTo(cx - 52 + i * 26, cy - 20); ctx.lineTo(cx - 52 + i * 26, cy - 72); ctx.stroke();
          box(cx - 58 + i * 26, cy - 74, 13, 26, P.wood2);
        }
      } else if (index === 3) {     // termos
        box(cx - 42, cy - 66, 84, 132, P.coral);
        box(cx - 50, cy - 84, 100, 20, P.paper);
        ctx.beginPath(); ctx.moveTo(cx + 42, cy - 34); ctx.quadraticCurveTo(cx + 92, cy, cx + 42, cy + 34); ctx.stroke();
      } else if (index === 4) {     // gelas dan piring
        circle(cx - 44, cy + 26, 46, P.paper2);
        box(cx + 18, cy - 40, 56, 86, P.paper2);
        ctx.beginPath(); ctx.moveTo(cx + 74, cy - 16); ctx.quadraticCurveTo(cx + 110, cy + 2, cx + 74, cy + 22); ctx.stroke();
      } else if (index === 5) {     // tenda dan lampu
        ctx.beginPath(); ctx.moveTo(cx - 100, cy - 10); ctx.lineTo(cx, cy - 78); ctx.lineTo(cx + 100, cy - 10); ctx.closePath();
        ctx.fillStyle = P.paper; ctx.fill(); ctx.stroke();
        box(cx - 92, cy - 10, 14, 84, P.wood2);
        box(cx + 78, cy - 10, 14, 84, P.wood2);
        circle(cx, cy + 30, 22, P.pear);
      } else if (index === 6) {     // etalase gorengan
        box(cx - 84, cy - 54, 168, 108, P.paper2);
        ctx.strokeStyle = P.ink; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(cx - 84, cy); ctx.lineTo(cx + 84, cy); ctx.stroke();
        for (let i = 0; i < 3; i++) circle(cx - 48 + i * 48, cy + 28, 17, P.ember);
        for (let i = 0; i < 3; i++) circle(cx - 48 + i * 48, cy - 28, 17, P.pear);
      } else {                      // cooler box
        box(cx - 80, cy - 34, 160, 92, P.cyan);
        box(cx - 88, cy - 54, 176, 22, P.paper2);
        ctx.strokeStyle = P.ink; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(cx - 34, cy - 54); ctx.lineTo(cx - 34, cy + 58); ctx.stroke();
      }

      // Nomor ubin sengaja tidak digambar di sini: UI katalog sudah menimpa
      // badge nomornya sendiri di atas ubin, dua nomor akan bertabrakan.

      const img = ctx.getImageData(0, 0, S, S);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * 20;
        d[i] += n; d[i + 1] += n; d[i + 2] += n;
      }
      ctx.putImageData(img, 0, 0);
    }`,
  },
};

/* ------------------------------------------------------------------ Chrome */

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/opt/pw-browsers/chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  ].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("Chrome/Edge tidak ditemukan. Set CHROME_PATH ke lokasi browser-nya.");
  return found;
}

function renderInChrome(chrome, html, name) {
  const htmlPath = join(workDir, `${name}.html`);
  writeFileSync(htmlPath, html, "utf8");
  const dom = execFileSync(
    chrome,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--allow-file-access-from-files",
      "--virtual-time-budget=20000",
      "--dump-dom",
      pathToFileURL(htmlPath).href,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 512 * 1024 * 1024 },
  );
  rmSync(htmlPath, { force: true });

  const payload = /<pre id="out">([\s\S]*?)<\/pre>/.exec(dom)?.[1];
  if (!payload) throw new Error(`Chrome tidak mengembalikan gambar untuk ${name}.`);
  return JSON.parse(payload.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"'));
}

const page = (body) => `<!doctype html><meta charset="utf-8"><body><pre id="out"></pre><script>
const P = ${JSON.stringify(PALETTE)};
${body}
<\/script></body>`;

function buildHero(chrome, id) {
  const html = page(`
    const c = document.createElement("canvas");
    c.width = ${HERO.width}; c.height = ${HERO.height};
    const ctx = c.getContext("2d");
    (${scenes[id].hero})(ctx, c.width, c.height, P);
    document.getElementById("out").textContent = JSON.stringify(c.toDataURL("image/jpeg", 0.92));
  `);
  return renderInChrome(chrome, html, `${id}-hero`);
}

/**
 * Poster cadangan untuk `public/previews/<slug>.png`.
 *
 * Ringkasan yang sebenarnya dirender di peramban pengunjung dari simulasi yang
 * sedang dibuka (lib/preview-image.ts). Berkas statis ini hanya dipakai sebagai
 * gambar sementara sebelum kanvas selesai, jadi isinya cukup adegan usaha plus
 * angka baseline nasional.
 */
function buildPreview(chrome, id, business) {
  const breakEven = business.fixedBase / (1 - business.variableRate);
  const traffic = business.trafficMode === "member"
    ? Math.ceil(breakEven / business.avgTicket)
    : Math.ceil(breakEven / business.avgTicket / 30);
  const money = (value, decimals = 1) => `Rp${Number(value.toFixed(decimals)).toLocaleString("id-ID")} jt`;

  const facts = [
    ["MODAL AWAL", `${money(business.capex[0], 0)}-${money(business.capex[1], 0).replace("Rp", "")}`],
    ["OMZET TARGET", `${money(business.targetRevenue, 0)}/bln`],
    ["OMZET BEP", money(breakEven)],
    ["TRAFFIC MIN", `${traffic} ${business.trafficLabel}`],
  ];

  const html = page(`
    const W = 1200, H = 1682;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    ctx.fillStyle = P.paper; ctx.fillRect(0, 0, W, H);

    // Adegan usaha di bagian atas
    const scene = document.createElement("canvas");
    scene.width = ${HERO.width}; scene.height = ${HERO.height};
    (${scenes[id].hero})(scene.getContext("2d"), scene.width, scene.height, P);
    // Butiran film bagus untuk JPEG hero, tetapi PNG menyimpannya piksel demi
    // piksel dan berkasnya membengkak belasan kali lipat. Blur tipis lalu
    // kuantisasi warna meredam frekuensi tingginya; untuk ilustrasi datar
    // hasilnya nyaris tidak berbeda dilihat mata.
    const sceneH = Math.round(W * scene.height / scene.width);
    ctx.filter = "blur(1.1px)";
    ctx.drawImage(scene, 0, 0, scene.width, scene.height, 0, 0, W, sceneH);
    ctx.filter = "none";
    const band = ctx.getImageData(0, 0, W, sceneH);
    const bd = band.data;
    const STEP = 16;
    for (let i = 0; i < bd.length; i += 4) {
      bd[i] = Math.round(bd[i] / STEP) * STEP;
      bd[i + 1] = Math.round(bd[i + 1] / STEP) * STEP;
      bd[i + 2] = Math.round(bd[i + 2] / STEP) * STEP;
    }
    ctx.putImageData(band, 0, 0);

    let y = Math.round(W * scene.height / scene.width);
    ctx.fillStyle = P.ink; ctx.fillRect(0, y, W, 6);
    y += 70;

    ctx.fillStyle = P.accent; ctx.fillRect(56, y - 34, 300, 40);
    ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.strokeRect(58, y - 32, 296, 36);
    ctx.fillStyle = P.ink; ctx.font = "800 20px Consolas, monospace";
    ctx.fillText(${JSON.stringify(business.category.toUpperCase())}, 72, y - 6);

    y += 74;
    ctx.fillStyle = P.ink; ctx.font = "800 76px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(${JSON.stringify(business.name)}, 56, y);

    y += 52;
    ctx.fillStyle = "#5f5f56"; ctx.font = "500 26px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(${JSON.stringify(business.oneLine.slice(0, 62))}, 56, y);

    y += 60;
    const facts = ${JSON.stringify(facts)};
    const cardW = (W - 112 - 24) / 2, cardH = 168;
    const tint = [P.paper2, "#d9fafc", "#eafdb8", "#fff3c4"];
    facts.forEach((f, i) => {
      const x = 56 + (i % 2) * (cardW + 24);
      const cy = y + Math.floor(i / 2) * (cardH + 24);
      ctx.fillStyle = P.ink; ctx.fillRect(x + 8, cy + 8, cardW, cardH);
      ctx.fillStyle = tint[i]; ctx.fillRect(x, cy, cardW, cardH);
      ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.strokeRect(x + 2.5, cy + 2.5, cardW - 5, cardH - 5);
      ctx.fillStyle = "#5f5f56"; ctx.font = "700 20px Consolas, monospace";
      ctx.fillText(f[0], x + 26, cy + 52);
      ctx.fillStyle = P.ink;
      let size = 44;
      do { ctx.font = "800 " + size + "px Consolas, monospace"; size -= 2; }
      while (ctx.measureText(f[1]).width > cardW - 52 && size > 16);
      ctx.fillText(f[1], x + 26, cy + 116);
    });

    y += (cardH + 24) * 2 + 40;
    ctx.fillStyle = P.ink; ctx.fillRect(0, H - 132, W, 132);
    ctx.fillStyle = P.accent; ctx.font = "800 22px Consolas, monospace";
    ctx.fillText("CEK BISNIS · RINGKASAN USAHA", 56, H - 78);
    ctx.fillStyle = "#a5a59a"; ctx.font = "500 20px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("Estimasi indikatif. Buka situs untuk simulasi per kota dan skala.", 56, H - 44);

    document.getElementById("out").textContent = JSON.stringify(c.toDataURL("image/png"));
  `);
  return renderInChrome(chrome, html, `${id}-preview`);
}

function buildAtlas(chrome, id) {
  const html = page(`
    const S = ${TILE};
    const c = document.createElement("canvas");
    c.width = S * ${ATLAS.cols}; c.height = S * ${ATLAS.rows};
    const ctx = c.getContext("2d");
    for (let i = 0; i < ${ATLAS.cols * ATLAS.rows}; i++) {
      const tile = document.createElement("canvas");
      tile.width = S; tile.height = S;
      (${scenes[id].tiles})(tile.getContext("2d"), S, P, i);
      ctx.drawImage(tile, (i % ${ATLAS.cols}) * S, Math.floor(i / ${ATLAS.cols}) * S);
    }
    document.getElementById("out").textContent = JSON.stringify(c.toDataURL("image/webp", 0.95));
  `);
  return renderInChrome(chrome, html, `${id}-atlas`);
}

const writeDataUrl = (dataUrl, outPath) => {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const buffer = Buffer.from(base64, "base64");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, buffer);
  return buffer.length;
};

/* -------------------------------------------------------------------- main */

const targets = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const ids = targets.length ? targets : Object.keys(scenes);
const unknown = ids.filter((id) => !scenes[id]);
if (unknown.length) {
  console.error(`Tidak ada ilustrasi untuk: ${unknown.join(", ")}. Pilihan: ${Object.keys(scenes).join(", ")}`);
  process.exit(1);
}

const chrome = findChrome();
mkdirSync(workDir, { recursive: true });

const businessData = JSON.parse(readFileSync(join(root, "data/business-data.json"), "utf8"));

for (const id of ids) {
  const business = businessData.businesses.find((item) => item.id === id);
  if (!business) throw new Error(`Model usaha "${id}" belum ada di data/business-data.json.`);

  const heroBytes = writeDataUrl(buildHero(chrome, id), join(publicDir, "businesses", `${business.slug}.jpg`));
  const atlasBytes = writeDataUrl(buildAtlas(chrome, id), join(publicDir, "equipment", `${business.slug}-atlas.webp`));
  const previewBytes = writeDataUrl(buildPreview(chrome, id, business), join(publicDir, "previews", `${business.slug}.png`));
  console.log(
    `ok  ${id.padEnd(14)} hero ${String(Math.round(heroBytes / 1024)).padStart(4)} KB`
    + `   atlas ${String(Math.round(atlasBytes / 1024)).padStart(4)} KB`
    + `   preview ${String(Math.round(previewBytes / 1024)).padStart(4)} KB`,
  );
}

rmSync(workDir, { recursive: true, force: true });
