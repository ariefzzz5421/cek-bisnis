import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function SiteHeader() {
  return (
    <header className="site-header">
      <BrandLogo />
      <nav className="site-nav" aria-label="Navigasi utama">
        <Link href="/#pilih-usaha">Jenis usaha</Link>
        <Link href="/survei-lokasi">Survei lokasi</Link>
        <Link href="/#data">Dasar data</Link>
      </nav>
      <Link className="header-action" href="/survei-lokasi">
        Cek lokasi <ArrowRight size={17} />
      </Link>
    </header>
  );
}
