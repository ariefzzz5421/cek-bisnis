"use client";

import Image from "next/image";
import { useState } from "react";
import { BusinessIcon } from "@/components/BusinessIcon";
import type { BusinessId } from "@/lib/business-data";
import { readableInkOn, type Franchise } from "@/lib/franchise-data";

/**
 * Ubin identitas untuk satu entitas: merek waralaba atau model usaha mandiri.
 *
 * Satu komponen dipakai di kartu compare, kartu waralaba, tabel, dan daftar
 * terkait supaya ukuran, padding, dan perilaku fallback-nya tidak lagi
 * diturunkan ulang di tiap tempat.
 *
 * Urutan sumber gambar:
 *   1. berkas logo lokal (`logoFile`) atau URL logo resmi (`logoUrl`)
 *   2. ilustrasi kategori buatan Cek Bisnis
 *   3. monogram inisial di atas warna merek
 *
 * Logo tidak pernah dipotong atau ditarik: kotaknya tetap persegi, gambarnya
 * `object-fit: contain` dengan padding aman di dalam bingkai.
 */

/** Logo yang diunggah manual, dipetakan di layer presentasi. */
const uploadedLogoById: Record<string, string> = {
  "ayam-geprek-sai": "ayam-geprek-sai.webp",
  bingxue: "bingxue-user.webp",
  "doyan-ayam": "doyan-ayam.webp",
  "geprek-bensu": "geprek-bensu.webp",
  "janji-jiwa": "janji-jiwa.webp",
  jnt: "jnt-express.webp",
  mrklin: "mr-klin.webp",
  "nyoklat-klasik": "nyoklat-klasik.webp",
  "point-coffee": "point-coffee.webp",
  "tahu-go": "tahu-go.webp",
};

/**
 * Merek yang logonya sendiri berwarna terang atau putih perlu alas gelap;
 * kalau tidak, siluetnya hilang di atas kertas. Sisanya memakai alas terang
 * netral yang aman untuk logo transparan maupun berwarna.
 */
const DARK_SURFACE_BRANDS = new Set<string>([]);

export type BrandLogoProps = {
  /** Merek waralaba, kalau entitasnya waralaba. */
  franchise?: Franchise;
  /** Model usaha mandiri, kalau entitasnya bukan waralaba. */
  businessId?: BusinessId;
  /** Nama entitas, dipakai untuk label aksesibilitas dan monogram. */
  name: string;
  size?: number;
};

export function BrandLogo({ franchise, businessId, name, size = 56 }: BrandLogoProps) {
  const [officialFailed, setOfficialFailed] = useState(false);
  const [categoryFailed, setCategoryFailed] = useState(false);

  const uploaded = franchise ? uploadedLogoById[franchise.id] : undefined;
  const logoSource = franchise
    ? uploaded
      ? `/brands/franchises/${uploaded}`
      : franchise.logoFile
        ? `/brands/franchises/${franchise.logoFile}`
        : franchise.logoUrl
    : undefined;

  const categorySource = franchise ? `/brands/categories/${franchise.category}.webp` : undefined;
  const showLogo = Boolean(logoSource) && !officialFailed;
  const showCategory = Boolean(categorySource) && !showLogo && !categoryFailed;

  const dark = franchise ? DARK_SURFACE_BRANDS.has(franchise.id) : false;
  const padding = Math.max(5, Math.round(size * 0.12));
  const radius = Math.max(8, Math.round(size * 0.16));

  return (
    <span
      className={`brand-logo ${dark ? "brand-logo--dark" : ""}`}
      style={{
        "--brand": franchise?.brandColor ?? "var(--color-accent)",
        width: size,
        height: size,
        padding: businessId ? Math.round(size * 0.18) : padding,
        borderRadius: radius,
      } as React.CSSProperties}
      role="img"
      aria-label={showLogo ? `Logo ${name}` : `Identitas ${name}`}
      data-source={showLogo ? "official" : showCategory ? "illustration" : "monogram"}
    >
      {businessId ? (
        <BusinessIcon id={businessId} size={Math.round(size * 0.52)} />
      ) : showLogo || showCategory ? (
        <Image
          src={(showLogo ? logoSource : categorySource) as string}
          alt=""
          width={size}
          height={size}
          unoptimized
          /* Sebagian logo masih di-hotlink dari server brand. Tanpa referrer,
             proteksi hotlink di sisi mereka lebih jarang menolak permintaan. */
          referrerPolicy="no-referrer"
          onError={() => (showLogo ? setOfficialFailed(true) : setCategoryFailed(true))}
        />
      ) : (
        <b>{franchise?.initials ?? name.slice(0, 2).toUpperCase()}</b>
      )}
    </span>
  );
}

/** Warna tinta monogram, diekspor agar pemakai lain bisa menyamakannya. */
export const brandMonogramInk = readableInkOn;
