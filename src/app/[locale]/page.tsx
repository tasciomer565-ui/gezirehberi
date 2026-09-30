import Link from "next/link";
import { Compass, Utensils, Wallet, MapPinned, Route as RouteIcon, BookOpen } from "lucide-react";
import { regions } from "@/lib/data/regions";
import { allCities } from "@/lib/data/cities";
import { getAllDistancePageData, getPopularDistances, formatDuration } from "@/lib/data/distances";
import { getAllGuides } from "@/lib/data/guides";
import RegionCard from "@/components/RegionCard";
import PlaceholderImage from "@/components/PlaceholderImage";
import { getDictionary, Locale, translateDataText, buildAlternates, SITE_URL } from "@/lib/i18n";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const dict = getDictionary(locale);

  // Search Console (2026-09-29): ana sayfa 3 ayda sıfır gösterim — title
  // bir slogandı ("Yola çıkmadan önce oku, yolda not düş."), hiçbir arama
  // kalıbı içermiyordu. TR'de marka + kategori + sitenin en güçlü içeriği
  // (mesafeler) ile absolute title; template'in marka eki tekrar eklenmesin.
  if (locale === "tr") {
    return {
      title: { absolute: "Yol Defteri: Türkiye Gezi Rehberi ve Şehirler Arası Mesafe" },
      description: `Türkiye'nin 81 iline gezi rehberi: gezilecek yerler, ne yenir, nerede kalınır. ${getAllDistancePageData().length} şehirler arası mesafe, süre ve yol üstü duraklar.`,
      alternates: buildAlternates(locale, ""),
    };
  }
  return {
    title: dict.home.title,
    description: dict.home.metaDescription,
    alternates: buildAlternates(locale, ""),
  };
}


// Önceden allCities.slice(0, 6) — veri dosyasının sırası yüzünden hep ilk
// 6 Karadeniz şehri (Amasra, Safranbolu, Amasya, Artvin, Bayburt, Bolu)
// çıkıyordu. Her bölgeden tanınmış bir destinasyon.
const FEATURED_CITY_SLUGS = ["istanbul", "kapadokya", "mardin", "fethiye", "safranbolu", "trabzon"];

export default async function Home(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const dict = getDictionary(locale);

  const featuredCities = FEATURED_CITY_SLUGS.map((slug) => allCities.find((c) => c.slug === slug)).filter(
    (c): c is (typeof allCities)[number] => Boolean(c)
  );
  const popularDistances = getPopularDistances();
  const latestGuides = getAllGuides().slice(0, 6);

  // Site-wide identity schema (report items 193-194). No SearchAction here — the
  // header's search bar is an autocomplete dropdown, not a URL-addressable results
  // page, so a fake SearchAction target would be incorrect structured data.
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": dict.nav.logo,
    "url": SITE_URL,
    "logo": `${SITE_URL}/icon`,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": dict.nav.logo,
    "url": SITE_URL,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 sm:pt-24">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-safran/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-kiremit">
          <Compass size={14} /> {dict.home.badge}
        </p>
        <h1 className="max-w-3xl font-display text-4xl italic leading-tight text-ink sm:text-6xl">
          {dict.home.title}
          {locale === "tr" && (
            <span className="mt-3 block font-sans text-lg not-italic font-bold text-kiremit sm:text-xl">
              Türkiye gezi rehberi: 81 il, 7 bölge, şehirler arası mesafeler
            </span>
          )}
        </h1>
        <p className="mt-6 max-w-xl text-base text-ink/70 sm:text-lg">
          {dict.home.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/bolgeler`}
            className="rounded-full bg-kiremit px-6 py-3 text-sm font-semibold text-paper transition-all hover:bg-ink hover:scale-105"
          >
            {dict.home.explore}
          </Link>
          <Link
            href={`/${locale}/bolgeler/karadeniz`}
            className="rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold text-ink transition-all hover:border-kiremit hover:text-kiremit hover:scale-105"
          >
            {dict.home.startBlacksea}
          </Link>
        </div>
      </section>

      <div className="route-dotted-line h-px w-full animate-pulse" />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl italic text-ink">{dict.nav.regions}</h2>
          <Link
            href={`/${locale}/bolgeler`}
            className="text-sm font-semibold text-kiremit hover:underline"
          >
            {locale === "tr" ? "Tümünü gör" : locale === "de" ? "Alle anzeigen" : locale === "ar" ? "عرض الكل" : "See all"}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((region, i) => (
            <RegionCard key={region.slug} region={region} locale={locale} eager={i === 0} />
          ))}
        </div>
      </section>

      {featuredCities.length > 0 && (
        <section className="bg-ink/[0.02] py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="mb-8 font-display text-3xl italic text-ink">
              {dict.home.featured}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCities.map((city, idx) => (
                <Link
                  key={city.slug}
                  href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}`}
                  className="group overflow-hidden rounded-2xl border border-ink/10 bg-paper transition-all duration-300 hover:border-kiremit hover:shadow-xl hover:-translate-y-1"
                >
                  <PlaceholderImage seed={city.slug} regionSlug={city.regionSlug} label={translateDataText(city.region, locale)} aspect="wide" index={idx} />
                  <div className="p-6">
                    <h3 className="font-display text-xl italic text-ink group-hover:text-kiremit transition-colors">
                      {translateDataText(city.name, locale)}
                    </h3>
                    <p className="mt-2 text-sm text-ink/70 line-clamp-2">{translateDataText(city.summary, locale)}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-ink/65 border-t border-ink/5 pt-4">
                      <span className="flex items-center gap-1">
                        <MapPinned size={13} /> {city.attractions.length} {dict.city.stopsCount}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-kiremit">
                        <Wallet size={13} /> {translateDataText(city.budget.split(" ")[0], locale)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Utensils size={13} /> {city.localFood.length} {dict.city.foodCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {popularDistances.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl italic text-ink">
              {locale === "tr" ? "Popüler Şehirler Arası Mesafeler" : "Popular Driving Distances"}
            </h2>
            <Link href={`/${locale}/mesafe`} className="shrink-0 text-sm font-semibold text-kiremit hover:underline">
              {locale === "tr" ? "Tüm mesafeler" : "All distances"}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularDistances.map((d) => (
              <Link
                key={d.slug}
                href={`/${locale}/mesafe/${d.slug}`}
                className="group flex items-center justify-between gap-3 rounded-lg border border-ink/8 bg-paper px-4 py-3 shadow-sm hover:border-kiremit/40 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-ink group-hover:text-kiremit transition-colors">
                  <RouteIcon size={14} className="shrink-0 text-kiremit" />
                  {translateDataText(d.cityA.name, locale)} - {translateDataText(d.cityB.name, locale)}
                </span>
                <span className="shrink-0 text-xs text-ink/60">
                  {Math.round(d.distanceKm)} km · {formatDuration(d.durationMin, locale)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {locale === "tr" && latestGuides.length > 0 && (
        <section className="bg-ink/[0.02] py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl italic text-ink">Gezi Rehberleri</h2>
              <Link href={`/${locale}/rehberler`} className="shrink-0 text-sm font-semibold text-kiremit hover:underline">
                Tümünü gör
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/${locale}/rehberler/${g.slug}`}
                  className="group flex items-start gap-3 rounded-xl border border-ink/8 bg-paper p-4 shadow-sm hover:border-kiremit/40 transition-colors"
                >
                  <BookOpen size={18} className="mt-0.5 shrink-0 text-kiremit" />
                  <span>
                    <span className="block text-sm font-bold text-ink group-hover:text-kiremit transition-colors">
                      {g.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink/65 line-clamp-2">{g.summary}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tüm şehir rehberlerine bölge bölge doğrudan link — şehir sayfaları
          (sıra ~27) ana sayfadan sadece 6 öne çıkan şehirle bağlanıyordu. */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 font-display text-3xl italic text-ink">
          {locale === "tr" ? "Tüm Şehir Rehberleri" : "All City Guides"}
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {regions.map((region) => (
            <div key={region.slug}>
              <Link
                href={`/${locale}/bolgeler/${region.slug}`}
                className="text-sm font-bold uppercase tracking-wider text-kiremit hover:underline"
              >
                {translateDataText(region.name, locale)}
              </Link>
              <ul className="mt-3 space-y-1.5">
                {allCities
                  .filter((c) => c.regionSlug === region.slug)
                  .map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/${locale}/bolgeler/${c.regionSlug}/${c.slug}`}
                        className="text-sm text-ink/75 hover:text-kiremit transition-colors"
                      >
                        {translateDataText(c.name, locale)}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
