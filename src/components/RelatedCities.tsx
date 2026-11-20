import Link from "@/components/PlainLink";
import { City } from "@/lib/types";
import { Locale, translateDataText } from "@/lib/i18n";
import { haversineDistanceKm } from "@/lib/geo";
import { withAblative } from "@/lib/turkish";
import PlaceholderImage from "./PlaceholderImage";

// Report item 84 — internal linking: "yakın şehirler" and "aynı bölgeden
// diğer şehirler" blocks. Real data only — geographic distance (haversine,
// same helper used for itinerary transfers) and shared regionSlug, no
// generated/fabricated recommendations.
export default function RelatedCities({
  currentCity,
  allCities,
  locale,
}: {
  currentCity: City;
  allCities: City[];
  locale: Locale;
}) {
  const others = allCities.filter((c) => c.slug !== currentCity.slug);

  const nearby = others
    .map((c) => ({ city: c, distanceKm: haversineDistanceKm(currentCity.location, c.location) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 4);

  const sameRegion = others
    .filter((c) => c.regionSlug === currentCity.regionSlug && !nearby.some((n) => n.city.slug === c.slug))
    .slice(0, 4);

  if (nearby.length === 0 && sameRegion.length === 0) return null;

  const CityLink = ({ city, subtitle }: { city: City; subtitle: string }) => (
    <Link
      href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-ink/8 bg-paper p-3 shadow-sm hover:border-kiremit/40 transition-colors"
    >
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
        <PlaceholderImage
          seed={city.slug}
          regionSlug={city.regionSlug}
          aspect="square"
          sizes="48px"
          className="h-12 w-12"
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-ink group-hover:text-kiremit transition-colors">
          {translateDataText(city.name, locale)}
        </span>
        <span className="block truncate text-xs text-ink/65">{subtitle}</span>
      </span>
    </Link>
  );

  return (
    <div className="mt-16 border-t border-ink/10 pt-16 no-print">
      {nearby.length > 0 && (
        <div className="mb-10">
          <h3 className="font-display text-2xl italic text-ink mb-5">
            {locale === "tr" ? "Yakın Şehirler" : "Nearby Cities"}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.map(({ city, distanceKm }) => (
              <CityLink
                key={city.slug}
                city={city}
                subtitle={`~${Math.round(distanceKm)} km`}
              />
            ))}
          </div>
        </div>
      )}
      {sameRegion.length > 0 && (
        <div>
          <h3 className="font-display text-2xl italic text-ink mb-5">
            {locale === "tr"
              ? `${withAblative(translateDataText(currentCity.region, locale))} Diğer Şehirler`
              : `More Cities in ${translateDataText(currentCity.region, locale)}`}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sameRegion.map((city) => (
              <CityLink
                key={city.slug}
                city={city}
                subtitle={translateDataText(currentCity.region, locale)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
