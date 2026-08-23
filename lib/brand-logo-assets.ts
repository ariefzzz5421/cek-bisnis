/**
 * Brand logo assets rendered by BrandLogo.
 *
 * Local manual/package assets live in public/brands/franchises/. A second set
 * is refreshed by scripts/sync-researched-brand-logos.mjs before production
 * builds so the browser never has to hotlink third-party logo URLs directly.
 */

export type BrandLogoAsset = {
  file: string;
  width: number;
  height: number;
};

export const brandLogoAssets: Record<string, BrandLogoAsset> = {
  "212-mart": { file: "212-mart.jpg", width: 900, height: 540 },
  "alfamart": { file: "alfamart.png", width: 240, height: 77 },
  "alfamidi": { file: "alfamidi.svg", width: 80, height: 19 },
  "anteraja": { file: "anteraja.svg", width: 80, height: 32 },
  "apotek-f21": { file: "apotek-f21.svg", width: 640, height: 240 },
  "ayam-geprek-sai": { file: "ayam-geprek-sai.webp", width: 116, height: 138 },
  "baba-rafi": { file: "baba-rafi-researched.jpg", width: 800, height: 450 },
  "basmalah": { file: "basmalah-mart.png", width: 720, height: 240 },
  "bingxue": { file: "bingxue-user.webp", width: 600, height: 179 },
  "century-pharma": { file: "century-pharma.png", width: 640, height: 360 },
  "dbesto": { file: "dbesto.jpg", width: 800, height: 450 },
  "doyan-ayam": { file: "doyan-ayam.webp", width: 496, height: 560 },
  "es-teh-indonesia": { file: "esteh-indonesia.svg", width: 179, height: 65 },
  "familymart": { file: "familymart.svg", width: 57, height: 62 },
  "farmapoint": { file: "farmapoint.jpg", width: 640, height: 360 },
  "geprek-bensu": { file: "geprek-bensu.webp", width: 164, height: 148 },
  "griya-farma": { file: "griya-farma.jpg", width: 800, height: 500 },
  "haus": { file: "haus.jpg", width: 600, height: 600 },
  "hisana": { file: "hisana.jpg", width: 800, height: 500 },
  "indomaret": { file: "indomaret.svg", width: 80, height: 27 },
  "janji-jiwa": { file: "janji-jiwa-researched.jpg", width: 640, height: 360 },
  "jne": { file: "jne.svg", width: 80, height: 34 },
  "jnt": { file: "jnt-express.webp", width: 700, height: 150 },
  "kimia-farma": { file: "kimia-farma.jpg", width: 800, height: 420 },
  "kopigo": { file: "kopigo.svg", width: 232.5, height: 84.75 },
  "lawson": { file: "lawson.svg", width: 80, height: 13 },
  "lion-parcel": { file: "lion-parcel.svg", width: 80, height: 19 },
  "mrklin": { file: "mr-klin.webp", width: 300, height: 113 },
  "ninja-xpress": { file: "ninja-xpress.svg", width: 80, height: 35 },
  "nyoklat-klasik": { file: "nyoklat-klasik.webp", width: 300, height: 122 },
  "omi": { file: "omi.svg", width: 80, height: 28 },
  "optik-loka": { file: "optik-loka.jpg", width: 800, height: 450 },
  "optik-melawai": { file: "optik-melawai.jpg", width: 800, height: 600 },
  "pasfarma": { file: "pasfarma.jpg", width: 800, height: 600 },
  "point-coffee": { file: "point-coffee.webp", width: 99, height: 110 },
  "rocket-chicken": { file: "rocket-chicken.png", width: 6300, height: 1856 },
  "sabana": { file: "sabana-researched.png", width: 720, height: 260 },
  "sicepat": { file: "sicepat.svg", width: 78, height: 80 },
  "tahu-go": { file: "tahu-go.webp", width: 560, height: 528 },
  "teh-poci": { file: "esteh-poci.png", width: 389, height: 318 },
  "viva-generik": { file: "viva-generik.jpg", width: 900, height: 600 },
  "wahana": { file: "wahana.svg", width: 80, height: 25 },
  "yomart": { file: "yomart.svg", width: 80, height: 18 },
};
