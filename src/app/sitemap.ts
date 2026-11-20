export const dynamic = "force-static";
import { MetadataRoute } from "next";
import dates from "@/lib/data/sitemapDates.json";
import { regions } from "@/lib/data/regions";
import { allCities } from "@/lib/data/cities";
import { popularDistricts } from "@/lib/data/districts";
import { getTranslatedCitySlugs } from "@/lib/translation/pipeline";
import type { TranslationTargetLocale } from "@/lib/translation/types";
import { getAllGuides } from "@/lib/data/guides";
import { getAllDistancePageData, getCityTableSlugs } from "@/lib/data/distances";
import { getAirportPageSlugs } from "@/lib/data/airportTransfers";
import { getAllPlacePairData } from "@/lib/data/placePairs";
import { getDayTripSlugs } from "@/lib/data/dayTrips";

// Only list locales that are actually indexable site-wide. en/de/ar/ru stay
// out of this base list (report items 22/283 — untranslated content by
// default) so listing them here would just trigger Search Console's
// "submitted URL marked 'noindex'" warning. City pages that DO have real
// per-city translation data get their own entries added below instead,
// mirroring the buildRobots(locale, contentTranslated) per-page override.
const locales = ["tr"];
const CANDIDATE_TRANSLATED_LOCALES: TranslationTargetLocale[] = ["en", "de", "ru", "ar"];

// lastmod, src/lib/data/sitemapDates.json'dan okunur (scripts/generate-sitemap-dates.ts
// tam git geçmişiyle üretir). Cloudflare Pages sığ klon kullandığı için derlemede
// `git log` çağırmak tüm URL'lere aynı sahte tarihi verirdi. Tarih yoksa
// lastModified hiç yazılmaz (uydurma tarih yok). Birden fazla kaynak verilirse
// en yeni olanı alınır.
const sitemapDates = dates as { paths: Record<string, string>; cities: Record<string, string> };

function newest(isoDates: (string | undefined)[]): Date | undefined {
  let best: Date | undefined;
  for (const iso of isoDates) {
    if (!iso) continue;
    const d = new Date(iso);
    if (isNaN(d.getTime())) continue;
    if (!best || d > best) best = d;
  }
  return best;
}

function route(
  url: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
  sourcePathspec: string | string[],
  extraIso?: string
): MetadataRoute.Sitemap[number] {
  const specs = Array.isArray(sourcePathspec) ? sourcePathspec : [sourcePathspec];
  const lastModified = newest([...specs.map((sp) => sitemapDates.paths[sp]), extraIso]);
  return { url, changeFrequency, priority, ...(lastModified ? { lastModified } : {}) };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://www.yoldefterim.com.tr";
  const sitemapRoutes: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    // 1. Core/Home & Discovery Routes — each backed by its own page.tsx source.
    sitemapRoutes.push(
      route(`${siteUrl}/${locale}`, "daily", 1.0, "src/app/[locale]/page.tsx"),
      route(`${siteUrl}/${locale}/bolgeler`, "weekly", 0.9, "src/app/[locale]/bolgeler/page.tsx"),
      // Denetim bulgusu (2026-09): /kayitlerim kisisel/ozel bir sayfa —
      // robots.txt'te disallow, sayfanin kendi meta'sinda noindex. Sitemap'te
      // listelenmesi GSC'nin "Submitted URL marked 'noindex'" uyarisini
      // tetikleyen celiskili bir sinyaldi, madde 16'nin ruhuna aykiri.
      route(`${siteUrl}/${locale}/hakkimizda`, "monthly", 0.5, "src/app/[locale]/hakkimizda/page.tsx"),
      route(`${siteUrl}/${locale}/gizlilik-politikasi`, "monthly", 0.4, "src/app/[locale]/gizlilik-politikasi/page.tsx"),
      route(`${siteUrl}/${locale}/cerez-politikasi`, "monthly", 0.4, "src/app/[locale]/cerez-politikasi/page.tsx"),
      route(`${siteUrl}/${locale}/kullanim-sartlari`, "monthly", 0.4, "src/app/[locale]/kullanim-sartlari/page.tsx"),
      route(`${siteUrl}/${locale}/iletisim`, "monthly", 0.5, "src/app/[locale]/iletisim/page.tsx")
    );

    // 1b. Guides (madde 302 follow-up) — only listed once real articles
    // exist (guides.ts starts empty by design, see that file's comment);
    // the index page's own robots directive already mirrors this same
    // guides.length > 0 check, so this stays consistent with what's
    // actually indexable.
    const guides = getAllGuides();
    if (guides.length > 0) {
      sitemapRoutes.push(route(`${siteUrl}/${locale}/rehberler`, "weekly", 0.6, "src/lib/data/guides.ts"));
      guides.forEach((guide) => {
        sitemapRoutes.push(
          route(`${siteUrl}/${locale}/rehberler/${guide.slug}`, "monthly", 0.5, "src/lib/data/guides.ts")
        );
      });
    }

    // 1b'. Mesafe hub sayfası (150 çift sayfasının crawl merkezi).
    sitemapRoutes.push(route(`${siteUrl}/${locale}/mesafe`, "monthly", 0.7, "src/lib/data/distanceCache.json"));

    // 1c. Madde 150 — programatik mesafe sayfaları (50 el ile seçilmiş şehir
    // çifti). Guides ile aynı desen: locales zaten sadece ["tr"] olduğu için
    // bu blok otomatik olarak TR-only kalıyor, ayrı bir kontrol gerekmiyor.
    // Havalimanı transfer sayfaları.
    const airportSlugs = getAirportPageSlugs();
    if (airportSlugs.length > 0) {
      sitemapRoutes.push(route(`${siteUrl}/${locale}/havalimani`, "monthly", 0.6, "src/lib/data/airportTransfers.json"));
      airportSlugs.forEach((slug) => {
        sitemapRoutes.push(route(`${siteUrl}/${locale}/havalimani/${slug}`, "monthly", 0.6, "src/lib/data/airportTransfers.json"));
      });
    }
    sitemapRoutes.push(route(`${siteUrl}/${locale}/plaka-kodlari`, "monthly", 0.6, "src/lib/data/provinces.ts"));
    sitemapRoutes.push(route(`${siteUrl}/${locale}/muzeler`, "weekly", 0.7, "src/lib/data/cities"));
    sitemapRoutes.push(route(`${siteUrl}/${locale}/plajlar`, "weekly", 0.7, ["src/lib/data/beaches.ts", "src/lib/data/cities"]));
    sitemapRoutes.push(route(`${siteUrl}/${locale}/yoresel-lezzetler`, "weekly", 0.7, "src/lib/data/cities"));
    // Şehirden illere mesafe tablosu sayfaları.
    getCityTableSlugs().forEach((slug) => {
      sitemapRoutes.push(route(`${siteUrl}/${locale}/mesafe/sehir/${slug}`, "monthly", 0.6, "src/lib/data/distanceCache.json"));
    });
    getDayTripSlugs().forEach((slug) => {
      sitemapRoutes.push(route(`${siteUrl}/${locale}/gunubirlik/${slug}`, "monthly", 0.6, ["src/lib/data/dayTrips.ts", "src/lib/data/distanceCache.json"]));
    });
    getAllPlacePairData().forEach((d) => {
      sitemapRoutes.push(route(`${siteUrl}/${locale}/mesafe/${d.slug}`, "monthly", 0.4, ["src/lib/data/placeDistances.json", "src/lib/data/placePairs.ts"]));
    });
    getAllDistancePageData().forEach((d) => {
      sitemapRoutes.push(
        route(`${siteUrl}/${locale}/mesafe/${d.slug}`, "monthly", 0.4, "src/lib/data/distanceCache.json")
      );
    });

    // 2. Region Routes — all backed by the shared regions data file.
    regions.forEach((region) => {
      sitemapRoutes.push(
        route(`${siteUrl}/${locale}/bolgeler/${region.slug}`, "weekly", 0.8, "src/lib/data/regions.ts")
      );
    });

    // 3. City Routes & Category Sub-Tabs
    // Note: the "?tab=" category variants were removed — CityContentSections
    // never reads a tab value from the URL, so those entries pointed to pages
    // that render byte-for-byte identical content to the bare city URL (fake
    // duplicate-content entries wasting crawl budget, report item 16).
    // City content is spread across many src/lib/data/cities/*.ts files with
    // no per-city file tracking, so this uses the directory's most recent
    // commit as a shared (coarser, but real — never fabricated) signal.
    allCities.forEach((city) => {
      sitemapRoutes.push(
        route(
          `${siteUrl}/${locale}/bolgeler/${city.regionSlug}/${city.slug}`,
          "daily",
          0.8,
          city.slug === "istanbul" ? ["src/lib/data/districtGuides"] : [],
          sitemapDates.cities[city.slug]
        )
      );
    });

    // 4. Tourist District Routes (Long-Tail Programmatic SEO)
    popularDistricts.forEach((district) => {
      sitemapRoutes.push(
        route(
          `${siteUrl}/${locale}/bolgeler/${district.regionSlug}/${district.citySlug}/${district.slug}`,
          "daily",
          0.7,
          ["src/lib/data/districts.ts", "src/lib/data/districtGuides"]
        )
      );
    });
  });

  // City pages that have real per-city translation data (see
  // getTranslatedCity/cityHasTranslation, Faz 9a) are indexable even though
  // their locale isn't in the base `locales` list above — this adds exactly
  // those, one cache read per candidate locale rather than per city. The
  // per-locale translation cache file's own last-commit date is used as the
  // freshness signal here — a genuinely accurate one, since that's the real
  // moment that locale's content was last (re)translated.
  const cityLookup = allCities.map((c) => ({ slug: c.slug, title: c.title }));
  for (const locale of CANDIDATE_TRANSLATED_LOCALES) {
    const translatedSlugs = await getTranslatedCitySlugs(locale, cityLookup);
    if (translatedSlugs.size === 0) continue;
    allCities.forEach((city) => {
      if (!translatedSlugs.has(city.slug)) return;
      sitemapRoutes.push(
        route(
          `${siteUrl}/${locale}/bolgeler/${city.regionSlug}/${city.slug}`,
          "daily",
          0.8,
          `src/locales/generated/${locale}.cache.json`
        )
      );
    });
  }

  return sitemapRoutes;
}
