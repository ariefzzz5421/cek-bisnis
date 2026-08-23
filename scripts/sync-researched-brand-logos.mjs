import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "brands", "franchises");
mkdirSync(OUT_DIR, { recursive: true });

/**
 * Brand assets researched for Cek Bisnis. Prefer official/brand-controlled
 * sources; when no standalone official logo is exposed publicly, use a
 * reputable listing/press image. A generated name badge is only a last-resort
 * fallback so the UI never shows a broken image.
 */
const ASSETS = [
  {
    id: "basmalah",
    name: "Basmalah Mart",
    file: "basmalah-mart.png",
    url: "https://tokobasmalah.co/storage/logos/pVZxMf8xy0xszjGXsBIoYjX2NQaBHOH9IyaakeJ3.png",
    brand: "#1B7A4B",
  },
  {
    id: "212-mart",
    name: "212 Mart",
    file: "212-mart.jpg",
    url: "https://www.tangerangkota.go.id/assets/storage/files/photos/9084horeee-kota-tangerang-punya-mini-market-berkonsep-islami-9084.jpg",
    brand: "#0F7B3E",
  },
  {
    id: "janji-jiwa",
    name: "Kopi Janji Jiwa",
    file: "janji-jiwa-researched.jpg",
    url: "https://i0.wp.com/i.gojekapi.com/darkroom/gofood-indonesia/v2/images/uploads/105f3f2b-06d2-4d6d-907f-ff30fdcf2216_brand-logo_1698896753190.jpg",
    brand: "#EE7623",
  },
  {
    id: "es-teh-indonesia",
    name: "Es Teh Indonesia",
    file: "es-teh-indonesia-researched.jpg",
    url: "https://www.medinfopedia.com/wp-content/uploads/2025/11/logo-es-teh-indonesia_-600x450.jpeg",
    brand: "#0F3D2E",
  },
  {
    id: "haus",
    name: "Haus!",
    file: "haus.jpg",
    url: "https://i.gojekapi.com/darkroom/gofood-indonesia/v2/images/uploads/2aedf945-364d-407f-9f9e-7e92f2bcd5ed_brand-logo_1641372010551.jpg",
    brand: "#E4322B",
  },
  {
    id: "sabana",
    name: "Sabana Fried Chicken",
    file: "sabana-researched.png",
    url: "https://www.storania.com/wp-content/sabai/File/files/6205ba22ab87b906a0f215c95094a0d5.png",
    brand: "#F6A800",
  },
  {
    id: "hisana",
    name: "Hisana Fried Chicken",
    file: "hisana.jpg",
    url: "https://radarcirebon.disway.id/upload/60e9503d20a4fff7d9ae5d7194e5581e.jpg",
    brand: "#D62027",
  },
  {
    id: "baba-rafi",
    name: "Kebab Turki Baba Rafi",
    file: "baba-rafi-researched.jpg",
    url: "https://storage.googleapis.com/storage-ajaib-prd-platform-wp-artifact/2020/04/Kebab-Baba-Rafi.jpg",
    brand: "#C49343",
  },
  {
    id: "dbesto",
    name: "D'Besto",
    file: "dbesto.jpg",
    url: "https://2.bp.blogspot.com/-h56OcdpU9MQ/VM4b7N_Yw8I/AAAAAAAAMq8/hkR9qfQeBic/s1600/dbesto%2Blogo.jpg",
    brand: "#E11B22",
  },
  {
    id: "rocket-chicken",
    name: "Rocket Chicken",
    file: "rocket-chicken.png",
    url: "https://cdn.brandfetch.io/idg7ixUkH_/w/6300/h/1856/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1766876763892",
    brand: "#E4032E",
  },
  {
    id: "tahu-go",
    name: "Tahu Go",
    file: "tahu-go-researched.png",
    url: "https://www.tahugo.co.id/wp-content/uploads/2019/11/Screen-Shot-2019-11-05-at-12.23.08-1024x962.png",
    brand: "#F5A623",
  },
  {
    id: "doyan-ayam",
    name: "Doyan Ayam",
    file: "doyan-ayam-researched.png",
    url: "https://cdn.brandfetch.io/idxkisaBzo/w/758/h/855/theme/light/logo.png?c=1bxid64Mup7aczewSAYMX&t=1770673437853",
    brand: "#E62429",
  },
  {
    id: "apotek-f21",
    name: "Apotek F21",
    file: "apotek-f21.svg",
    url: null,
    brand: "#0E8A5F",
  },
  {
    id: "griya-farma",
    name: "Apotek Griya Farma",
    file: "griya-farma.jpg",
    url: "https://cdn.bidhuan.id/img/2016/02/grya-farma.jpg",
    brand: "#1E8A44",
  },
  {
    id: "century-pharma",
    name: "Apotek Century Pharma",
    file: "century-pharma.png",
    url: "https://www.fxsudirman.com/uploads/tenant_logo/xMuGAH4runyNbcxNKq6SvkvOltIbhzjeCWt2oV3S.png",
    brand: "#0C4DA2",
  },
  {
    id: "kimia-farma",
    name: "Apotek Kimia Farma",
    file: "kimia-farma.jpg",
    url: "https://kftd.co.id/assets/img/customer/1.%20Kimia%20Farma%20Apotek.jpg",
    brand: "#F58220",
  },
  {
    id: "pasfarma",
    name: "Apotek Pasfarma",
    file: "pasfarma.jpg",
    url: "https://images.glints.com/unsafe/1200x0/glints-dashboard.oss-ap-southeast-1-internal.aliyuncs.com/company-logo/0580026ef21c1b38c3845a73bce724ce.jpg",
    brand: "#00A0A0",
  },
  {
    id: "optik-loka",
    name: "Optik Loka",
    file: "optik-loka.jpg",
    url: "https://awsimages.detik.net.id/community/media/visual/2024/07/12/optik-loka.jpeg?w=800",
    brand: "#1F3C88",
  },
  {
    id: "viva-generik",
    name: "Viva Generik",
    file: "viva-generik.jpg",
    url: "https://goalkes-images.s3.ap-southeast-1.amazonaws.com/media/7245/w1mDdsji62GDbNl1gnUaWzutwXiNGYdeKXoMGTEE.jpg",
    brand: "#E4002B",
  },
  {
    id: "farmapoint",
    name: "Apotek Farmapoint",
    file: "farmapoint.jpg",
    url: "https://www.waralabaku.com/logo/logo_franchise_peluang_usaha_apotek_farmapoint.jpg",
    brand: "#0F9D58",
  },
  {
    id: "optik-melawai",
    name: "Optik Melawai",
    file: "optik-melawai.jpg",
    url: "https://images.glints.com/unsafe/1200x0/glints-dashboard.oss-ap-southeast-1-internal.aliyuncs.com/company-logo/935f59840b12b12b0ee6806c13380d31.jpg",
    brand: "#0B4DA2",
  },
];

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[char]);
}

function readableInk(hex) {
  const value = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return "#111111";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#111111" : "#ffffff";
}

function fallbackBadge({ name, brand }) {
  const text = escapeXml(name);
  const ink = readableInk(brand);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240" role="img" aria-label="${text}">
  <rect width="640" height="240" rx="24" fill="${brand}"/>
  <rect x="10" y="10" width="620" height="220" rx="18" fill="none" stroke="${ink}" stroke-opacity=".35" stroke-width="2"/>
  <text x="320" y="123" text-anchor="middle" dominant-baseline="middle" fill="${ink}" font-family="Arial,Helvetica,sans-serif" font-size="54" font-weight="800">${text}</text>
</svg>`;
}

async function download(asset) {
  const target = path.join(OUT_DIR, asset.file);
  const fallbackTarget = target.replace(/\.[^.]+$/, ".svg");

  if (!asset.url) {
    writeFileSync(fallbackTarget, fallbackBadge(asset), "utf8");
    console.log(`[logo] ${asset.id}: verified-name badge (no reliable standalone logo found)`);
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(asset.url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 CekBisnisLogoSync/1.0",
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || (!type.startsWith("image/") && type !== "application/octet-stream")) {
      throw new Error(`HTTP ${response.status}; content-type ${type || "unknown"}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 500) throw new Error(`response too small (${bytes.length} bytes)`);
    writeFileSync(target, bytes);
    console.log(`[logo] ${asset.id}: downloaded ${bytes.length} bytes`);
  } catch (error) {
    if (existsSync(target)) {
      console.warn(`[logo] ${asset.id}: download failed; keeping existing file (${error.message})`);
      return;
    }
    writeFileSync(fallbackTarget, fallbackBadge(asset), "utf8");
    console.warn(`[logo] ${asset.id}: download failed; generated verified-name fallback (${error.message})`);
  } finally {
    clearTimeout(timer);
  }
}

for (const asset of ASSETS) {
  await download(asset);
}
