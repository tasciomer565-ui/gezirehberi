import Link from "next/link";
import { notFound } from "next/navigation";
import { Route as RouteIcon } from "lucide-react";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta, translateDataText } from "@/lib/i18n";
import { allCities } from "@/lib/data/cities";
import { getDistanceLinksForCity, getCityTableSlugs, CITY_TABLE_MIN_ROWS, formatDuration } from "@/lib/data/distances";
import { ablative, dative } from "@/lib/trSuffix";
import Breadcrumbs from "@/components/Breadcrumbs";

// "Ankara il mesafeleri", "İstanbul'dan illere uzaklık" gibi sorgular için
// bir şehirden diğer tüm şehirlere tek tablo (2026-10-01). Satırlar mevcut
// mesafe çiftlerinden (distanceCache, gerçek rota verisi) geliyor; tabloda
// olmayan çift uydurulmuyor. 12 merkez şehirde tüm şehirler, diğerlerinde
// merkezler + komşu şehirler var.
function getCityTable(slug: string) {
  const city = allCities.find((c) => c.slug === slug);
  if (!city) return undefined;
  const rows = getDistanceLinksForCity(slug);
  if (rows.length < CITY_TABLE_MIN_ROWS) return undefined;
  return { city, rows };
}

export async function generateStaticParams() {
  return getCityTableSlugs().map((city) => ({ city }));
}

function formatDurationShort(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h > 0 ? `${h} sa` : null, m > 0 ? `${m} dk` : null].filter(Boolean).join(" ");
}

export async function generateMetadata(props: { params: Promise<{ city: string; locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const data = getCityTable(params.city);
  if (!data) return { title: locale === "tr" ? "Sayfa bulunamadı" : "Page not found" };
  const { city, rows } = data;
  const from = ablative(city.name);
  const nearest = rows[0];
  const candidates = [
    `${from} İllere Mesafe Tablosu: Km ve Saat`,
    `${from} İllere Mesafe Tablosu`,
  ];
  const title =
    locale === "tr"
      ? candidates.find((t) => t.length + " | Yol Defteri".length <= 60) ?? candidates[candidates.length - 1]
      : `Distances from ${translateDataText(city.name, locale)} to Other Cities`;
  const description =
    locale === "tr"
      ? `${from} ${rows.length} şehre karayolu mesafesi ve sürüş süresi tek tabloda. En yakın: ${nearest.otherCityName} ${Math.round(nearest.distanceKm)} km. Gerçek rota verisi.`
      : `Road distance and driving time from ${translateDataText(city.name, locale)} to ${rows.length} cities in Turkey.`;
  const path = `/mesafe/sehir/${city.slug}`;
  return {
    title,
    description,
    robots: buildRobots(locale),
    alternates: buildAlternates(locale, path),
    ...buildPageSocialMeta(locale, path, title, description),
  };
}

export default async function CityDistanceTablePage(props: { params: Promise<{ city: string; locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const isTr = locale === "tr";
  const data = getCityTable(params.city);
  if (!data) notFound();
  const { city, rows } = data;
  const name = translateDataText(city.name, locale);
  const from = ablative(city.name);
  const nearest = rows[0];
  const farthest = rows[rows.length - 1];
  const withinThreeHours = rows.filter((r) => r.durationMin <= 180);

  const faqItems = isTr
    ? [
        {
          q: `${dative(city.name)} en yakın şehir hangisi?`,
          a: `Bu tablodaki şehirler arasında ${dative(city.name)} en yakın şehir ${nearest.otherCityName}: karayoluyla ${Math.round(nearest.distanceKm)} km, yaklaşık ${formatDuration(nearest.durationMin, locale)}.`,
        },
        {
          q: `${from} en uzak şehir hangisi?`,
          a: `Tablodaki en uzak şehir ${farthest.otherCityName}: ${Math.round(farthest.distanceKm)} km, yaklaşık ${formatDuration(farthest.durationMin, locale)} sürüş.`,
        },
        {
          q: `${from} 3 saatte hangi şehirlere gidilir?`,
          a:
            withinThreeHours.length > 0
              ? `Karayoluyla 3 saatten kısa sürenler: ${withinThreeHours.map((r) => `${r.otherCityName} (${Math.round(r.distanceKm)} km)`).join(", ")}.`
              : `Tablodaki şehirlerin hiçbiri ${from} 3 saatten kısa sürmüyor; en yakını ${nearest.otherCityName} (${formatDuration(nearest.durationMin, locale)}).`,
        },
        {
          q: "Mesafeler nasıl hesaplanıyor?",
          a: "Şehir merkezleri arasındaki gerçek karayolu güzergahından (OpenStreetMap yol verisi) hesaplanır, kuş uçuşu değildir. Süreler trafiksiz ortalama sürüş süresidir; mola ve yoğunluk süreyi uzatır.",
        },
      ]
    : [];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      {faqItems.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <Breadcrumbs
        withSchema
        items={[
          { label: isTr ? "Ana Sayfa" : "Home", href: `/${locale}` },
          { label: isTr ? "Mesafeler" : "Distances", href: `/${locale}/mesafe` },
          { label: isTr ? `${from} Mesafeler` : name },
        ]}
      />
      <h1 className="mb-4 font-display text-3xl italic text-ink sm:text-4xl">
        {isTr ? `${from} İllere Mesafe Tablosu` : `Distances from ${name}`}
      </h1>
      <p className="mb-8 max-w-3xl text-base leading-relaxed text-ink/75">
        {isTr
          ? `${from} ${rows.length} şehre karayolu mesafesi ve ortalama sürüş süresi, yakından uzağa sıralı. Satıra tıklayarak güzergahı, yol üstü durakları ve yakıt hesabını görebilirsin.`
          : `Road distance and average driving time from ${name} to ${rows.length} cities, nearest first.`}
      </p>

      <div className="mb-10 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs">{isTr ? "Şehir" : "Cities"}</div>
          <div className="mt-1 text-lg font-bold text-ink sm:text-2xl">{rows.length}</div>
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs">{isTr ? "En Yakın" : "Nearest"}</div>
          <div className="mt-1 text-sm font-bold text-ink sm:text-base">
            {translateDataText(nearest.otherCityName, locale)} · {Math.round(nearest.distanceKm)} km
          </div>
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs">{isTr ? "En Uzak" : "Farthest"}</div>
          <div className="mt-1 text-sm font-bold text-ink sm:text-base">
            {translateDataText(farthest.otherCityName, locale)} · {Math.round(farthest.distanceKm)} km
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink/10 bg-paper shadow-sm">
        <table className="w-full min-w-[340px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs font-bold uppercase tracking-wider text-ink/65">
              <th className="px-4 py-3">{isTr ? "Şehir" : "City"}</th>
              <th className="px-4 py-3 text-right">{isTr ? "Mesafe" : "Distance"}</th>
              <th className="px-4 py-3 text-right">{isTr ? "Süre" : "Time"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.03]">
                <td className="px-4 py-2.5">
                  <Link href={`/${locale}/mesafe/${r.slug}`} className="flex items-center gap-1.5 font-semibold text-ink/85 hover:text-kiremit">
                    <RouteIcon size={13} className="shrink-0 text-kiremit" />
                    {isTr ? `${city.name} – ${r.otherCityName}` : `${name} – ${translateDataText(r.otherCityName, locale)}`}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-ink/80">{Math.round(r.distanceKm)} km</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-ink/65">{isTr ? formatDurationShort(r.durationMin) : formatDuration(r.durationMin, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-ink/65">
        <Link href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}`} className="font-bold text-kiremit hover:underline">
          {isTr ? `${city.name} gezi rehberi: gezilecek yerler, ne yenir, nerede kalınır →` : `${name} travel guide →`}
        </Link>
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
