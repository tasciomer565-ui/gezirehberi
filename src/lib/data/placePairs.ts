import placeDistancesRaw from "./placeDistances.json";
import { allCities } from "./cities";
import { popularDistricts } from "./districts";
import { transferPlaces } from "./transferPlaces";
import { haversineDistanceKm } from "../geo";
import type { City } from "../types";

// Merkez şehir -> tatil yeri mesafe sayfaları (2026-10-02): "İstanbul Alanya
// arası kaç km" gibi sorgular. Tatil yerleri, sitede ayrı şehir sayfası
// olmayan ilçeler (Alanya, Kuşadası, Göreme...) ve transfer noktaları (Kemer,
// Side...). Bozcaada ve Gökçeada feribotla gidildiği için yok — otomatik
// karayolu rotası orada yanıltıcı olurdu.
export const PLACE_PAIR_HUBS = [
  "istanbul", "ankara", "izmir", "antalya", "bursa", "konya",
  "adana", "kayseri", "gaziantep", "samsun", "trabzon", "eskisehir",
];
const FERRY_ONLY = new Set(["bozcaada", "gokceada"]);

export interface Place {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  citySlug: string; // linklenecek şehir
  province: string;
  // Sitedeki ilgili sayfa: ilçe sayfası, yoksa bağlı olduğu şehrin sayfası.
  // Bölge, tatil yerinin kendi şehrinden alınır (2026-10-12 denetimi: merkez
  // şehrin bölgesi kullanılınca /bolgeler/marmara/aydin gibi 25 kırık link).
  href: string;
  summary?: string;
}

const cityBySlug = new Map(allCities.map((c) => [c.slug, c]));

export const places: Place[] = [
  ...popularDistricts
    .filter((d) => !cityBySlug.has(d.slug) && !FERRY_ONLY.has(d.slug))
    .map((d) => {
      const city = cityBySlug.get(d.citySlug);
      return {
        slug: d.slug,
        name: d.name,
        lat: d.location.lat,
        lng: d.location.lng,
        citySlug: d.citySlug,
        province: city?.name ?? "",
        href: city ? `/bolgeler/${city.regionSlug}/${city.slug}/${d.slug}` : "",
        summary: d.summary,
      };
    }),
  ...transferPlaces.map((p) => {
    const city = cityBySlug.get(p.citySlug);
    return {
      slug: p.slug,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      citySlug: p.citySlug,
      province: p.province,
      href: city ? `/bolgeler/${city.regionSlug}/${city.slug}` : "",
    };
  }),
];

export interface PlacePair {
  slug: string; // alfabetik "a-b"
  citySlug: string;
  place: Place;
}

export function getPlacePairs(): PlacePair[] {
  const out: PlacePair[] = [];
  for (const hub of PLACE_PAIR_HUBS) {
    const city = cityBySlug.get(hub);
    if (!city) continue;
    for (const place of places) {
      if (haversineDistanceKm(city.location, place) < 10) continue;
      const slug = [hub, place.slug].sort().join("-");
      out.push({ slug, citySlug: hub, place });
    }
  }
  return out;
}

interface Entry { distanceKm: number; durationMin: number; roadNames: string[] }
const distances = placeDistancesRaw as Record<string, Entry>;

export interface PlacePairData {
  slug: string;
  city: City;
  place: Place;
  distanceKm: number;
  durationMin: number;
  majorRoads: string[];
}

export function getPlacePairData(slug: string): PlacePairData | undefined {
  const pair = getPlacePairs().find((p) => p.slug === slug);
  const entry = distances[slug];
  const city = pair && cityBySlug.get(pair.citySlug);
  if (!pair || !entry || !city) return undefined;
  const cityStreet = /cadde|sokak|sokağı|bulvar|\bcd\.|\bsk\./i;
  return {
    slug,
    city,
    place: pair.place,
    distanceKm: entry.distanceKm,
    durationMin: entry.durationMin,
    majorRoads: entry.roadNames.filter((n) => !cityStreet.test(n)).slice(0, 5),
  };
}

export function getAllPlacePairData(): PlacePairData[] {
  return getPlacePairs()
    .map((p) => getPlacePairData(p.slug))
    .filter((d): d is PlacePairData => Boolean(d));
}

// Aynı tatil yerine diğer merkezlerden mesafeler (sayfa içi link).
export function getPlacePairsForPlace(placeSlug: string): PlacePairData[] {
  return getAllPlacePairData()
    .filter((d) => d.place.slug === placeSlug)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
