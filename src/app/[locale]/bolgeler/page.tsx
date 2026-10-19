import Link from "next/link";
import { regions } from "@/lib/data/regions";
import { getCitiesByRegion } from "@/lib/data/cities";
import RegionCard from "@/components/RegionCard";
import { getDictionary, Locale, buildAlternates, buildPageSocialMeta } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const dict = getDictionary(locale);

  // Plain title, no manual "| Yol Defteri" suffix here — the root layout's title
  // template already appends it, so appending it twice produced "Bölgeler | Yol
  // Defteri | Yol Defteri" (report item 12).
  // Uses the same locale-aware "Seven Regions" heading shown on the page itself,
  // rather than the generic nav label "Bölgeler" — more specific and keyword-rich.
  const title =
    locale === "tr"
      ? "Türkiye'nin Yedi Bölgesi"
      : locale === "de"
      ? "Die sieben Regionen der Türkei"
      : locale === "ar"
      ? "مناطق تركيا السبعة"
      : "The Seven Regions of Turkey";
  const description = dict.home.regionsMetaDescription;

  return {
    title,
    description,
    alternates: buildAlternates(locale, "/bolgeler"),
    ...buildPageSocialMeta(locale, "/bolgeler", title, description),
  };
}

export default async function BolgelerPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;

  const titleText = locale === "tr"
    ? "Türkiye'nin Yedi Bölgesi"
    : locale === "de"
    ? "Die sieben Regionen der Türkei"
    : locale === "ar"
    ? "مناطق تركيا السبعة"
    : "The Seven Regions of Turkey";

  const descText = locale === "tr"
    ? "Her bölgenin kendine özgü tarihi, doğası, kültürü ve lezzetleri var. Yol Defteri, bölge bölge Türkiye'yi keşfetmenizi bekliyor."
    : locale === "de"
    ? "Jede Region hat ihre eigene Geschichte, Natur, Kultur und Küche. Yol Defteri lädt Sie ein, die Türkei Region für Region zu entdecken."
    : locale === "ar"
    ? "لكل منطقة تاريخها وطبيعتها وثقافتها ونكهاتها الفريدة. دفتر الطريق بانتظارك لتكتشف تركيا منطقة تلو الأخرى."
    : "Each region has its unique history, nature, culture, and culinary tastes. Yol Defteri awaits you to explore Turkey region by region.";

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-12">
        <h1 className="font-display text-4xl italic text-ink sm:text-5xl">
          {titleText}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-ink/70">
          {descText}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((region, i) => (
          <RegionCard key={region.slug} region={region} locale={locale} eager={i === 0} />
        ))}
      </div>

      {/* Bölge bölge şehir listesi (2026-10-20): ana /bolgeler sayfası 198
          kelimeydi ve şehir sayfalarına link vermiyordu; her bölgedeki
          şehirleri gerçek veriden listeler. */}
      {locale === "tr" && (
        <section className="mt-16 border-t border-ink/10 pt-12">
          <h2 className="mb-2 font-display text-3xl italic text-ink">Bölge Bölge Gezilecek Şehirler</h2>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-ink/70">
            Yol Defteri&apos;nde yedi bölgede toplam {regions.reduce((n, r) => n + getCitiesByRegion(r.slug).length, 0)} şehir ve tatil beldesi için
            gezilecek yerler, ne yenir, nerede kalınır ve ulaşım bilgisi var. Bir şehri seçerek gezi rehberine, şehirden diğer illere mesafe
            tablosuna ve en yakın havalimanına ulaşabilirsiniz.
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {regions.map((region) => {
              const cities = [...getCitiesByRegion(region.slug)].sort((a, b) => a.name.localeCompare(b.name, "tr"));
              return (
                <div key={region.slug}>
                  <h3 className="mb-3 text-lg font-bold text-ink">
                    <Link href={`/${locale}/bolgeler/${region.slug}`} className="hover:text-kiremit transition-colors">
                      {region.name} Bölgesi
                    </Link>{" "}
                    <span className="text-sm font-semibold text-ink/50">({cities.length} şehir)</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cities.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/${locale}/bolgeler/${region.slug}/${c.slug}`}
                        className="rounded-full border border-ink/15 px-3 py-1 text-sm font-semibold text-ink/75 transition-colors hover:border-kiremit hover:text-kiremit"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
