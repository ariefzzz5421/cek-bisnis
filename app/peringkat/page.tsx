import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Info, MapPin, ShieldAlert, Trophy } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { businessData, businesses } from "@/lib/business-data";
import { franchises } from "@/lib/franchise-data";
import { buildCityRanking, buildLeaderboards } from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: "Peringkat Usaha dan Waralaba Indonesia - Top 5 per Kategori | Cek Bisnis",
  description:
    "Top 5 balik modal tercepat, modal teringan, margin tertinggi, traffic minimum paling ringan, waralaba termurah, dan kota paling menjanjikan — dihitung dari seluruh data Cek Bisnis.",
  openGraph: {
    title: "Peringkat Usaha dan Waralaba Indonesia - Top 5 per Kategori",
    description: "Peringkat balik modal, modal awal, margin, traffic, dan kota terbaik dari seluruh data Cek Bisnis.",
    url: "/peringkat",
  },
};

const MEDALS = ["01", "02", "03", "04", "05"];

export default function LeaderboardPage() {
  const boards = buildLeaderboards();
  const cityRanking = buildCityRanking();

  return (
    <main className="workbench-page">
      <SiteHeader />

      <section className="rank-hero">
        <div>
          <p className="workbench-kicker"><span aria-hidden="true" /> Peringkat · data {businessData.updatedAt}</p>
          <h1>Yang paling masuk akal,<br />menurut angkanya sendiri.</h1>
          <p>
            Enam papan peringkat yang dihitung ulang dari seluruh data di situs ini — {businesses.length} model usaha
            dan {franchises.length} waralaba. Tidak ada urutan yang disusun manual.
          </p>
        </div>
        <aside className="rank-hero__note">
          <div><Info size={19} aria-hidden="true" /><b>Cara membacanya</b></div>
          <p>
            Semua angka dihitung pada baseline nasional dengan faktor kota sama dengan satu, supaya model usaha
            dibandingkan setara. Begitu kamu memilih kota di halaman masing-masing usaha, angkanya akan berbeda.
          </p>
          <p className="rank-hero__warn">
            <ShieldAlert size={15} aria-hidden="true" />
            Peringkat ini alat penyaring awal, bukan rekomendasi investasi.
          </p>
        </aside>
      </section>

      <section className="rank-boards" aria-labelledby="rank-boards-title">
        <h2 id="rank-boards-title" className="visually-hidden">Papan peringkat</h2>
        <div className="rank-grid">
          {boards.map((board) => (
            <article className="rank-board" key={board.id} aria-labelledby={`board-${board.id}`}>
              <header>
                <Trophy size={19} aria-hidden="true" />
                <h3 id={`board-${board.id}`}>{board.title}</h3>
              </header>
              <p className="rank-board__measure">{board.measure}</p>
              <ol>
                {board.entries.map((entry, index) => (
                  <li key={entry.id}>
                    <Link href={entry.href}>
                      <span className="rank-board__pos" style={{ "--accent": entry.accent, "--accent-ink": entry.accentInk } as React.CSSProperties}>
                        {MEDALS[index]}
                      </span>
                      <span className="rank-board__copy">
                        <b>{entry.name}</b>
                        <small>{entry.detail}</small>
                      </span>
                      <em>{entry.value}</em>
                    </Link>
                  </li>
                ))}
              </ol>
              <p className="rank-board__caveat"><Info size={13} aria-hidden="true" /> {board.caveat}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rank-cities" aria-labelledby="rank-cities-title">
        <div className="real-section-head">
          <div><span>KOTA</span><h2 id="rank-cities-title">Lima kota dengan skor rata-rata tertinggi.</h2></div>
          <p>Rata-rata skor peluang seluruh model usaha di kota tersebut, dari data kota Cek Bisnis.</p>
        </div>
        <ol className="rank-city-list">
          {cityRanking.map((city, index) => (
            <li key={city.id}>
              <span className="rank-board__pos">{MEDALS[index]}</span>
              <div>
                <b><MapPin size={15} aria-hidden="true" /> {city.name}</b>
                <small>{city.province} · model terkuat: {city.best.name} ({city.best.score}/100)</small>
              </div>
              <em>{city.average.toFixed(1)}<small>/100</small></em>
              <Link href={`/usaha/${city.best.slug}#lokasi`} aria-label={`Cek ${city.best.name} di ${city.name}`}>
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="detail-next-business">
        <div><span>LANGKAH BERIKUTNYA</span><h2>Peringkat hanya titik awal.</h2></div>
        <Link href="/survei-lokasi">Uji lokasimu sendiri <ArrowRight size={20} aria-hidden="true" /></Link>
      </section>

      <SiteFooter />
    </main>
  );
}
