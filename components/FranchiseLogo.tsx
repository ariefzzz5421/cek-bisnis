import Image from "next/image";
import { readableInkOn, type Franchise } from "@/lib/franchise-data";

/**
 * Ubin identitas merek.
 *
 * Berkas logo resmi tidak ikut dibundel: aset itu milik masing-masing pemegang
 * merek dan tidak bebas didistribusikan ulang. Sebagai gantinya ubin ini memakai
 * warna resmi merek plus monogram, lalu menautkan ke situs waralaba resminya.
 *
 * Kalau nanti kamu sudah mengantongi izin pemakaian logo, taruh berkasnya di
 * `public/brand/franchise/<id>.svg` dan isi `logoFile` pada data franchise —
 * komponen ini otomatis memakainya tanpa perubahan kode lain.
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
  const logoFile = (franchise as Franchise & { logoFile?: string }).logoFile;

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
      {logoFile
        ? <Image src={`/brand/franchise/${logoFile}`} alt="" width={size} height={size} unoptimized />
        : size >= MONOGRAM_MIN_TILE
          ? <b>{franchise.initials}</b>
          : null}
    </span>
  );
}
