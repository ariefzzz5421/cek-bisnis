import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`workbench-footer ${compact ? "workbench-footer--compact" : ""}`}>
      {!compact && <p className="workbench-footer__statement">Usaha yang baik dimulai dari angka yang masuk akal.</p>}
      <BrandLogo />
      <p>Estimasi awal UMKM Indonesia. Validasi harga dan arus pengunjung sebelum membuka usaha.</p>
      <nav aria-label="Navigasi footer">
        <Link href="/#pilih-usaha">Jenis usaha</Link>
        <Link href="/survei-lokasi">Survei lokasi</Link>
        <Link href="/#data">Dasar data</Link>
        <a href="https://www.openstreetmap.org/" target="_blank" rel="noreferrer">OpenStreetMap <ArrowUpRight size={13} aria-hidden="true" /></a>
      </nav>
      <span>© 2026 Cek Bisnis</span>
    </footer>
  );
}
