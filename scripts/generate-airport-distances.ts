// Her şehir için en yakın (kuş uçuşu ≤150 km) en fazla 2 havalimanından şehir
// merkezine (city.location) gerçek karayolu mesafesi ve süresi — OSRM
// (router.project-osrm.org), saniyede en fazla 1 istek. Çıktı:
// src/lib/data/airportDistances.json. Çalıştırma:
//   npx tsx scripts/generate-airport-distances.ts
import { writeFile } from "fs/promises";
import path from "path";
import { allCities } from "../src/lib/data/cities";
import { airports } from "../src/lib/data/airports";
import { haversineDistanceKm } from "../src/lib/geo";

const OUT = path.join(process.cwd(), "src", "lib", "data", "airportDistances.json");
const MAX_STRAIGHT_KM = 150;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface AirportDistance {
  iata: string;
  distanceKm: number;
  durationMin: number;
}

async function main() {
  const out: Record<string, AirportDistance[]> = {};
  for (const city of allCities) {
    const near = airports
      .map((a) => ({ a, straight: haversineDistanceKm(city.location, { lat: a.lat, lng: a.lng }) }))
      .filter((x) => x.straight <= MAX_STRAIGHT_KM)
      .sort((x, y) => x.straight - y.straight)
      .slice(0, 2);
    const list: AirportDistance[] = [];
    for (const { a } of near) {
      const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${city.location.lng},${city.location.lat}?overview=false`;
      try {
        const res = await fetch(url, { headers: { "User-Agent": "yoldefteri-distance-data/1.0" }, signal: AbortSignal.timeout(30000) });
        const data = await res.json();
        const r = data.routes?.[0];
        if (r) list.push({ iata: a.iata, distanceKm: Math.round(r.distance / 100) / 10, durationMin: Math.round(r.duration / 60) });
        else console.error(`  ${city.slug} ${a.iata}: rota yok`);
      } catch (e) {
        console.error(`  ${city.slug} ${a.iata}: hata ${e}`);
      }
      await sleep(1100);
    }
    list.sort((x, y) => x.distanceKm - y.distanceKm);
    if (list.length > 0) out[city.slug] = list;
    console.log(`[${city.slug}] ${list.map((l) => `${l.iata} ${l.distanceKm} km ${l.durationMin} dk`).join(" | ") || "-"}`);
  }
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`Yazıldı: ${Object.keys(out).length} şehir`);
}

main();
