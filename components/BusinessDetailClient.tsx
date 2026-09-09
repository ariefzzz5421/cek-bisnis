"use client";
import Link from "next/link";
import { useState } from "react";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { EquipmentCatalog } from "@/components/EquipmentCatalog";
import { LocationSurvey } from "@/components/LocationSurvey";
import { getDossier } from "@/financial-models/catalog";
import { getBusinessDetail } from "@/lib/business-details";
import type { Business, City, Source } from "@/lib/business-data";
export function BusinessDetailClient({
  business,
  cities,
}: {
  business: Business;
  cities: City[];
  sources: Source[];
}) {
  const d = getDossier(business.id),
    detail = getBusinessDetail(business.id);
  const [city, setCity] = useState(""),
    [scale, setScale] = useState(detail.scales[1]?.id ?? detail.scales[0].id);
  const selected = detail.scales.find((s) => s.id === scale)!;
  return (
    <div className="fi-page">
      <header className="fi-business-header">
        <Link href="/usaha">← Semua jenis usaha</Link>
        <span className="fi-eyebrow">USAHA MANDIRI / RESEARCH DOSSIER</span>
        <h1>{business.name}</h1>
        <p>{business.description}</p>
        <div className="fi-header-links">
          <a href="#financial-model">Mulai analisis ↓</a>
          <a href="#lokasi">Survei lokasi</a>
          <Link href="/compare">Bandingkan usaha</Link>
        </div>
      </header>
      <section className="fi-panel">
        <h2>Format & lokasi rencana</h2>
        <div className="fi-inputs">
          <label>
            Kota rencana
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Belum dipilih</option>
              {cities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}, {c.province}
                </option>
              ))}
            </select>
          </label>
          <label>
            Format usaha
            <select value={scale} onChange={(e) => setScale(e.target.value)}>
              {detail.scales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p>
          {selected.name}: {selected.capacity}; {selected.staff};{" "}
          {selected.space}.{" "}
          <b>Deskripsi format merupakan asumsi, bukan kapasitas teruji.</b>
        </p>
        <p>
          Model di bawah memakai format dasar {d.name}. Untuk format lain, ubah
          volume, staf, peralatan dan sewa secara terpisah. Pemilihan format
          tidak mengalikan biaya atau permintaan secara otomatis.
        </p>
      </section>
      <FinancialDashboard
        key={city}
        dossier={d}
        initialModel={{
          ...d.model,
          location: city
            ? city + " — biaya lokal belum disurvei"
            : d.model.location,
        }}
      />
      <section className="fi-operations">
        <h2>Peralatan & rencana operasional</h2>
        <p className="fi-notice">
          Rincian alat adalah anggaran estimasi awal, bukan quotation resmi.
          Jumlah dan kapasitas mengikuti daftar format contoh, bukan seluruh
          pilihan format. Cocokkan total alat dengan input CAPEX pada model;
          jangan menjumlahkan dua kali.
        </p>
        <EquipmentCatalog business={business} />
        <div className="fi-risk-grid">
          <article>
            <h3>Operasi harian</h3>
            <ul>
              {business.dailyOps.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Cek sebelum buka</h3>
            <ul>
              {business.checklist.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </article>
        </div>
        <div className="fi-risk-grid">
          {business.plan90.map((p) => (
            <article key={p.phase}>
              <span className="fi-eyebrow">{p.phase}</span>
              <h3>{p.title}</h3>
              <ul>
                {p.actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <details className="fi-panel">
          <summary>Perizinan & mekanisme usaha</summary>
          <p>{business.scheme.model}</p>
          <p>{business.scheme.cashCycle}</p>
          <ul>
            {business.permits.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
          <p>
            Konfirmasikan persyaratan terkini melalui OSS dan pemerintah
            setempat; daftar ini bukan nasihat hukum.
          </p>
        </details>
      </section>
      <section id="lokasi">
        <LocationSurvey business={business} />
      </section>
      <div className="fi-download">
        <h3>Uji alternatif sebelum memilih.</h3>
        <Link className="fi-button" href="/compare">
          Bandingkan usaha
        </Link>
      </div>
    </div>
  );
}
