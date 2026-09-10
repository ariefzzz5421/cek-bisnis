"use client";

import { useMemo, useState } from "react";
import {
  Download,
  RotateCcw,
  SlidersHorizontal,
  Info,
  ArrowUpRight,
} from "lucide-react";
import {
  confidence,
  sourceList,
  type Dossier,
} from "@/financial-models/catalog";
import {
  calculate,
  scenarios,
  sensitivity,
  cashCurve,
  breakEvenCurve,
  viability,
  withOverrides,
  money,
  compactMoney,
  percent,
  months,
  type InputKey,
  type Model,
} from "@/financial-models/engine";
import { labels, evidenceLabels } from "@/financial-models/labels";
import { AIAnalysisPanel } from "@/components/AIAnalysisPanel";

type Series = { name: string; color: string; values: number[] };
function Chart({
  title,
  ticks,
  series,
  note,
  variant = "line",
  xValues,
  marker,
}: {
  title: string;
  ticks: string[];
  series: Series[];
  note: string;
  variant?: "line" | "bar";
  xValues?: number[];
  marker?: { value: number; label: string };
}) {
  const [active, setActive] = useState<string | null>(null);
  const all = series.flatMap((s) => s.values),
    lo = Math.min(0, ...all),
    hi = Math.max(1, ...all),
    span = hi - lo;
  const values = xValues ?? ticks.map((_, i) => i),
    xmin = Math.min(...values),
    xmax = Math.max(...values);
  const position = (v: number) =>
    (variant === "bar" ? 90 : 55) +
    ((v - xmin) * (variant === "bar" ? 440 : 510)) / Math.max(1, xmax - xmin);
  const x = (i: number) => position(values[i]),
    y = (v: number) => 200 - ((v - lo) / span) * 165;
  return (
    <article className="fi-chart">
      <h3>{title}</h3>
      <div className="fi-chart-scroll">
        <svg viewBox="0 0 600 240" role="img" aria-label={title}>
          {[0, 0.5, 1].map((f) => (
            <g key={f}>
              <line
                x1="55"
                x2="565"
                y1={y(lo + span * f)}
                y2={y(lo + span * f)}
                stroke="#e2e7ed"
              />
              <text
                x="48"
                y={y(lo + span * f) + 4}
                textAnchor="end"
                fontSize="10"
                fill="#526172"
              >
                {((lo + span * f) / 1e6).toFixed(0)} jt
              </text>
            </g>
          ))}
          <line
            x1="55"
            x2="565"
            y1={y(0)}
            y2={y(0)}
            stroke="#8594a4"
            strokeDasharray="4 4"
          />
          {marker && marker.value >= xmin && marker.value <= xmax && (
            <g>
              <line
                x1={position(marker.value)}
                x2={position(marker.value)}
                y1="30"
                y2="200"
                stroke="#8f5d24"
                strokeDasharray="4 3"
              />
              <text
                x={Math.min(500, position(marker.value) + 4)}
                y="20"
                fill="#8f5d24"
                fontSize="11"
              >
                {marker.label}
              </text>
            </g>
          )}
          {series.map((s, si) => (
            <g key={s.name}>
              {variant === "line" ? (
                <polyline
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
                />
              ) : (
                s.values.map((v, i) => (
                  <rect
                    key={i}
                    x={x(i) + (si - series.length / 2) * 18}
                    y={Math.min(y(0), y(v))}
                    width="15"
                    height={Math.max(1, Math.abs(y(v) - y(0)))}
                    fill={s.color}
                  >
                    <title>{`${s.name}: ${money(v)}`}</title>
                  </rect>
                ))
              )}
              {s.values.map((v, i) => (
                <circle
                  key={i}
                  tabIndex={0}
                  onFocus={() =>
                    setActive(`${s.name} · ${ticks[i]}: ${money(v)}`)
                  }
                  onMouseEnter={() =>
                    setActive(`${s.name} · ${ticks[i]}: ${money(v)}`)
                  }
                  onClick={() =>
                    setActive(`${s.name} · ${ticks[i]}: ${money(v)}`)
                  }
                  cx={x(i)}
                  cy={y(v)}
                  r="5"
                  fill={s.color}
                >
                  <title>{`${s.name} · ${ticks[i]}: ${money(v)}`}</title>
                </circle>
              ))}
            </g>
          ))}
          {ticks.map((t, i) => (
            <text
              key={i}
              x={x(i)}
              y="224"
              textAnchor="middle"
              fontSize="10"
              fill="#526172"
            >
              {t}
            </text>
          ))}
        </svg>
      </div>
      <div className="fi-legend">
        {series.map((s) => (
          <span key={s.name}>
            <i style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
      <p aria-live="polite" className="fi-chart-tooltip">
        {active ?? "Sentuh atau fokuskan titik untuk melihat nilai."}
      </p>
      <p>{note}</p>
      <details>
        <summary>Data grafik</summary>
        <div className="fi-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Periode / volume</th>
                {series.map((s) => (
                  <th key={s.name}>{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ticks.map((t, i) => (
                <tr key={i}>
                  <th>{t}</th>
                  {series.map((s) => (
                    <td key={s.name}>{money(s.values[i])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </article>
  );
}

export function FinancialDashboard({
  dossier: d,
  initialModel,
}: {
  dossier: Dossier;
  initialModel?: Model;
}) {
  const original = initialModel ?? d.model;
  const [overrides, setOverrides] = useState<Partial<Record<InputKey, number>>>(
    {},
  );
  const [location, setLocation] = useState(original.location);
  const [exportState, setExportState] = useState("");
  const [aiSeen, setAiSeen] = useState(false);
  const model = useMemo(() => {
    const m = withOverrides(original, overrides);
    m.location = location;
    // Scenario volumes move proportionally with the editable base, while cost edits apply to all cases.
    m.scenarios = original.scenarios.map((s) => ({
      ...s,
      overrides: {
        ...s.overrides,
        units: Math.min(
          m.capacity,
          ((s.overrides.units ?? original.inputs.units.value) *
            m.inputs.units.value) /
            Math.max(1, original.inputs.units.value),
        ),
      },
    }));
    return m;
  }, [original, overrides, location]);
  const computed = useMemo(() => {
    try {
      return { result: calculate(model), error: null };
    } catch (e) {
      return {
        result: null,
        error: e instanceof Error ? e.message : "Input tidak valid",
      };
    }
  }, [model]);
  const r = computed.result,
    conf = confidence({ ...d, model }),
    sources = sourceList(d);
  const download = async (kind: "pdf" | "png") => {
    if (!r) return;
    setExportState("loading");
    try {
      const { buildDossierPdf, downloadBlob } = await import(
        "@/lib/financial-pdf"
      );
      if (kind === "pdf")
        downloadBlob(await buildDossierPdf(d, model), `cek-bisnis-${d.id}-model.pdf`);
      else {
        const { renderModelPng } = await import("@/lib/model-preview");
        downloadBlob(
          await renderModelPng(d, model),
          `cek-bisnis-${d.id}-model.png`,
        );
      }
      setExportState("success");
    } catch {
      setExportState("error");
    }
  };
  const c = r ? scenarios(model) : [],
    sens = r ? sensitivity(model) : [],
    cash = r
      ? cashCurve(model, Math.min(120, Math.max(24, (r.payback ?? 60) + 6)))
      : [],
    be = r ? breakEvenCurve(model) : [];
  const cashSample = cash.filter(
    (_, i) =>
      i === 0 ||
      i === cash.length - 1 ||
      i % Math.max(1, Math.ceil(cash.length / 10)) === 0,
  );
  const assessment = r ? viability(model) : null;
  return (
    <section className="fi-dashboard" id="financial-model">
      <header className="fi-heading">
        <div>
          <span className="fi-eyebrow">FINANCIAL INTELLIGENCE / MODEL 1.0</span>
          <h2>Hitung kelayakannya.</h2>
          <p>Angka yang bisa ditelusuri. Asumsi yang bisa kamu ubah.</p>
        </div>
        <div className="fi-confidence">
          <span>
            Kepercayaan data: <b>{conf.label}</b>
          </span>
          <small>{conf.reason}</small>
          <small>
            Ditinjau {conf.lastResearched} · bukan jaminan masih berlaku
          </small>
        </div>
      </header>
      <div className="fi-notice">
        <Info size={18} />
        <p>
          {d.research.note} Semua hasil di bawah adalah{" "}
          <strong>CEK BISNIS ESTIMATE</strong>, bukan performa outlet atau
          rekomendasi investasi.
        </p>
      </div>
      <nav className="fi-section-nav" aria-label="Bagian model">
        <a href="#model-summary">Ringkasan</a>
        <a href="#assumptions">Asumsi</a>
        <a href="#scenarios">Skenario</a>
        <a href="#model-risks">Risiko</a>
        <a href="#model-sources">Sumber</a>
      </nav>
      <details className="fi-panel" id="official-data">
        <summary>Fakta publik & hal yang belum diketahui</summary>
        <p>
          Data resmi tidak berarti seluruh proyeksi laba resmi. Paket, promosi
          dan kontrak tetap perlu konfirmasi tertulis.
        </p>
        <div className="fi-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Komponen</th>
                <th>Data publik</th>
                <th>Status / konteks</th>
              </tr>
            </thead>
            <tbody>
              {d.research.facts.length ? (
                d.research.facts.map((f, i) => (
                  <tr key={i}>
                    <th>{f.label}</th>
                    <td>
                      {f.value === null
                        ? "Tidak ada data andal yang terkonfirmasi"
                        : typeof f.value === "number"
                          ? f.unit === "IDR"
                            ? money(f.value)
                            : `${f.value} ${f.unit ?? ""}`
                          : f.value}
                    </td>
                    <td>
                      <span className={`fi-badge ${f.type}`}>
                        {evidenceLabels[f.type]}
                      </span>
                      <p>{f.note}</p>
                      {f.sourceId && (
                        <a href={`#source-${f.sourceId}`}>Lihat sumber</a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>
                    Usaha independen: tidak ada laporan outlet resmi. Semua
                    input operasional merupakan asumsi perencanaan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </details>
      <details className="fi-panel" id="assumptions">
        <summary>
          <SlidersHorizontal size={18} /> Asumsi & pengaturan model
        </summary>
        <p>
          Semua nilai uang dalam rupiah penuh. Rasio memakai desimal:{" "}
          <b>20% = 0,20</b>. Mengedit angka resmi mengubah status input menjadi
          estimasi pengguna.
        </p>
        <label className="fi-location">
          Lokasi asumsi
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Kota / kecamatan"
          />
        </label>
        <p>
          Memilih nama kota tidak mengubah biaya otomatis. Isi sewa, gaji,
          permintaan dan persaingan dari survei setempat secara terpisah.
        </p>
        <div className="fi-inputs">
          {(Object.keys(model.inputs) as InputKey[])
            .filter(
              (k) =>
                !(k === "commissionRate" && model.mode !== "commission-rate") &&
                !(
                  k === "commissionFixed" && model.mode !== "commission-fixed"
                ) &&
                !(k === "royaltyRate" && model.royaltyTiers),
            )
            .map((k) => (
              <label key={k}>
                <span>{labels[k]}</span>
                <input
                  type="number"
                  min="0"
                  max={k === "units" ? model.capacity : undefined}
                  step={k === "employees" || k === "days" ? "1" : "any"}
                  value={model.inputs[k].value}
                  onChange={(e) =>
                    setOverrides({
                      ...overrides,
                      [k]: e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                />
                <span className={`fi-badge ${model.inputs[k].type}`}>
                  {evidenceLabels[model.inputs[k].type]}
                </span>
                <small>{model.inputs[k].note}</small>
              </label>
            ))}
        </div>
        <p>
          Kapasitas: {model.capacity} {model.unit}. {model.capacityNote}
        </p>
        {model.royaltyTiers && (
          <p>
            Royalti progresif resmi:{" "}
            {model.royaltyTiers
              .map(
                (t) =>
                  `${compactMoney(t.from)}–${t.to === null ? "ke atas" : compactMoney(t.to)}: ${percent(t.rate)}`,
              )
              .join("; ")}
            .
          </p>
        )}
        <button
          onClick={() => {
            setOverrides({});
            setLocation(original.location);
          }}
          className="fi-button secondary"
        >
          <RotateCcw size={16} /> Reset asumsi
        </button>
      </details>
      {computed.error && (
        <div role="alert" className="fi-notice error">
          {computed.error} Buka asumsi untuk memperbaiki input; hasil dan
          unduhan ditahan.
        </div>
      )}
      {r && (
        <>
          <section id="model-summary">
            <div className="fi-title-row">
              <h3>Ringkasan model dasar</h3>
              <span className="fi-badge estimate">CEK BISNIS ESTIMATE</span>
            </div>
            <p>
              {location} · {model.inputs.units.value.toLocaleString("id-ID")}{" "}
              {model.unit} · {model.inputs.days.value} hari operasi
            </p>
            <div className="fi-kpis">
              {[
                [
                  "Total modal",
                  money(r.capital),
                  "CAPEX + fee + deposit + modal kerja",
                ],
                [
                  "Pendapatan / bulan",
                  money(r.revenue),
                  r.gmv !== null
                    ? "Komisi agen, bukan GMV"
                    : "Penjualan net pajak penjualan",
                ],
                [
                  "Laba operasional",
                  money(r.operatingProfit),
                  "EBITDA-like, sebelum pajak & cicilan",
                ],
                [
                  "Margin operasional",
                  percent(r.operatingMargin),
                  "Laba operasional ÷ pendapatan",
                ],
                [
                  "BEP minimum",
                  r.breakEvenRevenue === null
                    ? "Di luar kapasitas"
                    : `${Math.ceil(r.breakEvenUnits ?? 0)} ${model.unit}`,
                  r.breakEvenRevenue === null
                    ? "Model belum mencapai impas"
                    : `${money(r.breakEvenRevenue)} pendapatan/bulan`,
                ],
                ["Arus kas / bulan", money(r.cashFlow), "Setelah cadangan yang diinput"],
                [
                  "Payback",
                  months(r.payback),
                  "Total modal ÷ arus kas bulanan",
                ],
                [
                  "Keyakinan data",
                  conf.label,
                  conf.reason,
                ],
              ].map(([a, b, n]) => (
                <article key={a}>
                  <span>{a}</span>
                  <strong>{b}</strong>
                  <small>{n}</small>
                </article>
              ))}
            </div>
            {r.gmv !== null && (
              <div className="fi-formula">
                <b>GMV ongkir ≠ pendapatan agen</b>
                <p>
                  {model.inputs.units.value} paket ×{" "}
                  {money(model.inputs.ticket.value)} × {model.inputs.days.value}{" "}
                  hari = {money(r.gmv)} GMV ongkir.
                </p>
                <p>
                  {model.mode === "commission-fixed"
                    ? `${model.inputs.units.value} paket × ${money(model.inputs.commissionFixed.value)} komisi/paket × ${model.inputs.days.value} hari`
                    : `${money(r.gmv)} × ${percent(model.inputs.commissionRate.value)} komisi`}{" "}
                  = {money(r.revenue)} pendapatan agen.
                </p>
              </div>
            )}
            <div className="fi-decision-grid" aria-label="Poin keputusan utama">
              <article>
                <span>Target model dasar</span>
                <b>{Math.round(model.inputs.units.value)} {model.unit}</b>
              </article>
              <article>
                <span>Biaya bulanan terbesar</span>
                <b>{r.costs.filter((cost) => cost.value > 0).sort((a, b) => b.value - a.value)[0]?.name ?? "Belum tersedia"}</b>
              </article>
              <article>
                <span>Lokasi paling menentukan</span>
                <b>{d.locationDependency}</b>
              </article>
            </div>
            <details className="fi-panel">
              <summary>Lihat rincian angka dan rumus</summary>
              <p>
                {model.inputs.units.value} {model.unit} ×{" "}
                {money(
                  model.mode === "commission-fixed"
                    ? model.inputs.commissionFixed.value
                    : model.inputs.ticket.value,
                )}{" "}
                × {model.mode === "membership" ? 1 : model.inputs.days.value}{" "}
                periode{" "}
                {model.mode === "commission-rate"
                  ? `× ${percent(model.inputs.commissionRate.value)} komisi`
                  : ""}{" "}
                = {money(r.revenue)} pendapatan.
              </p>
              <p>
                Pendapatan {money(r.revenue)} − HPP {money(r.cogs)} = laba kotor{" "}
                {money(r.grossProfit)}. Dikurangi biaya tetap{" "}
                {money(r.fixedOpex)}, royalti {money(r.royalty)} dan bagi hasil{" "}
                {money(r.managementShare)} = laba operasional{" "}
                {money(r.operatingProfit)}.
              </p>
              <div className="fi-table-scroll">
                <table>
                  <tbody>
                    {[
                      ["CAPEX", money(r.capex)],
                      ["Fee awal", money(r.entryFee)],
                      ["Deposit", money(r.deposit)],
                      ["Modal kerja (stok + kas)", money(r.workingCapital)],
                      ["Cadangan kas", money(r.cashReserve)],
                      ["HPP / variabel", money(r.cogs)],
                      ["Laba kotor", money(r.grossProfit)],
                      ["Margin kotor", percent(r.grossMargin)],
                      ["OPEX tetap", money(r.fixedOpex)],
                      ["Total biaya termasuk HPP", money(r.totalOpex)],
                      ["Arus kas / bulan", money(r.cashFlow)],
                      [
                        "BEP volume",
                        r.breakEvenUnits === null
                          ? "Di luar kapasitas"
                          : `${Math.ceil(r.breakEvenUnits)} ${model.unit}`,
                      ],
                      ["ROI sederhana / tahun", percent(r.annualRoi)],
                    ].map(([a, b]) => (
                      <tr key={a}>
                        <th>{a}</th>
                        <td>{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>
          <section id="scenarios">
            <h3>Tiga skenario. Satu rumus.</h3>
            <p>
              Perubahan volume dengan harga dan biaya tetap yang sama; bukan
              probabilitas atau prediksi penjualan.
            </p>
            <div className="fi-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Metrik</th>
                    {c.map((s) => (
                      <th key={s.id}>{s.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>{model.unit}</th>
                    {c.map((s) => (
                      <td key={s.id}>
                        {Math.round(s.model.inputs.units.value)}
                      </td>
                    ))}
                  </tr>
                  {(
                    [
                      "revenue",
                      "operatingProfit",
                      "operatingMargin",
                      "payback",
                    ] as const
                  ).map((k) => (
                    <tr key={k}>
                      <th>
                        {
                          {
                            revenue: "Pendapatan",
                            operatingProfit: "Laba operasional",
                            operatingMargin: "Margin",
                            payback: "Payback",
                          }[k]
                        }
                      </th>
                      {c.map((s) => (
                        <td key={s.id}>
                          {k === "payback"
                            ? months(s.result[k])
                            : k === "operatingMargin"
                              ? percent(s.result[k])
                              : money(s.result[k])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <div className="fi-charts">
            <Chart
              variant="bar"
              title="Pendapatan, biaya & laba"
              ticks={c.map((s) => s.name)}
              series={[
                {
                  name: "Pendapatan",
                  color: "#235a9f",
                  values: c.map((s) => s.result.revenue),
                },
                {
                  name: "Total biaya",
                  color: "#8795a8",
                  values: c.map((s) => s.result.totalOpex),
                },
                {
                  name: "Laba operasi",
                  color: "#217560",
                  values: c.map((s) => s.result.operatingProfit),
                },
              ]}
              note="Termasuk HPP, payroll, sewa dan biaya model; tidak termasuk pajak penghasilan."
            />
            <article className="fi-chart">
              <h3>Ke mana uangnya pergi?</h3>
              <p>Struktur biaya bulanan · model dasar</p>
              <div className="fi-cost-bars">
                {r.costs
                  .filter((v) => v.value > 0)
                  .map((v) => (
                    <div key={v.name}>
                      <span>{v.name}</span>
                      <b>{compactMoney(v.value)}</b>
                      <i
                        style={{
                          width: `${(v.value / Math.max(1, r.totalOpex)) * 100}%`,
                        }}
                      />
                    </div>
                  ))}
              </div>
            </article>
            <Chart
              title="Arus kas kumulatif"
              xValues={cashSample.map((v) => v.month)}
              marker={
                r.payback === null
                  ? undefined
                  : { value: r.payback, label: `Payback bln ${r.payback}` }
              }
              ticks={cashSample.map((v) => `Bln ${v.month}`)}
              series={[
                {
                  name: "Kas setelah modal awal",
                  color: "#235a9f",
                  values: cashSample.map((v) => v.cash),
                },
              ]}
              note={`Bulan 0: -${money(r.capital)}. Payback ${months(r.payback)}. Volume konstan, tanpa ramp-up; grafik dibatasi 120 bulan.`}
            />
            <Chart
              title="Batas impas operasional"
              xValues={be.map((v) => v.units)}
              marker={
                r.breakEvenUnits === null
                  ? undefined
                  : {
                      value: r.breakEvenUnits,
                      label: `BEP ≈ ${Math.ceil(r.breakEvenUnits)}`,
                    }
              }
              ticks={be.map((v) => `${Math.round(v.units)}`)}
              series={[
                {
                  name: "Pendapatan",
                  color: "#235a9f",
                  values: be.map((v) => v.revenue),
                },
                {
                  name: "Biaya",
                  color: "#b56642",
                  values: be.map((v) => v.cost),
                },
              ]}
              note={`Sumbu X: ${model.unit}. BEP ${r.breakEvenUnits === null ? "belum terjangkau kapasitas" : `sekitar ${Math.ceil(r.breakEvenUnits)} ${model.unit}`}.`}
            />
            <Chart
              variant="bar"
              title="Sensitivitas terhadap volume"
              ticks={sens
                .filter((v) => v.result)
                .map(
                  (v) =>
                    `${v.change >= 0 ? "+" : ""}${Math.round(v.change * 100)}%`,
                )}
              series={[
                {
                  name: "Laba operasional",
                  color: "#217560",
                  values: sens.flatMap((v) =>
                    v.result ? [v.result.operatingProfit] : [],
                  ),
                },
              ]}
              note="Harga tetap: perubahan volume setara perubahan pendapatan. Titik di atas kapasitas tidak dihitung. Ubah sewa, payroll, HPP atau komisi di panel asumsi."
            />
          </div>
          <section className="fi-assessment" id="model-risks">
            <span className="fi-eyebrow">PENILAIAN CEK BISNIS</span>
            <h3>{assessment?.label}</h3>
            <p>{assessment?.reason}</p>
            <small>{assessment?.note}</small>
          </section>
          <div className="fi-risk-grid fi-risk-grid--concise">
            {[
              ["Kekuatan model", d.pros],
              [
                "Yang perlu diwaspadai",
                [...d.cons, ...d.operationalRisks, ...d.financialRisks].filter(
                  (item, index, all) => all.indexOf(item) === index,
                ).slice(0, 6),
              ],
            ].map(([title, items]) => (
              <article key={title as string}>
                <h3>{title}</h3>
                <ul>
                  {(items as string[]).map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <details className="fi-panel">
            <summary>Checklist verifikasi sebelum membuka usaha</summary>
            <ul>
              {model.limitations.map((n) => (
                <li key={n}>{n}</li>
              ))}
              <li>
                Catat volume aktual 7–14 hari, rata-rata struk, HPP, waste,
                utilisasi dan saldo kas. Target BEP adalah hasil model, bukan
                benchmark performa brand.
              </li>
              <li>
                Pastikan quotation mencakup seluruh fee, pajak, stok,
                pengiriman, renovasi dan perpanjangan kontrak.
              </li>
            </ul>
          </details>
          <div className="fi-download" id="download">
            <div>
              <h3>Bawa model ini saat survei.</h3>
              <p>
                PDF dan PNG mengikuti input yang sedang tampil, termasuk asumsi
                dan status data.
              </p>
            </div>
            <button
              className="fi-button"
              disabled={exportState === "loading"}
              onClick={() => void download("pdf")}
            >
              <Download size={17} /> Unduh laporan PDF
            </button>
            <button
              className="fi-button secondary"
              disabled={exportState === "loading"}
              onClick={() => void download("png")}
            >
              PNG ringkasan
            </button>
            <span role="status">
              {exportState === "loading"
                ? "Menyiapkan laporan…"
                : exportState === "error"
                  ? "Unduhan gagal. Silakan coba lagi."
                  : exportState === "success"
                    ? "Berkas siap diunduh."
                    : ""}
            </span>
          </div>
          <details
            className="fi-panel"
            onToggle={(e) => {
              if (e.currentTarget.open) setAiSeen(true);
            }}
          >
            <summary>Interpretasi AI (opsional)</summary>
            <p>
              AI hanya menjelaskan hasil model; tidak menjadi sumber angka dan
              tidak mengubah perhitungan.
            </p>
            {aiSeen && (
              <AIAnalysisPanel
                scenario={{
                  business: d.name,
                  category: model.archetype,
                  city: location,
                  province: "Belum diverifikasi",
                  scale: "Model deterministik 1.0",
                  capexLow: r.capex / 1e6,
                  capexHigh: r.capex / 1e6,
                  monthlyRevenue: r.revenue / 1e6,
                  monthlyOpex: r.totalOpex / 1e6,
                  monthlyProfit: r.operatingProfit / 1e6,
                  breakEvenRevenue: (r.breakEvenRevenue ?? 0) / 1e6,
                  paybackMonths: r.payback,
                  trafficTarget: r.breakEvenUnits ?? 0,
                  trafficLabel: model.unit,
                  risks: [
                    ...d.financialRisks,
                    ...(r.breakEvenRevenue === null
                      ? [
                          "BEP di luar kapasitas; angka 0 pada field BEP berarti tidak tersedia, bukan impas pada nol.",
                        ]
                      : []),
                  ],
                }}
              />
            )}
          </details>
        </>
      )}
      <section id="model-sources">
        <h3>Sumber & jejak koreksi</h3>
        <p>
          Tanggal tinjau bukan jaminan harga berlaku. Sumber konteks industri
          tidak memverifikasi laba model.
        </p>
        {sources.map((s) => (
          <article className="fi-source" key={s.id} id={`source-${s.id}`}>
            <div>
              <span className={`fi-badge ${s.sourceType}`}>
                {evidenceLabels[s.sourceType]}
              </span>
              <h4>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title} <ArrowUpRight size={14} />
                </a>
              </h4>
              <p>
                {s.publisher} · Terbit: {s.publishedAt ?? "tidak tercantum"} ·
                Verifikasi: {s.lastVerifiedAt ?? "belum berhasil"}
              </p>
            </div>
            <div>
              <b>Mendukung</b>
              <p>{s.supports}</p>
              <small>Status pemeriksaan: {s.status}</small>
            </div>
          </article>
        ))}
        <details className="fi-panel">
          <summary>Angka lama yang dikoreksi / dikarantina</summary>
          <ul>
            {d.research.corrections.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </details>
      </section>
    </section>
  );
}
