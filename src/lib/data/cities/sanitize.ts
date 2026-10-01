import type { Accommodation, Attraction, City, CostLevel, FoodItem, Restaurant } from "@/lib/types";
import { getCostLevelText } from "@/lib/costLevel";

// Doğruluk denetimi (2026-10-01). Şehir veri dosyalarındaki konaklama ve
// restoran kayıtlarının büyük çoğunluğu gerçek bir işletme değil, şablonla
// üretilmiş isimlerdi ("Kastamonu Şehir Oteli 2", "Muş Merkez Butik Oteli");
// 822 konaklamanın hepsinde doğrulanmamış puan ve gecelik fiyat, 823
// restoranda kişi başı ücret vardı. Attraction giriş ücretleri ve bilet
// fiyatları (ör. Topkapı "650 TL") yıllar içinde birkaç kez değişti; 339 yerde
// aynı varsayılan saat ("08:00 - 19:00") yazıyordu ve 18 müze "Ücretsiz"
// görünüyordu (Hatay Arkeoloji Müzesi, Boğazköy Müzesi gibi ücretli olanlar
// dahil).
//
// Kaynak dosyalar olduğu gibi duruyor; kullanıcıya gösterilmeden önce bu
// katman:
//   - Bilinen gerçek işletmeleri (REAL_PLACE_IDS) adıyla tutar, diğerlerini
//     "tür · bölge" önerisine çevirir (aynı tür+bölge tek kartta birleşir).
//   - Doğrulanmamış puan, fiyat, olanak ve açılış saatlerini kaldırır.
//   - Rakamlı giriş ücretlerini "Ücretli" bilgisine indirir.
// Yeni bir gerçek işletme eklemek için: kaydın bilgileri doğrulanır ve id'si
// REAL_PLACE_IDS'e yazılır.

export const REAL_PLACE_IDS = new Set([
  // Konaklama
  "istanbul-ciragan",
  "istanbul-perapalace",
  "istanbul-sohohouse",
  "antalya-tuvana-hotel",
  "sanliurfa-el-ruha",
  "safranbolu-gul-evi",
  "safranbolu-cinci-han-otel",
  // Restoran
  "istanbul-pandeli",
  "istanbul-karakoy-lokantasi",
  "istanbul-mikla",
  "istanbul-sultanahmet-kofte",
  "istanbul-sunset",
  "istanbul-refik",
  "bursa-kebapci-iskender",
  "kapadokya-seten-restaurant",
  "kapadokya-dibek",
  "kapadokya-elai-restaurant",
  "mardin-cercis-murat",
  "sanliurfa-cevdet-lokantasi",
  "gaziantep-imam-cagdas",
  "cesme-agrilia",
  "cesme-imren-lokantasi",
  "kas-bi-lokma",
  "adana-onbasilar-ocakbasi",
  "adana-yuzevler-kebap",
  "antalya-vanilla-restaurant",
  "antalya-parlak-restaurant",
  "fethiye-meğri-lokantasi",
  "erzurum-kadioglu-pidecisi",
]);

const ACCOMMODATION_LABEL: Record<string, string> = {
  hotel: "Otel",
  guesthouse: "Pansiyon / Konuk Evi",
  boutique: "Butik Otel",
  resort: "Tatil Köyü / Resort",
};
const DINING_LABEL: Record<string, string> = {
  restaurant: "Restoranlar",
  cafe: "Kafeler",
  "street-food": "Sokak Lezzetleri",
  market: "Pazar ve Çarşı",
};

const PRICE_CHECK = "Güncel ücreti ziyaret öncesi resmî kaynaktan kontrol edin";
const HOURS_CHECK = "Saatler mevsime göre değişebilir, ziyaret öncesi kontrol edin";
const OPEN_AIR = new Set(["nature", "beach", "viewpoint", "shopping"]);
const DEFAULT_HOURS = "08:00 - 19:00";
const hasDigit = (s: string | undefined) => !!s && /\d/.test(s);

function sanitizeAttraction(a: Attraction): Attraction {
  let entranceFee = a.entranceFee;
  if (hasDigit(entranceFee)) entranceFee = `Ücretli — ${PRICE_CHECK.toLocaleLowerCase("tr")}`;
  else if (a.category === "museum" && entranceFee.startsWith("Ücretsiz")) entranceFee = PRICE_CHECK;

  let openingHours = a.openingHours;
  if (openingHours === DEFAULT_HOURS) openingHours = OPEN_AIR.has(a.category) ? "Açık alan" : HOURS_CHECK;

  const ticketPolicy = a.ticketPolicy
    ? {
        fullPrice: hasDigit(a.ticketPolicy.fullPrice) ? PRICE_CHECK : a.ticketPolicy.fullPrice,
        museumCardValid: a.ticketPolicy.museumCardValid,
      }
    : undefined;
  return { ...a, entranceFee, openingHours, ticketPolicy };
}

function sanitizeAccommodations(list: Accommodation[]): Accommodation[] {
  const out: Accommodation[] = [];
  const byKey = new Map<string, Accommodation>();
  for (const a of list) {
    const base = { ...a, rating: undefined, pricePerNight: undefined, amenities: [] };
    if (REAL_PLACE_IDS.has(a.id)) {
      out.push(base);
      continue;
    }
    const key = `${a.type}|${a.address}`;
    if (byKey.has(key)) continue;
    const item = { ...base, name: `${ACCOMMODATION_LABEL[a.type] ?? "Konaklama"} · ${a.address}`, isAreaSuggestion: true };
    byKey.set(key, item);
    out.push(item);
  }
  return out;
}

function sanitizeRestaurants(list: Restaurant[]): Restaurant[] {
  const out: Restaurant[] = [];
  const byKey = new Map<string, Restaurant>();
  for (const r of list) {
    const base: Restaurant = {
      ...r,
      rating: undefined,
      reviewCount: undefined,
      averageCost: undefined,
      openingHours: undefined,
      priceRange: undefined,
      priceSegment: undefined,
      reservationNeeded: false,
    };
    if (REAL_PLACE_IDS.has(r.id)) {
      out.push(base);
      continue;
    }
    const key = `${r.diningType}|${r.address}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.specialties = Array.from(new Set([...existing.specialties, ...r.specialties])).slice(0, 6);
      continue;
    }
    const item: Restaurant = {
      ...base,
      name: `${DINING_LABEL[r.diningType] ?? "Yeme-İçme"} · ${r.address}`,
      specialties: [...r.specialties],
      features: [],
      signatureDish: undefined,
      phone: undefined,
      website: undefined,
      isAreaSuggestion: true,
    };
    byKey.set(key, item);
    out.push(item);
  }
  return out;
}

function sanitizeFood(f: FoodItem): FoodItem {
  return { ...f, priceRange: undefined };
}

export function sanitizeCity(city: City): City {
  return {
    ...city,
    attractions: city.attractions.map(sanitizeAttraction),
    accommodations: sanitizeAccommodations(city.accommodations),
    restaurants: sanitizeRestaurants(city.restaurants),
    localFood: city.localFood.map(sanitizeFood),
  };
}

// Veri dosyalarındaki "Günlük 1.000-1.500 TL/kişi" gibi bütçeler 2026
// fiyatlarının çok altında; rakam yerine göreli düzey gösteriliyor. Eşikler
// verideki doğal kümelerden: 8 turizm merkezi (İstanbul, Bodrum, Kapadokya,
// Çeşme, Kaş, Fethiye, Antalya, Marmaris) diğerlerinin belirgin üstünde
// (≥1.800), 22 şehir en altta (≤925); geri kalanı orta.
const HIGH_COST_MIN = 1700;
const LOW_COST_MAX = 950;

function dailyBudgetMidpoint(budget: string): number | undefined {
  const m = budget.match(/(\d{1,3}(?:\.\d{3})*|\d+)\s*-\s*(\d{1,3}(?:\.\d{3})*|\d+)/);
  if (!m) return undefined;
  const n = (x: string) => Number(x.replace(/\./g, ""));
  return (n(m[1]) + n(m[2])) / 2;
}

export function applyCostLevels(cities: City[]): City[] {
  return cities.map((c) => {
    const v = dailyBudgetMidpoint(c.budget);
    const costLevel: CostLevel = v === undefined ? "mid" : v >= HIGH_COST_MIN ? "high" : v <= LOW_COST_MAX ? "low" : "mid";
    // budgetBreakdown hiçbir yerde gösterilmiyor; eski TL rakamları sayfa
    // verisiyle (RSC payload) istemciye de gitmesin.
    const budgetBreakdown = { accommodation: "", food: "", activities: "", transport: "" };
    return { ...c, costLevel, budget: getCostLevelText(costLevel, "tr"), budgetBreakdown };
  });
}
