import Image from "next/image";
import { readableInkOn } from "@/lib/franchise-data";
import { marketplaces, type MarketplaceId } from "@/lib/business-details";

/**
 * Ubin identitas marketplace di samping tautan belanja.
 *
 * Sama seperti ubin waralaba: berkas logo resmi tidak ikut dibundel karena
 * aset itu milik masing-masing pemegang merek dan tidak bebas didistribusikan
 * ulang. Yang dipakai adalah warna resmi merek plus monogram.
 *
 * Kalau kamu sudah mengantongi izin pemakaian logo, taruh berkasnya di
 * `public/brand/marketplace/<id>.svg` lalu isi `logoFile` pada
 * data/business-details.json — komponen ini otomatis memakainya.
 */
export function MarketplaceMark({ id, size = 20 }: { id: MarketplaceId; size?: number }) {
  const marketplace = marketplaces[id];
  const logoFile = (marketplace as typeof marketplace & { logoFile?: string }).logoFile;

  return (
    <span
      className="marketplace-mark"
      style={{
        "--brand": marketplace.brandColor,
        "--brand-ink": readableInkOn(marketplace.brandColor),
        width: size,
        height: size,
      } as React.CSSProperties}
      aria-hidden="true"
    >
      {logoFile
        ? <Image src={`/brand/marketplace/${logoFile}`} alt="" width={size} height={size} unoptimized />
        : <b>{marketplace.initials}</b>}
    </span>
  );
}
