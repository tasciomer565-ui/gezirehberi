import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import CityHero from "@/components/CityHero";
import WishlistButton from "@/components/WishlistButton";
import CityContentSections from "@/components/CityContentSections";
import StickyPlanBar from "@/components/StickyPlanBar";
import AudioGuide from "@/components/AudioGuide";
import FAQSection from "@/components/FAQSection";

import { getCity } from "@/lib/data/cities";
import { getDistrict, getAllDistrictSlugs } from "@/lib/data/districts";
import { getDictionary, Locale, translateDataText, buildAlternates } from "@/lib/i18n";
import { getCityImage } from "@/lib/cityImages";
import { getNextMondayISO } from "@/lib/pricingEngine";

export async function generateStaticParams() {
  const slugs = getAllDistrictSlugs();
  const locales = ["tr", "en", "de", "ar"];
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

  return {
    title: district.title,
    description: district.summary,
    alternates: buildAlternates(locale, `/bolgeler/${district.regionSlug}/${district.citySlug}/${district.slug}`),
    openGraph: {
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

  if (!city || !district) {
    notFound();
  }

  const bgImage = getCityImage(district.slug, district.regionSlug);

  // Schema definitions
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
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": district.name,
        "item": `https://yoldefterim.com.tr/${locale}/bolgeler/${city.regionSlug}/${city.slug}/${district.slug}`
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

  const nextMonday = getNextMondayISO();

  // Generate Hotel Schemas with priceValidUntil for district
  const hotelSchemas = [
    { name: `Lüks ${district.name} Butik Oteli`, rating: 4.8, price: 2500 },
    { name: `Tarihi ${district.name} Konak Otel`, rating: 4.7, price: 1800 }
  ].map((hotel) => ({
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": hotel.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": `${district.name} Oteller Bölgesi No: 15`,
      "addressLocality": district.name,
      "addressRegion": translateDataText(city.region, locale),
      "addressCountry": "TR"
    },
    "starRating": {
      "@type": "Rating",
      "ratingValue": hotel.rating
    },
    "offers": {
      "@type": "Offer",
      "price": hotel.price,
      "priceCurrency": "TRY",
      "priceValidUntil": nextMonday
    }
  }));

  // Generate Restaurant Schemas with priceValidUntil for district
  const restaurantSchemas = [
    { name: `Meşhur ${district.name} Balıkçısı`, rating: 4.9, price: 650 },
    { name: `${district.name} Lezzet Evi`, rating: 4.6, price: 350 }
  ].map((rest) => ({
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": rest.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": `${district.name} Liman Sokağı No: 4`,
      "addressLocality": district.name,
      "addressRegion": translateDataText(city.region, locale),
      "addressCountry": "TR"
    },
    "servesCuisine": "Turkish / Local",
    "starRating": {
      "@type": "Rating",
      "ratingValue": rest.rating
    },
    "offers": {
      "@type": "Offer",
      "price": rest.price,
      "priceCurrency": "TRY",
      "priceValidUntil": nextMonday
    }
  }));

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
        <CityHero city={districtObj} locale={locale} />
        <div className="absolute right-4 top-20 sm:right-8 sm:top-24">
          <WishlistButton citySlug={district.slug} regionSlug={city.regionSlug} cityName={district.name} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 pb-24 sm:px-6 sm:pb-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-ink/40">
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
            <Link href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}`} className="hover:text-kiremit transition-colors">
              {translateDataText(city.name, locale)}
            </Link>
            <span>/</span>
            <span className="text-ink/80 truncate max-w-[150px]">
              {district.name}
            </span>
          </nav>
          <div className="flex items-center gap-3">
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
        </div>

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
              <div className="border-t border-ink/10 pt-4">
                <div className="text-xs font-bold uppercase tracking-wider text-kiremit mb-3">
                  {locale === "tr" ? "İlçe İstatistikleri" : "District Stats"}
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-ink/70">🏨 500 {dict.city.accommodationsCount}</p>
                  <p className="text-ink/70">🍽️ 500 {dict.city.restaurantsCount}</p>
                  <p className="text-ink/70">📍 500 {dict.city.attractionsCount}</p>
                  <p className="text-ink/70">🍴 500 {dict.city.foodCount}</p>
                </div>
              </div>
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
        />

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
