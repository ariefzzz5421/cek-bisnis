"use client";

import Image from "next/image";
import { useState } from "react";
import { BusinessIcon } from "@/components/BusinessIcon";
import { LocationSurvey } from "@/components/LocationSurvey";
import { businesses } from "@/lib/business-data";

export function SurveyPageClient() {
  const [businessId, setBusinessId] = useState(businesses[0].id);
  const business = businesses.find((item) => item.id === businessId) ?? businesses[0];

  return (
    <>
      <section className="survey-page-hero">
        <div>
          <span>497 KOTA & KABUPATEN</span>
          <h1>Survei usaha<br />di seluruh Indonesia.</h1>
          <p>Pilih usaha. Cari kota. Klik titik lokasi.</p>
        </div>
        <Image src="/businesses/toko-kelontong.jpg" alt="Contoh toko kelontong Indonesia" width={1536} height={1024} priority unoptimized />
      </section>

      <section className="survey-business-picker">
        <span>PILIH JENIS USAHA</span>
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
