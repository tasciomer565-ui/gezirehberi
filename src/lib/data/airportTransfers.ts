import transfersRaw from "./airportTransfers.json";
import { allCities } from "./cities";
import { popularDistricts } from "./districts";
import { airports, airportSlug, type Airport } from "./airports";

// scripts/generate-airport-transfers.ts çıktısı (OSRM karayolu verisi).
export interface AirportTransfer {
  kind: "city" | "district" | "place";
  slug: string;
  citySlug: string;
  name: string;
  distanceKm: number;
  durationMin: number;
  href: string; // sitedeki ilgili sayfa (şehir / ilçe / en yakın şehir)
}

const raw = transfersRaw as Record<string, Omit<AirportTransfer, "href">[]>;

function hrefFor(t: Omit<AirportTransfer, "href">): string {
  const city = allCities.find((c) => c.slug === t.citySlug);
  if (!city) return "";
  if (t.kind === "district" && popularDistricts.some((d) => d.slug === t.slug && d.citySlug === t.citySlug)) {
    return `/bolgeler/${city.regionSlug}/${city.slug}/${t.slug}`;
  }
  return `/bolgeler/${city.regionSlug}/${city.slug}`;
}

export function getAirportTransfers(iata: string): AirportTransfer[] {
  return (raw[iata] ?? []).map((t) => ({ ...t, href: hrefFor(t) }));
}

// En az 2 varış noktası olan havalimanları sayfa alır.
export function getAirportsWithTransfers(): Airport[] {
  return airports.filter((a) => getAirportTransfers(a.iata).length >= 2);
}

export function getAirportPageSlugs(): string[] {
  return getAirportsWithTransfers().map(airportSlug);
}
