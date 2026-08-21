"use client";

import Link from "next/link";
import { ArrowLeftRight, ArrowRight, BadgePercent, Building2, Gauge, Timer, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { businesses, formatMoney } from "@/lib/business-data";
import {
  formatInvestmentRange,
  formatMonthRange,
  formatRevenueRange,
  franchiseBasisLabel,
  franchiseSectorName,
  franchises,
} from "@/lib/franchise-data";
import styles from "./BusinessCompare.module.css";

type CompareChoice = {
  key: string;
  name: string;
  kind: "Usaha mandiri" | "Franchise";
  sector: string;
  capital: string;
  revenue: string;
  bep: string;
  fee: string;
  recurring: string;
  mechanism: string;
  factors: string[];
  basis: string;
  href: string;
};

const choices: CompareChoice[] = [
  ...businesses.map((business) => ({
    key: `business:${business.slug}`,
    name: business.name,
    kind: "Usaha mandiri" as const,
    sector: business.category,
    capital: `${formatMoney(business.capex[0], 0)} - ${formatMoney(business.capex[1], 0).replace("Rp", "")}`,
    revenue: `${formatMoney(business.targetRevenue, 0)}/bulan`,
    bep: `${business.bepMonths[0]}-${business.bepMonths[1]} bulan`,
    fee: "Tidak ada franchise fee",
    recurring: `Variable cost ${(business.variableRate * 100).toFixed(0)}% + biaya tetap`,
    mechanism: business.scheme.model,
    factors: business.kpi.slice(0, 3).map((item) => `${item.label}: ${item.target}`),
    basis: "Model usaha Cek Bisnis",
    href: `/usaha/${business.slug}`,
  })),
  ...franchises.map((franchise) => ({
    key: `franchise:${franchise.id}`,
    name: franchise.name,
    kind: "Franchise" as const,
    sector: franchiseSectorName(franchise),
    capital: formatInvestmentRange(franchise.investment),
    revenue: `${formatRevenueRange(franchise.monthlyRevenue)}/bulan`,
    bep: formatMonthRange(franchise.bepMonths),
    fee: franchise.franchiseFee,
    recurring: franchise.royalty,
    mechanism: franchise.scheme,
    factors: franchise.kpi.slice(0, 3),
    basis: franchiseBasisLabel(franchise.dataBasis),
    href: `/franchise/${franchise.id}`,
  })),
];

const fallbackLeft = choices.find((item) => item.kind === "Usaha mandiri")?.key ?? choices[0]?.key ?? "";
const fallbackRight = choices.find((item) => item.kind === "Franchise")?.key ?? choices[1]?.key ?? fallbackLeft;

export function BusinessCompare() {
  const [leftKey, setLeftKey] = useState(fallbackLeft);
  const [rightKey, setRightKey] = useState(fallbackRight);

  const left = useMemo(() => choices.find((item) => item.key === leftKey) ?? choices[0], [leftKey]);
  const right = useMemo(() => choices.find((item) => item.key === rightKey) ?? choices[1] ?? choices[0], [rightKey]);

  const swap = () => {
    setLeftKey(rightKey);
    setRightKey(leftKey);
  };

  if (!left || !right) return null;

  return (
    <section className={styles.shell} aria-labelledby="compare-title">
      <header className={styles.hero}>
        <p className={styles.kicker}>COMPARE BUSINESS</p>
        <h1 id="compare-title">Dua bisnis. Satu layar.</h1>
        <p>Pilih usaha mandiri atau franchise yang tersedia di Cek Bisnis, lalu bandingkan modal, omzet, BEP, biaya berulang, mekanisme, dan faktor penentunya secara berdampingan.</p>
      </header>

      <div className={styles.pickers}>
        <ChoiceSelect label="Bisnis A" value={leftKey} onChange={setLeftKey} />
        <button className={styles.swap} type="button" onClick={swap} aria-label="Tukar posisi bisnis">
          <ArrowLeftRight size={19} aria-hidden="true" />
          <span>Tukar</span>
        </button>
        <ChoiceSelect label="Bisnis B" value={rightKey} onChange={setRightKey} />
      </div>

      {left.key === right.key && (
        <p className={styles.notice}>Kamu memilih bisnis yang sama di kedua sisi. Pilih item berbeda supaya perbandingannya berguna.</p>
      )}

      <div className={styles.grid}>
        <CompareCard choice={left} />
        <CompareCard choice={right} />
      </div>

      <div className={styles.matrix}>
        <CompareRow icon={<Building2 size={17} />} label="Sektor" left={left.sector} right={right.sector} />
        <CompareRow icon={<Wallet size={17} />} label="Modal awal" left={left.capital} right={right.capital} />
        <CompareRow icon={<Gauge size={17} />} label="Target / estimasi omzet" left={left.revenue} right={right.revenue} />
        <CompareRow icon={<Timer size={17} />} label="BEP" left={left.bep} right={right.bep} />
        <CompareRow icon={<BadgePercent size={17} />} label="Fee awal" left={left.fee} right={right.fee} />
        <CompareRow icon={<BadgePercent size={17} />} label="Biaya berulang" left={left.recurring} right={right.recurring} />
      </div>

      <div className={styles.detailGrid}>
        <CompareNarrative title="Mekanisme bisnis" left={left.mechanism} right={right.mechanism} />
        <CompareNarrative title="Faktor penentu" left={left.factors.join(" · ")} right={right.factors.join(" · ")} />
      </div>

      <p className={styles.disclaimer}>Perbandingan ini adalah alat screening. Untuk franchise, angka yang tidak dipublikasikan brand sengaja ditandai sebagai belum tersedia atau minta quotation—bukan diisi dengan tebakan.</p>
    </section>
  );
}

function ChoiceSelect({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const independent = choices.filter((item) => item.kind === "Usaha mandiri");
  const franchise = choices.filter((item) => item.kind === "Franchise");
  return (
    <label className={styles.selectWrap}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <optgroup label="Usaha mandiri">
          {independent.map((item) => <option value={item.key} key={item.key}>{item.name}</option>)}
        </optgroup>
        <optgroup label="Franchise">
          {franchise.map((item) => <option value={item.key} key={item.key}>{item.name}</option>)}
        </optgroup>
      </select>
    </label>
  );
}

function CompareCard({ choice }: { choice: CompareChoice }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span>{choice.kind}</span>
        <small>{choice.basis}</small>
      </div>
      <h2>{choice.name}</h2>
      <p>{choice.sector}</p>
      <dl>
        <div><dt>Modal</dt><dd>{choice.capital}</dd></div>
        <div><dt>Omzet</dt><dd>{choice.revenue}</dd></div>
        <div><dt>BEP</dt><dd>{choice.bep}</dd></div>
      </dl>
      <Link href={choice.href}>Buka analisis lengkap <ArrowRight size={16} aria-hidden="true" /></Link>
    </article>
  );
}

function CompareRow({ icon, label, left, right }: { icon: React.ReactNode; label: string; left: string; right: string }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>{icon}<span>{label}</span></div>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

function CompareNarrative({ title, left, right }: { title: string; left: string; right: string }) {
  return (
    <section className={styles.narrative}>
      <h3>{title}</h3>
      <div><p>{left}</p><p>{right}</p></div>
    </section>
  );
}
