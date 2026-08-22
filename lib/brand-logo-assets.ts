/**
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
  "alfamart": { file: "alfamart.png", width: 240, height: 77 },
  "alfamidi": { file: "alfamidi.svg", width: 80, height: 19 },
  "anteraja": { file: "anteraja.svg", width: 80, height: 32 },
  "ayam-geprek-sai": { file: "ayam-geprek-sai.webp", width: 116, height: 138 },
  "baba-rafi": { file: "baba-rafi.png", width: 150, height: 79 },
  "bingxue": { file: "bingxue-user.webp", width: 600, height: 179 },
  "doyan-ayam": { file: "doyan-ayam.webp", width: 496, height: 560 },
  "es-teh-indonesia": { file: "esteh-indonesia.svg", width: 179, height: 65 },
  "familymart": { file: "familymart.svg", width: 57, height: 62 },
  "geprek-bensu": { file: "geprek-bensu.webp", width: 164, height: 148 },
  "indomaret": { file: "indomaret.svg", width: 80, height: 27 },
  "janji-jiwa": { file: "janji-jiwa.webp", width: 560, height: 433 },
  "jne": { file: "jne.svg", width: 80, height: 34 },
  "jnt": { file: "jnt-express.webp", width: 700, height: 150 },
  "kopigo": { file: "kopigo.svg", width: 232.5, height: 84.749999 },
  "lawson": { file: "lawson.svg", width: 80, height: 13 },
  "lion-parcel": { file: "lion-parcel.svg", width: 80, height: 19 },
  "mrklin": { file: "mr-klin.webp", width: 300, height: 113 },
  "ninja-xpress": { file: "ninja-xpress.svg", width: 80, height: 35 },
  "nyoklat-klasik": { file: "nyoklat-klasik.webp", width: 300, height: 122 },
  "omi": { file: "omi.svg", width: 80, height: 28 },
  "point-coffee": { file: "point-coffee.webp", width: 99, height: 110 },
  "sabana": { file: "sabana.webp", width: 300, height: 90 },
  "sicepat": { file: "sicepat.svg", width: 78, height: 80 },
  "tahu-go": { file: "tahu-go.webp", width: 560, height: 528 },
  "teh-poci": { file: "esteh-poci.png", width: 389, height: 318 },
  "wahana": { file: "wahana.svg", width: 80, height: 25 },
  "yomart": { file: "yomart.svg", width: 80, height: 18 },
};
