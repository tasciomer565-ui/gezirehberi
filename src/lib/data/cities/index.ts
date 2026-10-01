import { City, RegionSlug } from "@/lib/types";
import contentDates from "./contentDates.json";
import { applyCostLevels, sanitizeCity } from "./sanitize";
import { karadenizCities } from "./karadeniz";
import { karadenizExtraCities } from "./karadeniz-extra";
import { karadenizExtra2Cities } from "./karadeniz-extra2";
import { karadenizExtra3Cities } from "./karadeniz-extra3";
import { karadenizExtra4Cities } from "./karadeniz-extra4";
import { karadenizExtra5Cities } from "./karadeniz-extra5";
import { karadenizExtra6Cities } from "./karadeniz-extra6";
import { akdenizCities } from "./akdeniz";
import { akdenizExtraCities } from "./akdeniz-extra";
import { akdenizExtra2Cities } from "./akdeniz-extra2";
import { egeCities } from "./ege";
import { egeExtraCities } from "./ege-extra";
import { egeExtra2Cities } from "./ege-extra2";
import { egeExtra3Cities } from "./ege-extra3";
import { marmaraCities } from "./marmara";
import { marmaraExtra2Cities } from "./marmara-extra2";
import { marmaraExtra3Cities } from "./marmara-extra3";
import { marmaraExtra4Cities } from "./marmara-extra4";
import { icAnadoluCities } from "./ic-anadolu";
import { icAnadoluExtraCities } from "./ic-anadolu-extra";
import { icAnadoluExtra2Cities } from "./ic-anadolu-extra2";
import { icAnadoluExtra3Cities } from "./ic-anadolu-extra3";
import { doguAnadoluCities } from "./dogu-anadolu";
import { doguAnadoluExtraCities } from "./dogu-anadolu-extra";
import { doguAnadoluExtra2Cities } from "./dogu-anadolu-extra2";
import { doguAnadoluExtra3Cities } from "./dogu-anadolu-extra3";
import { guneydoguAnadoluCities } from "./guneydogu-anadolu";
import { guneydoguAnadoluExtraCities } from "./guneydogu-anadolu-extra";
import { guneydoguAnadoluExtra2Cities } from "./guneydogu-anadolu-extra2";

export const allCities: City[] = applyCostLevels([
  ...karadenizCities,
  ...karadenizExtraCities,
  ...karadenizExtra2Cities,
  ...karadenizExtra3Cities,
  ...karadenizExtra4Cities,
  ...karadenizExtra5Cities,
  ...karadenizExtra6Cities,
  ...akdenizCities,
  ...akdenizExtraCities,
  ...akdenizExtra2Cities,
  ...egeCities,
  ...egeExtraCities,
  ...egeExtra2Cities,
  ...egeExtra3Cities,
  ...marmaraCities,
  ...marmaraExtra2Cities,
  ...marmaraExtra3Cities,
  ...marmaraExtra4Cities,
  ...icAnadoluCities,
  ...icAnadoluExtraCities,
  ...icAnadoluExtra2Cities,
  ...icAnadoluExtra3Cities,
  ...doguAnadoluCities,
  ...doguAnadoluExtraCities,
  ...doguAnadoluExtra2Cities,
  ...doguAnadoluExtra3Cities,
  ...guneydoguAnadoluCities,
  ...guneydoguAnadoluExtraCities,
  ...guneydoguAnadoluExtra2Cities,
].map(sanitizeCity));

export function getCity(regionSlug: string, citySlug: string): City | undefined {
  return allCities.find((c) => c.regionSlug === regionSlug && c.slug === citySlug);
}

export function getCitiesByRegion(regionSlug: string): City[] {
  return allCities.filter((c) => c.regionSlug === regionSlug);
}

export function getCityCount(regionSlug: RegionSlug): number {
  return allCities.filter((c) => c.regionSlug === regionSlug).length;
}

export function getAllCitySlugs(): { region: string; city: string }[] {
  return allCities.map((c) => ({ region: c.regionSlug, city: c.slug }));
}

// scripts/generate-content-dates.ts tarafından üretilir — "son doğrulama
// tarihi" değil, gerçek git commit tarihinden alınan "içerik son güncelleme"
// vekili (Parti 3, madde 11 — uydurma tarih yerine dürüst, doğrulanabilir bir
// vekil metrik, madde 9'daki istatistik rozeti substitution'ıyla aynı mantık).
export function getContentLastUpdated(citySlug: string): string | undefined {
  return (contentDates as Record<string, string>)[citySlug];
}

// Parti 5, madde 16 — "Gizli Cennet" rozeti. Gerçek ziyaretçi/arama hacmi
// verimiz yok. İlk denemede "editoryal öne-çıkanlar listesinde olmayan +
// curated içeriği olan şehir" kuralı denendi, ama curated attractions
// sayısı 84 şehirde neredeyse sabit (8-11 arası, kalıp/şablon üretiminden
// kalma) — bu kural şehirlerin %82'sini (69/84) "gizli cennet" yapıp
// rozeti anlamsızlaştırdı. Gerçek bir ayırt edici sinyal (trafik, arama
// hacmi) yok, bu yüzden algoritmik bir tanım yerine küçük, elle seçilmiş,
// UI'da AÇIKÇA "editoryal seçki" olarak etiketlenmiş bir liste kullanılıyor
// (madde 34/167 disiplini: belirsiz bir kritere dayanan sahte-kesin bir
// algoritma yerine, dürüstçe "bu bizim seçimimiz" demek).
const HIDDEN_GEM_SLUGS = new Set([
  "artvin",
  "ardahan",
  "bayburt",
  "gumushane",
  "tunceli",
  "bingol",
  "mus",
  "bitlis",
  "kirsehir",
  "yozgat",
  "usak",
  "burdur",
  "sinop",
  "kastamonu",
  "siirt",
  "hakkari",
  "igdir",
  "cankiri",
]);

export function isHiddenGem(citySlug: string): boolean {
  return HIDDEN_GEM_SLUGS.has(citySlug);
}

// Header'daki arama kutusu için küçük dizin (bkz. src/lib/search.ts notu).
// Sadece sunucu bileşenlerinden (layout, not-found) çağrılmalı.
export function getSearchIndex(): Pick<City, "slug" | "regionSlug" | "name" | "region" | "tags">[] {
  return allCities.map(({ slug, regionSlug, name, region, tags }) => ({ slug, regionSlug, name, region, tags }));
}
