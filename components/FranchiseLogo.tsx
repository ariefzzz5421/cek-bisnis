"use client";

import Image from "next/image";
import { useState } from "react";
import type { Franchise } from "@/lib/franchise-data";

/**
 * Logo yang diberikan user untuk mengisi brand yang sebelumnya belum punya
 * asset lokal. Mapping ini sengaja diletakkan di layer presentasi agar data
 * economics franchise tetap terpisah dari asset visual.
 */
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
 * Ubin identitas merek. Logo lokal/official selalu diletakkan di atas surface
 * netral dengan padding aman supaya logo ber-background transparan, gelap,
 * horizontal, atau berwarna terang tetap terbaca tanpa crop.
 */
export function FranchiseLogo({ franchise, size = 56 }: { franchise: Franchise; size?: number }) {
  const uploadedLogo = uploadedLogoById[franchise.id];
  const logoSource = uploadedLogo
    ? `/brands/franchises/${uploadedLogo}`
    : franchise.logoFile
      ? `/brands/franchises/${franchise.logoFile}`
      : franchise.logoUrl;
  const categorySource = `/brands/categories/${franchise.category}.webp`;
  const [officialFailed, setOfficialFailed] = useState(false);
  const source = logoSource && !officialFailed ? logoSource : categorySource;
  const sourceLabel = logoSource && !officialFailed
    ? `Logo ${franchise.name}`
    : `Ilustrasi kategori ${franchise.category} oleh Cek Bisnis`;
  const padding = Math.max(5, Math.round(size * 0.1));

  return (
    <span
      className="franchise-logo"
      style={{
        "--brand": franchise.brandColor,
        width: size,
        height: size,
        boxSizing: "border-box",
        padding,
        overflow: "hidden",
        border: "1px solid rgba(17, 17, 17, 0.16)",
        borderRadius: Math.max(8, Math.round(size * 0.16)),
        background: "#fffdf7",
        boxShadow: size >= 48 ? "0 3px 0 rgba(17, 17, 17, 0.12)" : "none",
      } as React.CSSProperties}
      aria-hidden="true"
      data-source={logoSource && !officialFailed ? "official" : "illustration"}
      title={sourceLabel}
    >
      <Image
        src={source}
        alt=""
        width={size}
        height={size}
        unoptimized
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        onError={() => {
          if (logoSource && !officialFailed) setOfficialFailed(true);
        }}
      />
    </span>
  );
}
