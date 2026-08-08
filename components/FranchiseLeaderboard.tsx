/* eslint-disable @next/next/no-img-element -- official brand marks use mixed local and official remote sources */
"use client";

import { ArrowUpRight, Star } from "lucide-react";
import { formatMoney } from "@/lib/business-data";
import { franchiseLeaderboard } from "@/lib/franchise-data";

function ProfitStars({ value }: { value: number }) {
  return (
    <span className="profit-stars" aria-label={`Skor ${value} dari 10`} title={`Skor kelayakan ${value}/10`}>
      {Array.from({ length: 10 }, (_, index) => (
        <Star key={index} size={14} aria-hidden="true" className={index < value ? "is-filled" : ""} />
      ))}
      <b>{value}/10</b>
    </span>
  );
}

export function FranchiseLeaderboard() {
  return (
    <section className="franchise-board" id="franchise-ranking" aria-labelledby="franchise-board-title">
      <header className="workbench-section-heading">
        <div><p>2.0 · RANKING FRANCHISE</p><h2 id="franchise-board-title">Bandingkan laba, bukan nama besar.</h2></div>
        <p>Urutan berdasarkan estimasi laba operasional bulanan. Bukan jaminan profit dan bukan laporan keuangan outlet.</p>
      </header>

      <div className="franchise-board__legend" role="note">
        <span><i className="is-brand" /> Proyeksi brand</span>
        <span><i className="is-model" /> Skenario Cek Bisnis</span>
        <span>Harga dan kontrak wajib dikonfirmasi ke brand.</span>
      </div>

      <div className="franchise-board__table" role="table" aria-label="Ranking 10 franchise berdasarkan estimasi laba bulanan">
        <div className="franchise-board__head" role="row">
          <span role="columnheader">Rank & merek</span><span role="columnheader">Modal</span><span role="columnheader">Omzet</span><span role="columnheader">Est. laba/bln</span><span role="columnheader">Skor</span>
        </div>
        {franchiseLeaderboard.map((brand) => (
          <article className="franchise-rank" role="row" key={brand.slug}>
            <div className="franchise-rank__brand" role="cell">
              <strong className="franchise-rank__number">#{brand.rank}</strong>
              <span className={`franchise-rank__logo franchise-rank__logo--${brand.slug}`} data-initials={brand.name.split(" ").map((word) => word[0]).join("").slice(0, 3)}>
                <img
                  src={brand.logo}
                  alt={`Logo resmi ${brand.name}`}
                  loading="lazy"
                  onLoad={(event) => { event.currentTarget.dataset.loaded = "true"; }}
                  onError={(event) => { event.currentTarget.hidden = true; }}
                />
              </span>
              <div><h3>{brand.name}</h3><small className={brand.basis === "Proyeksi brand" ? "is-brand" : "is-model"}>{brand.basis}</small></div>
            </div>
            <div role="cell"><small>Modal</small><b>{brand.investment}</b></div>
            <div role="cell"><small>Omzet/bln</small><b>{brand.monthlyRevenue}</b></div>
            <div className="franchise-rank__profit" role="cell"><small>Est. laba/bln</small><b>{formatMoney(brand.monthlyProfit)}</b></div>
            <div className="franchise-rank__score" role="cell"><ProfitStars value={brand.rating} /><a href={brand.officialUrl} target="_blank" rel="noreferrer">Cek resmi <ArrowUpRight size={14} aria-hidden="true" /></a></div>
            <p>{brand.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
