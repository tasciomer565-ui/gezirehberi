import distanceCacheRaw from "./distanceCache.json";
import routeStopsRaw from "./routeStops.json";
import { allCities } from "./cities";
import { distancePairs, distancePairSlug, type DistancePair } from "./distancePairs";
import type { Attraction, City } from "../types";
import type { Locale } from "../i18n";
import { haversineDistanceKm } from "../geo";

export interface DistanceCacheEntry {
  distanceKm: number;
  durationMin: number;
  roadNames: string[];
}

const distanceCache = distanceCacheRaw as Record<string, DistanceCacheEntry>;

// scripts/generate-distance-data.ts çıktısı — gerçek (OSRM) güzergah
// çizgisine yakınlıkla hesaplanmış yol üstü şehirler/yerler.
interface RouteStopsEntry {
  cities: { slug: string; kmFromA: number }[];
  attractions: { citySlug: string; attractionId: string; kmFromA: number; offsetKm: number }[];
}
const routeStops = routeStopsRaw as Record<string, RouteStopsEntry>;

export interface RouteStopCity {
  city: City;
  kmFromA: number;
}

export interface RouteStopAttraction {
  attraction: Attraction;
  city: City;
  kmFromA: number;
  offsetKm: number;
}

export interface DistancePageData {
  slug: string;
  cityA: City;
  cityB: City;
  distanceKm: number;
  durationMin: number;
  majorRoads: string[];
  stopCities: RouteStopCity[];
  stopAttractions: RouteStopAttraction[];
}

export const IMPORTANCE_RANK: Record<Attraction["importance"], number> = {
  "must-see": 0,
  "should-see": 1,
  "nice-to-have": 2,
};

// En önemli yerleri seç, sonra yol sırasına diz — uzun rotalarda (İstanbul-
// Trabzon 40+ yer) sayfayı liste çöplüğüne çevirmemek için sınırlı.
function pickRouteAttractions(entry: RouteStopsEntry | undefined, limit: number): RouteStopAttraction[] {
  if (!entry) return [];
  return entry.attractions
    .map((s) => {
      const city = allCities.find((c) => c.slug === s.citySlug);
      const attraction = city?.attractions.find((a) => a.id === s.attractionId);
      return city && attraction ? { attraction, city, kmFromA: s.kmFromA, offsetKm: s.offsetKm } : undefined;
    })
    .filter((s): s is RouteStopAttraction => Boolean(s))
    .sort((x, y) => IMPORTANCE_RANK[x.attraction.importance] - IMPORTANCE_RANK[y.attraction.importance] || x.offsetKm - y.offsetKm)
    .slice(0, limit)
    .sort((x, y) => x.kmFromA - y.kmFromA);
}

// Varış/başlangıç şehrinin öne çıkan yerleri (must-see öncelikli).
export function getTopAttractions(city: City, limit: number): Attraction[] {
  return [...city.attractions]
    .sort((x, y) => IMPORTANCE_RANK[x.importance] - IMPORTANCE_RANK[y.importance])
    .slice(0, limit);
}

// distanceCache.json'daki roadNames, üzerinde gidilen km'ye göre (çoktan
// aza) sıralı ve rotanın en az %2'sini oluşturan yollar (bkz.
// scripts/generate-distance-data.ts). Burada sadece şehir içi cadde/sokak/
// bulvarlar eleniyor — "güzergahın büyük bölümü X üzerinden geçiyor" cümlesi
// gerçekten en uzun gidilen şehirler arası yolları saymalı.
function extractMajorRoads(roadNames: string[]): string[] {
  const cityStreet = /cadde|sokak|sokağı|bulvar|\bcd\.|\bsk\./i;
  return roadNames.filter((n) => !cityStreet.test(n)).slice(0, 5);
}

export function getAllDistancePairSlugs(): string[] {
  return distancePairs.map(distancePairSlug);
}

export interface DistanceLinkInfo {
  slug: string;
  otherCityName: string;
  distanceKm: number;
}

// Şehir sayfasından ilgili mesafe sayfalarına ters link için (madde 84
// tutarlılığı — mesafe sayfaları şehirlere link veriyordu ama tersi hiç
// yoktu, bu 150 sayfayı iç link ağında yetim bırakıyordu). Gerçek cache
// verisinden gerçek mesafe okunuyor, uydurma yok.
export function getDistanceLinksForCity(citySlug: string): DistanceLinkInfo[] {
  return distancePairs
    .filter((p) => p.cityA === citySlug || p.cityB === citySlug)
    .map((p) => {
      const slug = distancePairSlug(p);
      const otherSlug = p.cityA === citySlug ? p.cityB : p.cityA;
      const otherCity = allCities.find((c) => c.slug === otherSlug);
      const entry = distanceCache[slug];
      if (!otherCity || !entry) return undefined;
      return { slug, otherCityName: otherCity.name, distanceKm: entry.distanceKm };
    })
    .filter((d): d is DistanceLinkInfo => Boolean(d));
}

export function getDistancePageData(slug: string): DistancePageData | undefined {
  const pair: DistancePair | undefined = distancePairs.find((p) => distancePairSlug(p) === slug);
  if (!pair) return undefined;

  const cityA = allCities.find((c) => c.slug === pair.cityA);
  const cityB = allCities.find((c) => c.slug === pair.cityB);
  if (!cityA || !cityB) return undefined;

  const entry = distanceCache[slug];
  if (!entry) return undefined; // Gerçek Mapbox verisi yoksa sayfa hiç üretilmez — uydurma yok.

  const stops = routeStops[slug];
  const stopCities = (stops?.cities ?? [])
    .map((s) => {
      const city = allCities.find((c) => c.slug === s.slug);
      return city ? { city, kmFromA: s.kmFromA } : undefined;
    })
    .filter((s): s is RouteStopCity => Boolean(s));

  return {
    slug,
    cityA,
    cityB,
    distanceKm: entry.distanceKm,
    durationMin: entry.durationMin,
    majorRoads: extractMajorRoads(entry.roadNames),
    stopCities,
    stopAttractions: pickRouteAttractions(stops, 6),
  };
}

// GSC'de en çok gösterim alan mesafe çiftleri (2026-09-29 dışa aktarımı) —
// ana sayfa ve /mesafe hub'ında öne çıkarılıyor. Yeni bir dışa aktarımda
// farklı çiftler öne çıkarsa burası güncellenmeli.
const POPULAR_DISTANCE_SLUGS = [
  "gaziantep-mardin",
  "bodrum-fethiye",
  "batman-siirt",
  "izmir-kutahya",
  "ankara-corum",
  "burdur-isparta",
  "bolu-safranbolu",
  "hatay-osmaniye",
  "giresun-samsun",
  "aksaray-kapadokya",
  "gumushane-trabzon",
  "eskisehir-kutahya",
];
// Sayfası olmayan slug sessizce atlanır.
export function getPopularDistances(): DistancePageData[] {
  return POPULAR_DISTANCE_SLUGS.map(getDistancePageData).filter((d): d is DistancePageData => Boolean(d));
}

export function getAllDistancePageData(): DistancePageData[] {
  return getAllDistancePairSlugs()
    .map(getDistancePageData)
    .filter((d): d is DistancePageData => Boolean(d));
}

export function formatDuration(minutes: number, locale: Locale): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (locale === "tr") {
    if (h === 0) return `${m} dakika`;
    if (m === 0) return `${h} saat`;
    return `${h} saat ${m} dakika`;
  }
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

// Şablon + gerçek veri harmanı — 150-200 kelimelik, sayfaya özel açıklama.
// Sabit kalıp kısmı asgari, değişen kısım her iki şehrin GERÇEK curated
// alanlarından (summary/highlights/howToArrive) ve gerçek Mapbox verisinden
// (mesafe/süre/yol adları) geliyor. Hiçbir sayı/coğrafi iddia uydurma değil.
export function buildDistanceDescription(data: DistancePageData, locale: Locale): string {
  const { cityA, cityB, distanceKm, durationMin, majorRoads } = data;
  const durationText = formatDuration(durationMin, locale);
  const sameRegion = cityA.regionSlug === cityB.regionSlug;

  if (locale !== "tr") {
    // Bu içerik tipi ilk etapta TR-only (çeviri altyapısı henüz yok, DeepL
    // kotası tükendi) — İngilizce/diğer dillerde kısa, gerçek verilerden
    // oluşan minimal bir özet gösteriliyor, tam editöryel metin değil.
    const roadsText = majorRoads.length > 0 ? ` via ${majorRoads.slice(0, 2).join(" and ")}` : "";
    return `${cityA.name} and ${cityB.name} are approximately ${distanceKm} km apart, a drive of about ${durationText}${roadsText}.`;
  }

  const roadsSentence =
    majorRoads.length > 0
      ? `Güzergahın büyük bölümü ${majorRoads.slice(0, 3).join(", ")} üzerinden geçiyor.`
      : "";

  const regionSentence = sameRegion
    ? `${cityA.name} ve ${cityB.name}, ikisi de ${cityA.region} bölgesinde yer alıyor — bu, aynı gezi rotası içinde birbirine yakın iki durak olarak planlanabileceği anlamına geliyor.`
    : `${cityA.name}, ${cityA.region} bölgesinde; ${cityB.name} ise ${cityB.region} bölgesinde yer alıyor, yani bu güzergah iki farklı bölgeyi birbirine bağlıyor.`;

  // Her iki şehrin gerçek curated summary'si — sayfaya özel, en uzun/en
  // bilgilendirici gerçek metin kaynağı, kelime sayısını organik olarak
  // artırıyor (uydurma cümle eklemek yerine zaten var olan veriyi kullanmak).
  const summarySentence = `${cityA.name}, ${cityA.summary}. ${cityB.name} ise ${cityB.summary}.`;

  const arrivalA = cityA.howToArrive.byAir || cityA.howToArrive.byBus || cityA.howToArrive.byCar;
  const arrivalB = cityB.howToArrive.byAir || cityB.howToArrive.byBus || cityB.howToArrive.byCar;
  const arrivalSentence =
    arrivalA || arrivalB
      ? [
          arrivalA ? `${cityA.name} tarafında ulaşım: ${arrivalA}.` : null,
          arrivalB ? `${cityB.name} tarafında ulaşım: ${arrivalB}.` : null,
        ]
          .filter(Boolean)
          .join(" ")
      : "";

  const highlightsA = cityA.highlights.slice(0, 3).join(", ");
  const highlightsB = cityB.highlights.slice(0, 3).join(", ");
  const highlightsSentence =
    highlightsA || highlightsB
      ? `Yol boyunca planlarken aklında bulunsun: ${cityA.name} denince akla ${highlightsA || cityA.summary} geliyor; ${cityB.name} denince ise ${highlightsB || cityB.summary} öne çıkıyor.`
      : "";

  const whenToGoSentence = `${cityA.name} için en iyi ziyaret zamanı: ${cityA.whenToGo}. ${cityB.name} için ise: ${cityB.whenToGo}.`;
  const climateSentence = `İklim açısından ${cityA.name}: ${cityA.climate}. ${cityB.name}: ${cityB.climate}.`;
  const durationRecommendationSentence = `Gezi süresi olarak ${cityA.name} için ${cityA.bestDuration}, ${cityB.name} için ise ${cityB.bestDuration} önerilir.`;

  // Çekirdek cümleler (mesafe, güzergah, bölge, summary, ulaşım, highlights)
  // her zaman ekleniyor. whenToGo/climate/süre önerisi ise sadece hedef
  // 150-200 kelime aralığına ulaşmak için gerektiği kadar ekleniyor — bazı
  // şehirlerin curated metinleri (özellikle küçük illerin) kısa olduğu için
  // hepsini her zaman eklemek bazı sayfaları 200'ün üstüne taşıyordu.
  const core = [
    `${cityA.name} ile ${cityB.name} arası karayoluyla yaklaşık ${distanceKm} km, ortalama sürüş süresi ise ${durationText} civarında.`,
    roadsSentence,
    regionSentence,
    summarySentence,
    arrivalSentence,
    highlightsSentence,
  ].filter((s) => s && s.trim().length > 0);

  const fillers = [whenToGoSentence, climateSentence, durationRecommendationSentence];

  const countWords = (parts: string[]) => parts.join(" ").split(/\s+/).filter(Boolean).length;

  const result = [...core];
  for (const filler of fillers) {
    if (countWords(result) >= 175) break;
    result.push(filler);
  }

  return result.join(" ");
}

export interface DistanceSection {
  id: "km" | "sure" | "guzergah" | "yakit" | "ulasim" | "hakkinda";
  heading: string;
  paragraphs: string[];
}

// Rakip incelemesi (2026-09-30): "X Y arası kaç km" sorgusunda ilk sayfadaki
// sayfalar içeriği aranan sorularla başlıklandırıyor ("Kaç Kilometredir?",
// "Kaç Saat Sürer?", "Yol Güzergahları", "Ne Kadar Yakar?", "Ulaşım
// Seçenekleri"); bizde aynı bilgi başlıksız tek paragraftaydı. Bu fonksiyon
// buildDistanceDescription ile AYNI gerçek veriyi (Mapbox mesafe/süre/yol,
// güzergah durakları, şehirlerin curated alanları) soru başlıklı bölümlere
// ayırır. Eklenen iki türetilmiş değer de gerçek veriden: kuş uçuşu mesafe
// (iki şehir koordinatından) ve ortalama hız (km / süre). Sadece TR.
export function buildDistanceSections(data: DistancePageData): DistanceSection[] {
  const { cityA, cityB, distanceKm, durationMin, majorRoads, stopCities } = data;
  const durationText = formatDuration(durationMin, "tr");
  const airKm = Math.round(haversineDistanceKm(cityA.location, cityB.location));
  const avgSpeed = Math.round(distanceKm / (durationMin / 60));
  const sameRegion = cityA.regionSlug === cityB.regionSlug;
  const liters = (per100: number) => Math.round((distanceKm * per100) / 100);

  const sections: DistanceSection[] = [
    {
      id: "km",
      heading: `${cityA.name} ${cityB.name} Arası Kaç Km?`,
      paragraphs: [
        `${cityA.name} ile ${cityB.name} arası karayoluyla yaklaşık ${distanceKm} km. İki şehir arasındaki kuş uçuşu mesafe ise yaklaşık ${airKm} km; aradaki fark yolun izlediği güzergahtan kaynaklanıyor.`,
        sameRegion
          ? `${cityA.name} ve ${cityB.name}, ikisi de ${cityA.region} bölgesinde yer alıyor — aynı gezi rotası içinde birbirine yakın iki durak olarak planlanabilir.`
          : `${cityA.name} ${cityA.region} bölgesinde, ${cityB.name} ise ${cityB.region} bölgesinde yer alıyor; bu yol iki farklı bölgeyi birbirine bağlıyor.`,
      ],
    },
    {
      id: "sure",
      heading: `${cityA.name} ${cityB.name} Arası Kaç Saat Sürer?`,
      paragraphs: [
        `${cityA.name} ${cityB.name} arası arabayla normal trafik koşullarında yaklaşık ${durationText} sürüyor; bu, yolun tamamında ortalama ${avgSpeed} km/sa hıza karşılık geliyor. Mola, trafik ve hava koşulları süreyi uzatabilir.`,
      ],
    },
    {
      id: "guzergah",
      heading: `${cityA.name} ${cityB.name} Yol Güzergahı`,
      paragraphs: [
        [
          majorRoads.length > 0 ? `Güzergahın büyük bölümü ${majorRoads.slice(0, 3).join(", ")} üzerinden geçiyor.` : "",
          stopCities.length > 0
            ? `Yol, ${stopCities.map((s) => s.city.name).join(", ")} üzerinden ya da yakınından geçiyor.`
            : "",
          `Dönüş yönünde (${cityB.name} - ${cityA.name}) de aynı güzergah kullanılıyor ve mesafe aynı.`,
        ]
          .filter(Boolean)
          .join(" "),
      ],
    },
    {
      id: "yakit",
      heading: `${cityA.name} ${cityB.name} Arası Ne Kadar Yakıt Harcanır?`,
      paragraphs: [
        `${distanceKm} km'lik bu yolda 100 km'de 5 litre tüketen bir araç yaklaşık ${liters(5)} litre, 7 litre tüketen bir araç yaklaşık ${liters(7)} litre, 9 litre tüketen bir araç ise yaklaşık ${liters(9)} litre yakıt harcar. Yakıt maliyetini bulmak için bu miktarı güncel litre fiyatıyla çarpmak yeterli; aşağıdaki hesaplayıcıya kendi aracınızın tüketimini ve güncel fiyatı girebilirsiniz.`,
      ],
    },
  ];

  const transport = (city: City) =>
    [
      city.howToArrive.byBus ? `Otobüs: ${city.howToArrive.byBus}.` : "",
      city.howToArrive.byAir ? `Uçak: ${city.howToArrive.byAir}.` : "",
      city.howToArrive.byTrain ? `Tren: ${city.howToArrive.byTrain}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
  const transportA = transport(cityA);
  const transportB = transport(cityB);
  if (transportA || transportB) {
    sections.push({
      id: "ulasim",
      heading: `${cityA.name} ve ${cityB.name} Ulaşım Seçenekleri`,
      paragraphs: [
        ...(transportA ? [`${cityA.name} tarafında — ${transportA}`] : []),
        ...(transportB ? [`${cityB.name} tarafında — ${transportB}`] : []),
      ],
    });
  }

  const highlightsA = cityA.highlights.slice(0, 3).join(", ");
  const highlightsB = cityB.highlights.slice(0, 3).join(", ");
  sections.push({
    id: "hakkinda",
    heading: `${cityA.name} ve ${cityB.name} Hakkında`,
    paragraphs: [
      `${cityA.name}, ${cityA.summary}. ${cityB.name} ise ${cityB.summary}.`,
      ...(highlightsA || highlightsB
        ? [`${cityA.name} denince akla ${highlightsA || cityA.summary} geliyor; ${cityB.name} denince ise ${highlightsB || cityB.summary} öne çıkıyor.`]
        : []),
      `${cityA.name} için en iyi ziyaret zamanı: ${cityA.whenToGo}. ${cityB.name} için ise: ${cityB.whenToGo}.`,
    ],
  });

  return sections;
}
