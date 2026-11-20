import Link from "@/components/PlainLink";
import { notFound } from "next/navigation";
import { Landmark, MapPin } from "lucide-react";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta } from "@/lib/i18n";
import { allCities } from "@/lib/data/cities";
import { regions } from "@/lib/data/regions";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";
import { ToursOffer } from "@/components/TripOffers";
import { jsonLd } from "@/lib/jsonLd";

const PATH = "/muzeler";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const totalMuseums = allCities.reduce(
    (sum, c) => sum + c.attractions.filter((a) => a.category === "museum").length,
    0
  );
  const title = "Türkiye Müzeleri ve Ören Yerleri Rehberi";
  const description = `Türkiye genelinde ${totalMuseums} müze ve sergi alanı: İstanbul, Ankara, İzmir, Antalya, Kapadokya ve diğer illerde gezilecek müzeler, konumları ve şehir rehberleri.`;
  return {
    title,
    description,
    robots: buildRobots(locale),
    alternates: buildAlternates(locale, PATH),
    ...buildPageSocialMeta(locale, PATH, title, description),
  };
}

export default async function MuseumsPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  if (locale !== "tr") notFound();

  const cityMuseums = allCities
    .map((city) => ({
      city,
      museums: city.attractions.filter((a) => a.category === "museum"),
    }))
    .filter((x) => x.museums.length > 0);

  const totalMuseums = cityMuseums.reduce((sum, x) => sum + x.museums.length, 0);

  const regionGroups = regions
    .map((region) => ({
      region,
      cities: cityMuseums
        .filter((x) => x.city.regionSlug === region.slug)
        .sort((a, b) => b.museums.length - a.museums.length || a.city.name.localeCompare(b.city.name, "tr")),
    }))
    .filter((g) => g.cities.length > 0);

  const topMuseums = cityMuseums
    .flatMap((x) =>
      x.museums.map((m) => ({
        name: `${m.name} (${x.city.name})`,
        url: `https://www.yoldefterim.com.tr/tr/bolgeler/${x.city.regionSlug}/${x.city.slug}#gezilecek-yerler`,
      }))
    )
    .slice(0, 20);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Türkiye Müzeleri ve Ören Yerleri (${totalMuseums} Müze)`,
    numberOfItems: totalMuseums,
    itemListElement: topMuseums.map((m, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: m.name,
      url: m.url,
    })),
  };

  const faqItems = [
    {
      q: "Türkiye'de en çok müze hangi şehirlerde bulunuyor?",
      a: `Rehberimizde kayıtlı ${totalMuseums} müze arasında en fazla müzeye sahip şehirler ${[...cityMuseums]
        .sort((a, b) => b.museums.length - a.museums.length)
        .slice(0, 5)
        .map((x) => `${x.city.name} (${x.museums.length})`)
        .join(", ")} olarak öne çıkıyor.`,
    },
    {
      q: "Müze ziyaret saatleri ve giriş ücretleri neden burada yazmıyor?",
      a: "Müze giriş ücretleri ve sezonluk açılış-kapanış saatleri Kültür ve Turizm Bakanlığı ile belediyeler tarafından yıl içinde güncellendiği için eski/yanlış bilgi vermemek adına burada sabit fiyat paylaşılmaz; gitmeden önce resmî duyuruları kontrol etmeniz önerilir.",
    },
    {
      q: "Müze Kart nerelerde geçerlidir?",
      a: "MüzeKart, Kültür ve Turizm Bakanlığı'na bağlı müze ve ören yerlerinde geçerlidir. Belediye müzeleri ve özel müzeler kendi bilet tarifelerini uygular.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <Breadcrumbs
        withSchema
        items={[
          { label: "Ana Sayfa", href: `/${locale}` },
          { label: "Türkiye Müzeleri" },
        ]}
      />

      <h1 className="mb-4 font-display text-3xl italic text-ink sm:text-4xl">
        Türkiye Müzeleri ve Ören Yerleri Rehberi
      </h1>
      <p className="mb-8 max-w-3xl text-base leading-relaxed text-ink/75">
        Türkiye&apos;nin <strong>{cityMuseums.length}</strong> farklı şehir ve tatil beldesinde yer alan{" "}
        <strong>{totalMuseums} müze</strong>, bölge bölge tek rehberde. Şehir adına tıklayarak harita konumlarına, diğer gezilecek yerlere ve ulaşım bilgilerine geçebilirsiniz.
      </p>

      <nav aria-label="Bölgeye git" className="mb-10 flex flex-wrap gap-2">
        {regionGroups.map(({ region }) => (
          <a
            key={region.slug}
            href={`#${region.slug}`}
            className="rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink/80 transition-colors hover:border-kiremit hover:text-kiremit"
          >
            {region.name}
          </a>
        ))}
      </nav>

      <ToursOffer />

      <div className="my-8">
        <AdSlot />
      </div>

      <div className="space-y-14">
        {regionGroups.map(({ region, cities }) => (
          <section key={region.slug} id={region.slug} className="scroll-mt-24">
            <h2 className="mb-5 font-display text-2xl italic text-ink sm:text-3xl">
              {region.name} Bölgesi Müzeleri
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {cities.map(({ city, museums }) => (
                <article key={city.slug} className="rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-2 border-b border-ink/8 pb-3">
                    <h3 className="font-display text-xl italic text-ink">
                      <Link
                        href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}#gezilecek-yerler`}
                        className="hover:text-kiremit transition-colors"
                      >
                        {city.name} Müzeleri ({museums.length})
                      </Link>
                    </h3>
                    <Link
                      href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-kiremit hover:underline shrink-0"
                    >
                      <MapPin size={12} /> Şehir Rehberi
                    </Link>
                  </div>
                  <ul className="space-y-2.5">
                    {museums.map((m) => (
                      <li key={m.id} className="text-sm">
                        <span className="flex items-start gap-2 font-semibold text-ink/90">
                          <Landmark size={14} className="mt-1 shrink-0 text-kiremit" />
                          <span>{m.name}</span>
                        </span>
                        {m.description && (
                          <p className="mt-0.5 pl-6 text-xs leading-relaxed text-ink/65 line-clamp-2">
                            {m.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-14 border-t border-ink/10 pt-10">
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
