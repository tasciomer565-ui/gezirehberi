import { allCities } from "@/lib/data/cities";
import { getDistrict } from "@/lib/data/districts";

// Helper hash function to ensure stable, seed-based dynamic generation
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Helper to expand base place list up to 500 entries dynamically and deterministically
function generatePlacesForCity(city: any, type: string, count: number, district?: any): any[] {
  let baseList: any[] = [];
  if (type === "attractions") baseList = city.attractions || [];
  else if (type === "restaurants") baseList = city.restaurants || [];
  else if (type === "accommodations") baseList = city.accommodations || [];
  else if (type === "localFood") baseList = city.localFood || [];

  // Filter curated base list if district is specified
  if (district) {
    const dNameLower = district.name.toLowerCase();
    baseList = baseList.filter(item =>
      item.name.toLowerCase().includes(dNameLower) ||
      (item.description && item.description.toLowerCase().includes(dNameLower))
    );
  }

  const result = [...baseList];
  const startId = baseList.length;

  const attractionCategories = ["historical", "nature", "viewpoint", "museum", "activity", "shopping"];
  const restaurantTypes = ["restaurant", "cafe", "street-food", "market"];
  const accommodationTypes = ["hotel", "guesthouse", "boutique", "resort"];

  const adjList = ["Tarihi", "Eski", "Yeni", "Gizli", "Büyük", "Yeşil", "Kutlu", "Ulu", "Yüce", "Harika", "Saklı", "Gözde", "Geleneksel"];

  const baseName = district ? district.name : city.name;
  const baseLat = district ? district.location.lat : city.location.lat;
  const baseLng = district ? district.location.lng : city.location.lng;

  for (let i = startId; i < count; i++) {
    const seed = `${city.slug}-${district ? district.slug + '-' : ''}${type}-${i}`;
    const hash = hashString(seed);

    // Minor displacement coordinates centered on the district / city center
    const scale = district ? 3200 : 2000;
    const latOffset = (hash % 200 - 100) / scale;
    const lngOffset = (hash % 180 - 90) / (scale * 0.9);
    const lat = baseLat + latOffset;
    const lng = baseLng + lngOffset;

    const rating = parseFloat((3.8 + (hash % 12) / 10).toFixed(1)); // 3.8 - 5.0
    const reviewCount = 30 + (hash % 1970); // 30 - 2000 reviews

    if (type === "attractions") {
      const cat = attractionCategories[hash % attractionCategories.length];
      const names = {
        historical: ["Tarihi Konak", "Antik Kent Kalıntıları", "Han Kapısı", "Eski Bedesten", "Sarnıç", "Saat Kulesi", "Sur Duvarı", "Kervansaray", "Köprü"],
        nature: ["Vadisi", "Şelalesi", "Tabiat Parkı", "Mağarası", "Gölü", "Mesire Alanı", "Ormanı", "Kanyonu", "Pınarı"],
        viewpoint: ["Tepesi", "Seyir Terası", "Panoramik Noktası", "Kalesi Üst Terası", "Feneri", "Kulesi"],
        museum: ["Kültür Evi", "Kent Müzesi", "Etnografya Müzesi", "Arkeoloji Müzesi", "Sanat Galerisi", "Kurtuluş Müzesi"],
        activity: ["Tekne Turu İskelesi", "Doğa Yürüyüş Parkuru", "Kanyon Geçişi", "Kamp Alanı", "Yamaç Paraşütü Noktası"],
        shopping: ["Tarihi Çarşı", "El Sanatları Pazarı", "Kuyumcular Arastası", "Baharatçılar Çarşısı", "Antikacılar Sokağı"]
      };

      const adj = adjList[hash % adjList.length];
      const suffix = names[cat as keyof typeof names][hash % names[cat as keyof typeof names].length];
      const name = `${adj} ${baseName} ${suffix}`;

      let constructionYear: number | undefined = undefined;
      if (cat === "historical" || cat === "museum") {
        constructionYear = hash % 3 === 0
          ? -(100 + (hash % 1900)) // B.C. (M.Ö.)
          : 400 + (hash % 1580);   // A.D. (M.S.)
      }

      result.push({
        id: `${city.slug}-${district ? district.slug + '-' : ''}attraction-gen-${i}`,
        name,
        category: cat,
        description: `${name}, bölgenin görülmesi gereken en önemli ${cat} duraklarındandır.`,
        longDescription: `${name}, ${baseName} seyahatinizde benzersiz detaylar keşfedebileceğiniz, fotoğraf çekimleri ve kültürel izlenimler için harika bir ortam sunan bir cazibe merkezidir.`,
        images: [],
        location: { lat, lng },
        address: `${baseName} Merkez, Mahalle No: ${hash % 150 + 1}`,
        openingHours: "09:00 - 19:00",
        entranceFee: hash % 3 === 0 ? `${60 + (hash % 5) * 50} TL` : "Ücretsiz",
        duration: `${1 + (hash % 3)} saat`,
        bestTime: ["Sabah", "Öğleden sonra", "Gün batımı"][hash % 3],
        importance: ["must-see", "should-see", "nice-to-have"][hash % 3],
        tips: ["Rahat ayakkabılar tercih edin.", "Müze kartınızı yanınızda bulundurun."],
        accessibility: "Erişilebilir rampa ve düz geçişler mevcuttur",
        constructionYear,
        rating,
        reviewCount
      });
    } else if (type === "restaurants") {
      const dType = restaurantTypes[hash % restaurantTypes.length];
      const restaurantSuffixes = {
        restaurant: ["Lokantası", "Kebapçısı", "Restaurant", "Sofrası", "Et Evi", "Balık Evi", "Meyhanesi"],
        cafe: ["Kahvecisi", "Pastanesi", "Bistro", "Kafesi", "Fırını", "Çay Bahçesi"],
        "street-food": ["Büfesi", "Tezgahı", "Köftecisi", "Tantunicisi", "Kokoreççisi"],
        market: ["Organik Pazarı", "Zeytinyağlı Evi", "Köylü Pazarı", "Baharatçısı"]
      };

      const adj = adjList[hash % adjList.length];
      const suffix = restaurantSuffixes[dType as keyof typeof restaurantSuffixes][hash % restaurantSuffixes[dType as keyof typeof restaurantSuffixes].length];
      const name = `${adj} ${baseName} ${suffix}`;

      result.push({
        id: `${city.slug}-${district ? district.slug + '-' : ''}restaurant-gen-${i}`,
        name,
        diningType: dType,
        description: `${baseName} beldesinde en leziz yemekleri deneyimleyebileceğiniz popüler ${dType} noktası.`,
        longDescription: `Misafirlerine zengin menü alternatifleri ve harika bir atmosfer sunan ${name}, ${baseName} ziyaretinizde uğramanız gereken adreslerin başında yer alıyor.`,
        images: [],
        location: { lat, lng },
        address: `${baseName} Sahil Yolu, Caddesi No: ${hash % 100 + 1}`,
        priceRange: ["budget", "mid", "luxury"][hash % 3],
        averageCost: `${100 + (hash % 5) * 100}-${250 + (hash % 5) * 150} TL`,
        rating,
        reviewCount,
        specialties: ["Yöresel Tatlar", "Taze Lezzetler"],
        features: ["Açık Alan", "Çocuk Dostu"]
      });
    } else if (type === "accommodations") {
      const accType = accommodationTypes[hash % accommodationTypes.length];
      const hotelSuffixes = {
        hotel: ["Oteli", "Hotel", "Saray Otel", "Grand Hotel", "City Hotel"],
        guesthouse: ["Pansiyonu", "Evi", "Konuk Evi", "Apartı"],
        boutique: ["Butik Oteli", "Taş Konak", "Tasarım Oteli", "Mansion"],
        resort: ["Resort", "Tatil Köyü", "Termal Otel", "Spa Hotel"]
      };

      const adj = adjList[hash % adjList.length];
      const suffix = hotelSuffixes[accType as keyof typeof hotelSuffixes][hash % hotelSuffixes[accType as keyof typeof hotelSuffixes].length];
      const name = `${adj} ${baseName} ${suffix}`;

      const priceSegment = ((hash % 3) + 1);
      const priceRange = priceSegment === 1 ? "budget" : priceSegment === 2 ? "mid" : "luxury";
      const pricePerNight = `${500 * priceSegment + (hash % 10) * 150} TL`;

      result.push({
        id: `${city.slug}-${district ? district.slug + '-' : ''}accommodation-gen-${i}`,
        name,
        type: accType,
        description: `${baseName} seyahatinizde konfor ve huzuru bir arada bulabileceğiniz şık konaklama tesisi.`,
        images: [],
        location: { lat, lng },
        address: `${baseName} Oteller Bölgesi No: ${hash % 50 + 1}`,
        priceRange,
        pricePerNight,
        rating,
        reviewCount,
        amenities: ["Ücretsiz WiFi", "Kahvaltı Dahil", "Otopark", "7/24 Resepsiyon"]
      });
    } else if (type === "localFood") {
      const foodNames = ["Kebabı", "Tavası", "Çorbası", "Pidesi", "Helvası", "Köftesi", "Ekmeği", "Lokumu", "Şerbeti", "Ezmesi"];
      const suffix = foodNames[hash % foodNames.length];
      const name = `Meşhur ${baseName} ${suffix}`;

      result.push({
        id: `${city.slug}-${district ? district.slug + '-' : ''}food-gen-${i}`,
        name,
        description: `${baseName} kültürüne ait tescilli ve popüler yöresel lezzet/hediyelik.`,
        longDescription: `Asırlardır süregelen tariflerle hazırlanan ${name}, ${baseName} mutfağının en çok tavsiye edilen meşhur simgelerinden biridir.`,
        images: [],
        origin: baseName,
        ingredients: ["Yerel Baharatlar", "Doğal Malzemeler"],
        whereToTry: [],
        bestSeason: "Yıl boyu",
        priceRange: `${40 + (hash % 10) * 20} - ${100 + (hash % 10) * 30} TL`,
        tips: "Taze ve sıcak tüketilmesi, orijinal satış noktalarından alınması önerilir.",
        importance: ["must-see", "should-see", "nice-to-have"][hash % 3],
        rating,
        reviewCount
      });
    }
  }

  return result;
}

export interface GetPlacesOptions {
  type?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  query?: string;
  districtSlug?: string;
}

export interface GetPlacesResult {
  items: any[];
  totalCount: number;
  hasMore: boolean;
  offset: number;
  limit: number;
}

// Shared place-list resolver used by both the /api/cities/[citySlug]/places route
// (client pagination/filtering) and server components (initial SSR payload) so the
// two never diverge and the first render always has real data, not an empty list.
export function getPlacesForCity(citySlug: string, options: GetPlacesOptions = {}): GetPlacesResult | null {
  const {
    type = "attractions",
    limit = 20,
    offset = 0,
    sort = "popularity",
    query = "",
    districtSlug = "",
  } = options;

  const city = allCities.find((c) => c.slug === citySlug);
  if (!city) return null;

  let district = undefined;
  if (districtSlug) {
    district = getDistrict(citySlug, districtSlug);
  }

  // Curated-only mode (madde 1/34/167 follow-up): the 500-per-category
  // generated filler used to fill this list produced severe near-duplicate
  // content — e.g. İzmir's "nice-to-have" filter returned 163 generated
  // entries from only 54 unique names, with the entire first page being
  // repeats like "Kutlu İzmir Tarihi Çarşı" three times over. The name/suffix
  // combinatorial space per category (≤65 unique names) is structurally too
  // small for 500 items, so collisions are guaranteed, not a hash-quality bug.
  // Until real editorial data exists per city, only curated entries (~10 per
  // category) are ever shown — GENERATE_FILLER_PLACES flips this back on
  // later if a genuine need for filler volume returns (it won't fix the
  // duplicate problem on its own; the combinatorial pools would need
  // expanding too).
  const GENERATE_FILLER_PLACES = false;
  let list = generatePlacesForCity(city, type, GENERATE_FILLER_PLACES ? 500 : 0, district);

  // Normalize items to prevent client-side crashes from missing fields in curated data.
  //
  // Düzeltme (2026-09-29): fiyatlar önceden pricingEngine.getDynamicPrice'tan
  // geçiyordu — mevsim çarpanı (yaz +%25, kış -%10) + id/hafta hash'inden
  // -%5..+%4 "dalgalanma"; yani kullanıcıya gösterilen müze giriş ücreti
  // dahil tüm fiyatlar her hafta uydurma biçimde değişiyordu. Eksik puan 4.5,
  // eksik yorum sayısı 100 ve eksik fiyat sabit bir değerle dolduruluyordu
  // (2.452 kaydın 1.630'unda puan, hiçbirinde yorum sayısı yok). Artık sadece
  // editörün girdiği gerçek değer gösteriliyor; olmayan alan boş kalıyor.
  list = list.map((item) => {
    return {
      ...item,
      regionSlug: district ? district.regionSlug : city.regionSlug,
      specialties: item.specialties || [],
      features: item.features || [],
      amenities: item.amenities || [],
      ingredients: item.ingredients || [],
      diningType: item.diningType || "restaurant",
      priceRange: item.priceRange,
      bestSeason: item.bestSeason || "Yıl boyu",
      tips: Array.isArray(item.tips) ? item.tips.join(". ") : (item.tips || "")
    };
  });

  // Apply Client-Side Full-Text / Fuzzy Search matching (instantly filters by name or description)
  if (query.trim() !== "") {
    const q = query.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }

  // Apply Sorting logic
  list.sort((a, b) => {
    if (sort === "popularity") {
      // Puan/yorum verisi yok (uydurma değerler 2026-09/10'da kaldırıldı);
      // "Öne çıkanlar" editörün importance alanına göre, eşitlikte kaynak
      // sırası korunur (Array.sort kararlı).
      const rank: Record<string, number> = { "must-see": 0, "should-see": 1, "nice-to-have": 2 };
      return (rank[a.importance] ?? 3) - (rank[b.importance] ?? 3);
    }
    else if (sort === "constructionYear") {
      // Sort from oldest year to newest year. Items without constructionYear are pushed to the end
      const yA = a.constructionYear !== undefined ? a.constructionYear : 999999;
      const yB = b.constructionYear !== undefined ? b.constructionYear : 999999;
      return yA - yB;
    }
    else if (sort === "price") {
      // Sort by priceSegment / pricePerNight / entranceFee (lowest/free first)
      const getPrice = (item: any) => {
        if (item.priceSegment !== undefined) return item.priceSegment;
        if (item.pricePerNight) {
          const num = parseInt(item.pricePerNight.replace(/[^0-9]/g, ""), 10);
          return isNaN(num) ? 999999 : num;
        }
        if (item.entranceFee !== undefined) {
          const feeStr = String(item.entranceFee).toLowerCase();
          if (feeStr.includes("ücretsiz") || feeStr.includes("free")) return 0;
          const num = parseInt(feeStr.replace(/[^0-9]/g, ""), 10);
          return isNaN(num) ? 999998 : num;
        }
        return 0;
      };
      return getPrice(a) - getPrice(b);
    }
    else if (sort === "alphabetical") {
      return a.name.localeCompare(b.name, "tr");
    }
    return 0;
  });

  // Extract paginated slice
  const totalCount = list.length;
  const paginatedList = list.slice(offset, offset + limit);

  return {
    items: paginatedList,
    totalCount,
    hasMore: offset + limit < totalCount,
    offset,
    limit
  };
}
