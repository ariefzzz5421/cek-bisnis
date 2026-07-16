import Link from "next/link";
import Image from "next/image";

export function BrandLogo({ large = false }: { large?: boolean }) {
  return (
    <Link className={`brand brand-c ${large ? "brand-large" : ""}`} href="/" aria-label="Cek Bisnis beranda">
      <span className={`logo-crop ${large ? "logo-crop-large" : "logo-crop-small"}`} aria-hidden="true">
        <Image src="/brand/logo-options.png" alt="" width={1536} height={1024} priority />
      </span>
      <span className="brand-wordmark">CEK BISNIS</span>
    </Link>
  );
}
