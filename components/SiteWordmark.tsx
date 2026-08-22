import Link from "next/link";
import Image from "next/image";

/** Wordmark Cek Bisnis di header dan footer.
 *
 * Dinamai ulang dari `BrandLogo` supaya nama itu bisa dipakai komponen logo
 * entitas (franchise / model usaha) yang jauh lebih sering muncul di UI.
 */

export function SiteWordmark({ large = false }: { large?: boolean }) {
  return (
    <Link className={`brand ${large ? "brand-large" : ""}`} href="/" aria-label="Cek Bisnis beranda">
      <span className={`brand-mark ${large ? "brand-mark-large" : ""}`} aria-hidden="true">
        <Image src="/favicon.svg" alt="" width={64} height={64} priority unoptimized />
      </span>
      <span className="brand-wordmark"><b>CEK</b> BISNIS</span>
    </Link>
  );
}
