// Bölüm 2: kullanıcının check-off, not ve gün-kopyalama tercihlerini
// localStorage'da saklayan hafif bir overlay katmanı (backend yok).

export interface ItineraryLocalState {
  checked: Record<string, boolean>; // key: `${day}-${order}`
  notes: Record<number, string>; // key: day
  budgets?: Record<number, { accommodation: number; food: number; tickets: number; transport: number }>;
}

function keyFor(citySlug: string, days: number) {
  return `yoldefteri_itinerary_${citySlug}_${days}d`;
}

const EMPTY: ItineraryLocalState = { checked: {}, notes: {}, budgets: {} };

export function loadItineraryLocalState(citySlug: string, days: number): ItineraryLocalState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(keyFor(citySlug, days));
    return raw ? JSON.parse(raw) : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function saveItineraryLocalState(citySlug: string, days: number, state: ItineraryLocalState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(citySlug, days), JSON.stringify(state));
}

/**
 * Mock hava durumu — gerçek bir Weather API key'i olmadan, il koordinatına ve
 * gün indexine göre deterministik (her yenilemede aynı) bir tahmin üretir.
 * Gerçek API entegrasyonu (OpenWeather vb.) key sağlanırsa buraya eklenebilir.
 */
export interface MockWeather {
  tempC: number;
  condition: "güneşli" | "parçalı bulutlu" | "yağmurlu" | "karlı" | "sisli";
  icon: string;
  rainChance: number;
  windKmh: number;
}

const CONDITIONS: MockWeather["condition"][] = [
  "güneşli",
  "parçalı bulutlu",
  "yağmurlu",
  "karlı",
  "sisli",
];
const ICONS: Record<MockWeather["condition"], string> = {
  "güneşli": "☀️",
  "parçalı bulutlu": "⛅",
  "yağmurlu": "🌧️",
  "karlı": "❄️",
  "sisli": "🌫️",
};

function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h % 1000) / 1000;
}

export function getMockWeather(citySlug: string, day: number, avgTempHint = 18): MockWeather {
  const r1 = seededRandom(`${citySlug}-${day}-t`);
  const r2 = seededRandom(`${citySlug}-${day}-c`);
  const r3 = seededRandom(`${citySlug}-${day}-r`);
  const r4 = seededRandom(`${citySlug}-${day}-w`);

  // Ege and Akdeniz regions are generally warmer
  let baseTemp = avgTempHint;
  const isWarmRegion = 
    citySlug.includes("cesme") || 
    citySlug.includes("bodrum") || 
    citySlug.includes("antalya") || 
    citySlug.includes("alanya") || 
    citySlug.includes("fethiye") || 
    citySlug.includes("marmaris") || 
    citySlug.includes("kas") ||
    citySlug.includes("izmir");

  if (isWarmRegion) {
    baseTemp = 25;
  }

  const tempC = Math.round(baseTemp - 5 + r1 * 10);
  
  // Filter weather conditions based on temperature and regional climate
  let allowedConditions: MockWeather["condition"][] = ["güneşli", "parçalı bulutlu", "yağmurlu", "sisli"];
  if (tempC <= 5 && !isWarmRegion) {
    allowedConditions.push("karlı");
  }

  // Pick condition from the allowed subset
  const condition = allowedConditions[Math.floor(r2 * allowedConditions.length)];

  return {
    tempC,
    condition,
    icon: ICONS[condition],
    rainChance: Math.round(r3 * (condition === "yağmurlu" ? 80 : 25)),
    windKmh: Math.round(8 + r4 * 22),
  };
}
