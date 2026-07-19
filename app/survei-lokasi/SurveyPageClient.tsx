"use client";

import Image from "next/image";
import { useState } from "react";
import { BusinessIcon } from "@/components/BusinessIcon";
import { LocationSurvey } from "@/components/LocationSurvey";
import { businesses } from "@/lib/business-data";
import { placesMeta } from "@/lib/location-survey";

export function SurveyPageClient() {
  const [businessId, setBusinessId] = useState(businesses[0].id);
  const business = businesses.find((item) => item.id === businessId) ?? businesses[0];

  return (
    <>
      <section className="survey-page-hero survey-workbench-hero">
        <div className="survey-workbench-hero__copy">
          <span>PETA USAHA INDONESIA</span>
          <h1>Cek lokasi sebelum<br />membayar sewa.</h1>
          <p>Cari kota, klik titik, lalu baca skor awal, pesaing sekitar, pemicu ramai, dan estimasi omzet.</p>
          <dl><div><dt>Kota & kabupaten</dt><dd>{placesMeta.count}</dd></div><div><dt>Data titik</dt><dd>OpenStreetMap</dd></div></dl>
        </div>
        <div className="survey-workbench-hero__media"><Image src="/businesses/toko-kelontong.jpg" alt="Contoh toko kelontong Indonesia" width={1536} height={1024} priority unoptimized /><span><b>Pilih titik</b> lalu jalankan survei</span></div>
      </section>

      <section className="survey-business-picker">
        <span>USAHA YANG DIUJI</span>
        <div>
          {businesses.map((item) => (
            <button
              type="button"
              key={item.id}
              className={item.id === business.id ? "active" : ""}
              onClick={() => setBusinessId(item.id)}
              style={{ "--accent": item.accent } as React.CSSProperties}
            >
              <BusinessIcon id={item.id} size={21} />{item.short}
            </button>
          ))}
        </div>
      </section>

      <div className="survey-page-content">
        <LocationSurvey business={business} />
      </div>
    </>
  );
}
