"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { BusinessIcon } from "@/components/BusinessIcon";
import { brandLogoAssets } from "@/lib/brand-logo-assets";
import type { BusinessId } from "@/lib/business-data";
import { accessibleBrandInk, readableInkOn, type Franchise } from "@/lib/franchise-data";

/** Wordmarks may be wide, but never let the logo tile consume the whole card header. */
const MAX_ASPECT = 3.05;
const WIDE_THRESHOLD = 1.22;

/** Dataset ids that historically used a different asset slug. */
const ASSET_ID_ALIASES: Record<string, string> = {
  mrklin: "mrklin",
  "mr-klin-laundry": "mrklin",
  "family-mart": "familymart",
  "kopi-janji-jiwa": "janji-jiwa",
  "pointcoffee": "point-coffee",
  "sicepat-ekspres": "sicepat",
  "ninja-express": "ninja-xpress",
  "hisana-fried-chicken": "hisana",
  "apotek-kimia-farma": "kimia-farma",
};

/**
 * Prefer stable official/public marks where the bundled artwork is an old badge,
 * storefront photo, or an unusually cropped conversion. Local assets remain the
 * next candidate, so a remote failure never leaves a card empty.
 */
const SOURCE_OVERRIDES: Record<string, string> = {
  familymart: "https://commons.wikimedia.org/wiki/Special:Redirect/file/FamilyMart%20Logo%20(2016-).svg",
  mixue: "https://ised-isde.canada.ca/cipo/trademark-search/media/2445069.png",
  sicepat: "https://fe-cft.cdn.sicepat.express/web-company-v3/public/company-logo.svg",
  "kimia-farma": "https://commons.wikimedia.org/wiki/Special:Redirect/file/Kimia-Farma-Apotek%20MemberofBiofarma.png",
  "optik-melawai": "https://stra-pi.s3.ap-southeast-1.amazonaws.com/optikmelawaidotcom_4df28342ce.png",
  "tahu-go": "https://www.tahugo.co.id/wp-content/uploads/2019/11/Screen-Shot-2019-11-05-at-12.23.08-1024x962.png",
  "doyan-ayam": "https://cdn.brandfetch.io/idxkisaBzo/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1770673437960",
};

/** Remote assets do not expose intrinsic dimensions to this component. */
const REMOTE_ASPECT_HINTS: Record<string, number> = {
  familymart: 592 / 86,
  mixue: 1,
  sicepat: 2.8,
  "kimia-farma": 1005 / 664,
  "optik-melawai": 1.55,
  "simply-fresh": 2.55,
  "tahu-go": 1.06,
  "doyan-ayam": 1,
};

/** White/light marks need a deliberate brand surface instead of cream paper. */
const SURFACE_COLORS: Record<string, string> = {
  "es-teh-indonesia": "#0f3d2e",
  "rocket-chicken": "#171717",
  sabana: "#b41920",
  "simply-fresh": "#d71920",
  "tahu-go": "#e8c47e",
  "doyan-ayam": "#e42a2d",
  "point-coffee": "#ffffff",
  familymart: "#ffffff",
  mixue: "#ffffff",
  sicepat: "#ffffff",
  "kimia-farma": "#ffffff",
  "optik-melawai": "#ffffff",
  mrklin: "#ffffff",
  "apotek-f21": "#fffdf7",
  pasfarma: "#ffffff",
};

/** Per-brand breathing room for unusual artwork. */
const PADDING_RATIOS: Record<string, number> = {
  familymart: 0.055,
  mixue: 0.04,
  "simply-fresh": 0.045,
  sabana: 0.055,
  "janji-jiwa": 0.055,
  "point-coffee": 0.035,
  mrklin: 0.045,
  sicepat: 0.055,
  "ninja-xpress": 0.055,
  hisana: 0.05,
  "tahu-go": 0.025,
  "doyan-ayam": 0.025,
  "apotek-f21": 0.03,
  "century-pharma": 0.08,
  "kimia-farma": 0.065,
  "griya-farma": 0.03,
  pasfarma: 0.03,
  "optik-melawai": 0.075,
};

/** Final optical adjustment after contain-fit. Values below 1 add safe space. */
const IMAGE_SCALE: Record<string, number> = {
  familymart: 0.94,
  mixue: 0.88,
  "janji-jiwa": 0.88,
  "point-coffee": 0.88,
  mrklin: 0.92,
  sicepat: 0.9,
  "ninja-xpress": 0.9,
  hisana: 0.88,
  "apotek-f21": 0.92,
  "kimia-farma": 0.82,
  pasfarma: 0.78,
  "optik-melawai": 0.82,
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
  hisana: "50% 50%",
  "kimia-farma": "50% 50%",
  pasfarma: "50% 50%",
  "optik-melawai": "50% 50%",
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
  const rawId = franchise?.id ?? "";
  const assetId = ASSET_ID_ALIASES[rawId] ?? rawId;
  const asset = franchise ? brandLogoAssets[assetId] : undefined;

  const logoSources = useMemo(() => {
    const candidates = [
      assetId ? SOURCE_OVERRIDES[assetId] : undefined,
      asset ? `/brands/franchises/${asset.file}` : undefined,
      franchise?.logoUrl,
    ].filter((source): source is string => Boolean(source));
    return [...new Set(candidates)];
  }, [asset, assetId, franchise?.logoUrl]);

  const logoSource = logoSources[sourceIndex];
  const showLogo = Boolean(logoSource);
  const initials = franchise?.initials ?? name.slice(0, 2).toUpperCase();

  const aspect = showLogo
    ? SOURCE_OVERRIDES[assetId] === logoSource
      ? REMOTE_ASPECT_HINTS[assetId] ?? 1
      : asset && logoSource === `/brands/franchises/${asset.file}`
        ? asset.width / asset.height
        : REMOTE_ASPECT_HINTS[assetId] ?? 1
    : 0.45 + initials.length * 0.42;

  const tileWidth = aspect > WIDE_THRESHOLD
    ? Math.round(size * Math.min(aspect, MAX_ASPECT))
    : size;

  const cover = COVER_BRANDS.has(assetId);
  const ratio = PADDING_RATIOS[assetId] ?? 0.11;
  const padding = businessId
    ? Math.round(size * 0.18)
    : cover
      ? 0
      : showLogo
        ? Math.max(2, Math.round(size * ratio))
        : 2;

  const surface = SURFACE_COLORS[assetId] ?? "#fffdf7";
  const radius = Math.max(8, Math.round(size * 0.16));
  const scale = IMAGE_SCALE[assetId] ?? 1;
  const sourceLabel = VERIFIED_NAME_ASSETS.has(assetId)
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
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: cover ? "cover" : "contain",
            objectPosition: OBJECT_POSITION[assetId] ?? "center",
            transform: `scale(${scale})`,
            transformOrigin: "center",
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
