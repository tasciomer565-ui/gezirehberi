import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getDictionary, Locale, buildAlternates, buildRobots, buildPageSocialMeta } from "@/lib/i18n";
import { getAllGuides } from "@/lib/data/guides";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const guides = getAllGuides();
  const title = locale === "tr" ? "Türkiye Gezi Rehberleri ve Rota Önerileri" : "Turkey Travel Guides";
  const description =
    locale === "tr"
      ? "Ekim, Kasım ve kış rotaları, UNESCO mirası listesi, en iyi sahil kasabaları, 1 günlük şehir planları ve pratik seyahat bilgileri: Türkiye gezi rehberleri."
      : "Seasonal routes, UNESCO sites, beach towns, one-day city plans and practical travel tips for Turkey.";

  return {
    title,
    description,
    // No real articles exist yet — an empty list page has no indexable value,
    // so this stays noindexed regardless of locale until guides.length > 0
    // (report item 83 decision: architecture now, content added by hand later).
    // Kartlar (rehber başlık/özetleri) yalnızca Türkçe — TR dışı locale'ler
    // site geneli varsayılanla noindex (bkz. rehberler/[slug]).
    robots: buildRobots(locale, guides.length > 0 ? undefined : false),
    alternates: buildAlternates(locale, "/rehberler"),
    ...buildPageSocialMeta(locale, "/rehberler", title, description),
  };
}

export default async function GuidesIndexPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const dict = getDictionary(locale);
  const guides = getAllGuides();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl italic text-ink sm:text-5xl mb-4">
          {locale === "tr" ? "Rehberler" : "Guides"}
        </h1>
        <p className="text-lg text-ink/75 max-w-2xl mx-auto font-medium">
          {locale === "tr"
            ? "Bölgesel öneri listeleri ve mevsimsel seyahat rehberleri."
            : "Regional recommendation lists and seasonal travel guides."}
        </p>
      </div>

      {guides.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink/20 p-10 text-center bg-paper/30">
          <BookOpen className="mx-auto mb-3 text-ink/65" size={28} />
          <p className="text-sm text-ink/65 font-semibold">
            {locale === "tr"
              ? "Henüz yayınlanmış bir rehber yazısı yok."
              : "No guide articles have been published yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {guides.map((g) => (
            <Link
              key={g.slug}
              href={`/${locale}/rehberler/${g.slug}`}
              className="rounded-2xl border border-ink/8 bg-paper p-5 shadow-sm hover:border-kiremit/40 transition-colors"
            >
              <h2 className="font-bold text-ink mb-2">{g.title}</h2>
              <p className="text-sm text-ink/65 leading-relaxed">{g.summary}</p>
            </Link>
          ))}
        </div>
      )}

      <p className="mt-10 text-center text-xs text-ink/65">{dict.nav.logo}</p>
    </div>
  );
}
