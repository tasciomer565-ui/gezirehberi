// Mesafe sayfalarının (madde 150) tüm rota verisini TEK istekten üretir:
//   - src/lib/data/distanceCache.json : mesafe (km), süre (dk), yol adları
//   - src/lib/data/routeStops.json    : güzergaha yakın şehirler ve gezilecek yerler
// İkisi aynı güzergahtan türediği için birbiriyle tutarsız kalamaz.
//
// YOL MOTORU: OSRM (router.project-osrm.org, OpenStreetMap verisi).
// 2026-09-30'a kadar Mapbox Directions kullanılıyordu. 297 çiftin KGM'nin
// resmî "İller Arası Mesafe Cetveli" (3 Mart 2026) ve Google'ın yol kutusuyla
// karşılaştırılması şunu gösterdi:
//   - Mapbox bazı çiftlerde doğrudan devlet yolunu seçmeyip uzun dolaşıyordu
//     (Denizli-Uşak 246,6 km; KGM 153, Google 154, OSRM 153,6 — Antalya-Mersin
//     627,7 km; KGM 469, OSRM 461,5).
//   - Mapbox süreleri sistematik olarak uzundu (Şırnak-Van 451 dk; Google 311,
//     OSRM 308).
// OSRM, şehir koordinatları doğru olduğunda KGM ile birkaç yüzde içinde
// örtüşüyor. Kalan büyük farklar KGM'nin eski devlet yolunu saydığı, yeni
// köprü/otoyol/yolun kullanıldığı çiftler (İstanbul-Yalova, Bursa-İstanbul,
// Adıyaman-Malatya) — orada Google da OSRM'le aynı.
//
// Çalıştırma (token gerekmez):
//   npx tsx scripts/generate-distance-data.ts            # sadece eksik çiftler
//   npx tsx scripts/generate-distance-data.ts --fresh    # hepsini sıfırdan
// Açık OSRM sunucusunun kullanım kuralı saniyede en fazla 1 istek; script buna
// uyar ve ilerlemeyi ara ara diske yazar (yarıda kesilirse --fresh OLMADAN
// tekrar çalıştırınca kaldığı yerden devam eder). Başarısız çift atlanır ve
// raporlanır — uydurma değer yazılmaz.
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { allCities } from "../src/lib/data/cities";
import { distancePairs, distancePairSlug } from "../src/lib/data/distancePairs";
import type { GeoPoint } from "../src/lib/types";

interface DistanceCacheEntry {
  distanceKm: number;
  durationMin: number;
  roadNames: string[];
}
interface RouteStops {
  cities: { slug: string; kmFromA: number }[];
  attractions: { citySlug: string; attractionId: string; kmFromA: number; offsetKm: number }[];
}

const CACHE_PATH = path.join(process.cwd(), "src", "lib", "data", "distanceCache.json");
const STOPS_PATH = path.join(process.cwd(), "src", "lib", "data", "routeStops.json");
const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";
const REQUEST_GAP_MS = 1100;

// DOĞRULANMIŞ DÜZELTMELER. OSRM çoğu çiftte Google'ın yol tarifi kutusuyla
// örtüşüyor (2026-09-30'da karşılaştırılabilen 23 tartışmalı çiftin 16'sı),
// ama aşağıdaki çiftlerde sürücünün fiilen kullandığı yolu seçmiyor (OSM'de
// eksik/kapalı işaretli yol ya da farklı güzergah tercihi) ve %10-38 sapıyor.
// Bu çiftlerde değer, Google Haritalar yol tarifindeki (araba) mesafe ve
// süreyle değiştiriliyor; KGM cetveli de aynı yönü gösteriyor. OSRM'in çizdiği
// güzergah farklı bir yol olduğu için bu çiftlerde yol adı ve yol üstü durak
// üretilmiyor (yanlış güzergah bilgisi vermemek için).
// Valhalla ve Mapbox da denendi: hiçbiri her çiftte doğru değil, oylama kuralı
// da güvenilir çıkmadı — bu yüzden kural değil, doğrulanmış liste.
const VERIFIED_OVERRIDES: Record<string, { distanceKm: number; durationMin: number }> = {
  "aksaray-kirsehir": { distanceKm: 97.4, durationMin: 86 }, // OSRM 134,3 km; KGM 108
  "batman-bitlis": { distanceKm: 132, durationMin: 114 }, // OSRM 163,1 km; KGM 133
  "mardin-siirt": { distanceKm: 226, durationMin: 197 }, // OSRM 188,3 km; KGM 234
  "sirnak-van": { distanceKm: 352, durationMin: 311 }, // OSRM 302,4 km; KGM 350
  "bayburt-rize": { distanceKm: 149, durationMin: 143 }, // OSRM 133,4 km
  "duzce-sakarya": { distanceKm: 74.9, durationMin: 52 }, // OSRM 83,0 km; KGM 68
};

// Şehir merkezi güzergaha bu kadar yakınsa "yol üstü" sayılıyor — çevre yolu
// şehir merkezinin birkaç km dışından geçebildiği için 0 değil. 12 km, gerçek
// rotalarda çevre yolundan geçilen Şanlıurfa/Afyon/Bursa'yı (~9-10 km) alıp
// rotanın gerçekten uğramadığı Manisa/Uşak/Isparta'yı (15-17 km) dışarıda
// bırakan eşik (2026-09-29 tanı çalıştırması).
const CITY_MAX_OFFSET_KM = 12;
// Başka bir şehre ait gezilecek yer, yoldan en fazla bu kadar sapmayla
// görülebiliyorsa "yol üstünde görülecek yer" sayılıyor.
const ATTRACTION_MAX_OFFSET_KM = 10;
// Başlangıç/varış şehrinin hemen dibindeki noktalar ara durak değil.
const ENDPOINT_MARGIN_KM = 25;

// Kısa mesafelerde yeterince doğru, hızlı düzlem yaklaşımı (equirectangular).
function toXY(p: GeoPoint, lat0: number): [number, number] {
  const kx = 111.32 * Math.cos((lat0 * Math.PI) / 180);
  return [p.lng * kx, p.lat * 110.574];
}

// Noktanın polyline'a en yakın mesafesi ve o noktanın rota başından
// itibaren yol boyunca kaçıncı km'de olduğu.
function projectOnRoute(point: GeoPoint, line: GeoPoint[]): { offsetKm: number; alongKm: number } {
  const lat0 = point.lat;
  const [px, py] = toXY(point, lat0);
  let best = { offsetKm: Infinity, alongKm: 0 };
  let cumulative = 0;
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, ay] = toXY(line[i], lat0);
    const [bx, by] = toXY(line[i + 1], lat0);
    const dx = bx - ax;
    const dy = by - ay;
    const segLen = Math.hypot(dx, dy);
    const t = segLen === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (segLen * segLen)));
    const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    if (d < best.offsetKm) best = { offsetKm: d, alongKm: cumulative + t * segLen };
    cumulative += segLen;
  }
  return best;
}

interface FetchedRoute {
  entry: DistanceCacheEntry;
  line: GeoPoint[];
  lengthKm: number;
}

async function fetchRoute(from: GeoPoint, to: GeoPoint): Promise<FetchedRoute | undefined> {
  const url = `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url, {
    headers: { "User-Agent": "yoldefteri-distance-data/1.0" },
    signal: AbortSignal.timeout(40000),
  });
  if (!res.ok) {
    console.error(`  OSRM hatası: ${res.status}`);
    return undefined;
  }
  const data = await res.json();
  const route = data.routes?.[0];
  const coords: [number, number][] | undefined = route?.geometry?.coordinates;
  if (!route || !Array.isArray(route.legs) || route.legs.length === 0 || !coords || coords.length < 2) {
    console.error(`  Rota bulunamadı`);
    return undefined;
  }

  // Gerçek karayolu adları adımlardan (madde 150'nin "hangi güzergah
  // üzerinden" isteği). OSRM ayrıca yol numarasını (ref: "D400", "O-52")
  // veriyor — adı olmayan adımlarda numara kullanılıyor.
  //
  // Adlar ÜZERİNDE GİDİLEN KM'ye göre (çoktan aza) sıralanıyor. Önceden
  // güzergahtaki sıraya göre saklanıyordu; sayfa "güzergahın büyük bölümü X
  // üzerinden geçiyor" derken ilk adları aldığı için çıkış şehrinin cadde ve
  // bulvarları (Gaziantep-Mardin'de "Sani Konukoğlu Bulvarı") öne çıkıyordu —
  // yanlış bir iddia. Aynı yolun yazım varyantları ("Gaziantep - Şanlıurfa
  // Yolu" / "Gaziantep-Şanlıurfa Yolu") tek kayıtta birleştiriliyor; rotanın
  // %2'sinden kısa parçalar (kavşak, bağlantı yolu) listeye girmiyor.
  const byRoad = new Map<string, { label: string; meters: number }>();
  for (const s of (route.legs[0].steps || []) as { name?: string; ref?: string; distance?: number }[]) {
    const label = (s.name && s.name.trim()) || (s.ref && s.ref.trim()) || "";
    if (!label) continue;
    const key = label.toLocaleLowerCase("tr").replace(/[\s\-–.]/g, "");
    const cur = byRoad.get(key);
    if (cur) cur.meters += s.distance || 0;
    else byRoad.set(key, { label, meters: s.distance || 0 });
  }
  const roadNames = Array.from(byRoad.values())
    .filter((r) => r.meters >= route.distance * 0.02)
    .sort((a, b) => b.meters - a.meters)
    .slice(0, 12)
    .map((r) => r.label);

  return {
    entry: {
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMin: Math.max(1, Math.round(route.duration / 60)),
      roadNames,
    },
    line: coords.map(([lng, lat]) => ({ lat, lng })),
    lengthKm: route.distance / 1000,
  };
}

function computeStops(cityASlug: string, cityBSlug: string, cityB: GeoPoint, line: GeoPoint[], lengthKm: number): RouteStops {
  // Polyline uzunluğu (düzlem yaklaşımı) ile motorun km'si arasındaki küçük
  // farkı, "A'dan X km" değerlerini gerçek yol km'sine oturtmak için
  // ölçekleyerek gideriyoruz.
  const polyLen = projectOnRoute(cityB, line).alongKm || lengthKm;
  const scale = lengthKm / polyLen;
  const inMiddle = (km: number) => km > ENDPOINT_MARGIN_KM && km < lengthKm - ENDPOINT_MARGIN_KM;
  const others = allCities.filter((c) => c.slug !== cityASlug && c.slug !== cityBSlug);

  const cities = others
    .map((c) => {
      const p = projectOnRoute(c.location, line);
      return { slug: c.slug, kmFromA: Math.round(p.alongKm * scale), offsetKm: p.offsetKm };
    })
    .filter((c) => c.offsetKm <= CITY_MAX_OFFSET_KM && inMiddle(c.kmFromA))
    .sort((x, y) => x.kmFromA - y.kmFromA)
    .map(({ slug, kmFromA }) => ({ slug, kmFromA }));

  const attractions = others
    .flatMap((c) =>
      c.attractions.map((a) => {
        const p = projectOnRoute(a.location, line);
        return {
          citySlug: c.slug,
          attractionId: a.id,
          kmFromA: Math.round(p.alongKm * scale),
          offsetKm: Math.round(p.offsetKm * 10) / 10,
        };
      })
    )
    .filter((a) => a.offsetKm <= ATTRACTION_MAX_OFFSET_KM && inMiddle(a.kmFromA))
    .sort((x, y) => x.kmFromA - y.kmFromA);

  return { cities, attractions };
}

async function readJson<T>(file: string): Promise<Record<string, T>> {
  try {
    return JSON.parse(await readFile(file, "utf-8"));
  } catch {
    return {};
  }
}

async function main() {
  const fresh = process.argv.includes("--fresh");
  const cache: Record<string, DistanceCacheEntry> = fresh ? {} : await readJson(CACHE_PATH);
  const stops: Record<string, RouteStops> = fresh ? {} : await readJson(STOPS_PATH);
  const save = async () => {
    await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n", "utf-8");
    await writeFile(STOPS_PATH, JSON.stringify(stops, null, 2) + "\n", "utf-8");
  };

  const validSlugs = new Set(distancePairs.map(distancePairSlug));
  // Listeden çıkarılmış çiftlerin eski kayıtlarını temizle.
  for (const k of Object.keys(cache)) if (!validSlugs.has(k)) delete cache[k];
  for (const k of Object.keys(stops)) if (!validSlugs.has(k)) delete stops[k];

  const toFetch = distancePairs.filter((p) => !cache[distancePairSlug(p)] || !stops[distancePairSlug(p)]);
  console.log(`${fresh ? "Sıfırdan üretim" : "Eksikler"}: ${toFetch.length}/${distancePairs.length} çift çekilecek.\n`);

  const missing: string[] = [];
  let done = 0;
  for (const pair of toFetch) {
    const slug = distancePairSlug(pair);
    // Yön, sayfanın kullandığı pair.cityA -> pair.cityB ile aynı olmalı
    // ("A'dan X km" değerleri sayfada cityA'ya göre gösteriliyor).
    const cityA = allCities.find((c) => c.slug === pair.cityA);
    const cityB = allCities.find((c) => c.slug === pair.cityB);
    if (!cityA || !cityB) {
      console.error(`[${slug}] Şehir kaydı bulunamadı — atlandı`);
      missing.push(slug);
      continue;
    }

    let route: FetchedRoute | undefined;
    for (let attempt = 0; attempt < 3 && !route; attempt++) {
      try {
        route = await fetchRoute(cityA.location, cityB.location);
      } catch (err) {
        console.error(`[${slug}] Hata (deneme ${attempt + 1}): ${err instanceof Error ? err.message : err}`);
      }
      await new Promise((r) => setTimeout(r, REQUEST_GAP_MS));
    }
    if (!route) {
      missing.push(slug);
      continue;
    }

    const override = VERIFIED_OVERRIDES[slug];
    if (override) {
      cache[slug] = { ...override, roadNames: [] };
      stops[slug] = { cities: [], attractions: [] };
    } else {
      cache[slug] = route.entry;
      stops[slug] = computeStops(cityA.slug, cityB.slug, cityB.location, route.line, route.lengthKm);
    }
    done++;
    console.log(
      `[${slug}]${override ? " (doğrulanmış düzeltme)" : ""} ${cache[slug].distanceKm} km, ${cache[slug].durationMin} dk | duraklar: ${stops[slug].cities.map((c) => c.slug).join(", ") || "-"} | ${stops[slug].attractions.length} yer`
    );
    if (done % 15 === 0) await save();
  }

  await save();
  console.log(`\nYazıldı: ${Object.keys(cache).length}/${distancePairs.length} çift`);
  if (missing.length > 0) console.log(`Eksik kalan çiftler (${missing.length}): ${missing.join(", ")}`);
}

main();
