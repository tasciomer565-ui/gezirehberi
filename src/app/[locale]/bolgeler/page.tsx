import { regions } from "@/lib/data/regions";
import RegionCard from "@/components/RegionCard";
import { getDictionary, Locale } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const dict = getDictionary(locale);
  
  return {
    title: dict.nav.regions,
    description: dict.home.subtitle,
  };
}

export default async function BolgelerPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const dict = getDictionary(locale);

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
        {regions.map((region) => (
          <RegionCard key={region.slug} region={region} locale={locale} />
        ))}
      </div>
    </div>
  );
}
