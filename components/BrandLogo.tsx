"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { BusinessIcon } from "@/components/BusinessIcon";
import { brandLogoAssets } from "@/lib/brand-logo-assets";
import type { BusinessId } from "@/lib/business-data";
import { accessibleBrandInk, readableInkOn, type Franchise } from "@/lib/franchise-data";

/** Keep wordmarks readable without letting the logo tile dominate the card. */
const MAX_ASPECT = 2.65;
const WIDE_THRESHOLD = 1.28;

/**
 * Preferred public logo sources for brands whose old local conversion did not
 * render reliably in-browser. Local files remain the second candidate, so a
 * temporary remote failure never leaves the card blank.
 */
const SOURCE_OVERRIDES: Record<string, string> = {
  "tahu-go": "https://www.tahugo.co.id/wp-content/uploads/2019/11/Screen-Shot-2019-11-05-at-12.23.08-1024x962.png",
  "doyan-ayam": "https://cdn.brandfetch.io/idxkisaBzo/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1770673437960",
};

/** Remote assets do not expose intrinsic dimensions to this component. */
const REMOTE_ASPECT_HINTS: Record<string, number> = {
  "simply-fresh": 2.55,
  "tahu-go": 1.06,
  "doyan-ayam": 1,
};

/** White/light marks need a deliberate brand surface instead of cream paper. */
const SURFACE_COLORS: Record<string, string> = {
  "es-teh-indonesia": "#0f3d2e",
  "rocket-chicken": "#171717",
  "sabana": "#b41920",
  "simply-fresh": "#d71920",
  "tahu-go": "#e8c47e",
  "doyan-ayam": "#e42a2d",
};

/** Per-brand breathing room for unusual logo artwork. */
const PADDING_RATIOS: Record<string, number> = {
  "simply-fresh": 0.045,
  "sabana": 0.055,
  "janji-jiwa": 0.09,
  "tahu-go": 0.025,
  "doyan-ayam": 0.025,
  "century-pharma": 0.08,
  "kimia-farma": 0.08,
  "griya-farma": 0.03,
};

/** Photo/signage sources are intentionally cropped to keep the brand readable. */
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

/** This asset is a verified-name badge, not a standalone official mark. */
const VERIFIED_NAME_ASSETS = new Set<string>(["apotek-f21"]);

export type BrandLogoProps = {
  franchise?: Franchise;
  businessId?: BusinessId;
  name: string;
  size?: number;
};

export function BrandLogo({ franchise, businessId, name, size = 56 }: BrandLogoProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const franchiseId = franchise?.id ?? "";
  const asset = franchise ? brandLogoAssets[franchise.id] : undefined;

  const logoSources = useMemo(() => {
    const candidates = [
      franchiseId ? SOURCE_OVERRIDES[franchiseId] : undefined,
      asset ? `/brands/franchises/${asset.file}` : undefined,
      franchise?.logoUrl,
    ].filter((source): source is string => Boolean(source));
    return [...new Set(candidates)];
  }, [asset, franchise?.logoUrl, franchiseId]);

  const logoSource = logoSources[sourceIndex];
  const showLogo = Boolean(logoSource);
  const initials = franchise?.initials ?? name.slice(0, 2).toUpperCase();

  const aspect = showLogo
    ? SOURCE_OVERRIDES[franchiseId] === logoSource
      ? REMOTE_ASPECT_HINTS[franchiseId] ?? 1
      : asset && logoSource === `/brands/franchises/${asset.file}`
        ? asset.width / asset.height
        : REMOTE_ASPECT_HINTS[franchiseId] ?? 1
    : 0.45 + initials.length * 0.42;

  const tileWidth = aspect > WIDE_THRESHOLD
    ? Math.round(size * Math.min(aspect, MAX_ASPECT))
    : size;

  const cover = COVER_BRANDS.has(franchiseId);
  const ratio = PADDING_RATIOS[franchiseId] ?? 0.11;
  const padding = businessId
    ? Math.round(size * 0.18)
    : cover
      ? 0
      : showLogo
        ? Math.max(2, Math.round(size * ratio))
        : 2;

  const surface = SURFACE_COLORS[franchiseId] ?? "#fffdf7";
  const radius = Math.max(8, Math.round(size * 0.16));
  const sourceLabel = VERIFIED_NAME_ASSETS.has(franchiseId)
    ? "verified-name"
    : showLogo
      ? "logo"
      : "monogram";

  return (
    <span
      className={`brand-logo ${showLogo ? "" : "brand-logo--monogram"}`}
      style={{
        "--brand": franchise?.brandColor ?? "var(--color-accent)",
        "--brand-ink": franchise ? accessibleBrandInk(franchise.brandColor) : "var(--color-ink)",
        "--monogram-size": `${Math.max(11, Math.round(size * 0.42))}px`,
        width: tileWidth,
        height: size,
        padding,
        borderRadius: radius,
        background: surface,
      } as React.CSSProperties}
      role="img"
      aria-label={`Identitas ${name}`}
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
          onError={() => setSourceIndex((current) => current + 1)}
        />
      ) : (
        <b>{initials}</b>
      )}
    </span>
  );
}

export const brandMonogramInk = readableInkOn;
