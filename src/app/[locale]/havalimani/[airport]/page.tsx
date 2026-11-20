import Link from "@/components/PlainLink";
import { notFound } from "next/navigation";
import { Plane, Route as RouteIcon, Clock } from "lucide-react";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta, translateDataText } from "@/lib/i18n";
import { airportFrom, airportSlug, getAirportBySlug } from "@/lib/data/airports";
import { getAirportPageSlugs, getAirportTransfers } from "@/lib/data/airportTransfers";
import { formatDuration } from "@/lib/data/distances";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";
import CarRentalOffer from "@/components/CarRentalOffer";
import { FlightOffer } from "@/components/TripOffers";
import { jsonLd } from "@/lib/jsonLd";

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
  const nearest = transfers[0];
  const names = transfers.map((t) => t.name);
  const candidates = [
    `${base} Ulaşım: ${names.slice(0, 2).join(", ")} Kaç Km, Kaç Dk?`,
    `${base} Ulaşım: Merkeze Kaç Km, Kaç Dakika?`,
    `${base} (${airport.iata}) Ulaşım ve Mesafeler`,
    `${base} Ulaşım: Hangi Yere Kaç Km?`,
  ];
  const title =
    locale === "tr"
      ? candidates.find((t) => t.length <= 60) ?? candidates[candidates.length - 1]
      : `${base} (${airport.iata}) transfers`;
  const descriptionParts =
    locale === "tr"
      ? [
          `${airportFrom(airport)} (${airport.iata}) ${nearest.name} merkezine ${Math.round(nearest.distanceKm)} km (${shortDuration(nearest.durationMin)}).`,
          ` ${ names.slice(0, 4).join(", ")} transfer süresi, taksi, servis ve araçla ulaşım tablosu.`,
        ]
      : [
          `Road distance and transfer time from ${base} (${airport.iata}) to ${transfers.length} nearby destinations.`,
        ];
  const description = descriptionParts.reduce((acc, part) => (acc.length + part.length <= 160 ? acc + part : acc), "");
  const path = `/havalimani/${airportSlug(airport)}`;
  return {
    title: locale === "tr" ? { absolute: title } : title,
    description,
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
  const nearest = transfers[0];
  const farthest = transfers[transfers.length - 1];
  const within60 = transfers.filter((t) => t.durationMin <= 60).length;
  const within100 = transfers.filter((t) => t.distanceKm <= 100).length;

  const nearestCity = transfers.find((t) => t.kind === "city");
  const faqItems = isTr
    ? [
        ...(nearestCity
          ? [
              {
                q: `${from} şehir merkezine nasıl gidilir, kaç km?`,
                a: `${from} ${nearestCity.name} şehir merkezine karayoluyla ${nearestCity.distanceKm.toLocaleString("tr-TR")} km (${Math.round(nearestCity.distanceKm)} kilometre); taksi, özel transfer veya kiralık araçla trafiksiz yaklaşık ${formatDuration(nearestCity.durationMin, locale)} sürer. Havalimanı yolcu servisleri (HAVAŞ veya belediye otobüsleri) için güncel saatleri kontrol etmeniz önerilir.`,
              },
            ]
          : []),
        ...transfers.slice(0, 10).map((t) => ({
          q: `${from} ${t.name}${t.kind === "city" ? " merkezine" : ""} kaç km, kaç dakika?`,
          a: `${from} ${t.name}${t.kind === "city" ? " şehir merkezine" : ""} karayoluyla ${t.distanceKm.toLocaleString("tr-TR")} km; trafiksiz yaklaşık ${formatDuration(t.durationMin, locale)} sürer. Yoğun saatlerde ve yaz sezonunda süre uzayabilir.`,
        })),
      ]
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
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
        {isTr ? `${base} (${airport.iata}) Ulaşım: Şehir Merkezi ve Çevreye Kaç Km?` : `${base} (${airport.iata}) Transfers`}
      </h1>
      <p className="mb-8 max-w-3xl text-base leading-relaxed text-ink/75">
        {isTr
          ? `${from} (${airport.iata}) çevredeki ${transfers.length} şehir merkezi ve tatil beldesine karayolu mesafesi (km) ve trafiksiz sürüş süresi, yakından uzağa sıralı. Transfer, servis, taksi ya da araç kiralama planlarken kullanabilirsin.`
          : `Road distance and drive time from ${base} (${airport.iata}) to ${transfers.length} nearby destinations.`}
      </p>

      <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs">
            <RouteIcon size={12} /> {isTr ? "En Yakın Merkez" : "Nearest"}
          </div>
          <div className="mt-1 text-sm font-bold text-ink sm:text-base">
            {nearest.name} · {Math.round(nearest.distanceKm)} km
          </div>
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs">
            <Clock size={12} /> {isTr ? "Transfer Süresi" : "Drive Time"}
          </div>
          <div className="mt-1 text-sm font-bold text-ink sm:text-base">
            ~{shortDuration(nearest.durationMin)}
          </div>
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs">
            {isTr ? "Varış Noktası" : "Destinations"}
          </div>
          <div className="mt-1 text-sm font-bold text-ink sm:text-base">
            {transfers.length} {isTr ? "nokta" : "stops"}
          </div>
        </div>
      </div>

      {isTr && (
        <section className="mb-8 max-w-3xl space-y-3 text-sm leading-relaxed text-ink/75">
          <h2 className="font-display text-2xl italic text-ink">{base} nerede, şehir merkezine kaç km ve kaç dakika?</h2>
          <p>
            {`${base} (${airport.iata}), listedeki en yakın varış noktası olan ${nearest.name} ${nearest.kind === "city" ? "merkezine" : "bölgesine"} karayoluyla yaklaşık ${Math.round(nearest.distanceKm)} km (${Math.round(nearest.distanceKm)} kilometre), trafiksiz ${shortDuration(nearest.durationMin)} uzaklıkta. `}
            {within60 > 0 && `${within60} varış noktasına 1 saatten kısa sürede, `}
            {`${within100} varış noktasına ise 100 km içinde ulaşabilirsin. En uzak listelenen nokta ${farthest.name}: yaklaşık ${Math.round(farthest.distanceKm)} km, ${shortDuration(farthest.durationMin)}.`}
          </p>
          <p>
            {`Süreler karayolu ve trafiksiz ortalamadır; havalimanı çıkışı, bagaj teslimi ve yaz sezonu yoğunluğu gerçek varış süresini uzatır. Bu yüzden son varış noktası için sürüş süresine yarım saat eklemek makul bir plandır. Şehir merkezlerinin gezilecek yerleri ve konaklama bölgeleri için tablodaki bağlantılardan şehir rehberlerine geçebilirsin.`}
          </p>
        </section>
      )}

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
              <tr key={`${t.kind}-${t.slug}`} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.03]">
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

      {isTr && <CarRentalOffer iata={airport.iata} airportName={base} />}
      {isTr && <FlightOffer airportName={base} iata={airport.iata} />}

      <AdSlot />

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
