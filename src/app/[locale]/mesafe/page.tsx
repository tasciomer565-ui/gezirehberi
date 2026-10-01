import Link from "next/link";
import { Route as RouteIcon, TrendingUp } from "lucide-react";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta, translateDataText } from "@/lib/i18n";
import { getAllDistancePageData, getPopularDistances, formatDuration } from "@/lib/data/distances";
import { regions } from "@/lib/data/regions";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ablative } from "@/lib/trSuffix";

// Denetim bulgusu (2026-09): 150 mesafe sayfasının (madde 150) crawl edilebilir
// bir merkezi yoktu (/mesafe 404) — sadece şehir sayfalarındaki bloklar ve
// sitemap üzerinden keşfediliyordu. Bu hub, hepsine tek sayfadan iç link verir
// ve "şehirler arası mesafe" genel sorgusuna hedef sayfa olur. Tüm km/süre
// değerleri distanceCache.json'daki gerçek rota verisinden (OSRM) okunur.
//
// Güncelleme (2026-09-29): title marka ekiyle 65 karakterdi (kesiliyordu);
// sayfa 85 alfabetik H2 altında ~300 satırlık düz listeydi. Artık bölge (H2) →
// şehir (H3) hiyerarşisi, bölgeye atlama menüsü, popüler rotalar, gerçek
// veriden özet istatistikler ve SSS var.
export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const total = getAllDistancePageData().length;
  const title =
    locale === "tr" ? "Şehirler Arası Mesafe Tablosu: Km ve Süre" : `Distances Between Turkish Cities: ${total} Routes`;
  const description =
    locale === "tr"
      ? `Türkiye'de ${total} popüler şehir çifti arasındaki karayolu mesafesi ve sürüş süresi — gerçek rota verisiyle, bölge bölge tek tabloda.`
      : `Real driving distance and average drive time for ${total} popular city pairs in Turkey.`;
  return {
    title,
    description,
    robots: buildRobots(locale),
    alternates: buildAlternates(locale, "/mesafe"),
    ...buildPageSocialMeta(locale, "/mesafe", title, description),
  };
}

// Tablo satırında kısa biçim ("4 sa 41 dk"); cümle içinde formatDuration.
function formatDurationShort(min: number, locale: Locale): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (locale === "tr") return [h > 0 ? `${h} sa` : null, m > 0 ? `${m} dk` : null].filter(Boolean).join(" ");
  return [h > 0 ? `${h}h` : null, m > 0 ? `${m}min` : null].filter(Boolean).join(" ");
}

// Merkez şehirlerin (İstanbul, Ankara...) tüm şehirlerle çifti eklendikten
// sonra (2026-10-01, 1133 çift) her kartta tüm satırlar 2000+ link ediyordu;
// kartta en yakın 10'u, tamamı şehir sayfasındaki mesafe listesinde.
const HUB_ROWS_PER_CITY = 10;

export default async function DistanceHubPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const isTr = locale === "tr";
  const all = getAllDistancePageData();
  const popular = getPopularDistances();

  // Her şehir için, dahil olduğu tüm çiftler (bir çift iki şehrin altında da
  // görünür — kullanıcı iki yönde de arar, aynı kanonik URL'e link verir).
  type Row = { slug: string; other: string; km: number; min: number };
  const byCity = new Map<string, { slug: string; name: string; regionSlug: string; rows: Row[] }>();
  for (const d of all) {
    for (const [self, other] of [[d.cityA, d.cityB], [d.cityB, d.cityA]] as const) {
      if (!byCity.has(self.slug)) byCity.set(self.slug, { slug: self.slug, name: self.name, regionSlug: self.regionSlug, rows: [] });
      byCity.get(self.slug)!.rows.push({ slug: d.slug, other: other.name, km: d.distanceKm, min: d.durationMin });
    }
  }
  const regionGroups = regions
    .map((region) => ({
      region,
      cities: Array.from(byCity.values())
        .filter((g) => g.regionSlug === region.slug)
        .map((g) => ({ ...g, rows: g.rows.sort((a, b) => a.km - b.km) }))
        .sort((a, b) => a.name.localeCompare(b.name, "tr")),
    }))
    .filter((g) => g.cities.length > 0);

  const byKm = [...all].sort((a, b) => a.distanceKm - b.distanceKm);
  const shortest = byKm[0];
  const longest = byKm[byKm.length - 1];

  const faqItems = isTr
    ? [
        {
          q: "Şehirler arası mesafeler nasıl hesaplanıyor?",
          a: "Mesafeler, iki şehir merkezi arasındaki gerçek karayolu güzergahından (OpenStreetMap yol verisi) hesaplanır ve resmî KGM mesafe cetveliyle karşılaştırılarak doğrulanır; kuş uçuşu değildir. Süreler, normal trafik koşullarındaki ortalama sürüş süresidir — mola ve trafik bu süreyi uzatabilir.",
        },
        ...(shortest && longest
          ? [
              {
                q: "Tablodaki en kısa ve en uzun rota hangisi?",
                a: `En kısa rota ${shortest.cityA.name} - ${shortest.cityB.name} (${Math.round(shortest.distanceKm)} km, ${formatDuration(shortest.durationMin, locale)}), en uzun rota ise ${longest.cityA.name} - ${longest.cityB.name} (${Math.round(longest.distanceKm)} km, ${formatDuration(longest.durationMin, locale)}).`,
              },
            ]
          : []),
        {
          q: "Mesafe sayfalarında başka hangi bilgiler var?",
          a: "Her rota sayfasında sürüş süresi, yaklaşık yakıt tüketimi, güzergah üzerindeki ana yollar ve iki şehrin gezi bilgileri yer alıyor; uzun rotalarda yol üstündeki şehirler ve görülecek yerler de listeleniyor.",
        },
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
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      {faqItems.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <Breadcrumbs
        withSchema
        items={[
          { label: isTr ? "Ana Sayfa" : "Home", href: `/${locale}` },
          { label: isTr ? "Mesafeler" : "Distances" },
        ]}
      />
      <h1 className="font-display text-3xl italic text-ink sm:text-4xl mb-4">
        {isTr ? "Şehirler Arası Mesafe Tablosu" : "Distances Between Turkish Cities"}
      </h1>
      <p className="mb-6 max-w-3xl text-base leading-relaxed text-ink/75">
        {isTr
          ? `Türkiye'nin popüler ${all.length} şehir çifti için karayoluyla gerçek mesafe ve ortalama sürüş süresi. Bir çifte tıklayarak yakıt tahminini, güzergah üzerindeki ana yolları, yol üstü durakları ve her iki şehrin gezi bilgilerini görebilirsin.`
          : `Real road distance and average driving time for ${all.length} popular city pairs in Turkey. Open a pair for fuel estimate, main roads, stops on the way and travel info for both cities.`}
      </p>

      {shortest && longest && (
        <div className="mb-10 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs">{isTr ? "Rota Sayısı" : "Routes"}</div>
            <p className="mt-1 text-lg font-bold text-ink">{all.length}</p>
          </div>
          <Link
            href={`/${locale}/mesafe/${shortest.slug}`}
            className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4 hover:border-kiremit/40 transition-colors"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs">{isTr ? "En Kısa" : "Shortest"}</div>
            <p className="mt-1 text-xs font-bold text-ink sm:text-sm">
              {translateDataText(shortest.cityA.name, locale)} - {translateDataText(shortest.cityB.name, locale)}
            </p>
            <p className="text-xs text-ink/60">{Math.round(shortest.distanceKm)} km</p>
          </Link>
          <Link
            href={`/${locale}/mesafe/${longest.slug}`}
            className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4 hover:border-kiremit/40 transition-colors"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs">{isTr ? "En Uzun" : "Longest"}</div>
            <p className="mt-1 text-xs font-bold text-ink sm:text-sm">
              {translateDataText(longest.cityA.name, locale)} - {translateDataText(longest.cityB.name, locale)}
            </p>
            <p className="text-xs text-ink/60">{Math.round(longest.distanceKm)} km</p>
          </Link>
        </div>
      )}

      {popular.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 flex items-center gap-2 font-display text-2xl italic text-ink">
            <TrendingUp size={20} className="text-kiremit" /> {isTr ? "En Çok Aranan Rotalar" : "Most Searched Routes"}
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((d) => (
              <Link
                key={d.slug}
                href={`/${locale}/mesafe/${d.slug}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-ink/8 bg-paper px-3 py-2.5 text-sm shadow-sm hover:border-kiremit/40 hover:text-kiremit transition-colors"
              >
                <span className="font-semibold">
                  {translateDataText(d.cityA.name, locale)} - {translateDataText(d.cityB.name, locale)}
                </span>
                <span className="shrink-0 text-xs text-ink/60">
                  {Math.round(d.distanceKm)} km · {formatDurationShort(d.durationMin, locale)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <nav aria-label={isTr ? "Bölgeye git" : "Jump to region"} className="mb-10 flex flex-wrap gap-2">
        {regionGroups.map(({ region }) => (
          <a
            key={region.slug}
            href={`#${region.slug}`}
            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/75 hover:border-kiremit hover:text-kiremit transition-colors"
          >
            {translateDataText(region.name, locale)}
          </a>
        ))}
      </nav>

      {regionGroups.map(({ region, cities }) => (
        <section key={region.slug} id={region.slug} className="mb-14 scroll-mt-24">
          <h2 className="mb-5 font-display text-2xl italic text-ink">
            {isTr ? `${region.name} Bölgesi Şehirler Arası Mesafeler` : `Distances: ${translateDataText(region.name, locale)}`}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {cities.map((g) => (
              <div key={g.slug} className="rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
                <h3 className="mb-3 font-display text-xl italic text-ink">
                  {isTr ? `${g.name} — Diğer Şehirlere Mesafe` : `From ${translateDataText(g.name, locale)}`}
                </h3>
                <ul className="divide-y divide-ink/5 text-sm">
                  {g.rows.slice(0, HUB_ROWS_PER_CITY).map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/${locale}/mesafe/${r.slug}`}
                        className="flex items-center justify-between gap-3 py-2 text-ink/80 hover:text-kiremit transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <RouteIcon size={13} className="shrink-0 text-kiremit" />
                          {translateDataText(g.name, locale)} – {translateDataText(r.other, locale)}
                        </span>
                        <span className="shrink-0 text-xs text-ink/60">
                          {r.km} km · {formatDurationShort(r.min, locale)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {g.rows.length > HUB_ROWS_PER_CITY && (
                  <Link
                    href={`/${locale}/mesafe/sehir/${g.slug}`}
                    className="mt-3 inline-block text-xs font-bold text-kiremit hover:underline"
                  >
                    {isTr
                      ? `${ablative(g.name)} ${g.rows.length} şehre mesafe tablosu →`
                      : `All ${g.rows.length} distances from ${translateDataText(g.name, locale)} →`}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {faqItems.length > 0 && (
        <section className="mt-6 border-t border-ink/10 pt-10">
          <h2 className="mb-6 font-display text-2xl italic text-ink">Sık Sorulan Sorular</h2>
          <div className="space-y-5">
            {faqItems.map((item) => (
              <div key={item.q}>
                <h3 className="text-base font-bold text-ink">{item.q}</h3>
                <p className="mt-1 text-sm text-ink/75 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
