import { readableInkOn } from "@/lib/franchise-data";
import { marketplaces, type MarketplaceId } from "@/lib/business-details";

/**
 * Ubin identitas marketplace di samping tautan belanja.
 *
 * Untuk merek yang berkas logonya tersedia (`logoFile`), siluetnya dirender
 * lewat CSS mask, bukan `<img>`. Ikon simple-icons berupa path satu warna tanpa
 * atribut `fill`, jadi kalau dipasang sebagai gambar biasa ia selalu hitam dan
 * hilang di atas latar merek yang gelap. Mask membuatnya bisa diwarnai memakai
 * tinta yang sama dengan monogram.
 *
 * Merek yang belum punya berkas logo tetap memakai monogram. Lihat
 * `public/brand/marketplace/README.md` untuk asal berkas dan cara menambah.
 */
export function MarketplaceMark({ id, size = 20 }: { id: MarketplaceId; size?: number }) {
  const marketplace = marketplaces[id];
  const ink = readableInkOn(marketplace.brandColor);

  return (
    <span
      className="marketplace-mark"
      style={{
        "--brand": marketplace.brandColor,
        "--brand-ink": ink,
        width: size,
        height: size,
      } as React.CSSProperties}
      aria-hidden="true"
    >
      {marketplace.logoFile
        ? (
          <i
            className="marketplace-mark__glyph"
            style={{ "--glyph": `url(/brand/marketplace/${marketplace.logoFile})` } as React.CSSProperties}
          />
        )
        : <b>{marketplace.initials}</b>}
    </span>
  );
}
