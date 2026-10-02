import { City, DayPlan, ItineraryRoute, RouteStop, Attraction, Restaurant } from "@/lib/types";
import { estimateTransfer, assignTimeSlot, optimizeTSP, clusterByLocation, haversineDistanceKm } from "@/lib/geo";

const IMPORTANCE_ORDER: Record<string, number> = {
  "must-see": 0,
  "should-see": 1,
  "nice-to-have": 2,
};

function sortByImportance<T extends { importance: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => (IMPORTANCE_ORDER[a.importance] ?? 3) - (IMPORTANCE_ORDER[b.importance] ?? 3)
  );
}

// optimizeTSP (en yakın komşu, kahvaltıdan başlar) yemek duraklarını doğru
// yere koyuyor ama gezilecek yerleri açgözlü sırayla bağladığı için bazen
// geri dönüş yaratıyordu (denetim: 34 günde ara durak, uç duraklar arası
// mesafenin 1,6-3,8 katı yol). Gün başına en fazla 3-4 gezilecek yer olduğu
// için, yemek durakları yerinde kalırken gezilecek yerler kendi
// pozisyonlarında, ilk duraktan başlayan en kısa yol sırasına diziliyor.
function reorderAttractionStops(stops: RouteStop[]): RouteStop[] {
  const idx = stops.map((s, i) => (s.type === "attraction" ? i : -1)).filter((i) => i >= 0);
  const attractions = idx.map((i) => stops[i]);
  if (attractions.length < 2 || attractions.length > 6 || attractions.some((s) => !s.location)) return stops;
  const start = stops[0].type !== "attraction" ? stops[0].location : undefined;
  const permute = (arr: RouteStop[]): RouteStop[][] =>
    arr.length <= 1 ? [arr] : arr.flatMap((x, i) => permute([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p]));
  const length = (p: RouteStop[]) =>
    (start ? haversineDistanceKm(start, p[0].location!) : 0) +
    p.slice(1).reduce((sum, s, i) => sum + haversineDistanceKm(p[i].location!, s.location!), 0);
  const best = permute(attractions).reduce((b, p) => (length(p) < length(b) ? p : b));
  const out = [...stops];
  idx.forEach((pos, k) => (out[pos] = best[k]));
  return out.map((s, i) => ({ ...s, order: i + 1 }));
}

// Şablon isimli kayıtlar belirli bir işletme değil, bölge önerisi (bkz.
// data/cities/sanitize.ts) — durak başlığında da öyle yazılıyor.
function diningTitle(meal: string, r: Restaurant): string {
  return r.isAreaSuggestion ? `${meal}: ${r.address} çevresinde` : `${meal}: ${r.name}`;
}

function pickRestaurant(restaurants: Restaurant[], index: number): Restaurant | undefined {
  if (restaurants.length === 0) return undefined;
  return restaurants[index % restaurants.length];
}

// A dining stop's meal type (Kahvaltı/Öğle Yemeği/Akşam Yemeği, baked into its
// title at creation time) is semantic, not positional — it must not be
// re-derived from where optimizeTSP happens to place the stop in the day's
// geographic route. Returns undefined for anything that isn't a recognized
// meal-titled dining stop, so callers can fall back to position-based logic.
function mealTimeSlot(title: string): "morning" | "afternoon" | "evening" | undefined {
  if (title.startsWith("Kahvaltı")) return "morning";
  if (title.startsWith("Öğle Yemeği")) return "afternoon";
  if (title.startsWith("Akşam Yemeği")) return "evening";
  return undefined;
}

/**
 * Otomatik itinerary oluşturucu: şehrin attraction/restaurant verisinden
 * gün sayısına göre optimize edilmiş gün gün plan üretir.
 * Must-see yerler önce, sonra should-see, sonra nice-to-have dağıtılır.
 */
export function generateItinerary(city: City, days: number): ItineraryRoute {
  // Ferry-only attractions/restaurants (Bozcaada/Gökçeada/Eceabat-type stops,
  // see Attraction.accessMode) must never be mixed into a normal driving day
  // with mainland stops — report follow-up: Çanakkale's day plans were
  // routing "by car" straight across the strait to an island, and could even
  // put two different islands in the same day. These get pulled out of the
  // regular per-day pool entirely and, when the trip is long enough, handed
  // their own dedicated day(s) instead. "boat-tour" stops (e.g. Kekova from
  // Kaş) stay in the normal pool as-is — their departure point is already on
  // the mainland, so same-day mixing is fine; only the transfer estimate
  // needs the accessMode carried through (handled below via estimateTransfer).
  const mainlandAttractions = city.attractions.filter((a) => a.accessMode !== "ferry");
  const ferryAttractions = city.attractions.filter((a) => a.accessMode === "ferry");
  const mainlandRestaurants = city.restaurants.filter((r) => r.accessMode !== "ferry");
  const ferryRestaurants = city.restaurants.filter((r) => r.accessMode === "ferry");

  const sortedAttractions = sortByImportance(mainlandAttractions);
  const restaurants = mainlandRestaurants.length > 0 ? mainlandRestaurants : [];

  // Cluster ferry attractions by location so two genuinely distinct ferry
  // destinations (e.g. Bozcaada vs. Gökçeada) never land on the same day.
  const ferryClusters = clusterByLocation(sortByImportance(ferryAttractions)).sort(
    (a, b) => (IMPORTANCE_ORDER[a[0]?.importance] ?? 3) - (IMPORTANCE_ORDER[b[0]?.importance] ?? 3)
  );

  // Reserve one day per ferry cluster — never the first day (still a normal
  // mainland arrival day) and, for 3+ day trips, never the last day either
  // (keep the final day free for the return journey, matching the existing
  // "son gün" note below). A 1-day trip can't fit a same-day island
  // excursion realistically, so ferry clusters are simply left out of it.
  const ferryDayNumbers: number[] = [];
  if (days >= 2 && ferryClusters.length > 0) {
    const lastUsableDay = days >= 3 ? days - 1 : days;
    for (let d = 2; d <= lastUsableDay && ferryDayNumbers.length < ferryClusters.length; d++) {
      ferryDayNumbers.push(d);
    }
  }

  const restaurantClusterFor = (cluster: Attraction[]): Restaurant | undefined => {
    if (ferryRestaurants.length === 0 || cluster.length === 0) return undefined;
    const anchor = cluster[0].location;
    if (!anchor) return ferryRestaurants[0];
    return [...ferryRestaurants].sort((a, b) => {
      if (!a.location || !b.location) return 0;
      const da = Math.abs(a.location.lat - anchor.lat) + Math.abs(a.location.lng - anchor.lng);
      const db = Math.abs(b.location.lat - anchor.lat) + Math.abs(b.location.lng - anchor.lng);
      return da - db;
    })[0];
  };

  // Her gün için kaç attraction hedefleniyor (yoğunluk gün arttıkça azalır)
  const attractionsPerDay = days <= 2 ? 3 : days <= 5 ? 2 : 2;

  const dayPlans: DayPlan[] = [];
  // Günlere coğrafi dağıtım (2026-10-02): her gün kalan en önemli yerle
  // başlar, günün diğer durakları o yere en yakın kalan yerlerden seçilir.
  // Önceden önem sırasıyla art arda alınıyordu; şehrin zıt yönlerindeki yerler
  // (Kars: Ani doğuda, Sarıkamış batıda) aynı güne düşüp gidiş-dönüş
  // yaratıyordu.
  const remainingAttractions = [...sortedAttractions];
  let ferryClusterCursor = 0;

  const dayThemes = [
    "Şehrin Kalbi",
    "Tarihi Keşif",
    "Doğa ve Manzara",
    "Yerel Yaşam",
    "Sakin Bir Gün",
    "Gizli Köşeler",
    "Deniz ve Lezzet",
    "Kültür Turu",
    "Macera Günü",
    "Rahatlama",
    "Çevre Gezileri",
    "Alışveriş ve Sanat",
    "Fotoğraf Turu",
    "Veda Günü",
  ];

  for (let day = 1; day <= days; day++) {
    const stops: RouteStop[] = [];
    let order = 1;

    const isFerryDay = ferryDayNumbers.includes(day);
    const ferryCluster = isFerryDay ? ferryClusters[ferryClusterCursor++] ?? [] : [];
    const ferryLunchRestaurant = isFerryDay ? restaurantClusterFor(ferryCluster) : undefined;

    const breakfastRestaurant = pickRestaurant(restaurants, (day - 1) * 3);
    const lunchRestaurant = ferryLunchRestaurant ?? pickRestaurant(restaurants, (day - 1) * 3 + 1);
    const dinnerRestaurant = pickRestaurant(restaurants, (day - 1) * 3 + 2);

    if (breakfastRestaurant) {
      stops.push({
        order: order++,
        title: diningTitle("Kahvaltı", breakfastRestaurant),
        description: breakfastRestaurant.description,
        duration: "1 saat",
        type: "dining",
        itemId: breakfastRestaurant.id,
        location: breakfastRestaurant.location,
        accessMode: breakfastRestaurant.accessMode,
      });
    }

    // Ferry günlerinde durak havuzu mainland sortedAttractions'tan değil, o
    // günün ayrılmış tek ferry cluster'ından geliyor — böylece aynı gün içinde
    // iki farklı adaya (ör. Bozcaada + Gökçeada) gidilmiş gibi görünmüyor.
    const dayAttractions: Attraction[] = isFerryDay
      ? ferryCluster.slice(0, 2)
      : (() => {
          const seed = remainingAttractions.shift();
          if (!seed) return [];
          const picked: Attraction[] = [seed];
          while (picked.length < attractionsPerDay && remainingAttractions.length > 0) {
            let best = 0;
            if (seed.location) {
              let bestKm = Infinity;
              remainingAttractions.forEach((a, i) => {
                const km = a.location ? haversineDistanceKm(seed.location, a.location) : Infinity;
                if (km < bestKm) {
                  bestKm = km;
                  best = i;
                }
              });
            }
            picked.push(remainingAttractions.splice(best, 1)[0]);
          }
          return picked;
        })();

    dayAttractions.forEach((attraction, idx) => {
      stops.push({
        order: order++,
        title: attraction.name,
        description: attraction.description,
        duration: attraction.duration,
        type: "attraction",
        itemId: attraction.id,
        location: attraction.location,
        tips: attraction.tips,
        accessMode: attraction.accessMode,
      });

      // Öğlen ilk attraction sonrası öğle yemeği ekle
      if (idx === 0 && lunchRestaurant) {
        stops.push({
          order: order++,
          title: diningTitle("Öğle Yemeği", lunchRestaurant),
          description: lunchRestaurant.description,
          duration: "1.5 saat",
          type: "dining",
          itemId: lunchRestaurant.id,
          location: lunchRestaurant.location,
          accessMode: lunchRestaurant.accessMode,
        });
      }
    });

    if (dinnerRestaurant) {
      stops.push({
        order: order++,
        title: diningTitle("Akşam Yemeği", dinnerRestaurant),
        description: dinnerRestaurant.description,
        duration: "2 saat",
        type: "dining",
        itemId: dinnerRestaurant.id,
        location: dinnerRestaurant.location,
        accessMode: dinnerRestaurant.accessMode,
      });
    }

    // Eğer hiç attraction kalmadıysa (uzun rotalarda), serbest gün ekle
    if (!isFerryDay && dayAttractions.length === 0 && sortedAttractions.length > 0) {
      stops.splice(1, 0, {
        order: 99,
        title: "Serbest Zaman: Sahilde/Çarşıda Keşif",
        description: "Bu gün programsız — kendi hızınızda şehri keşfedin, alışveriş yapın veya dinlenin.",
        duration: "3-4 saat",
        type: "activity",
      });
    }

    // Attraction/restoran seçimi importance sırasına göre yapıldı (koordinattan
    // bağımsız), bu yüzden ham sıra coğrafi olarak zikzak çizebiliyordu — ör.
    // Kars'ta kahvaltı (merkez) -> Ani Harabeleri (53km) -> öğle yemeği (merkez)
    // -> Kars Kalesi (merkez) -> Sarıkamış (50km, ters yön) -> akşam yemeği
    // (yine Ani yolu üzerinde). "Rotayı Optimize Et" butonundaki optimizeTSP
    // (nearest-neighbor, ilk durağı sabit tutar) burada da uygulanarak varsayılan
    // sıra baştan coğrafi olarak mantıklı geliyor; kullanıcı butona hiç
    // basmasa da SSR/ilk render zaten optimize.
    const optimizedStops = reorderAttractionStops(optimizeTSP(stops));
    stops.length = 0;
    stops.push(...optimizedStops);

    // Section 2.2: her durağı zaman dilimine (sabah/öğle/akşam) yerleştir.
    // Dining duraklar (Kahvaltı/Öğle Yemeği/Akşam Yemeği) title'larına göre
    // SABİT bir zaman dilimine atanır — optimizeTSP durakları coğrafi
    // yakınlığa göre yeniden sıraladığında bir akşam-yemeği durağı erken
    // sıraya düşebiliyor, pozisyon-oranı mantığı o zaman "Akşam Yemeği" yazan
    // bir durağı "Sabah" rozetiyle gösteriyordu (madde 293 regresyonu).
    // Attraction/diğer duraklar hâlâ pozisyon oranına göre yerleştiriliyor.
    stops.forEach((s) => {
      const mealSlot = s.type === "dining" ? mealTimeSlot(s.title) : undefined;
      s.timeSlot = mealSlot ?? assignTimeSlot(s.order, stops.length);
    });

    // Section 1.3: ardışık duraklar arası mock transfer bloğu (mesafe + süre)
    const transfers = [];
    let totalWalkingKm = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      const transfer = estimateTransfer(
        stops[i].order,
        stops[i + 1].order,
        stops[i].location,
        stops[i + 1].location,
        stops[i].accessMode,
        stops[i + 1].accessMode
      );
      if (transfer) {
        transfers.push(transfer);
        if (transfer.mode === "walk") totalWalkingKm += transfer.distanceKm;
      }
    }


    dayPlans.push({
      day,
      title: dayThemes[(day - 1) % dayThemes.length],
      stops,
      transfers,
      totalWalkingKm: Math.round(totalWalkingKm * 10) / 10,
      totalDuration: `${6 + dayAttractions.length * 2} saat`,
      mealSuggestions:
        breakfastRestaurant && lunchRestaurant && dinnerRestaurant
          ? {
              breakfast: breakfastRestaurant,
              lunch: lunchRestaurant,
              dinner: dinnerRestaurant,
            }
          : undefined,
      accommodationSuggestion: city.accommodations[0],
      notes:
        day === days
          ? "Son gün — dönüş yolculuğu için zaman payı bırakın."
          : undefined,
    });
  }

  const importance: ItineraryRoute["importance"] =
    days <= 2 ? "quick-visit" : days <= 5 ? "highlights" : "full-experience";

  return {
    id: `${city.slug}-${days}days`,
    title: `${city.name} İçin ${days} Günlük Rota`,
    description: `${city.name} için otomatik oluşturulmuş, ${days} günlük optimize edilmiş rota`,
    days,
    summary: `${dayPlans.length} günlük plan, ${city.attractions.length} gezilecek yer ve ${city.restaurants.length} restoran verisinden oluşturuldu.`,
    importance,
    dayPlans,
    bestSeason: city.whenToGo,
    budgetPerPerson: city.budget,
    images: city.attractions[0]?.images ?? [],
  };
}

export const AVAILABLE_DURATIONS = [1, 2, 3, 5, 7, 14];
