"use client";

import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { SiteWordmark } from "./SiteWordmark";

export function SiteHeader({ landing = false }: { landing?: boolean }) {
  const actionHref = landing ? "/usaha" : "/survei-lokasi";
  const actionLabel = landing ? "Mulai analisis" : "Cek lokasi";

  return (
    <header
      className="workbench-header"
      style={{
        position: "relative",
        inset: "auto",
        top: "auto",
        width: "100%",
        marginTop: "-4rem",
        background: "var(--color-paper)",
      }}
    >
      <nav
        className="workbench-nav"
        aria-label="Navigasi utama"
        style={{ width: "100%", maxWidth: "100%", margin: 0 }}
      >
        <SiteWordmark />
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
