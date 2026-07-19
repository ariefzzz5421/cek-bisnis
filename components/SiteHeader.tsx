import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function SiteHeader({ landing = false }: { landing?: boolean }) {
  return (
    <header className="workbench-header">
      <nav className="workbench-nav" aria-label="Navigasi utama">
        <BrandLogo />
        <div className="workbench-nav__links">
          <Link href="/#pilih-usaha">Jenis usaha</Link>
          <Link href="/survei-lokasi">Peta Indonesia</Link>
          <Link href="/#data">Dasar data</Link>
        </div>
        <Link className="workbench-nav__action" href={landing ? "#pilih-usaha" : "/survei-lokasi"}>
          {landing ? "Mulai analisis" : "Cek lokasi"} <ArrowRight size={17} aria-hidden="true" />
        </Link>
        <details className="workbench-nav__mobile">
          <summary aria-label="Buka navigasi"><Menu size={20} aria-hidden="true" /></summary>
          <div>
            <Link href="/#pilih-usaha">Jenis usaha</Link>
            <Link href="/survei-lokasi">Peta Indonesia</Link>
            <Link href="/#data">Dasar data</Link>
            <Link href={landing ? "#pilih-usaha" : "/survei-lokasi"}>{landing ? "Mulai analisis" : "Cek lokasi"} <ArrowRight size={16} /></Link>
          </div>
        </details>
      </nav>
    </header>
  );
}
