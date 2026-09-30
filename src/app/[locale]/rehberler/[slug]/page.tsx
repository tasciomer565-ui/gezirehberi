import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta, translateDataText, getDictionary, SITE_URL } from "@/lib/i18n";
import { getAllGuides, getGuideBySlug } from "@/lib/data/guides";
import { allCities } from "@/lib/data/cities";
import AdSlot from "@/components/AdSlot";
import Breadcrumbs from "@/components/Breadcrumbs";

// Rehber gövdeleri düz metin; bölüm başlıkları kendi satırında BÜYÜK HARFLE
// yazılmış ("SELAMLAŞMA", "112 — TEK ACİL ÇAĞRI NUMARASI"). Önceden hepsi tek
// bir whitespace-pre-line div'inde basılıyordu — sayfada hiç H2 yoktu. Paragraf
// bloğunun ilk satırı büyük harfse (parantez içi açıklama hariç) başlık sayılır.
function isHeadingLine(line: string): boolean {
  const core = line.replace(/\(.*?\)/g, "").trim();
  return (
    core.length > 0 &&
    line.length <= 120 &&
    /\p{Lu}/u.test(core) &&
    core === core.toLocaleUpperCase("tr")
  );
}

function parseGuideBody(body: string): { heading?: string; text: string }[] {
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [first, ...rest] = block.split("\n");
      return isHeadingLine(first) ? { heading: first.trim(), text: rest.join("\n").trim() } : { text: block };
    });
}

export async function generateStaticParams() {
  // Empty until real guides exist — no fake slugs to prerender.
  const guides = getAllGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string; locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const guide = getGuideBySlug(params.slug);
  if (!guide) return { title: locale === "tr" ? "Rehber bulunamadı" : "Guide not found" };

  // Rehber içeriği yalnızca Türkçe — önceden buildRobots(locale, true) ile 5
  // dilde de indexlenebilir ve self-canonical'dı; Search Console'da (2026-09)
  // Türkçe sorgular için /en/ kopyası TR'nin önüne geçiyordu (acil durum
  // numaraları: EN 44 gösterim, TR 1). Artık site geneli kural: sadece
  // çevrilmiş locale'ler (TR) indexleniyor, diğerleri noindex.
  const title = guide.seoTitle ?? guide.title;
  return {
    title,
    description: guide.summary,
    robots: buildRobots(locale),
    alternates: buildAlternates(locale, `/rehberler/${guide.slug}`),
    ...buildPageSocialMeta(locale, `/rehberler/${guide.slug}`, title, guide.summary),
  };
}

export default async function GuideDetailPage(props: { params: Promise<{ slug: string; locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const guide = getGuideBySlug(params.slug);

  if (!guide) {
    notFound();
  }

  // Madde 85 — relatedCitySlugs alanı GuideArticle tipinde tanımlıydı ve bazı
  // makalelerde doldurulmuştu ama hiçbir yerde render edilmiyordu (veri var,
  // UI yoktu). citySlug'ları gerçek City kayıtlarına çözüyoruz — olmayan bir
  // slug varsa sessizce atlanır, kırık link göstermez.
  const relatedCities = (guide.relatedCitySlugs ?? [])
    .map((slug) => allCities.find((c) => c.slug === slug))
    .filter((c): c is (typeof allCities)[number] => Boolean(c));

  // Bulgu: hiçbir rehber sayfasında (eski ya da yeni) JSON-LD structured
  // data yoktu — şehir sayfalarındaki (TouristDestination/BreadcrumbList)
  // desene uyacak şekilde gerçek bir Article şeması ekleniyor. Uydurma
  // yazar/kurum bilgisi yok — sadece gerçek, doğrulanabilir alanlar
  // (başlık, özet, gerçek yayın tarihi, site kimliği).
  const dict = getDictionary(locale);
  const pageUrl = `${SITE_URL}/${locale}/rehberler/${guide.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": guide.title,
    "description": guide.summary,
    "datePublished": guide.publishedAt,
    "dateModified": guide.updatedAt ?? guide.publishedAt,
    "url": pageUrl,
    "mainEntityOfPage": pageUrl,
    // Google'ın Article için önerdiği alanlar. Yazar olarak uydurma bir kişi
    // değil, içeriği gerçekten yayımlayan kurum (site) gösteriliyor; görsel,
    // sayfanın og:image'ı olan markalı görsel.
    "image": [`${SITE_URL}/${locale}/opengraph-image`],
    "author": {
      "@type": "Organization",
      "name": dict.nav.logo,
      "url": SITE_URL,
    },
    "publisher": {
      "@type": "Organization",
      "name": dict.nav.logo,
      "url": SITE_URL,
      "logo": { "@type": "ImageObject", "url": `${SITE_URL}/icon` },
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Breadcrumbs
        withSchema
        items={[
          { label: locale === "tr" ? "Ana Sayfa" : "Home", href: `/${locale}` },
          { label: locale === "tr" ? "Rehberler" : "Guides", href: `/${locale}/rehberler` },
          { label: guide.seoTitle ?? guide.title },
        ]}
      />
      <h1 className="font-display text-3xl italic text-ink sm:text-4xl mb-4">{guide.title}</h1>
      <p className="text-base text-ink/65 mb-8">{guide.summary}</p>
      <div className="max-w-none text-ink/80 leading-relaxed">
        {parseGuideBody(guide.body).map((block, i) =>
          block.heading ? (
            <section key={i} className="mt-8">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-kiremit">{block.heading}</h2>
              {block.text && <p className="whitespace-pre-line">{block.text}</p>}
            </section>
          ) : (
            <p key={i} className="mt-6 whitespace-pre-line first:mt-0">
              {block.text}
            </p>
          )
        )}
      </div>

      <AdSlot />

      {relatedCities.length > 0 && (
        <div className="mt-12 border-t border-ink/10 pt-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-kiremit">
            {locale === "tr" ? "İlgili Şehirler" : "Related Cities"}
          </h2>
          <div className="flex flex-wrap gap-3">
            {relatedCities.map((city) => (
              <Link
                key={city.slug}
                href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}`}
                className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink/75 hover:border-kiremit hover:text-kiremit transition-colors"
              >
                <MapPin size={14} className="text-kiremit shrink-0" />
                {translateDataText(city.name, locale)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
