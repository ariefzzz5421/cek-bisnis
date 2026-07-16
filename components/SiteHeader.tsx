import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function SiteHeader() {
  return (
    <header className="site-header">
      <BrandLogo />
      <nav className="site-nav" aria-label="Navigasi utama">
        <Link href="/#pilih-usaha">Jenis usaha</Link>
        <Link href="/#kota">Kota ramai</Link>
        <Link href="/#metode">Metode data</Link>
      </nav>
      <Link className="header-action" href="/#pilih-usaha">
        Pilih usaha <ArrowRight size={17} />
      </Link>
    </header>
  );
}
