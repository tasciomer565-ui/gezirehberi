import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, BedDouble, UtensilsCrossed, MapPinned, Soup } from "lucide-react";
import CityHero from "@/components/CityHero";
import WishlistButton from "@/components/WishlistButton";
import CityContentSections from "@/components/CityContentSections";
import StickyPlanBar from "@/components/StickyPlanBar";
import AudioGuide from "@/components/AudioGuide";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQSection from "@/components/FAQSection";
import CommunityRoutes from "@/components/CommunityRoutes";
import ContentAccuracyFeedback from "@/components/ContentAccuracyFeedback";
import ConfusedPlacesWarning from "@/components/ConfusedPlacesWarning";
import { getConfusablePlaces } from "@/lib/data/confusablePlaces";
import AdSlot from "@/components/AdSlot";

import { getCity } from "@/lib/data/cities";
import { getDistrict, getAllDistrictSlugs, getDistrictDistance } from "@/lib/data/districts";
import { formatDuration } from "@/lib/data/distances";
import { getPlacesForCity } from "@/lib/places";
import { getDictionary, Locale, translateDataText, buildAlternates, SITE_URL } from "@/lib/i18n";
import { getCityImage } from "@/lib/cityImages";

export async function generateStaticParams() {
  const slugs = getAllDistrictSlugs();
  const locales = ["tr", "en", "de", "ar", "ru"];
  const paramsList = [];

  for (const slugInfo of slugs) {
    for (const locale of locales) {
      paramsList.push({
        locale,
        region: slugInfo.region,
        city: slugInfo.city,
        district: slugInfo.district
      });
    }
  }

  return paramsList;
}

export async function generateMetadata(props: {
  params: Promise<{ region: string; city: string; district: string; locale: string }>;
}) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const district = getDistrict(params.city, params.district);
  if (!district) return { title: "İlçe bulunamadı" };

  const bgImage = getCityImage(district.slug, district.regionSlug);

  const pageUrl = `${SITE_URL}/${locale}/bolgeler/${district.regionSlug}/${district.citySlug}/${district.slug}`;

  return {
    title: district.title,
    description: district.summary,
    alternates: buildAlternates(locale, `/bolgeler/${district.regionSlug}/${district.citySlug}/${district.slug}`),
    openGraph: {
      url: pageUrl,
      title: district.title,
      description: district.summary,
      images: [
        {
          url: bgImage,
          width: 960,
          height: 600,
          alt: district.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: district.title,
      description: district.summary,
    },
  };
}

export default async function DistrictDetailPage(props: {
  params: Promise<{ region: string; city: string; district: string; locale: string }>;
}) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const dict = getDictionary(locale);
  const city = getCity(params.region, params.city);
  const district = getDistrict(params.city, params.district);
  const districtDistance = getDistrictDistance(params.city, params.district);
  // Adalara karayoluyla gidilemiyor; rota feribot geçişi içeriyor.
  const isIsland = ["bozcaada", "gokceada"].includes(params.district);

  if (!city || !district) {
    notFound();
  }

  const bgImage = getCityImage(district.slug, district.regionSlug);

  // Server-rendered first page of the default (attractions/popularity) list, scoped to
  // this district, so the initial HTML already contains real results.
  const initialPlaces = getPlacesForCity(city.slug, { type: "attractions", limit: 24, districtSlug: district.slug });

  // Bulgu (madde 305): bu blokta önceden her ilçe için hardcoded "500" sahte
  // istatistik gösteriliyordu — District tipinde konaklama/restoran/lezzet
  // verisi hiç yok, sayı tamamen uydurmaydı. Madde 296'daki sahte otel/restoran
  // şeması düzeltmesiyle aynı mantık: gerçek veri yoksa gösterme. Burada
  // gerçek veri, ebeveyn şehrin curated listelerinden isim/açıklama eşleşmesiyle
  // bu ilçeye filtrelenen kayıtlar (CityContentSections'ın da kullandığı
  // getPlacesForCity ile aynı kaynak) — sayı 0 ise o satır hiç gösterilmiyor.
  const districtRestaurants = getPlacesForCity(city.slug, { type: "restaurants", limit: 1, districtSlug: district.slug });
  const districtAccommodations = getPlacesForCity(city.slug, { type: "accommodations", limit: 1, districtSlug: district.slug });
  const districtLocalFood = getPlacesForCity(city.slug, { type: "localFood", limit: 1, districtSlug: district.slug });
  const districtStats = [
    { icon: "attractions" as const, count: initialPlaces?.totalCount ?? 0, label: dict.city.attractionsCount },
    { icon: "restaurants" as const, count: districtRestaurants?.totalCount ?? 0, label: dict.city.restaurantsCount },
    { icon: "accommodations" as const, count: districtAccommodations?.totalCount ?? 0, label: dict.city.accommodationsCount },
    { icon: "localFood" as const, count: districtLocalFood?.totalCount ?? 0, label: dict.city.foodCount },
  ].filter((s) => s.count > 0);

  // Schema definitions
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": locale === "tr" ? "Ana Sayfa" : "Home",
        "item": `${SITE_URL}/${locale}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": translateDataText(city.region, locale),
        "item": `${SITE_URL}/${locale}/bolgeler/${city.regionSlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": translateDataText(city.name, locale),
        "item": `${SITE_URL}/${locale}/bolgeler/${city.regionSlug}/${city.slug}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": district.name,
        "item": `${SITE_URL}/${locale}/bolgeler/${city.regionSlug}/${city.slug}/${district.slug}`
      }
    ]
  };

  const touristDestinationSchema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": district.name,
    "description": district.summary,
    "image": bgImage,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": district.location.lat,
      "longitude": district.location.lng
    }
  };

  // Mock district-specific stats and info
  const districtObj = {
    slug: district.slug,
    name: district.name,
    heroTagline: district.heroTagline,
    region: city.region,
    regionSlug: city.regionSlug
  };

  const whenToGoText = locale === "tr" ? "İlkbahar sonu ve Yaz ayları idealdir." : "Late Spring and Summer months are ideal.";
  const transitText = locale === "tr" ? `${city.name} merkezinden düzenli dolmuş, otobüs veya özel araç ile kolayca ulaşılır.` : `Easily reachable from ${city.name} center via shuttle bus, taxi, or private car.`;
  const budgetText = locale === "tr" ? "Mevsime ve yoğunluğa göre değişken bütçelidir." : "Variable budgets depending on peak tourist season.";
  const durationText = locale === "tr" ? "2 - 3 gün" : "2 - 3 days";

  return (
    <div data-region={city.regionSlug}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(touristDestinationSchema) }}
      />

      <div className="relative">
        <CityHero city={districtObj} locale={locale} />
        <div className="absolute right-4 top-20 sm:right-8 sm:top-24">
          <WishlistButton citySlug={district.slug} regionSlug={city.regionSlug} cityName={district.name} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 pb-24 sm:px-6 sm:pb-12">
        <Breadcrumbs
          items={[
            { label: locale === "tr" ? "Ana Sayfa" : "Home", href: `/${locale}` },
            { label: dict.nav.regions, href: `/${locale}/bolgeler` },
            { label: translateDataText(city.region, locale), href: `/${locale}/bolgeler/${city.regionSlug}` },
            { label: translateDataText(city.name, locale), href: `/${locale}/bolgeler/${city.regionSlug}/${city.slug}` },
            { label: translateDataText(district.name, locale) },
          ]}
        />
        <div className="mb-8 flex items-center justify-between">
          <Link
            href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:border-kiremit hover:text-kiremit transition-colors"
          >
            <ArrowLeft size={16} /> {translateDataText(city.name, locale)}
          </Link>
          <WishlistButton
            citySlug={district.slug}
            regionSlug={city.regionSlug}
            cityName={district.name}
            variant="inline"
          />
        </div>

        <ConfusedPlacesWarning places={getConfusablePlaces(district.slug)} locale={locale} />

        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-3xl italic text-ink">{dict.city.about}</h2>
              <AudioGuide
                title={`${district.name} — ${dict.city.audioGuide}`}
                text={district.longDescription}
              />
            </div>
            <p className="text-base text-ink/70 leading-relaxed mb-6">{district.longDescription}</p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: dict.city.bestTime, value: whenToGoText },
                { label: dict.city.transit, value: transitText },
                { label: dict.city.budget, value: budgetText },
                { label: dict.city.idealDuration, value: durationText },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-ink/10 bg-paper p-4 hover:border-kiremit/50 transition-colors shadow-sm"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-kiremit mb-1">
                    {item.label}
                  </div>
                  <p className="text-sm text-ink/80">{item.value}</p>
                </div>
              ))}
            </div>

            {/* İlçe düzeyinde mesafe aramaları ("izmir çeşme arası kaç km",
                "trabzon uzungöl") için — gerçek güzergah verisi, kayıt yoksa
                (ilçe ile şehir aynı yer) hiç gösterilmez. */}
            {districtDistance && (
              <div className="mt-6 rounded-lg border border-ink/10 bg-paper p-4 shadow-sm">
                <h3 className="text-base font-bold text-ink">
                  {locale === "tr"
                    ? `${city.name} ${district.name} arası kaç km?`
                    : `${translateDataText(city.name, locale)} to ${translateDataText(district.name, locale)}`}
                </h3>
                <p className="mt-1 text-sm text-ink/80 leading-relaxed">
                  {locale === "tr"
                    ? `${city.name} merkezden ${district.name} ${isIsland ? "karayolu ve feribotla" : "karayoluyla"} yaklaşık ${districtDistance.distanceKm} km; yolculuk ${isIsland ? "feribot geçişi dahil " : "arabayla "}yaklaşık ${formatDuration(districtDistance.durationMin, locale)} sürüyor.`
                    : `About ${districtDistance.distanceKm} km by road from the city centre, roughly ${formatDuration(districtDistance.durationMin, locale)} by car.`}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-ink/10 bg-gradient-to-br from-safran/10 to-kiremit/5 p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-kiremit mb-2">
                  {dict.city.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-ink/80">
                  <MapPin size={16} className="text-kiremit" />
                  {translateDataText(city.region, locale)} / {translateDataText(city.name, locale)}
                </div>
              </div>
              {districtStats.length > 0 && (
                <div className="border-t border-ink/10 pt-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-kiremit mb-3">
                    {locale === "tr" ? "İlçe İstatistikleri" : "District Stats"}
                  </div>
                  <div className="space-y-2 text-sm">
                    {districtStats.map((s) => {
                      const Icon = s.icon === "accommodations" ? BedDouble
                        : s.icon === "restaurants" ? UtensilsCrossed
                        : s.icon === "attractions" ? MapPinned
                        : Soup;
                      return (
                        <p key={s.icon} className="flex items-center gap-2 text-ink/70">
                          <Icon size={15} className="text-kiremit shrink-0" /> {s.count} {s.label}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic content rendering specifically for the district */}
        <CityContentSections
          citySlug={city.slug}
          cityCenter={[district.location.lat, district.location.lng]}
          attractions={[]}
          restaurants={[]}
          localFood={[]}
          accommodations={[]}
          locale={locale}
          districtSlug={district.slug}
          initialItems={initialPlaces?.items}
          initialTotalCount={initialPlaces?.totalCount}
          initialHasMore={initialPlaces?.hasMore}
        />

        {/* İlçenin kendi curated attraction listesi yok — CommunityRoutes'un
            "mekan seç" adımı için ebeveyn şehrin attractions listesi
            kullanılıyor, ama rota kendi ilçe slug'ı altında saklanıyor
            (report follow-up, Bulgu 3). */}
        <CommunityRoutes
          identitySlug={district.slug}
          regionSlug={district.regionSlug}
          attractions={city.attractions}
          locale={locale}
        />

        <div className="mt-8 mb-16">
          <ContentAccuracyFeedback citySlug={district.slug} locale={locale} />
        </div>

        <AdSlot />

        {/* Dynamic FAQ block with JSON-LD schema */}
        <FAQSection
          name={district.name}
          whenToGo={whenToGoText}
          howToGetThere={transitText}
          budget={budgetText}
          whatToEat={locale === "tr"
            ? `${district.name} sahilinde taze yerel balıklar, deniz mahsulleri mezeleri, Ege zeytinyağlıları ve meşhur tatlıların tadına bakmalısınız.`
            : `You should try fresh local fish, seafood appetizers, Aegean olive oil dishes, and famous local desserts around ${district.name}.`
          }
          locale={locale}
        />
      </div>

      <StickyPlanBar cityName={district.name} />
    </div>
  );
}
