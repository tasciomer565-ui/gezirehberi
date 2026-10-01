import { Scale } from "lucide-react";
import { getCostLevelText } from "@/lib/costLevel";
import { allCities } from "@/lib/data/cities";
import { getDictionary, Locale, translateDataText, buildAlternates, buildPageSocialMeta } from "@/lib/i18n";
import CityComparator, { CitySummary } from "@/components/CityComparator";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const title = locale === "tr" ? "İki Şehri Karşılaştır" : "Compare Two Cities";
  const description =
    locale === "tr"
      ? "Türkiye'deki iki şehri bütçe, gezilecek yer sayısı, en iyi ziyaret zamanı ve daha fazlasına göre yan yana karşılaştırın."
      : "Compare two cities in Turkey side by side by budget, number of attractions, best time to visit, and more.";

  return {
    title,
    description,
    alternates: buildAlternates(locale, "/karsilastir"),
    ...buildPageSocialMeta(locale, "/karsilastir", title, description),
  };
}

// Parti 5, madde 18 — iki şehir karşılaştırma aracı. Tüm alanlar (bütçe,
// süre, gezilecek yer sayısı vb.) her şehrin kendi curated City verisinden
// birebir alınır — yeni bir sayı/iddia üretilmez, sadece mevcut gerçek veri
// yan yana gösterilir.
export default async function ComparePage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const dict = getDictionary(locale);

  const cities: CitySummary[] = allCities.map((c) => ({
    slug: c.slug,
    regionSlug: c.regionSlug,
    name: translateDataText(c.name, locale),
    budget: getCostLevelText(c.costLevel, locale),
    bestDuration: translateDataText(c.bestDuration, locale),
    whenToGo: translateDataText(c.whenToGo, locale),
    howToGetThere: translateDataText(c.howToGetThere, locale),
    highlights: c.highlights.map((h) => translateDataText(h, locale)),
    attractionsCount: c.attractions.length,
    restaurantsCount: c.restaurants.length,
    accommodationsCount: c.accommodations.length,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-kiremit/10 text-kiremit">
          <Scale size={22} />
        </span>
        <h1 className="font-display text-4xl italic text-ink sm:text-5xl mb-3">
          {dict.city.compareTitle}
        </h1>
      </div>

      <CityComparator cities={cities} locale={locale} />
    </div>
  );
}
