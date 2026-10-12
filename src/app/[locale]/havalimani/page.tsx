import Link from "next/link";
import { Plane } from "lucide-react";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta } from "@/lib/i18n";
import { airportSlug } from "@/lib/data/airports";
import { getAirportsWithTransfers, getAirportTransfers } from "@/lib/data/airportTransfers";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const count = getAirportsWithTransfers().length;
  const title = locale === "tr" ? "Havalimanından Şehir Merkezine Kaç Km?" : "Airport Transfers in Turkey";
  const description =
    locale === "tr"
      ? `Türkiye'deki ${count} havalimanından şehir merkezlerine ve tatil beldelerine karayolu mesafesi ve transfer süresi, gerçek yol verisiyle.`
      : `Road distance and transfer time from ${count} Turkish airports to city centres and resorts.`;
  return {
    title,
    description,
    robots: buildRobots(locale),
    alternates: buildAlternates(locale, "/havalimani"),
    ...buildPageSocialMeta(locale, "/havalimani", title, description),
  };
}

export default async function AirportsHubPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const isTr = locale === "tr";
  const list = getAirportsWithTransfers()
    .map((a) => ({ a, nearest: getAirportTransfers(a.iata)[0] }))
    .sort((x, y) => x.a.name.localeCompare(y.a.name, "tr"));

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <Breadcrumbs
        withSchema
        items={[
          { label: isTr ? "Ana Sayfa" : "Home", href: `/${locale}` },
          { label: isTr ? "Havalimanları" : "Airports" },
        ]}
      />
      <h1 className="mb-4 font-display text-3xl italic text-ink sm:text-4xl">
        {isTr ? "Havalimanından Şehir Merkezine ve Tatil Yerlerine Mesafeler" : "Airport Transfer Distances in Turkey"}
      </h1>
      <p className="mb-10 max-w-3xl text-base leading-relaxed text-ink/75">
        {isTr
          ? `Türkiye'deki ${list.length} havalimanı için çevredeki şehir merkezlerine ve tatil beldelerine karayolu mesafesi ve trafiksiz transfer süresi. Bir havalimanı seçerek tüm varış noktalarını görebilirsin.`
          : `Road distances and transfer times from ${list.length} airports in Turkey.`}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(({ a, nearest }) => (
          <Link
            key={a.iata}
            href={`/${locale}/havalimani/${airportSlug(a)}`}
            className="group flex items-start gap-3 rounded-xl border border-ink/8 bg-paper p-4 shadow-sm transition-colors hover:border-kiremit/40"
          >
            <Plane size={18} className="mt-0.5 shrink-0 text-kiremit" />
            <span>
              <span className="block text-sm font-bold text-ink group-hover:text-kiremit">
                {a.name} <span className="font-semibold text-ink/50">({a.iata})</span>
              </span>
              {nearest && (
                <span className="mt-0.5 block text-xs text-ink/65">
                  {isTr ? `${nearest.name}: ${Math.round(nearest.distanceKm)} km` : `${nearest.name}: ${Math.round(nearest.distanceKm)} km`}
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
