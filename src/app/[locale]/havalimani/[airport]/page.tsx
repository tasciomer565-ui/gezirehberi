import Link from "next/link";
import { notFound } from "next/navigation";
import { Plane } from "lucide-react";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta, translateDataText } from "@/lib/i18n";
import { airportFrom, airportSlug, getAirportBySlug } from "@/lib/data/airports";
import { getAirportPageSlugs, getAirportTransfers } from "@/lib/data/airportTransfers";
import { formatDuration } from "@/lib/data/distances";
import Breadcrumbs from "@/components/Breadcrumbs";

// "Antalya havalimanı Kemer kaç km" tipi transfer sorguları için (2026-10-02).
// Mesafeler OSRM karayolu verisi (scripts/generate-airport-transfers.ts),
// havalimanı koordinatları OurAirports açık verisi.
export async function generateStaticParams() {
  return getAirportPageSlugs().map((airport) => ({ airport }));
}

function shortDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h > 0 ? `${h} sa` : null, m > 0 ? `${m} dk` : null].filter(Boolean).join(" ");
}

function load(slug: string) {
  const airport = getAirportBySlug(slug);
  if (!airport) return undefined;
  const transfers = getAirportTransfers(airport.iata);
  if (transfers.length < 2) return undefined;
  return { airport, transfers };
}

export async function generateMetadata(props: { params: Promise<{ airport: string; locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const data = load(params.airport);
  if (!data) return { title: locale === "tr" ? "Sayfa bulunamadı" : "Page not found" };
  const { airport, transfers } = data;
  const base = airport.name.replace(/\s*\(.*?\)/g, "");
  const names = transfers.map((t) => t.name);
  let title = `${base} Ulaşım: Hangi Yere Kaç Km?`;
  for (let n = 3; n >= 1; n--) {
    const t = `${base} Ulaşım: ${names.slice(0, n).join(", ")} Kaç Km?`;
    if (t.length <= 60) { title = t; break; }
  }
  const description =
    locale === "tr"
      ? `${airportFrom(airport)} ${names.slice(0, 4).join(", ")} ve çevreye karayolu mesafesi ve transfer süresi: ${transfers.length} varış noktası, gerçek yol verisi.`
      : `Road distance and transfer time from ${base} (${airport.iata}) to ${transfers.length} nearby destinations.`;
  const path = `/havalimani/${airportSlug(airport)}`;
  return {
    title: locale === "tr" ? { absolute: title } : `${base} (${airport.iata}) transfers`,
    description: description.length > 158 ? description.slice(0, description.lastIndexOf(",", 150)) + "." : description,
    robots: buildRobots(locale),
    alternates: buildAlternates(locale, path),
    ...buildPageSocialMeta(locale, path, title, description),
  };
}

export default async function AirportPage(props: { params: Promise<{ airport: string; locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const isTr = locale === "tr";
  const data = load(params.airport);
  if (!data) notFound();
  const { airport, transfers } = data;
  const base = airport.name.replace(/\s*\(.*?\)/g, "");
  const from = airportFrom(airport);

  const faqItems = isTr
    ? transfers.slice(0, 6).map((t) => ({
        q: `${from} ${t.name}${t.kind === "city" ? " merkezine" : ""} kaç km?`,
        a: `${from} ${t.name}${t.kind === "city" ? " şehir merkezine" : ""} karayoluyla ${t.distanceKm.toLocaleString("tr-TR")} km; trafiksiz yaklaşık ${formatDuration(t.durationMin, locale)} sürer. Yoğun saatlerde ve yaz sezonunda süre uzayabilir.`,
      }))
    : [];
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Airport",
      name: base,
      iataCode: airport.iata,
      geo: { "@type": "GeoCoordinates", latitude: airport.lat, longitude: airport.lng },
    },
    ...(faqItems.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Breadcrumbs
        withSchema
        items={[
          { label: isTr ? "Ana Sayfa" : "Home", href: `/${locale}` },
          { label: isTr ? "Havalimanları" : "Airports", href: `/${locale}/havalimani` },
          { label: base },
        ]}
      />
      <h1 className="mb-4 flex items-start gap-3 font-display text-3xl italic text-ink sm:text-4xl">
        <Plane className="mt-1.5 shrink-0 text-kiremit" size={28} />
        {isTr ? `${base} Ulaşım: Şehir Merkezi ve Çevreye Mesafeler` : `${base} (${airport.iata}) Transfers`}
      </h1>
      <p className="mb-8 max-w-3xl text-base leading-relaxed text-ink/75">
        {isTr
          ? `${from} (${airport.iata}) çevredeki ${transfers.length} şehir merkezi ve tatil beldesine karayolu mesafesi ve trafiksiz sürüş süresi, yakından uzağa sıralı. Transfer, taksi ya da araç kiralama planlarken kullanabilirsin.`
          : `Road distance and drive time from ${base} (${airport.iata}) to ${transfers.length} nearby destinations.`}
      </p>

      <div className="overflow-x-auto rounded-xl border border-ink/10 bg-paper shadow-sm">
        <table className="w-full min-w-[340px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs font-bold uppercase tracking-wider text-ink/65">
              <th className="px-4 py-3">{isTr ? "Varış Noktası" : "Destination"}</th>
              <th className="px-4 py-3 text-right">{isTr ? "Mesafe" : "Distance"}</th>
              <th className="px-4 py-3 text-right">{isTr ? "Süre" : "Time"}</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={`${t.kind}-${t.slug}`} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-2.5">
                  {t.href ? (
                    <Link href={`/${locale}${t.href}`} className="font-semibold text-ink/85 hover:text-kiremit">
                      {translateDataText(t.name, locale)}
                    </Link>
                  ) : (
                    <span className="font-semibold text-ink/85">{t.name}</span>
                  )}
                  {t.kind === "city" && <span className="ml-1.5 text-xs text-ink/50">{isTr ? "merkez" : "centre"}</span>}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-ink/80">{Math.round(t.distanceKm)} km</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-ink/65">{isTr ? shortDuration(t.durationMin) : formatDuration(t.durationMin, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink/55">
        {isTr
          ? "Süreler trafiksiz ortalamadır. Transfer ve otobüs (HAVAŞ vb.) seferleri ile ücretleri için havalimanının ve firmaların güncel duyurularını kontrol edin."
          : "Times assume no traffic. Check current shuttle schedules and fares with the airport and operators."}
      </p>

      {faqItems.length > 0 && (
        <section className="mt-12 border-t border-ink/10 pt-10">
          <h2 className="mb-6 font-display text-2xl italic text-ink">Sık Sorulan Sorular</h2>
          <div className="space-y-5">
            {faqItems.map((item) => (
              <div key={item.q}>
                <h3 className="text-base font-bold text-ink">{item.q}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/75">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
