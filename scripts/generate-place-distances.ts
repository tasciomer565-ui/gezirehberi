// Merkez şehirlerden şehir sayfası olmayan tatil yerlerine (ilçe ve transfer
// noktaları: Alanya, Kuşadası, Kemer, Side...) mesafe sayfaları için rota
// verisi (2026-10-02). OSRM, saniyede en fazla 1 istek, yarıda kesilirse
// kaldığı yerden devam eder.
// Rota seçimi generate-distance-data.ts ile aynı mantık: en hızlı rota; ama
// süresi en fazla %10 uzun bir alternatif en az 40 km ve %5 kısaysa o
// (uzun yollarda OSRM'in otoyol dolanmasını önler, kısa yolda köy yoluna
// sapmaz).
// Çıktı: src/lib/data/placeDistances.json
//   npx tsx scripts/generate-place-distances.ts
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { allCities } from "../src/lib/data/cities";
import { getPlacePairs } from "../src/lib/data/placePairs";

const OUT = path.join(process.cwd(), "src", "lib", "data", "placeDistances.json");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Entry { distanceKm: number; durationMin: number; roadNames: string[] }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickRoute(routes: any[]): any {
  if (routes.length === 0) return undefined;
  const fastest = routes[0];
  const better = routes
    .slice(1)
    .filter((r) => r.duration <= fastest.duration * 1.1 && fastest.distance - r.distance >= 40000 && r.distance <= fastest.distance * 0.95)
    .sort((a, b) => a.distance - b.distance)[0];
  return better ?? fastest;
}

async function fetchEntry(a: { lat: number; lng: number }, b: { lat: number; lng: number }): Promise<Entry | undefined> {
  const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=false&steps=true&alternatives=3`;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "yoldefteri-distance-data/1.0" }, signal: AbortSignal.timeout(40000) });
      if (res.ok) {
        const route = pickRoute((await res.json()).routes ?? []);
        if (!route) return undefined;
        const byRoad = new Map<string, { label: string; meters: number }>();
        for (const s of (route.legs?.[0]?.steps || []) as { name?: string; ref?: string; distance?: number }[]) {
          const label = (s.name && s.name.trim()) || (s.ref && s.ref.trim()) || "";
          if (!label) continue;
          const key = label.toLocaleLowerCase("tr").replace(/[\s\-–.]/g, "");
          const cur = byRoad.get(key);
          if (cur) cur.meters += s.distance || 0;
          else byRoad.set(key, { label, meters: s.distance || 0 });
        }
        const roadNames = Array.from(byRoad.values())
          .filter((r) => r.meters >= route.distance * 0.02)
          .sort((x, y) => y.meters - x.meters)
          .slice(0, 12)
          .map((r) => r.label);
        return { distanceKm: Math.round(route.distance / 100) / 10, durationMin: Math.max(1, Math.round(route.duration / 60)), roadNames };
      }
    } catch {
      /* tekrar dene */
    }
    await sleep(3000);
  }
  return undefined;
}

async function main() {
  let cache: Record<string, Entry> = {};
  try {
    cache = JSON.parse(await readFile(OUT, "utf8"));
  } catch {
    /* ilk çalıştırma */
  }
  const pairs = getPlacePairs();
  const todo = pairs.filter((p) => !cache[p.slug]);
  console.log(`${todo.length}/${pairs.length} çift çekilecek`);
  for (const p of todo) {
    const city = allCities.find((c) => c.slug === p.citySlug)!;
    const e = await fetchEntry(city.location, p.place);
    await sleep(1100);
    if (!e) { console.error(`  ${p.slug}: rota yok`); continue; }
    cache[p.slug] = e;
    console.log(`[${p.slug}] ${e.distanceKm} km, ${e.durationMin} dk`);
    if (Object.keys(cache).length % 20 === 0) await writeFile(OUT, JSON.stringify(cache, null, 2) + "\n");
  }
  const valid = new Set(pairs.map((p) => p.slug));
  for (const k of Object.keys(cache)) if (!valid.has(k)) delete cache[k];
  await writeFile(OUT, JSON.stringify(cache, null, 2) + "\n");
  console.log(`Yazıldı: ${Object.keys(cache).length}/${pairs.length}`);
}

main();
