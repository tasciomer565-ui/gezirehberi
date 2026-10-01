"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PlacesMapProps {
  center: [number, number];
  zoom?: number;
  places: any[];
  themeColor?: string;
  locale?: string;
  onBoundsChange?: (bounds: { northEast: [number, number]; southWest: [number, number] }) => void;
}

// Custom category colors for map pins
const CATEGORY_COLORS: Record<string, string> = {
  historical: "#8A3A2B", // Kiremit Red
  nature: "#2F5F40", // Green
  beach: "#16909C", // Blue
  viewpoint: "#B7791F", // Gold
  museum: "#8A2B45", // Purple
  activity: "#0F5257", // Deep Teal
  shopping: "#D97706", // Amber
  default: "#b33a25"
};

const createSingleIcon = (color: string, label: string) => {
  const svgHtml = `
    <div style="position: relative; display: flex; items-center; justify-content: center; width: 34px; height: 34px;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.35));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      <div style="position: absolute; top: 5px; font-family: sans-serif; font-size: 9px; font-weight: bold; color: white; border-radius: 50%; width: 14px; height: 14px; display: flex; items-center; justify-content: center;">
        ${label}
      </div>
    </div>
  `;
  
  return L.divIcon({
    html: svgHtml,
    className: "custom-places-icon",
    iconSize: [34, 34],
    iconAnchor: [17, 32],
    popupAnchor: [0, -32],
  });
};

const createClusterIcon = (count: number) => {
  const size = count < 10 ? 32 : count < 50 ? 38 : 44;
  const color = "#b33a25";
  const html = `
    <div style="
      width: ${size}px; 
      height: ${size}px; 
      border-radius: 50%; 
      background: rgba(179, 58, 37, 0.12); 
      border: 2px solid ${color}; 
      color: ${color}; 
      font-weight: bold; 
      font-family: sans-serif;
      font-size: 11px; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      box-shadow: 0 2px 8px rgba(179,58,37,0.3);
      cursor: pointer;
    ">
      ${count}
    </div>
  `;
  return L.divIcon({
    html,
    className: "custom-places-cluster",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

export default function PlacesMap({
  center,
  zoom = 12,
  places,
  themeColor = "#b33a25",
  locale = "tr",
  onBoundsChange
}: PlacesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const isDarkMode =
      document.documentElement.getAttribute("data-theme") === "dark" ||
      (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    // CARTO basemap'leri 2026'da API anahtarı istemeye başladı; anahtarsız
    // istekler "API KEY REQUIRED" karosu döndürüyordu (tüm haritalar boştu).
    // OpenStreetMap standart karoları anahtarsız; koyu temada CSS filtresiyle
    // koyulaştırılıyor (globals.css .map-tiles-dark).
    const tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

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

    // Track Zoom Changes to update clusters dynamically
    map.on("zoomend", () => {
      setCurrentZoom(map.getZoom());
    });

    // Debounced bounds change trigger to synchronize list with map view boundaries
    let debounceTimer: NodeJS.Timeout;
    map.on("moveend", () => {
      if (!onBoundsChange) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const bounds = map.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        onBoundsChange({
          northEast: [ne.lat, ne.lng],
          southWest: [sw.lat, sw.lng]
        });
      }, 350); // 350ms debouncing to prevent spamming server requests
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers & Perform Dynamic Client-Side Clustering
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // Perform distance-based clustering algorithm based on current zoom level
    const clusterRadius = 0.08 / Math.pow(2, currentZoom - 10);
    const visited = new Set<string>();
    const markersToRender: any[] = [];

    // Filter out places with invalid coords
    const validPlaces = places.filter(p => p.location && p.location.lat && p.location.lng);

    for (let i = 0; i < validPlaces.length; i++) {
      const p1 = validPlaces[i];
      if (visited.has(p1.id)) continue;

      const neighbors = [p1];
      visited.add(p1.id);

      for (let j = i + 1; j < validPlaces.length; j++) {
        const p2 = validPlaces[j];
        if (visited.has(p2.id)) continue;

        const dx = p1.location.lng - p2.location.lng;
        const dy = p1.location.lat - p2.location.lat;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < clusterRadius) {
          neighbors.push(p2);
          visited.add(p2.id);
        }
      }

      if (neighbors.length > 1) {
        let sumLat = 0;
        let sumLng = 0;
        neighbors.forEach(n => {
          sumLat += n.location.lat;
          sumLng += n.location.lng;
        });
        markersToRender.push({
          isCluster: true,
          position: [sumLat / neighbors.length, sumLng / neighbors.length],
          count: neighbors.length,
          places: neighbors
        });
      } else {
        markersToRender.push({
          isCluster: false,
          position: [p1.location.lat, p1.location.lng],
          place: p1,
          index: i
        });
      }
    }

    // Render clustered / individual markers onto map layer
    markersToRender.forEach(m => {
      if (m.isCluster) {
        const clusterIcon = createClusterIcon(m.count);
        const marker = L.marker(m.position, { icon: clusterIcon });
        
        marker.on("click", () => {
          // Zoom in on cluster click to reveal individual pins
          const current = map.getZoom();
          map.setView(m.position, current + 2, { animate: true });
        });

        marker.addTo(markersLayer);
      } else {
        const p = m.place;
        const color = CATEGORY_COLORS[p.category || "default"] || themeColor;
        const label = (m.index + 1).toString();
        const singleIcon = createSingleIcon(color, label);
        
        const priceTag = p.priceSegment !== undefined 
          ? "• " + "$".repeat(p.priceSegment) 
          : p.pricePerNight 
          ? `• ${p.pricePerNight}` 
          : "";

        const ratingText = p.rating 
          ? `<span style="color:#b33a25; font-weight:bold;">★ ${p.rating}</span> (${p.reviewCount} ${locale === "tr" ? "yorum" : "reviews"})` 
          : "";

        const marker = L.marker(m.position, { icon: singleIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 4px; min-width: 150px; line-height: 1.4;">
              <strong style="color: #22201b; font-size: 13px; display: block; margin-bottom: 2px;">${p.name}</strong>
              <div style="font-size: 11px; margin-bottom: 4px;">
                ${ratingText} ${priceTag}
              </div>
              <p style="margin: 0; font-size: 11px; color: #666;">${p.address || ""}</p>
            </div>
          `);

        marker.addTo(markersLayer);
      }
    });

  }, [places, currentZoom, themeColor, locale]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl border border-ink/10 shadow-md bg-paper/50">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: "100%" }} />
      <div className="absolute left-3 top-3 z-[400] rounded-lg bg-paper/95 backdrop-blur-md border border-ink/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink shadow">
        📍 {locale === "tr" ? "HARİTA KEŞİF PANELİ" : locale === "de" ? "KARTE ERKUNDUNG" : locale === "ar" ? "لوحة الخريطة" : "MAP DISCOVERY"}
      </div>
    </div>
  );
}
