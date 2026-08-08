import Image from "next/image";
import { readableInkOn, type Franchise } from "@/lib/franchise-data";

/**
 * Ubin identitas merek. Logo yang berhasil diambil dari situs brand disimpan
 * lokal; URL resmi atau monogram menjadi fallback saat sumber membatasi unduhan.
 */
/**
 * Ubin yang lebih kecil dari ini hanya menampilkan blok warna.
 *
 * Alasannya kontras: sebagian warna merek resmi (mis. merah #ED1C24) tidak
 * mencapai 4,5:1 dengan tinta hitam maupun putih. Pada ubin sebesar ini
 * monogramnya dirender minimal 19px tebal, sehingga masuk kategori teks besar
 * WCAG yang ambangnya 3:1 dan lolos. Di ubin kecil monogram dihilangkan saja —
 * nama mereknya toh selalu tertulis persis di sebelahnya.
 */
const MONOGRAM_MIN_TILE = 44;

export function FranchiseLogo({ franchise, size = 56 }: { franchise: Franchise; size?: number }) {
  const logoSource = franchise.logoFile
    ? `/brands/franchises/${franchise.logoFile}`
    : franchise.logoUrl;

  return (
    <span
      className="franchise-logo"
      style={{
        "--brand": franchise.brandColor,
        // Warna monogram dihitung dari warna merek, bukan disimpan di data,
        // supaya kontrasnya tetap lolos kalau warna mereknya nanti diperbarui.
        "--brand-ink": readableInkOn(franchise.brandColor),
        width: size,
        height: size,
      } as React.CSSProperties}
      aria-hidden="true"
    >
      {logoSource
        ? <Image src={logoSource} alt="" width={size} height={size} unoptimized />
        : size >= MONOGRAM_MIN_TILE
          ? <b>{franchise.initials}</b>
          : null}
    </span>
  );
}
