"use client";

import Link from "next/link";
import { ArrowLeftRight, ArrowRight, BadgePercent, Building2, ChevronDown, Download, FileText, Gauge, ImageDown, Timer, Wallet } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { businesses, formatMoney, type BusinessId } from "@/lib/business-data";
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
  businessId?: BusinessId;
  franchiseId?: string;
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
    businessId: business.id,
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
    franchiseId: franchise.id,
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
  const [exportState, setExportState] = useState<"idle" | "png" | "pdf" | "error">("idle");

  const left = useMemo(() => choices.find((item) => item.key === leftKey) ?? choices[0], [leftKey]);
  const right = useMemo(() => choices.find((item) => item.key === rightKey) ?? choices[1] ?? choices[0], [rightKey]);

  const swap = () => {
    setLeftKey(rightKey);
    setRightKey(leftKey);
  };

  if (!left || !right) return null;

  const exportBase = `cek-bisnis-compare-${left.key}-${right.key}`.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();

  const downloadComparePng = async () => {
    setExportState("png");
    try {
      const { downloadBlob, renderCompareSummaryPng } = await import("@/lib/export-documents");
      const blob = await renderCompareSummaryPng(left, right);
      downloadBlob(blob, `${exportBase}.png`);
      setExportState("idle");
    } catch {
      setExportState("error");
    }
  };

  const downloadComparePdf = async () => {
    setExportState("pdf");
    try {
      const { buildComparePdf, downloadBlob } = await import("@/lib/export-documents");
      const blob = buildComparePdf(left, right);
      downloadBlob(blob, `${exportBase}.pdf`);
      setExportState("idle");
    } catch {
      setExportState("error");
    }
  };

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
        <CompareNarrative title="Mekanisme bisnis" leftLabel={left.name} rightLabel={right.name} left={left.mechanism} right={right.mechanism} />
        <CompareNarrative title="Faktor penentu" leftLabel={left.name} rightLabel={right.name} left={left.factors} right={right.factors} />
      </div>

      <section className={styles.downloads} aria-labelledby="compare-download-title">
        <div className={styles.downloadIntro}>
          <span>UNDUH PERBANDINGAN</span>
          <h2 id="compare-download-title">Simpan keputusan ini.</h2>
          <p>File mengikuti Bisnis A dan Bisnis B yang sedang dipilih sekarang, termasuk modal, omzet, BEP, fee, biaya berulang, mekanisme, dan faktor penentu.</p>
        </div>
        <div className={styles.downloadActions}>
          <button type="button" onClick={() => void downloadComparePng()} disabled={exportState === "png" || exportState === "pdf"}>
            <ImageDown size={21} aria-hidden="true" />
            <span><small>RINGKASAN</small><b>{exportState === "png" ? "Menyiapkan PNG..." : "Download PNG"}</b></span>
            <Download size={17} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => void downloadComparePdf()} disabled={exportState === "png" || exportState === "pdf"}>
            <FileText size={21} aria-hidden="true" />
            <span><small>DETAIL</small><b>{exportState === "pdf" ? "Menyiapkan PDF..." : "Download PDF"}</b></span>
            <Download size={17} aria-hidden="true" />
          </button>
          {exportState === "error" && <p className={styles.downloadError}>Gagal membuat file di peramban ini. Coba ulang atau gunakan Chrome terbaru.</p>}
        </div>
      </section>

      <p className={styles.disclaimer}>Perbandingan ini adalah alat screening. Untuk franchise, angka yang tidak dipublikasikan brand sengaja ditandai sebagai belum tersedia atau minta quotation—bukan diisi dengan tebakan.</p>
    </section>
  );
}

const franchiseOf = (choice: CompareChoice) =>
  choice.franchiseId ? franchises.find((item) => item.id === choice.franchiseId) : undefined;

/**
 * Pemilih bisnis dengan logo merek di sebelah kiri tiap baris.
 *
 * `<select>` bawaan browser tidak bisa merender gambar di dalam `<option>`,
 * jadi daftarnya dibangun sebagai combobox: kotak teks untuk menyaring, plus
 * listbox yang bisa dijalankan dengan panah, Enter, dan Escape. Dengan lebih
 * dari lima puluh pilihan, penyaringan teks sekaligus menggantikan ketik-cepat
 * yang biasa didapat gratis dari `<select>`.
 */
function ChoiceSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);

  const selected = choices.find((item) => item.key === value);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return choices;
    return choices.filter(
      (item) =>
        item.name.toLowerCase().includes(needle) || item.sector.toLowerCase().includes(needle),
    );
  }, [query]);

  const groups = useMemo(
    () =>
      [
        { title: "Usaha mandiri", items: matches.filter((item) => item.kind === "Usaha mandiri") },
        { title: "Franchise", items: matches.filter((item) => item.kind === "Franchise") },
      ].filter((group) => group.items.length > 0),
    [matches],
  );
  /* Urutan datar mengikuti urutan render, supaya indeks aktif dan tombol panah
     bergerak persis seperti yang dilihat pengguna. */
  const ordered = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const openList = () => {
    const current = ordered.findIndex((item) => item.key === value);
    setActiveIndex(current >= 0 ? current : 0);
    setOpen(true);
  };

  const commit = (choice?: CompareChoice) => {
    if (choice) onChange(choice.key);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setQuery("");
      setOpen(false);
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter")) {
      event.preventDefault();
      openList();
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (ordered.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (index + step + ordered.length) % ordered.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(Math.max(0, ordered.length - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      commit(ordered[activeIndex]);
    }
  };

  let flatIndex = -1;

  return (
    <div className={styles.selectWrap} ref={rootRef}>
      <label htmlFor={`${listId}-input`}>{label}</label>
      <div className={`${styles.picker} ${open ? styles.pickerOpen : ""}`}>
        {selected && (
          <BrandLogo
            franchise={franchiseOf(selected)}
            businessId={selected.businessId}
            name={selected.name}
            size={30}
          />
        )}
        <input
          id={`${listId}-input`}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && ordered[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          placeholder={selected?.name ?? "Pilih bisnis"}
          value={open ? query : (selected?.name ?? "")}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            if (!open) openList();
          }}
          onKeyDown={onKeyDown}
        />
        <ChevronDown size={17} aria-hidden="true" />
      </div>

      <ul className={styles.options} id={listId} role="listbox" aria-label={label} hidden={!open}>
        {groups.map((group) => (
          <li key={group.title} role="group" aria-label={group.title}>
            <p className={styles.optionGroup}>{group.title}</p>
            <ul>
              {group.items.map((item) => {
                flatIndex += 1;
                const index = flatIndex;
                return (
                  <li
                    key={item.key}
                    id={`${listId}-${index}`}
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    role="option"
                    aria-selected={item.key === value}
                    className={`${styles.option} ${index === activeIndex ? styles.optionActive : ""}`}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      commit(item);
                    }}
                    onPointerEnter={() => setActiveIndex(index)}
                  >
                    <BrandLogo
                      franchise={franchiseOf(item)}
                      businessId={item.businessId}
                      name={item.name}
                      size={26}
                    />
                    <span>
                      <b>{item.name}</b>
                      <small>{item.sector}</small>
                    </span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
        {ordered.length === 0 && <li className={styles.optionEmpty}>Tidak ada yang cocok.</li>}
      </ul>
    </div>
  );
}

function CompareCard({ choice }: { choice: CompareChoice }) {
  const franchise = choice.franchiseId
    ? franchises.find((item) => item.id === choice.franchiseId)
    : undefined;

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span>{choice.kind}</span>
        <small>{choice.basis}</small>
      </div>
      <div className={styles.identity}>
        <BrandLogo
          franchise={franchise}
          businessId={choice.businessId}
          name={choice.name}
          size={64}
        />
        <div>
          <h2>{choice.name}</h2>
          <p>{choice.sector}</p>
        </div>
      </div>
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

function CompareNarrative({
  title,
  leftLabel,
  rightLabel,
  left,
  right,
}: {
  title: string;
  leftLabel: string;
  rightLabel: string;
  left: string | string[];
  right: string | string[];
}) {
  return (
    <section className={styles.narrative}>
      <h3>{title}</h3>
      <div>
        <NarrativeColumn label={leftLabel} value={left} />
        <NarrativeColumn label={rightLabel} value={right} />
      </div>
    </section>
  );
}

/**
 * Prose mekanisme datang sebagai satu paragraf panjang. Dalam kolom sempit
 * berdampingan, blok seperti itu jauh lebih sulit dipindai daripada beberapa
 * baris pendek, jadi kalimatnya dipecah jadi butir begitu paragrafnya panjang.
 */
const BULLET_MIN_CHARS = 150;

function toBullets(value: string): string[] | null {
  if (value.length < BULLET_MIN_CHARS) return null;
  const sentences = value
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  return sentences.length > 1 ? sentences : null;
}

function NarrativeColumn({ label, value }: { label: string; value: string | string[] }) {
  const bullets = Array.isArray(value) ? value : toBullets(value);

  return (
    <div className={styles.narrativeColumn}>
      <small>{label}</small>
      {bullets ? (
        <ul>{bullets.map((item) => <li key={item}>{item}</li>)}</ul>
      ) : (
        <p>{value as string}</p>
      )}
    </div>
  );
}
