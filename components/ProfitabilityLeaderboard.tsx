/* eslint-disable @next/next/no-img-element -- mixed verified local and official remote brand assets */
"use client";

import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { BusinessIcon } from "@/components/BusinessIcon";
import { formatMoney } from "@/lib/business-data";
import { buildProfitabilityRanking } from "@/lib/leaderboard";

const ranking = buildProfitabilityRanking();

function Rating({ value }: { value: number }) {
  return (
    <span className="profit-rank__rating" role="cell" aria-label={`${value} dari 10 bintang berdasarkan laba relatif`}>
      <span aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <Star key={index} size={14} className={index < value ? "is-filled" : ""} />
        ))}
      </span>
      <b>{value}/10</b>
    </span>
  );
}

export function ProfitabilityLeaderboard() {
  return (
    <section className="profit-rank" aria-labelledby="profit-rank-title">
      <header className="profit-rank__head">
        <div>
          <span>TOP 10 · PROFITABILITAS</span>
          <h2 id="profit-rank-title">Peluang dengan estimasi laba tertinggi.</h2>
        </div>
        <p>Usaha mandiri dan waralaba dibandingkan dari estimasi laba operasional bulanan. Skor 1–10 bersifat relatif, bukan jaminan hasil.</p>
      </header>

      <div className="profit-rank__table" role="table" aria-label="Top 10 peluang usaha berdasarkan estimasi laba bulanan">
        <div className="profit-rank__labels" role="row">
          <span role="columnheader">Peringkat & usaha</span>
          <span role="columnheader">Dasar hitung</span>
          <span role="columnheader">Estimasi laba</span>
          <span role="columnheader">Rating</span>
        </div>
        {ranking.map((item) => (
          <article className="profit-rank__row" role="row" data-profitability-row key={`${item.kind}-${item.id}`}>
            <div className="profit-rank__identity" role="cell">
              <strong>#{String(item.rank).padStart(2, "0")}</strong>
              <span className="profit-rank__mark" style={{ "--rank-accent": item.accent } as React.CSSProperties} data-initials={item.initials}>
                {item.businessId ? <BusinessIcon id={item.businessId} size={25} /> : (
                  <img src={item.logo} alt={`Logo ${item.name}`} loading="lazy" onLoad={(event) => { event.currentTarget.dataset.loaded = "true"; }} onError={(event) => { event.currentTarget.hidden = true; }} />
                )}
              </span>
              <div>
                <Link href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined}>
                  {item.name}{item.external ? <ArrowUpRight size={14} aria-hidden="true" /> : null}
                </Link>
                <small>{item.kind === "business" ? "Usaha mandiri" : "Waralaba"} · omzet {item.revenue}</small>
              </div>
            </div>
            <span className="profit-rank__basis" role="cell">{item.basis}</span>
            <b className="profit-rank__profit" role="cell">{formatMoney(item.profit)}<small>/bln</small></b>
            <Rating value={item.rating} />
          </article>
        ))}
      </div>
      <p className="profit-rank__note">⚠️ Laba waralaba bukan laporan outlet yang diaudit. Konfirmasi biaya sewa, gaji, royalti, dan proposal terbaru sebelum membayar.</p>
    </section>
  );
}
