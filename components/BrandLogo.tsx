import Link from "next/link";
import Image from "next/image";

export function BrandLogo({ large = false }: { large?: boolean }) {
  return (
    <Link className={`brand ${large ? "brand-large" : ""}`} href="/" aria-label="Cek Bisnis beranda">
      <span className={`brand-mark ${large ? "brand-mark-large" : ""}`} aria-hidden="true">
        <Image src="/favicon.svg" alt="" width={64} height={64} priority unoptimized />
      </span>
      <span className="brand-wordmark"><b>CEK</b> BISNIS</span>
    </Link>
  );
}
