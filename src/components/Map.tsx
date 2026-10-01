"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapMarker {
  id: string;
  name: string;
  position: [number, number];
  category?: string;
}

interface MapProps {
  center: [number, number];
  zoom?: number;
  markers: MapMarker[];
  polylineCoords?: Array<[number, number]>;
  themeColor?: string;
  locale?: string;
}

// Custom SVG icon generator for a premium look
const createSvgIcon = (color: string, label: string) => {
  const svgHtml = `
    <div style="position: relative; display: flex; flex-col; items-center; justify-content: center; width: 40px; height: 40px;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="36" height="36" style="filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.3));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      <div style="position: absolute; top: 6px; font-family: sans-serif; font-size: 11px; font-weight: bold; color: white; background: rgba(0,0,0,0.25); border-radius: 50%; width: 16px; height: 16px; display: flex; items-center; justify-content: center;">
        ${label}
      </div>
    </div>
  `;
  
  return L.divIcon({
    html: svgHtml,
    className: "custom-leaflet-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 36],
    popupAnchor: [0, -36],
  });
};

export default function Map({
  center,
  zoom = 12,
  markers,
  polylineCoords = [],
  themeColor = "#b33a25",
  locale = "tr",
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Detect if site is in dark mode
    const isDarkMode =
      document.documentElement.getAttribute("data-theme") === "dark" ||
      (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    // CARTO basemap'leri 2026'da API anahtarı istemeye başladı; anahtarsız
    // istekler "API KEY REQUIRED" karosu döndürüyordu (tüm haritalar boştu).
    // OpenStreetMap standart karoları anahtarsız; koyu temada CSS filtresiyle
    // koyulaştırılıyor (globals.css .map-tiles-dark).
    const tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      className: isDarkMode ? "map-tiles-dark" : "",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları',
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers and polyline when data changes
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear old markers
    markersLayer.clearLayers();

    // Add new markers
    const leafletMarkers: L.Marker[] = [];
    markers.forEach((marker, index) => {
      const label = (index + 1).toString();
      const icon = createSvgIcon(themeColor, label);
      
      const m = L.marker(marker.position, { icon: icon })
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="color: #22201b; font-size: 13px;">${marker.name}</strong>
            ${marker.category ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #b33a25; text-transform: uppercase; font-weight: bold;">${marker.category}</p>` : ""}
          </div>
        `);
      
      m.addTo(markersLayer);
      leafletMarkers.push(m);
    });

    // Handle Route Polyline (Draw connecting lines)
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (polylineCoords.length > 1) {
      const poly = L.polyline(polylineCoords, {
        color: themeColor,
        weight: 3.5,
        opacity: 0.8,
        dashArray: "6, 8",
        lineJoin: "round",
      }).addTo(map);

      polylineRef.current = poly;
    }

    // Auto-fit bounds to show all markers and polyline
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => m.position));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView(center, zoom);
    }
  }, [markers, polylineCoords, themeColor, center, zoom]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl border border-ink/10 shadow-lg">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: "350px" }} />
      <div className="absolute left-3 top-3 z-10 rounded-lg bg-paper/90 backdrop-blur border border-ink/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink shadow">
        🗺️ {locale === "tr" ? "CANLI ROTA HARİTASI" : locale === "de" ? "LIVE-ROUTE-KARTE" : locale === "ar" ? "خريطة المسار الحي" : "LIVE ROUTE MAP"}
      </div>
    </div>
  );
}
