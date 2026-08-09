"use client";

import Image from "next/image";
import { useState } from "react";
import type { Franchise } from "@/lib/franchise-data";

/**
 * Ubin identitas merek. Logo yang berhasil diambil dari situs brand disimpan
 * lokal; URL resmi atau monogram menjadi fallback saat sumber membatasi unduhan.
 */
export function FranchiseLogo({ franchise, size = 56 }: { franchise: Franchise; size?: number }) {
  const logoSource = franchise.logoFile
    ? `/brands/franchises/${franchise.logoFile}`
    : franchise.logoUrl;
  const categorySource = `/brands/categories/${franchise.category}.webp`;
  const [officialFailed, setOfficialFailed] = useState(false);
  const source = logoSource && !officialFailed ? logoSource : categorySource;
  const sourceLabel = logoSource && !officialFailed
    ? `Logo resmi ${franchise.name}`
    : `Ilustrasi kategori ${franchise.category} oleh Cek Bisnis`;

  return (
    <span
      className="franchise-logo"
      style={{
        "--brand": franchise.brandColor,
        width: size,
        height: size,
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
        onError={() => {
          if (logoSource && !officialFailed) setOfficialFailed(true);
        }}
      />
    </span>
  );
}
