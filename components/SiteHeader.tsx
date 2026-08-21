"use client";

import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";

export function SiteHeader({ landing = false }: { landing?: boolean }) {
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      setFloating(window.scrollY > 80);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const actionHref = landing ? "/usaha" : "/survei-lokasi";
  const actionLabel = landing ? "Mulai analisis" : "Cek lokasi";

  return (
    <header className={`workbench-header ${floating ? "is-floating" : ""}`}>
      <nav className="workbench-nav" aria-label="Navigasi utama">
        <BrandLogo />
        <div className="workbench-nav__links">
          <Link href="/usaha">Jenis usaha</Link>
          <Link href="/franchise">Franchise</Link>
          <Link href="/compare">Bandingkan</Link>
          <Link href="/peringkat">Peringkat</Link>
          <Link href="/survei-lokasi">Peta Indonesia</Link>
          <Link href="/data">Dasar data</Link>
        </div>
        <Link className="workbench-nav__action" href={actionHref}>
          {actionLabel} <ArrowRight size={17} aria-hidden="true" />
        </Link>
        <details className="workbench-nav__mobile">
          <summary aria-label="Buka navigasi"><Menu size={20} aria-hidden="true" /></summary>
          <div>
            <Link href="/usaha">Jenis usaha</Link>
            <Link href="/franchise">Franchise</Link>
            <Link href="/compare">Bandingkan</Link>
            <Link href="/peringkat">Peringkat</Link>
            <Link href="/survei-lokasi">Peta Indonesia</Link>
            <Link href="/data">Dasar data</Link>
            <Link href={actionHref}>{actionLabel} <ArrowRight size={16} /></Link>
          </div>
        </details>
      </nav>
    </header>
  );
}
