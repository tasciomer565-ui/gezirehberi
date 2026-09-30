import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPinned, UtensilsCrossed, Soup, Route as RouteIcon } from "lucide-react";
import { getRegion, regions } from "@/lib/data/regions";
import { getCitiesByRegion } from "@/lib/data/cities";
import { RegionSlug } from "@/lib/types";
import PlaceholderImage from "@/components/PlaceholderImage";
import { getDictionary, Locale, translateDataText, buildAlternates, SITE_URL } from "@/lib/i18n";
import { REGION_IMAGES } from "@/lib/cityImages";
import Breadcrumbs from "@/components/Breadcrumbs";
import KnownForSection from "@/components/KnownForSection";
import { getRegionCulture } from "@/lib/data/regionCulture";
import AdSlot from "@/components/AdSlot";
import { getRegionTopAttractions, getRegionDistances } from "@/lib/data/regionHighlights";
import { formatDuration } from "@/lib/data/distances";

export async function generateMetadata(props: { params: Promise<{ region: string; locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const region = getRegion(params.region as RegionSlug);
  if (!region) return { title: "Bölge bulunamadı" };
  
  // "Bölgesi"/"Region" inserted before the guide suffix (report follow-up: region
  // page titles were too short/generic without it, e.g. just "Ege Gezi Rehberi").
  const guideSuffix = locale === "tr"
    ? "Bölgesi Gezi Rehberi"
    : locale === "de"
    ? "Region Reiseführer"
    : locale === "ar"
    ? "دليل سفر منطقة"
    : "Region Travel Guide";

  const regionImg = REGION_IMAGES[region.slug] || REGION_IMAGES.marmara;
  let title = locale === "ar"
    ? `${guideSuffix} ${translateDataText(region.name, locale)}`
    : `${translateDataText(region.name, locale)} ${guideSuffix}`;
  let description = translateDataText(region.description, locale);
  // TR: baskın arama kalıbı "X bölgesi gezilecek yerler" — şehir sayfalarıyla
  // aynı yaklaşım (2026-09-29). Açıklama bölgenin gerçek must-see yerlerini
  // sayıyor; marka eki dahil 60 / açıklama 155 karakter sınırı.
  if (locale === "tr") {
    const MAX_TITLE = 60 - " | Yol Defteri".length;
    const titleCandidates = [
      `${region.name} Bölgesi Gezilecek Yerler ve Şehirler`,
      `${region.name} Bölgesi Gezilecek Yerler`,
    ];
    title = titleCandidates.find((t) => t.length <= MAX_TITLE) ?? titleCandidates[titleCandidates.length - 1];
    const names = getRegionTopAttractions(region.slug, 4).map((a) => a.attraction.name);
    const cityCount = getCitiesByRegion(region.slug).length;
    const tail = ` ${cityCount} şehir rehberi ve şehirler arası mesafeler.`;
    description =
      [4, 3, 2, 1]
        .map((n) => `${region.name} Bölgesi gezilecek yerler: ${names.slice(0, n).join(", ")} ve daha fazlası.${tail}`)
        .find((d) => d.length <= 155) ?? description;
  }
  const pageUrl = `${SITE_URL}/${locale}/bolgeler/${region.slug}`;
  return {
    title,
    description,
    alternates: buildAlternates(locale, `/bolgeler/${region.slug}`),
    openGraph: {
      url: pageUrl,
      title,
      description,
      images: [
        {
          url: regionImg,
          width: 960,
          height: 450,
          alt: translateDataText(region.name, locale),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export async function generateStaticParams() {
  const paramsList = [];
  const locales = ["tr", "en", "de", "ar", "ru"];
  for (const locale of locales) {
    for (const r of regions) {
      paramsList.push({ region: r.slug, locale });
    }
  }
  return paramsList;
}

export default async function RegionPage(props: {
  params: Promise<{ region: string; locale: string }>;
}) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const dict = getDictionary(locale);
  const region = getRegion(params.region as RegionSlug);
  const cities = getCitiesByRegion(params.region as RegionSlug);

  if (!region) {
    notFound();
  }

  const noCitiesText = locale === "tr"
    ? "Bu bölge için içerik yakında yayına alınacaktır. Lütfen yakında tekrar ziyaret edin."
    : locale === "de"
    ? "Inhalte für diese Region werden in Kürze veröffentlicht. Bitte besuchen Sie uns bald wieder."
    : locale === "ar"
    ? "سيتم نشر محتوى هذه المنطقة قريباً. يرجى زيارتنا مرة أخرى قريباً."
    : "Content for this region will be published soon. Please check back later.";

  const cityGuidesTitle = locale === "tr"
    ? "Şehir Rehberleri"
    : locale === "de"
    ? "Stadtführer"
    : locale === "ar"
    ? "أدلة المدن"
    : "City Guides";

  const bgImage = REGION_IMAGES[region.slug] || REGION_IMAGES.marmara;

  const topAttractions = getRegionTopAttractions(region.slug, 12);
  const regionDistances = getRegionDistances(region.slug, 12);
  const regionName = translateDataText(region.name, locale);
  // SSS yalnızca TR — cevaplar Türkçe veri alanlarından (yer/şehir adları)
  // kuruluyor, diğer dillerde yarı çevrilmiş cümleler üretirdi.
  const faqItems =
    locale === "tr" && cities.length > 0
      ? [
          {
            q: `${region.name} Bölgesi'nde gezilecek en güzel yerler nelerdir?`,
            a: `${region.name} Bölgesi'nin öne çıkan yerleri arasında ${topAttractions
              .slice(0, 6)
              .map((t) => `${t.attraction.name} (${t.city.name})`)
              .join(", ")} bulunuyor.`,
          },
          {
            q: `${region.name} Bölgesi'nde hangi şehirleri gezebilirim?`,
            a: `Yol Defteri'nde ${region.name} Bölgesi için ${cities.length} şehir ve destinasyon rehberi var: ${cities
              .map((c) => c.name)
              .join(", ")}.`,
          },
          ...(regionDistances.length > 0
            ? [
                {
                  q: `${region.name} Bölgesi'nde şehirler arası mesafeler ne kadar?`,
                  a: `Örnek güzergahlar: ${regionDistances
                    .slice(0, 4)
                    .map((d) => `${d.cityA.name} - ${d.cityB.name} ${Math.round(d.distanceKm)} km (${formatDuration(d.durationMin, locale)})`)
                    .join("; ")}.`,
                },
              ]
            : []),
        ]
      : [];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a },
    })),
  };

  return (
    <div data-region={region.slug}>
      {faqItems.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <div className="relative h-64 text-paper sm:h-80 overflow-hidden">
        {/* Background Image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={bgImage}
            alt={translateDataText(region.name, locale)}
            fill
            preload
            sizes="100vw"
            className="object-cover filter brightness-[0.7] contrast-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20 opacity-90" />
        </div>

        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-10">
          <Link
            href={`/${locale}/bolgeler`}
            className="mb-4 flex w-fit items-center gap-2 rounded-full bg-paper/20 px-3 py-1.5 text-xs font-semibold text-paper hover:bg-paper/30 transition-colors sm:px-4 sm:py-2"
          >
            <ArrowLeft size={15} /> {dict.city.back}
          </Link>
          <h1 className="font-display text-4xl italic sm:text-5xl drop-shadow-md">
            {locale === "tr" ? `${region.name} Bölgesi` : regionName}
            {locale === "tr" && (
              <span className="mt-1 block font-sans text-base not-italic font-bold tracking-wide text-paper/85 sm:text-lg">
                Gezilecek Yerler ve Şehir Rehberleri
              </span>
            )}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-paper/90 sm:text-base drop-shadow-sm">
            {translateDataText(region.tagline, locale)}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Breadcrumbs
        withSchema
          items={[
            { label: locale === "tr" ? "Ana Sayfa" : "Home", href: `/${locale}` },
            { label: dict.nav.regions, href: `/${locale}/bolgeler` },
            { label: translateDataText(region.name, locale) },
          ]}
        />
        <p className="mb-8 max-w-3xl text-base text-ink/70 leading-relaxed border-l-2 border-kiremit pl-4">
          {translateDataText(region.description, locale)}
        </p>

        {/* PİLOT (madde 155-163) — sadece 3 bölge için içerik var, onay
            bekleniyor; şimdilik yalnızca tr locale'de render ediliyor. */}
        {locale === "tr" && getRegionCulture(region.slug) && (
          <KnownForSection
            title={locale === "tr" ? "Bölge Kültürü ve Tarihi" : "Regional Culture & History"}
            text={getRegionCulture(region.slug)!}
          />
        )}

        {cities.length > 0 ? (
          <div>
            <h2 className="mb-6 font-display text-3xl italic text-ink">
              {cityGuidesTitle}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cities.map((city, idx) => (
                <Link
                  key={city.slug}
                  href={`/${locale}/bolgeler/${region.slug}/${city.slug}`}
                  className="group overflow-hidden rounded-xl border border-ink/10 bg-paper transition-all duration-300 hover:border-kiremit hover:shadow-xl hover:-translate-y-1"
                >
                  <PlaceholderImage seed={city.slug} regionSlug={city.regionSlug} label={translateDataText(city.name, locale)} aspect="wide" index={idx} />
                  <div className="p-5">
                    <h3 className="font-display text-xl italic text-ink group-hover:text-kiremit transition-colors">
                      {translateDataText(city.name, locale)}
                    </h3>
                    <p className="mt-2 text-sm text-ink/70 line-clamp-2">{translateDataText(city.summary, locale)}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-ink/65 border-t border-ink/5 pt-4">
                      <span className="flex items-center gap-1">
                        <MapPinned size={12} /> {city.attractions.length} {dict.city.stopsCount}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-kiremit">
                        <UtensilsCrossed size={12} /> {city.restaurants.length} {dict.city.restaurantsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Soup size={12} /> {city.localFood.length} {dict.city.foodCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-safran/20 bg-safran/5 p-6 text-center text-ink/70">
            {noCitiesText}
          </p>
        )}

        {topAttractions.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-3xl italic text-ink">
              {locale === "tr"
                ? `${region.name} Bölgesi'nde Gezilecek En Güzel Yerler`
                : locale === "de"
                ? `Sehenswürdigkeiten: ${regionName}`
                : `Top Places to Visit: ${regionName}`}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topAttractions.map(({ attraction, city }) => (
                <Link
                  key={`${city.slug}-${attraction.id}`}
                  href={`/${locale}/bolgeler/${region.slug}/${city.slug}`}
                  className="group rounded-xl border border-ink/8 bg-paper p-4 shadow-sm hover:border-kiremit/40 transition-colors"
                >
                  <h3 className="text-sm font-bold text-ink group-hover:text-kiremit transition-colors">
                    {translateDataText(attraction.name, locale)}
                  </h3>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-kiremit/80">
                    <MapPinned size={12} /> {translateDataText(city.name, locale)}
                  </span>
                  <p className="mt-1.5 text-xs text-ink/70 line-clamp-2">
                    {translateDataText(attraction.description, locale)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <AdSlot />

        {regionDistances.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-3xl italic text-ink">
              {locale === "tr"
                ? `${region.name} Bölgesi Şehirler Arası Mesafeler`
                : `Driving Distances in ${regionName}`}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {regionDistances.map((d) => (
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
          </div>
        )}

        {faqItems.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-3xl italic text-ink">Sık Sorulan Sorular</h2>
            <div className="space-y-5">
              {faqItems.map((item) => (
                <div key={item.q}>
                  <h3 className="text-base font-bold text-ink">{item.q}</h3>
                  <p className="mt-1 text-sm text-ink/75 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Madde 84 — RelatedCities şehir sayfasına özgü (yakınlık +
            aynı-bölge mantığı bir bölge sayfasına uymuyor); bölge
            seviyesindeki karşılığı diğer 6 bölgeye link vermek. */}
        <div className="mt-16 border-t border-ink/10 pt-16 no-print">
          <h3 className="font-display text-2xl italic text-ink mb-5">
            {locale === "tr" ? "Diğer Bölgeler" : "Other Regions"}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {regions
              .filter((r) => r.slug !== region.slug)
              .map((r) => (
                <Link
                  key={r.slug}
                  href={`/${locale}/bolgeler/${r.slug}`}
                  className="group rounded-xl border border-ink/8 bg-paper p-3 text-center shadow-sm hover:border-kiremit/40 transition-colors"
                >
                  <span className="block text-sm font-bold text-ink group-hover:text-kiremit transition-colors">
                    {translateDataText(r.name, locale)}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
