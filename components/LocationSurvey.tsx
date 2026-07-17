"use client";

import { AlertTriangle, Building2, LoaderCircle, MapPin, Search, Store, Users, Waypoints } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import type { Business } from "@/lib/business-data";
import { formatMoney } from "@/lib/business-data";
import {
  analyzeOsmSurvey,
  buildOverpassQuery,
  findNearestPlace,
  indonesiaPlaces,
  normalizeSearch,
  placesMeta,
  type IndonesiaPlace,
  type LocationSurveyResult,
  type OsmElement,
} from "@/lib/location-survey";

const defaultPlace = indonesiaPlaces.find((place) => place.name === "Kediri") ?? indonesiaPlaces[0]!;
const endpoints = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

type SelectedPoint = { lat: number; lng: number; place: IndonesiaPlace; distance: number };
type OverpassResponse = { elements: OsmElement[]; osm3s?: { timestamp_osm_base?: string } };

export function LocationSurvey({ business }: { business: Business }) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const resultLayerRef = useRef<LayerGroup | null>(null);
  const clickHandlerRef = useRef<(lat: number, lng: number) => void>(() => {});
  const [selected, setSelected] = useState<SelectedPoint>({ lat: defaultPlace.lat, lng: defaultPlace.lng, place: defaultPlace, distance: 0 });
  const [mapReady, setMapReady] = useState(false);
  const [query, setQuery] = useState("");
  const [radius, setRadius] = useState(1000);
  const [result, setResult] = useState<LocationSurveyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchResults = useMemo(() => {
    const normalized = normalizeSearch(query.trim());
    if (normalized.length < 2) return [];
    return indonesiaPlaces
      .filter((place) => normalizeSearch(`${place.name} ${place.province}`).includes(normalized))
      .sort((a, b) => b.population - a.population)
      .slice(0, 8);
  }, [query]);

  const choosePoint = (lat: number, lng: number, place?: IndonesiaPlace) => {
    const nearest = place ? { place, distance: 0 } : findNearestPlace(lat, lng);
    setSelected({ lat, lng, ...nearest });
    setResult(null);
    setError("");
    setQuery(place ? `${place.name}, ${place.province}` : "");
    mapRef.current?.setView([lat, lng], Math.max(mapRef.current.getZoom(), 13), { animate: true });
  };

  useEffect(() => {
    clickHandlerRef.current = (lat, lng) => choosePoint(lat, lng);
  });

  useEffect(() => {
    let disposed = false;
    let localMap: LeafletMap | null = null;

    void import("leaflet").then((L) => {
      if (disposed || !mapElement.current || mapRef.current) return;
      localMap = L.map(mapElement.current, { zoomControl: true, minZoom: 5 }).setView(
        [defaultPlace.lat, defaultPlace.lng],
        12,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(localMap);
      localMap.on("click", (event) => clickHandlerRef.current(event.latlng.lat, event.latlng.lng));
      mapRef.current = localMap;
      setMapReady(true);
    });

    return () => {
      disposed = true;
      localMap?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    void import("leaflet").then((L) => {
      if (disposed || !mapRef.current) return;
      mapRef.current.setView([selected.lat, selected.lng], Math.max(mapRef.current.getZoom(), 13), { animate: true });
      resultLayerRef.current?.remove();
      const layer = L.layerGroup().addTo(mapRef.current);
      L.circle([selected.lat, selected.lng], {
        radius,
        color: "#121617",
        fillColor: "#B7F26C",
        fillOpacity: 0.12,
        weight: 2,
      }).addTo(layer);
      L.circleMarker([selected.lat, selected.lng], {
        radius: 9,
        color: "#121617",
        fillColor: business.accent,
        fillOpacity: 1,
        weight: 3,
      }).bindTooltip("Titik usaha").addTo(layer);

      result?.pois.slice(0, 30).forEach((poi) => {
        const competitor = poi.category === "competitor";
        L.circleMarker([poi.lat, poi.lng], {
          radius: competitor ? 6 : 4,
          color: competitor ? "#7D2E2E" : "#135F66",
          fillColor: competitor ? "#FF8A77" : "#5CE1E6",
          fillOpacity: 0.9,
          weight: 2,
        }).bindTooltip(`${poi.name} · ${Math.round(poi.distance * 1000)} m`).addTo(layer);
      });
      resultLayerRef.current = layer;
    });
    return () => { disposed = true; };
  }, [business.accent, mapReady, radius, result, selected.lat, selected.lng]);

  const runSurvey = async () => {
    setLoading(true);
    setError("");
    const cacheKey = `cek-bisnis-survey-v1:${business.id}:${selected.lat.toFixed(4)}:${selected.lng.toFixed(4)}:${radius}`;

    try {
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as LocationSurveyResult;
        if (Date.now() - new Date(parsed.timestamp).getTime() < 6 * 60 * 60 * 1000) {
          setResult(parsed);
          setLoading(false);
          return;
        }
      }

      const overpassQuery = buildOverpassQuery(selected.lat, selected.lng, radius);
      let payload: OverpassResponse | null = null;
      for (const endpoint of endpoints) {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 24_000);
        try {
          const response = await fetch(`${endpoint}?data=${encodeURIComponent(overpassQuery)}`, { signal: controller.signal });
          if (!response.ok) continue;
          payload = await response.json() as OverpassResponse;
          break;
        } catch {
          // Try the next public Overpass endpoint.
        } finally {
          window.clearTimeout(timeout);
        }
      }
      if (!payload) throw new Error("Data peta sedang sibuk. Coba lagi satu menit lagi.");

      const analysis = analyzeOsmSurvey({
        business,
        elements: payload.elements,
        place: selected.place,
        lat: selected.lat,
        lng: selected.lng,
        osmTimestamp: payload.osm3s?.timestamp_osm_base,
      });
      window.localStorage.setItem(cacheKey, JSON.stringify(analysis));
      setResult(analysis);
    } catch (surveyError) {
      setError(surveyError instanceof Error ? surveyError.message : "Survei gagal dimuat.");
    } finally {
      setLoading(false);
    }
  };

  const nearestCompetitors = result?.pois.filter((poi) => poi.category === "competitor").slice(0, 5) ?? [];

  return (
    <section className="survey-shell" aria-labelledby={`survey-${business.id}`}>
      <div className="survey-topbar">
        <div>
          <span className="section-kicker">SURVEI LOKASI</span>
          <h2 id={`survey-${business.id}`}>Klik titik. Baca peluang.</h2>
        </div>
        <div className="survey-source-pill"><span /> OSM + GeoNames</div>
      </div>

      <div className="survey-controls">
        <div className="place-search">
          <Search size={18} />
          <input
            aria-label="Cari kota atau kabupaten"
            placeholder="Cari kota atau kabupaten..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {searchResults.length > 0 && query !== `${selected.place.name}, ${selected.place.province}` && (
            <div className="place-results">
              {searchResults.map((place) => (
                <button type="button" key={place.id} onClick={() => choosePoint(place.lat, place.lng, place)}>
                  <span><b>{place.name}</b><small>{place.province}</small></span>
                  <em>{place.population > 0 ? `${place.population.toLocaleString("id-ID")} jiwa` : "Pusat wilayah"}</em>
                </button>
              ))}
            </div>
          )}
        </div>
        <select aria-label="Radius survei" value={radius} onChange={(event) => { setRadius(Number(event.target.value)); setResult(null); }}>
          <option value={500}>Radius 500 m</option>
          <option value={1000}>Radius 1 km</option>
          <option value={1500}>Radius 1,5 km</option>
        </select>
        <button className="survey-run" type="button" onClick={runSurvey} disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={18} /> : <Waypoints size={18} />}
          {loading ? "Membaca peta..." : "Jalankan survei"}
        </button>
      </div>

      <div className="survey-layout">
        <div className="survey-map-wrap">
          <div className="survey-map" ref={mapElement} />
          <div className="survey-map-hint"><MapPin size={15} /> Klik titik mana pun di Indonesia</div>
        </div>

        <aside className="survey-result" aria-live="polite">
          <div className="selected-place">
            <span>TITIK TERPILIH</span>
            <h3>{selected.place.name}</h3>
            <p>{selected.place.province} · {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</p>
          </div>

          {!result && !error && (
            <div className="survey-empty">
              <MapPin size={28} />
              <b>Siap disurvei</b>
              <p>Pilih titik lalu tekan tombol survei.</p>
            </div>
          )}
          {error && <div className="survey-error"><AlertTriangle size={19} />{error}</div>}
          {result && (
            <>
              <div className="survey-score" style={{ "--score-color": business.accent } as React.CSSProperties}>
                <strong>{result.score}</strong><span>/100<small>Skor awal</small></span>
              </div>
              <div className="survey-metrics">
                <div><Store size={17} /><span><b>{result.competitorCount}</b><small>Pesaing</small></span></div>
                <div><Users size={17} /><span><b>{result.anchorCount}</b><small>Pemicu ramai</small></span></div>
                <div><Building2 size={17} /><span><b>{result.buildingCount}</b><small>Bangunan</small></span></div>
                <div><Waypoints size={17} /><span><b>{result.accessCount}</b><small>Akses utama</small></span></div>
              </div>
              <div className="survey-revenue">
                <small>Estimasi omzet model</small>
                <b>{formatMoney(result.estimatedRevenueLow, 0)}-{formatMoney(result.estimatedRevenueHigh, 0).replace("Rp", "")}</b>
                <span>per bulan</span>
              </div>
              <div className="survey-components">
                {Object.entries(result.components).map(([label, value]) => (
                  <div key={label}><span>{label}</span><i><b style={{ width: `${Math.min(100, value / (label === "demand" ? 35 : label === "market" ? 10 : 15) * 100)}%` }} /></i><em>{value}</em></div>
                ))}
              </div>
              {nearestCompetitors.length > 0 && (
                <div className="competitor-list">
                  <span>PESAING TERDEKAT</span>
                  {nearestCompetitors.map((poi) => <div key={poi.id}><b>{poi.name}</b><em>{Math.round(poi.distance * 1000)} m</em></div>)}
                </div>
              )}
              <p className="survey-coverage">Kepadatan data peta: {result.coverage}% · populasi kota terdekat {selected.place.population > 0 ? selected.place.population.toLocaleString("id-ID") : "-"}</p>
            </>
          )}
        </aside>
      </div>

      <div className="survey-footnote">
        <AlertTriangle size={16} />
        <span>Skor = aktivitas sekitar + kompetisi + kepadatan + akses + ukuran kota. Ini penyaring awal, bukan data penjualan atau jumlah orang lewat.</span>
        <a href={placesMeta.sourceUrl} target="_blank" rel="noreferrer">GeoNames {placesMeta.license}</a>
      </div>
    </section>
  );
}
