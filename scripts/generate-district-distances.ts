// Turistik ilçelerin bağlı olduğu şehir merkezine gerçek karayolu mesafesi
// ve süresi — src/lib/data/districtDistances.json.
//
// Neden: Search Console ve Google'ın "ilgili aramalar"ı ilçe düzeyinde mesafe
// soruyor ("izmir çeşme arası kaç km", "balıkesir ayvalık", "trabzon uzungöl").
// İlçe sayfalarında bu bilgi hiç yoktu. Kaynak, mesafe sayfalarıyla aynı yol
// motoru (OSRM — bkz. scripts/generate-distance-data.ts başındaki not).
//
// İlçe ile şehir aynı yerse (Bodrum/Bodrum, Fethiye/Fethiye, Safranbolu/
// Safranbolu; aradaki kuş uçuşu < 3 km) kayıt üretilmez — "0 km" gibi anlamsız
// bir satır göstermemek için.
//
// Çalıştırma (token gerekmez): npx tsx scripts/generate-district-distances.ts
import { writeFile } from "fs/promises";
import path from "path";
import { allCities } from "../src/lib/data/cities";
import { popularDistricts } from "../src/lib/data/districts";
import type { GeoPoint } from "../src/lib/types";

const OUT_PATH = path.join(process.cwd(), "src", "lib", "data", "districtDistances.json");
const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

function airKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

async function main() {
  const out: Record<string, { distanceKm: number; durationMin: number }> = {};
  const missing: string[] = [];
  for (const d of popularDistricts) {
    const city = allCities.find((c) => c.slug === d.citySlug);
    const key = `${d.citySlug}/${d.slug}`;
    if (!city) {
      missing.push(key);
      continue;
    }
    if (airKm(city.location, d.location) < 3) {
      console.log(`[${key}] şehirle aynı nokta — atlandı`);
      continue;
    }
    try {
      const url = `${OSRM_BASE}/${city.location.lng},${city.location.lat};${d.location.lng},${d.location.lat}?overview=false`;
      const res = await fetch(url, {
        headers: { "User-Agent": "yoldefteri-distance-data/1.0" },
        signal: AbortSignal.timeout(30000),
      });
      const route = res.ok ? (await res.json()).routes?.[0] : undefined;
      if (!route) {
        missing.push(key);
      } else {
        out[key] = {
          distanceKm: Math.round((route.distance / 1000) * 10) / 10,
          durationMin: Math.max(1, Math.round(route.duration / 60)),
        };
        console.log(`[${key}] ${out[key].distanceKm} km, ${out[key].durationMin} dk`);
      }
    } catch (err) {
      console.error(`[${key}] Hata: ${err instanceof Error ? err.message : err}`);
      missing.push(key);
    }
    await new Promise((r) => setTimeout(r, 1100));
  }
  await writeFile(OUT_PATH, JSON.stringify(out, null, 2) + "\n", "utf-8");
  console.log(`\nYazıldı: ${OUT_PATH} (${Object.keys(out).length} ilçe)`);
  if (missing.length > 0) console.log(`Eksik: ${missing.join(", ")}`);
}

main();
