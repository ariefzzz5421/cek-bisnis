"use client";

import Image from "next/image";
import { useState } from "react";
import { BusinessIcon } from "@/components/BusinessIcon";
import { brandLogoAssets } from "@/lib/brand-logo-assets";
import type { BusinessId } from "@/lib/business-data";
import { accessibleBrandInk, readableInkOn, type Franchise } from "@/lib/franchise-data";

/** Batas pelebaran ubin untuk wordmark, supaya baris kartu tetap rapi. */
const MAX_ASPECT = 2.6;
const WIDE_THRESHOLD = 1.35;

/** Logo putih/terang yang memang dibuat untuk latar gelap. */
const DARK_SURFACE_BRANDS = new Set<string>(["rocket-chicken"]);

/**
 * Beberapa sumber publik terbaik berupa foto signage/storefront, bukan file
 * logo transparan. Mereka dipotong secara terkendali supaya identitas merek
 * tetap terbaca pada tile kecil dan tidak berubah menjadi foto mini yang sulit
 * dikenali.
 */
const COVER_BRANDS = new Set<string>([
  "212-mart",
  "griya-farma",
  "optik-loka",
  "viva-generik",
]);

const OBJECT_POSITION: Record<string, string> = {
  "212-mart": "50% 24%",
  "griya-farma": "50% 28%",
  "optik-loka": "50% 34%",
  "viva-generik": "50% 24%",
};

/** Asset ini adalah badge nama terverifikasi, bukan logo resmi mandiri. */
const VERIFIED_NAME_ASSETS = new Set<string>(["apotek-f21"]);

export type BrandLogoProps = {
  franchise?: Franchise;
  businessId?: BusinessId;
  name: string;
  size?: number;
};

export function BrandLogo({ franchise, businessId, name, size = 56 }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  const asset = franchise ? brandLogoAssets[franchise.id] : undefined;
  const logoSource = asset ? `/brands/franchises/${asset.file}` : franchise?.logoUrl;
  const showLogo = Boolean(logoSource) && !failed;
  const franchiseId = franchise?.id ?? "";

  const initials = franchise?.initials ?? name.slice(0, 2).toUpperCase();
  const aspect = showLogo ? (asset ? asset.width / asset.height : 1) : 0.45 + initials.length * 0.42;
  const tileWidth = aspect > WIDE_THRESHOLD
    ? Math.round(size * Math.min(aspect, MAX_ASPECT))
    : size;

  const dark = DARK_SURFACE_BRANDS.has(franchiseId);
  const cover = COVER_BRANDS.has(franchiseId);
  const padding = businessId
    ? Math.round(size * 0.18)
    : cover
      ? 0
      : showLogo
        ? Math.max(5, Math.round(size * 0.12))
        : 2;
  const radius = Math.max(8, Math.round(size * 0.16));
  const sourceLabel = VERIFIED_NAME_ASSETS.has(franchiseId)
    ? "verified-name"
    : showLogo
      ? "logo"
      : "monogram";

  return (
    <span
      className={`brand-logo ${dark ? "brand-logo--dark" : ""} ${showLogo ? "" : "brand-logo--monogram"}`}
      style={{
        "--brand": franchise?.brandColor ?? "var(--color-accent)",
        "--brand-ink": franchise ? accessibleBrandInk(franchise.brandColor) : "var(--color-ink)",
        "--monogram-size": `${Math.max(11, Math.round(size * 0.42))}px`,
        width: tileWidth,
        height: size,
        padding,
        borderRadius: radius,
      } as React.CSSProperties}
      role="img"
      aria-label={showLogo ? `Identitas ${name}` : `Identitas ${name}`}
      data-source={sourceLabel}
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
          referrerPolicy="no-referrer"
          style={{
            width: "100%",
            height: "100%",
            objectFit: cover ? "cover" : "contain",
            objectPosition: OBJECT_POSITION[franchiseId] ?? "center",
          }}
          onError={() => setFailed(true)}
        />
      ) : (
        <b>{initials}</b>
      )}
    </span>
  );
}

export const brandMonogramInk = readableInkOn;
