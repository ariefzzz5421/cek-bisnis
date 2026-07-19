import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "../tokens.css";
import "./globals.css";
import "./workbench.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], display: "swap" });
const jetBrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://cek-bisnis.vercel.app"),
  title: "Cek Bisnis - Panduan Modal, OPEX dan BEP UMKM Indonesia",
  description: "Pilih jenis usaha dan cek modal awal, biaya bulanan, omzet minimum, kota terbaik, rencana 90 hari, PDF guide, dan preview image.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Cek Bisnis — Hitung dulu. Baru buka.",
    description: "Modal, OPEX, BEP, alat usaha, dan peta interaktif 497 kota Indonesia.",
    url: "/",
    siteName: "Cek Bisnis",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og.webp", width: 1536, height: 911, alt: "Cek Bisnis — Hitung dulu. Baru buka." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cek Bisnis — Hitung dulu. Baru buka.",
    description: "Modal, OPEX, BEP, alat usaha, dan peta interaktif 497 kota Indonesia.",
    images: ["/og.webp"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
