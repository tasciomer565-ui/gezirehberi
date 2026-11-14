// Şehir sayfaları için anlık hava durumu ve 5 günlük tahmin (2026-11-02).
// Kaynak: MET Norway (Norveç Meteoroloji Enstitüsü) Locationforecast 2.0 —
// API anahtarı gerektirmez, ticari kullanıma izin verir; koşullar: tanımlayıcı
// User-Agent (iletişim bilgisiyle), enlem/boylam en fazla 4 ondalık, kaynak
// gösterimi (CC BY 4.0). Hata/zaman aşımında null döner ve bölüm gizlenir,
// sayfa asla kırılmaz.
const ENDPOINT = "https://api.met.no/weatherapi/locationforecast/2.0/compact";

export type WeatherIcon = "sun" | "partly" | "cloud" | "fog" | "rain" | "snow" | "sleet" | "thunder";

export interface WeatherNow {
  temp: number;
  wind: number; // km/sa
  humidity: number; // %
  label: string;
  icon: WeatherIcon;
}
export interface WeatherDay {
  date: string; // YYYY-MM-DD (Europe/Istanbul)
  weekday: string;
  min: number;
  max: number;
  label: string;
  icon: WeatherIcon;
}
export interface WeatherData {
  now: WeatherNow;
  days: WeatherDay[];
  updatedAt: string; // ISO (kaynağın üretim zamanı)
}

// symbol_code (ör. "lightrain_day", "partlycloudy_night") -> Türkçe etiket.
const BASE: Record<string, string> = {
  clearsky: "Açık",
  fair: "Az bulutlu",
  partlycloudy: "Parçalı bulutlu",
  cloudy: "Bulutlu",
  fog: "Sisli",
};
export function symbolLabel(code: string | undefined): string {
  if (!code) return "";
  const c = code.replace(/_(day|night|polartwilight)$/, "");
  if (BASE[c]) return BASE[c];
  const thunder = c.includes("thunder");
  const strength = c.startsWith("light") ? "Hafif " : c.startsWith("heavy") ? "Kuvvetli " : "";
  const core = c.replace(/^(light|heavy)/, "");
  let kind = "";
  if (core.startsWith("rainshowers")) kind = "sağanak yağışlı";
  else if (core.startsWith("snowshowers")) kind = "kar sağanaklı";
  else if (core.startsWith("sleetshowers")) kind = "karla karışık sağanaklı";
  else if (core.startsWith("rain")) kind = "yağmurlu";
  else if (core.startsWith("snow")) kind = "karlı";
  else if (core.startsWith("sleet")) kind = "karla karışık yağmurlu";
  if (!kind) return thunder ? "Gök gürültülü" : "";
  const text = `${strength}${kind}`;
  const out = text.charAt(0).toUpperCase() + text.slice(1);
  return thunder ? `${out}, gök gürültülü` : out;
}

// symbol_code -> ikon anahtarı (UI lucide ikonuna eşler).
export function symbolIcon(code: string | undefined): WeatherIcon {
  const c = (code ?? "").replace(/_(day|night|polartwilight)$/, "");
  if (c.includes("thunder")) return "thunder";
  if (c.includes("sleet")) return "sleet";
  if (c.includes("snow")) return "snow";
  if (c.includes("rain")) return "rain";
  if (c === "fog") return "fog";
  if (c === "cloudy") return "cloud";
  if (c === "partlycloudy" || c === "fair") return "partly";
  return "sun";
}

const dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" });
const hourFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", hour12: false });
const weekdayFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", weekday: "long" });

interface Entry {
  time: string;
  data: {
    instant: { details: { air_temperature?: number; wind_speed?: number; relative_humidity?: number } };
    next_1_hours?: { summary?: { symbol_code?: string } };
    next_6_hours?: { summary?: { symbol_code?: string } };
    next_12_hours?: { summary?: { symbol_code?: string } };
  };
}

type MetResponse = { properties?: { meta?: { updated_at?: string }; timeseries?: Entry[] } };

// Tarayıcıda çağrılır (CityWeather istemci bileşeni). MET Norway CORS'a izin
// veriyor; tarayıcı User-Agent başlığını değiştiremediği için kimlik Origin/
// Referer ile gidiyor. Önceden sunucuda saatlik ISR ile çekiliyordu: 425 şehir
// sayfası x saatlik yeniden üretim Vercel Hobby ISR/CPU limitlerini aşıp ekibi
// durdurdu (2026-11-15). Artık şehir sayfaları tamamen statik.
export async function fetchWeather(lat: number, lng: number, signal?: AbortSignal): Promise<WeatherData | null> {
  try {
    const url = `${ENDPOINT}?lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal });
    if (!res.ok) return null;
    return parseWeather((await res.json()) as MetResponse);
  } catch {
    return null;
  }
}

function parseWeather(json: MetResponse): WeatherData | null {
  try {
    const series = json.properties?.timeseries;
    if (!Array.isArray(series) || series.length === 0) return null;

    const first = series[0];
    const d0 = first?.data?.instant?.details;
    if (!d0 || typeof d0.air_temperature !== "number" || !Number.isFinite(d0.air_temperature)) return null;
    const now: WeatherNow = {
      temp: Math.round(d0.air_temperature),
      wind: Math.round((d0.wind_speed ?? 0) * 3.6),
      humidity: Math.round(d0.relative_humidity ?? 0),
      label: symbolLabel(first.data.next_1_hours?.summary?.symbol_code ?? first.data.next_6_hours?.summary?.symbol_code),
      icon: symbolIcon(first.data.next_1_hours?.summary?.symbol_code ?? first.data.next_6_hours?.summary?.symbol_code),
    };

    const byDay = new Map<string, { temps: number[]; noon?: Entry; noonDelta: number; firstEntry?: Entry }>();
    for (const e of series) {
      const t = e.data?.instant?.details?.air_temperature;
      if (typeof t !== "number" || !Number.isFinite(t)) continue;
      const d = new Date(e.time);
      if (Number.isNaN(d.getTime())) continue;
      const key = dateFmt.format(d);
      const hour = parseInt(hourFmt.format(d), 10);
      const slot = byDay.get(key) ?? { temps: [], noonDelta: 99 };
      slot.temps.push(t);
      slot.firstEntry = slot.firstEntry ?? e;
      const delta = Math.abs(hour - 13);
      if (delta < slot.noonDelta && (e.data.next_6_hours || e.data.next_12_hours || e.data.next_1_hours)) {
        slot.noon = e;
        slot.noonDelta = delta;
      }
      byDay.set(key, slot);
    }
    const days: WeatherDay[] = [];
    for (const [date, s] of byDay) {
      if (days.length >= 7) break;
      // Yalnızca tamamlanmış gün özeti: ilk gün kısmi olabilir ama bugünü de gösteriyoruz.
      const e = s.noon ?? s.firstEntry;
      const code = e?.data.next_12_hours?.summary?.symbol_code ?? e?.data.next_6_hours?.summary?.symbol_code ?? e?.data.next_1_hours?.summary?.symbol_code;
      days.push({
        date,
        weekday: weekdayFmt.format(new Date(`${date}T12:00:00+03:00`)),
        min: Math.round(Math.min(...s.temps)),
        max: Math.round(Math.max(...s.temps)),
        label: symbolLabel(code),
        icon: symbolIcon(code),
      });
    }
    if (days.length === 0) return null;
    const stamp = json.properties?.meta?.updated_at ?? first.time;
    const updatedAt = Number.isNaN(new Date(stamp).getTime()) ? new Date().toISOString() : stamp;
    return { now, days, updatedAt };
  } catch {
    return null;
  }
}
