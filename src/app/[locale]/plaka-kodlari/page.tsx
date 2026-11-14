import Link from "@/components/PlainLink";
import { notFound } from "next/navigation";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta } from "@/lib/i18n";
import { PROVINCES } from "@/lib/data/provinces";
import { allCities } from "@/lib/data/cities";
import { regions } from "@/lib/data/regions";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";
import { jsonLd } from "@/lib/jsonLd";

// "plaka kodları", "alan kodları", "hangi ilin plakası 34" gibi çok aranan,
// sabit ve doğrulanabilir bilgi (2026-11-02). Tek sayfa, 81 il; her satır sitedeki
// şehir rehberine bağlanır (iç link ağı).
const PATH = "/plaka-kodlari";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const title = "Plaka Kodları ve Alan Kodları Listesi: 81 İl";
  const description =
    "Türkiye'nin 81 ilinin plaka kodları ve telefon alan kodları tek tabloda: hangi ilin plakası kaç, hangi ilin alan kodu ne. Bölge ve şehir rehberi bağlantılarıyla.";
  return {
    title,
    description,
    robots: buildRobots(locale),
    alternates: buildAlternates(locale, PATH),
    ...buildPageSocialMeta(locale, PATH, title, description),
  };
}

export default async function PlateCodesPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  if (locale !== "tr") notFound();

  const regionName = (slug: string) => regions.find((r) => r.slug === slug)?.name ?? slug;
  const guideHref = (slug?: string) => {
    const c = slug ? allCities.find((x) => x.slug === slug) : undefined;
    return c ? `/${locale}/bolgeler/${c.regionSlug}/${c.slug}` : undefined;
  };

  const faqItems = [
    {
      q: "Plaka kodları nasıl belirlenir?",
      a: "Türkiye'de araç plakalarının ilk iki hanesi, aracın kayıtlı olduğu ilin plaka kodudur. Kodlar illerin alfabetik sırasına göre 01'den 81'e kadar verilmiştir; sonradan il olan Bartın (74), Karabük (78), Kilis (79), Osmaniye (80) ve Düzce (81) gibi illerin kodları listenin sonundadır.",
    },
    {
      q: "İstanbul'un plaka ve alan kodu nedir?",
      a: "İstanbul'un plaka kodu 34'tür. Telefon alan kodu Avrupa yakasında 212, Anadolu yakasında 216'dır.",
    },
    {
      q: "Alan kodu ile plaka kodu aynı mıdır?",
      a: "Hayır. Plaka kodu aracın kayıtlı olduğu ili, alan kodu ise sabit telefonun hangi bölgeye ait olduğunu belirtir. Örneğin Ankara'nın plaka kodu 06, alan kodu 312'dir.",
    },
    {
      q: "Bir ilçenin plaka ve alan kodu nedir?",
      a: "İlçeler, bağlı oldukları ilin plaka kodunu kullanır; telefon alan kodları da genellikle il genelinde aynıdır. Örneğin Bodrum, Muğla iline bağlıdır: plaka 48, alan kodu 252.",
    },
  ];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <Breadcrumbs
        withSchema
        items={[{ label: "Ana Sayfa", href: `/${locale}` }, { label: "Plaka ve Alan Kodları" }]}
      />
      <h1 className="mb-4 font-display text-3xl italic text-ink sm:text-4xl">Plaka Kodları ve Alan Kodları Listesi</h1>
      <p className="mb-8 max-w-3xl text-base leading-relaxed text-ink/75">
        Türkiye&apos;nin 81 ilinin plaka kodları ve telefon alan kodları plaka sırasına göre tek tabloda. İlin adına tıklayarak şehir rehberine, gezilecek yerlere ve mesafe bilgilerine ulaşabilirsiniz.
      </p>

      <div className="overflow-x-auto rounded-xl border border-ink/10 bg-paper shadow-sm">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs font-bold uppercase tracking-wider text-ink/65">
              <th className="px-4 py-3">Plaka</th>
              <th className="px-4 py-3">İl</th>
              <th className="px-4 py-3">Alan Kodu</th>
              <th className="px-4 py-3">Bölge</th>
            </tr>
          </thead>
          <tbody>
            {PROVINCES.map(([name, plate, area, region, slug]) => {
              const href = guideHref(slug);
              return (
                <tr key={plate} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.03]">
                  <td className="px-4 py-2.5 font-bold tabular-nums text-ink">{String(plate).padStart(2, "0")}</td>
                  <td className="px-4 py-2.5">
                    {href ? (
                      <Link href={href} className="font-semibold text-ink/85 hover:text-kiremit">{name}</Link>
                    ) : (
                      <span className="font-semibold text-ink/85">{name}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-ink/80">{area}</td>
                  <td className="px-4 py-2.5 text-ink/65">
                    <Link href={`/${locale}/bolgeler/${region}`} className="hover:text-kiremit">{regionName(region)}</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink/55">
        Muğla için rehber bağlantısı, ilin en çok ziyaret edilen ilçesi Bodrum sayfasına; Nevşehir için Kapadokya, Bartın için Amasra, Karabük için Safranbolu sayfasına gider.
      </p>

      <div className="mt-8">
        <AdSlot />
      </div>

      <section className="mt-12 border-t border-ink/10 pt-10">
        <h2 className="mb-6 font-display text-2xl italic text-ink">Sık Sorulan Sorular</h2>
        <div className="space-y-5">
          {faqItems.map((f) => (
            <div key={f.q}>
              <h3 className="text-base font-bold text-ink">{f.q}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink/75">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
