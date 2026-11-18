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
    .filter((d) => !cityBySlug.has(d.slug) && !FERRY_ONLY.has(d.slug) && !d.urban)
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

// Merkez listesinde olmayan ama Search Console'da aranan çiftler (2026-10-12
// export'u: aksaray göreme 37, ayvalık balıkesir 25, fethiye turgutreis gösterim).
const EXTRA_PAIRS: [string, string][] = [
  ["aksaray", "goreme"],
  ["balikesir", "ayvalik"],
  ["fethiye", "turgutreis"],
];

// Sonuçlar modül düzeyinde önbelleğe alınıyor: önceden getPlacePairData her
// çağrıda tüm çift listesini yeniden hesaplıyordu (getAllPlacePairData için
// kare katı iş) ve her şehir sayfası bunu 85 şehir x birkaç kez çağırdığı için
// Vercel build'inde sayfa üretimi 60 sn'yi aşıyordu (2026-11-07).
let pairsCache: PlacePair[] | undefined;
export function getPlacePairs(): PlacePair[] {
  return (pairsCache ??= computePlacePairs());
}

function computePlacePairs(): PlacePair[] {
  const out: PlacePair[] = [];
  for (const [citySlug, placeSlug] of EXTRA_PAIRS) {
    const place = places.find((p) => p.slug === placeSlug);
    if (place) out.push({ slug: [citySlug, placeSlug].sort().join("-"), citySlug, place });
  }
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

let pairBySlugCache: Map<string, PlacePair> | undefined;
function getPairBySlug(slug: string): PlacePair | undefined {
  if (!pairBySlugCache) {
    pairBySlugCache = new Map();
    for (const p of getPlacePairs()) if (!pairBySlugCache.has(p.slug)) pairBySlugCache.set(p.slug, p);
  }
  return pairBySlugCache.get(slug);
}

export function getPlacePairData(slug: string): PlacePairData | undefined {
  const pair = getPairBySlug(slug);
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

let allPairDataCache: PlacePairData[] | undefined;
export function getAllPlacePairData(): PlacePairData[] {
  return (allPairDataCache ??= getPlacePairs()
    .map((p) => getPlacePairData(p.slug))
    .filter((d): d is PlacePairData => Boolean(d)));
}

// Aynı tatil yerine diğer merkezlerden mesafeler (sayfa içi link).
export function getPlacePairsForPlace(placeSlug: string): PlacePairData[] {
  return getAllPlacePairData()
    .filter((d) => d.place.slug === placeSlug)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
