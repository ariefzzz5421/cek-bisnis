"use client";

import { useEffect, useRef } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import type { Business, City } from "@/lib/business-data";

const scoreTone = (score: number) => score >= 86 ? "#B7F26C" : score >= 80 ? "#F4C95D" : "#FF8A77";

export function BusinessMap({
  business,
  selectedCity,
  onSelectCity,
}: {
  business: Business;
  selectedCity: City;
  onSelectCity: (cityId: string) => void;
}) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);

  useEffect(() => {
    let active = true;

    import("leaflet").then((L) => {
      if (!active || !elementRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(elementRef.current, {
          center: [-3.4, 117.8],
          zoom: 4,
          minZoom: 4,
          maxZoom: 11,
          zoomControl: false,
          scrollWheelZoom: false,
        });
        L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      layerRef.current?.remove();
      layerRef.current = L.layerGroup().addTo(mapRef.current);

      import("@/lib/business-data").then(({ cities }) => {
        if (!mapRef.current || !layerRef.current) return;
        cities.forEach((city) => {
          const score = city.scores[business.id];
          const selected = city.id === selectedCity.id;
          const marker = L.circleMarker([city.lat, city.lng], {
            radius: selected ? 12 : 6 + (score - 65) / 5,
            color: selected ? "#FFFFFF" : scoreTone(score),
            weight: selected ? 3 : 2,
            fillColor: scoreTone(score),
            fillOpacity: selected ? 0.98 : 0.78,
          });
          marker.bindTooltip(
            `<strong>${city.name}</strong><br/>Skor ${score}/100<br/>${city.hotspots[0]}`,
            { direction: "top", offset: [0, -8] },
          );
          marker.on("click", () => onSelectCity(city.id));
          marker.addTo(layerRef.current!);
        });
      });
    });

    return () => {
      active = false;
    };
  }, [business, onSelectCity, selectedCity.id]);

  useEffect(() => () => {
    mapRef.current?.remove();
    mapRef.current = null;
  }, []);

  return <div className="detail-map-canvas" ref={elementRef} aria-label={`Peta peluang ${business.name} di Indonesia`} />;
}
