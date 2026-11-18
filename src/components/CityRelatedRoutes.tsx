import Link from "@/components/PlainLink";
import { Route as RouteIcon, ArrowRight, BookOpen, Plane, Compass } from "lucide-react";
import type { City } from "@/lib/types";
import { getNextCityRoutes, getRouteGuidesForCity } from "@/lib/data/nextRoutes";
import { getDayTripSlugs } from "@/lib/data/dayTrips";
import { getCityAirports, airportSlug } from "@/lib/data/airports";
import { getAirportPageSlugs } from "@/lib/data/airportTransfers";
import { formatDuration, getDistanceLinksForCity, CITY_TABLE_MIN_ROWS } from "@/lib/data/distances";
import { ablative, dative } from "@/lib/trSuffix";

// "İlgili Rota ve Mesafeler" + "Sıradaki Rota Önerisi" (2026-11-02): şehir
// sayfasından, kullanıcıyı sitede tutacak en alakalı sonraki adımlar —
// en yakın aynı bölge durakları (gerçek km/süre), rota rehberleri, günübirlik
// gezi sayfası, illere mesafe tablosu ve havalimanı transferi. Yalnızca TR;
// olmayan veri gösterilmez.
export default function CityRelatedRoutes({ city, locale }: { city: City; locale: string }) {
  const next = getNextCityRoutes(city.slug, 3);
  const routeGuides = getRouteGuidesForCity(city.slug, 3);
  const hasDayTrips = getDayTripSlugs().includes(city.slug);
  const distanceRows = getDistanceLinksForCity(city.slug);
  const hasDistanceTable = distanceRows.length >= CITY_TABLE_MIN_ROWS;
  const airport = getCityAirports(city.slug)[0];
  const airportPages = new Set(getAirportPageSlugs());
  const airportHref = airport && airportPages.has(airportSlug(airport.airport)) ? `/${locale}/havalimani/${airportSlug(airport.airport)}` : undefined;
  if (next.length === 0 && routeGuides.length === 0 && !hasDayTrips && !hasDistanceTable && !airportHref) return null;

  const [primary, ...others] = next;
  return (
    <section className="mt-16 border-t border-ink/10 pt-16 no-print">
      <h2 className="mb-6 font-display text-3xl italic text-ink">{city.name} İçin İlgili Rota ve Mesafeler</h2>

      {primary && (
        <div className="mb-6 rounded-2xl border border-kiremit/25 bg-kiremit/5 p-5 sm:p-6">
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-kiremit">
            <Compass size={14} /> Sıradaki Rota Önerisi
          </div>
          <h3 className="text-xl font-bold text-ink">
            {city.name} <ArrowRight size={16} className="mx-1 inline text-kiremit" /> {primary.name}
          </h3>
          <p className="mt-1 text-sm font-semibold text-kiremit">
            {primary.km} km · {formatDuration(primary.min, "tr")}
          </p>
          {primary.top.length > 0 && (
            <p className="mt-2 text-sm leading-relaxed text-ink/75">{`${primary.name} durağında görülecekler: ${primary.top.join(", ")}.`}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
            <Link href={`/${locale}/bolgeler/${primary.regionSlug}/${primary.slug}`} className="rounded-full bg-kiremit px-4 py-2 text-paper hover:opacity-90">
              {primary.name} rehberi
            </Link>
            <Link href={`/${locale}/mesafe/${primary.pairSlug}`} className="rounded-full border border-ink/20 px-4 py-2 text-ink hover:border-kiremit hover:text-kiremit">
              Yol tarifi ve mesafe
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((o) => (
          <Link key={o.pairSlug} href={`/${locale}/mesafe/${o.pairSlug}`} className="flex items-start gap-2 rounded-xl border border-ink/10 bg-paper p-4 text-sm shadow-sm hover:border-kiremit/40">
            <RouteIcon size={15} className="mt-0.5 shrink-0 text-kiremit" />
            <span>
              <span className="block font-bold text-ink">{`${city.name} ${o.name} arası kaç km`}</span>
              <span className="text-ink/65">{o.km} km · {formatDuration(o.min, "tr")}</span>
            </span>
          </Link>
        ))}
        {routeGuides.map((g) => (
          <Link key={g.slug} href={`/${locale}/rehberler/${g.slug}`} className="flex items-start gap-2 rounded-xl border border-ink/10 bg-paper p-4 text-sm shadow-sm hover:border-kiremit/40">
            <BookOpen size={15} className="mt-0.5 shrink-0 text-kiremit" />
            <span>
              <span className="block text-xs font-bold uppercase tracking-wider text-kiremit">İlgili rehber</span>
              <span className="font-bold text-ink">{g.title}</span>
            </span>
          </Link>
        ))}
        {hasDayTrips && (
          <Link href={`/${locale}/gunubirlik/${city.slug}`} className="flex items-start gap-2 rounded-xl border border-ink/10 bg-paper p-4 text-sm shadow-sm hover:border-kiremit/40">
            <Compass size={15} className="mt-0.5 shrink-0 text-kiremit" />
            <span>
              <span className="block text-xs font-bold uppercase tracking-wider text-kiremit">Günübirlik</span>
              <span className="font-bold text-ink">{dative(city.name)} yakın yerler ve günübirlik rotalar</span>
            </span>
          </Link>
        )}
        {hasDistanceTable && (
          <Link href={`/${locale}/mesafe/sehir/${city.slug}`} className="flex items-start gap-2 rounded-xl border border-ink/10 bg-paper p-4 text-sm shadow-sm hover:border-kiremit/40">
            <RouteIcon size={15} className="mt-0.5 shrink-0 text-kiremit" />
            <span>
              <span className="block text-xs font-bold uppercase tracking-wider text-kiremit">Mesafe Tablosu</span>
              <span className="font-bold text-ink">{ablative(city.name)} {distanceRows.length} şehre km ve saat tablosu</span>
            </span>
          </Link>
        )}
        {airportHref && airport && (
          <Link href={airportHref} className="flex items-start gap-2 rounded-xl border border-ink/10 bg-paper p-4 text-sm shadow-sm hover:border-kiremit/40">
            <Plane size={15} className="mt-0.5 shrink-0 text-kiremit" />
            <span>
              <span className="block text-xs font-bold uppercase tracking-wider text-kiremit">Havalimanı</span>
              <span className="font-bold text-ink">{airport.airport.name} ulaşım ve mesafeler</span>
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
