// Havalimanı transfer sayfaları (/havalimani/[iata]) için: her havalimanından
// kuş uçuşu 160 km içindeki şehir merkezlerine, ilçelere ve transfer
// noktalarına gerçek karayolu mesafesi/süresi. OSRM (router.project-osrm.org),
// saniyede en fazla 1 istek; kısa mesafede en hızlı rota (ilk rota) alınır.
// Çıktı: src/lib/data/airportTransfers.json
//   npx tsx scripts/generate-airport-transfers.ts
import { writeFile } from "fs/promises";
import path from "path";
import { allCities } from "../src/lib/data/cities";
import { popularDistricts } from "../src/lib/data/districts";
import { airports } from "../src/lib/data/airports";
import { transferPlaces } from "../src/lib/data/transferPlaces";
import { haversineDistanceKm } from "../src/lib/geo";

const OUT = path.join(process.cwd(), "src", "lib", "data", "airportTransfers.json");
const MAX_STRAIGHT_KM = 160;
const MAX_ROAD_KM = 220;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Kind = "city" | "district" | "place";
interface Dest { kind: Kind; slug: string; citySlug: string; name: string; lat: number; lng: number }
interface Transfer { kind: Kind; slug: string; citySlug: string; name: string; distanceKm: number; durationMin: number }

const dests: Dest[] = [
  ...allCities.map((c) => ({ kind: "city" as const, slug: c.slug, citySlug: c.slug, name: c.name, ...c.location })),
  // Şehirle aynı isimli ilçe (Bodrum, Fethiye, Kaş, Çeşme, Safranbolu) zaten
  // şehir olarak var — tekrar eklenmiyor.
  ...popularDistricts
    .filter((d) => !allCities.some((c) => c.slug === d.slug))
    .map((d) => ({ kind: "district" as const, slug: d.slug, citySlug: d.citySlug, name: d.name, ...d.location })),
  ...transferPlaces.map((p) => ({ kind: "place" as const, slug: p.slug, citySlug: p.citySlug, name: p.name, lat: p.lat, lng: p.lng })),
];

async function route(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=false`;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "yoldefteri-distance-data/1.0" }, signal: AbortSignal.timeout(30000) });
      if (res.ok) {
        const r = (await res.json()).routes?.[0];
        if (r) return { distanceKm: Math.round(r.distance / 100) / 10, durationMin: Math.round(r.duration / 60) };
      }
    } catch {
      /* tekrar dene */
    }
    await sleep(3000);
  }
  return undefined;
}

async function main() {
  const out: Record<string, Transfer[]> = {};
  for (const ap of airports) {
    const near = dests.filter((d) => haversineDistanceKm({ lat: ap.lat, lng: ap.lng }, d) <= MAX_STRAIGHT_KM);
    const list: Transfer[] = [];
    for (const d of near) {
      const r = await route({ lat: ap.lat, lng: ap.lng }, d);
      await sleep(1100);
      if (!r) { console.error(`  ${ap.iata} -> ${d.slug}: rota yok`); continue; }
      if (r.distanceKm > MAX_ROAD_KM) continue;
      list.push({ kind: d.kind, slug: d.slug, citySlug: d.citySlug, name: d.name, ...r });
    }
    list.sort((a, b) => a.distanceKm - b.distanceKm);
    out[ap.iata] = list;
    console.log(`[${ap.iata}] ${list.map((t) => `${t.name} ${t.distanceKm}`).join(", ")}`);
  }
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log("Yazıldı");
}

main();
