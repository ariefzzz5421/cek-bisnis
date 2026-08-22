"use client";

import Image from "next/image";
import { useState } from "react";
import { BusinessIcon } from "@/components/BusinessIcon";
import { brandLogoAssets } from "@/lib/brand-logo-assets";
import type { BusinessId } from "@/lib/business-data";
import { accessibleBrandInk, readableInkOn, type Franchise } from "@/lib/franchise-data";

/**
 * Ubin identitas untuk satu entitas: merek waralaba atau model usaha mandiri.
 *
 * Satu komponen dipakai di kartu compare, kartu waralaba, tabel, dan daftar
 * terkait supaya ukuran, padding, dan perilaku fallback-nya tidak lagi
 * diturunkan ulang di tiap tempat.
 *
 * Urutan sumber gambar:
 *   1. berkas logo lokal (lib/brand-logo-assets.ts, dibangkitkan skrip)
 *   2. URL logo resmi yang masih di-hotlink (`logoUrl`)
 *   3. monogram inisial di atas warna merek
 *
 * Ilustrasi kategori sengaja tidak lagi dipakai sebagai fallback: satu gambar
 * yang sama untuk sepuluh merek justru membuat merek sulit dibedakan. Monogram
 * berwarna merek memberi tiap merek tampilan yang khas.
 *
 * Logo tidak pernah dipotong atau ditarik. Tingginya dikunci ke `size`, dan
 * logo berbentuk wordmark (jauh lebih lebar daripada tinggi) mendapat ubin
 * yang lebih lebar supaya tetap terbaca, bukan diperkecil di kotak persegi.
 */

/** Batas pelebaran ubin untuk wordmark, supaya barisnya tetap rapi. */
const MAX_ASPECT = 2.6;
/** Di bawah ini logo dianggap cukup persegi dan ubinnya tetap persegi. */
const WIDE_THRESHOLD = 1.35;

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
  const [failed, setFailed] = useState(false);

  const asset = franchise ? brandLogoAssets[franchise.id] : undefined;
  const logoSource = asset ? `/brands/franchises/${asset.file}` : franchise?.logoUrl;
  const showLogo = Boolean(logoSource) && !failed;

  const initials = franchise?.initials ?? name.slice(0, 2).toUpperCase();
  /* Monogram juga butuh ubin yang lebih lebar daripada tinggi: dua atau tiga
     huruf di kotak persegi terpotong di ubin kecil seperti baris pemilih. */
  const aspect = showLogo ? (asset ? asset.width / asset.height : 1) : 0.45 + initials.length * 0.42;
  const tileWidth =
    aspect > WIDE_THRESHOLD ? Math.round(size * Math.min(aspect, MAX_ASPECT)) : size;

  const dark = franchise ? DARK_SURFACE_BRANDS.has(franchise.id) : false;
  const padding = showLogo ? Math.max(5, Math.round(size * 0.12)) : 2;
  const radius = Math.max(8, Math.round(size * 0.16));

  return (
    <span
      className={`brand-logo ${dark ? "brand-logo--dark" : ""} ${showLogo ? "" : "brand-logo--monogram"}`}
      style={{
        "--brand": franchise?.brandColor ?? "var(--color-accent)",
        "--brand-ink": franchise ? accessibleBrandInk(franchise.brandColor) : "var(--color-ink)",
        "--monogram-size": `${Math.max(11, Math.round(size * 0.42))}px`,
        width: tileWidth,
        height: size,
        padding: businessId ? Math.round(size * 0.18) : padding,
        borderRadius: radius,
      } as React.CSSProperties}
      role="img"
      aria-label={showLogo ? `Logo ${name}` : `Identitas ${name}`}
      data-source={showLogo ? "official" : "monogram"}
    >
      {businessId ? (
        <BusinessIcon id={businessId} size={Math.round(size * 0.52)} />
      ) : showLogo ? (
        <Image
          src={logoSource as string}
          alt=""
          width={tileWidth}
          height={size}
          unoptimized
          /* Sebagian logo masih di-hotlink dari server brand. Tanpa referrer,
             proteksi hotlink di sisi mereka lebih jarang menolak permintaan. */
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <b>{initials}</b>
      )}
    </span>
  );
}

/** Warna tinta monogram, diekspor agar pemakai lain bisa menyamakannya. */
export const brandMonogramInk = readableInkOn;
