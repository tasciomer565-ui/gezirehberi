import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import CityHero from "@/components/CityHero";
import WishlistButton from "@/components/WishlistButton";
import ItinerarySection from "@/components/ItinerarySection";
import CityContentSections from "@/components/CityContentSections";
import CommunityRoutes from "@/components/CommunityRoutes";
import Gallery from "@/components/Gallery";
import StickyPlanBar from "@/components/StickyPlanBar";
import AudioGuide from "@/components/AudioGuide";
import { getCity, getAllCitySlugs } from "@/lib/data/cities";
import { getRegionThemeStyle } from "@/lib/regionTheme";
import { getDictionary, Locale, translateDataText, buildAlternates } from "@/lib/i18n";
import { getCityImage } from "@/lib/cityImages";
import FAQSection from "@/components/FAQSection";
import { getNextMondayISO, getDynamicPrice } from "@/lib/pricingEngine";

export async function generateStaticParams() {
  const slugs = getAllCitySlugs();
  const locales = ["tr", "en", "de", "ar"];
  const paramsList = [];
  for (const locale of locales) {
    for (const s of slugs) {
      paramsList.push({ region: s.region, city: s.city, locale });
    }
  }
  return paramsList;
}

export async function generateMetadata(props: {
  params: Promise<{ region: string; city: string; locale: string }>;
}) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const city = getCity(params.region, params.city);
  if (!city) return { title: "Şehir bulunamadı" };
  const bgImage = getCityImage(city.slug, city.regionSlug);
  return {
    title: translateDataText(city.title, locale),
    description: translateDataText(city.summary, locale),
    alternates: buildAlternates(locale, `/bolgeler/${city.regionSlug}/${city.slug}`),
    openGraph: {
      title: `${translateDataText(city.title, locale)}`,
      description: translateDataText(city.summary, locale),
      images: [
        {
          url: bgImage,
          width: 960,
          height: 600,
          alt: translateDataText(city.name, locale),
        },
      ],
    },
  };
}

export default async function CityDetailPage(props: {
  params: Promise<{ city: string; region: string; locale: string }>;
}) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const dict = getDictionary(locale);
  const city = getCity(params.region, params.city);

  if (!city) {
    notFound();
  }

  const galleryImages = city.attractions.flatMap((a) => a.images).slice(0, 4);

  const bgImage = getCityImage(city.slug, city.regionSlug);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": locale === "tr" ? "Ana Sayfa" : "Home",
        "item": `https://yoldefterim.com.tr/${locale}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": translateDataText(city.region, locale),
        "item": `https://yoldefterim.com.tr/${locale}/bolgeler/${city.regionSlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": translateDataText(city.name, locale),
        "item": `https://yoldefterim.com.tr/${locale}/bolgeler/${city.regionSlug}/${city.slug}`
      }
    ]
  };

  const touristDestinationSchema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": translateDataText(city.name, locale),
    "description": translateDataText(city.summary, locale),
    "image": bgImage,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": city.location.lat,
      "longitude": city.location.lng
    }
  };

  const nextMonday = getNextMondayISO();

  // Generate Hotel Schemas with priceValidUntil
  const hotelSchemas = city.accommodations.slice(0, 3).map((hotel) => ({
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": translateDataText(hotel.name, locale),
    "description": translateDataText(hotel.description, locale),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": translateDataText(hotel.address, locale),
      "addressLocality": translateDataText(city.name, locale),
      "addressRegion": translateDataText(city.region, locale),
      "addressCountry": "TR"
    },
    "starRating": {
      "@type": "Rating",
      "ratingValue": hotel.rating || 4.5
    },
    "offers": {
      "@type": "Offer",
      "price": parseFloat(getDynamicPrice(hotel.pricePerNight, hotel.id).replace(/[^0-9]/g, "")) || 1200,
      "priceCurrency": "TRY",
      "priceValidUntil": nextMonday
    }
  }));

  // Generate Restaurant Schemas with priceValidUntil
  const restaurantSchemas = city.restaurants.slice(0, 3).map((rest) => {
    const cost = getDynamicPrice(rest.averageCost, rest.id);
    const priceLimit = cost.includes("-") ? cost.split("-")[1] : cost;
    const numericPrice = parseFloat(priceLimit.replace(/[^0-9]/g, "")) || 250;

    return {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "name": translateDataText(rest.name, locale),
      "description": translateDataText(rest.description || "", locale),
      "address": {
        "@type": "PostalAddress",
        "streetAddress": translateDataText(rest.address, locale),
        "addressLocality": translateDataText(city.name, locale),
        "addressRegion": translateDataText(city.region, locale),
        "addressCountry": "TR"
      },
      "servesCuisine": rest.diningType,
      "starRating": {
        "@type": "Rating",
        "ratingValue": rest.rating || 4.5
      },
      "offers": {
        "@type": "Offer",
        "price": numericPrice,
        "priceCurrency": "TRY",
        "priceValidUntil": nextMonday
      }
    };
  });

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
      {hotelSchemas.map((h, i) => (
        <script
          key={`hotel-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(h) }}
        />
      ))}
      {restaurantSchemas.map((r, i) => (
        <script
          key={`restaurant-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(r) }}
        />
      ))}
      <div className="relative">
        <CityHero city={city} locale={locale} />
        <div className="absolute right-4 top-20 sm:right-8 sm:top-24">
          <WishlistButton citySlug={city.slug} regionSlug={city.regionSlug} cityName={city.name} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 pb-24 sm:px-6 sm:pb-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-ink/40">
            <Link href={`/${locale}`} className="hover:text-kiremit transition-colors">
              {locale === "tr" ? "Ana Sayfa" : "Home"}
            </Link>
            <span>/</span>
            <Link href={`/${locale}/bolgeler`} className="hover:text-kiremit transition-colors">
              {locale === "tr" ? "Bölgeler" : "Regions"}
            </Link>
            <span>/</span>
            <Link href={`/${locale}/bolgeler/${city.regionSlug}`} className="hover:text-kiremit transition-colors">
              {translateDataText(city.region, locale)}
            </Link>
            <span>/</span>
            <span className="text-ink/80 truncate max-w-[150px]">
              {translateDataText(city.name, locale)}
            </span>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/bolgeler/${city.regionSlug}`}
              className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:border-kiremit hover:text-kiremit transition-colors"
            >
              <ArrowLeft size={16} /> {dict.city.back}
            </Link>
            <WishlistButton
              citySlug={city.slug}
              regionSlug={city.regionSlug}
              cityName={city.name}
              variant="inline"
            />
          </div>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-3xl italic text-ink">{dict.city.about}</h2>
              <AudioGuide
                title={`${translateDataText(city.name, locale)} — ${dict.city.audioGuide}`}
                text={translateDataText(city.longDescription, locale)}
              />
            </div>
            <p className="text-base text-ink/70 leading-relaxed mb-6">{translateDataText(city.longDescription, locale)}</p>

            <Gallery images={galleryImages} fallbackSeed={city.slug} />

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: dict.city.bestTime, value: translateDataText(city.whenToGo, locale) },
                { label: dict.city.transit, value: translateDataText(city.howToGetThere, locale) },
                { label: dict.city.budget, value: translateDataText(city.budget, locale) },
                { label: dict.city.idealDuration, value: translateDataText(city.bestDuration, locale) },
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
          </div>

          <div className="rounded-xl border border-ink/10 bg-gradient-to-br from-safran/10 to-kiremit/5 p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-kiremit mb-2">
                  {dict.city.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-ink/80">
                  <MapPin size={16} className="text-kiremit" />
                  {translateDataText(city.region, locale)}
                </div>
              </div>
              <div className="border-t border-ink/10 pt-4">
                <div className="text-xs font-bold uppercase tracking-wider text-kiremit mb-3">
                  {dict.city.quickStats}
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-ink/70">🏨 {city.accommodations.length} {dict.city.accommodationsCount}</p>
                  <p className="text-ink/70">🍽️ {city.restaurants.length} {dict.city.restaurantsCount}</p>
                  <p className="text-ink/70">📍 {city.attractions.length} {dict.city.attractionsCount}</p>
                  <p className="text-ink/70">🍴 {city.localFood.length} {dict.city.foodCount}</p>
                </div>
              </div>
              {city.highlights.length > 0 && (
                <div className="border-t border-ink/10 pt-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-kiremit mb-3">
                    {dict.city.highlights}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {city.highlights.map((h) => (
                      <span key={h} className="rounded-full bg-paper px-2.5 py-1 text-xs text-ink/70 border border-ink/10 shadow-sm font-semibold">
                        {translateDataText(h, locale)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div id="itinerary-section" className="mb-20 scroll-mt-20">
          <ItinerarySection city={city} locale={locale} />
        </div>

        <CommunityRoutes city={city} locale={locale} />

        <div className="my-16 border-t border-ink/10" />

        <CityContentSections
          citySlug={city.slug}
          cityCenter={[city.location.lat, city.location.lng]}
          attractions={city.attractions}
          restaurants={city.restaurants}
          localFood={city.localFood}
          accommodations={city.accommodations}
          locale={locale}
        />

        {/* Dynamic local foods summary for SSS / FAQ page */}
        <FAQSection
          name={translateDataText(city.name, locale)}
          whenToGo={translateDataText(city.whenToGo, locale)}
          howToGetThere={translateDataText(city.howToGetThere, locale)}
          budget={translateDataText(city.budget, locale)}
          whatToEat={city.localFood.length > 0 
            ? `${city.localFood.slice(0, 3).map(f => translateDataText(f.name, locale)).join(", ")} ${locale === "tr" ? "gibi yöresel lezzetleri mutlaka denemelisiniz." : "are among the famous local foods you must try."}`
            : (locale === "tr" ? "Bölgeye özgü yöresel lezzetleri ve tescilli tatları yerel lokantalarda denemelisiniz." : "You should try region-specific local dishes at local restaurants.")
          }
          locale={locale}
        />
      </div>

      <StickyPlanBar cityName={translateDataText(city.name, locale)} />
    </div>
  );
}
