import Link from "@/components/PlainLink";
import { notFound } from "next/navigation";
import { Soup, MapPin } from "lucide-react";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta } from "@/lib/i18n";
import { allCities } from "@/lib/data/cities";
import { regions } from "@/lib/data/regions";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";
import { ToursOffer } from "@/components/TripOffers";
import { jsonLd } from "@/lib/jsonLd";

const PATH = "/yoresel-lezzetler";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const totalFoods = allCities.reduce((sum, c) => sum + c.localFood.length, 0);
  const title = "Türkiye Yöresel Lezzetleri: 85 İl";
  const description = `Türkiye genelinde ${totalFoods} meşhur yöresel yemek ve tatlı: Gaziantep, Adana, Hatay, Trabzon, İzmir, Konya ve 85 şehirde ne yenir, malzemeleri ve mevsimleri.`;
  return {
    title,
    description,
    robots: buildRobots(locale),
    alternates: buildAlternates(locale, PATH),
    ...buildPageSocialMeta(locale, PATH, title, description),
  };
}

export default async function LocalFoodsPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  if (locale !== "tr") notFound();

  const cityFoods = allCities
    .filter((c) => c.localFood.length > 0)
    .map((city) => ({
      city,
      foods: city.localFood,
    }));

  const totalFoods = cityFoods.reduce((sum, x) => sum + x.foods.length, 0);

  const regionGroups = regions
    .map((region) => ({
      region,
      cities: cityFoods
        .filter((x) => x.city.regionSlug === region.slug)
        .sort((a, b) => b.foods.length - a.foods.length || a.city.name.localeCompare(b.city.name, "tr")),
    }))
    .filter((g) => g.cities.length > 0);

  const featuredList = cityFoods
    .flatMap((x) =>
      x.foods.slice(0, 1).map((f) => ({
        name: `${f.name} (${x.city.name})`,
        url: `https://www.yoldefterim.com.tr/tr/bolgeler/${x.city.regionSlug}/${x.city.slug}#ne-yenir`,
      }))
    )
    .slice(0, 20);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Türkiye Yöresel Lezzetleri (${totalFoods} Yemek)`,
    numberOfItems: totalFoods,
    itemListElement: featuredList.map((m, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: m.name,
      url: m.url,
    })),
  };

  const faqItems = [
    {
      q: "Türkiye'de gastronomi turizmi için öne çıkan şehirler hangileri?",
      a: "Gaziantep, Hatay (Antakya), Adana, Şanlıurfa, Kayseri, Konya, Trabzon, İzmir ve Bursa köklü yerel mutfaklarıyla gastronomi seyahatlerinde en çok tercih edilen şehirler arasındadır.",
    },
    {
      q: "Yöresel yemeklerin fiyatları neden yazmıyor?",
      a: "Lokanta ve tatlıcı fiyatları dönemsel olarak güncellendiği için ziyaretçilere eski veya yanıltıcı fiyat göstermemek adına burada sabit TL tutarı paylaşılmaz; her şehir rehberinde yemeklerin içeriği ve hangi bölgede yenebileceği yer alır.",
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
          { label: "Yöresel Lezzetler" },
        ]}
      />

      <h1 className="mb-4 font-display text-3xl italic text-ink sm:text-4xl">
        Türkiye Yöresel Lezzetleri: 85 Şehirde Ne Yenir?
      </h1>
      <p className="mb-8 max-w-3xl text-base leading-relaxed text-ink/75">
        Türkiye&apos;nin <strong>{cityFoods.length}</strong> şehir ve tatil beldesinde mutlaka denenmesi gereken{" "}
        <strong>{totalFoods} yöresel yemek, çorba, kebap ve tatlı</strong> bölge bölge tek rehberde. Şehir adına tıklayarak nerede yenir ve nerede kalınır bölümlerine geçebilirsiniz.
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

      <div className="my-8">
        <AdSlot />
      </div>

      <div className="space-y-14">
        {regionGroups.map(({ region, cities }) => (
          <section key={region.slug} id={region.slug} className="scroll-mt-24">
            <h2 className="mb-5 font-display text-2xl italic text-ink sm:text-3xl">
              {region.name} Mutfağı ve Yöresel Yemekleri
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {cities.map(({ city, foods }) => (
                <article key={city.slug} className="rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-2 border-b border-ink/8 pb-3">
                    <h3 className="font-display text-xl italic text-ink">
                      <Link
                        href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}#ne-yenir`}
                        className="hover:text-kiremit transition-colors"
                      >
                        {city.name} Yemekleri ({foods.length})
                      </Link>
                    </h3>
                    <Link
                      href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}#nerede-yenir`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-kiremit hover:underline shrink-0"
                    >
                      <MapPin size={12} /> Nerede Yenir?
                    </Link>
                  </div>
                  <ul className="space-y-2.5">
                    {foods.slice(0, 4).map((f) => (
                      <li key={f.id} className="text-sm">
                        <span className="flex items-start gap-2 font-semibold text-ink/90">
                          <Soup size={14} className="mt-1 shrink-0 text-kiremit" />
                          <span>{f.name}</span>
                        </span>
                        <p className="mt-0.5 pl-6 text-xs leading-relaxed text-ink/65 line-clamp-2">
                          {f.description.length > 110 ? f.description.slice(0, f.description.lastIndexOf(" ", 110)) + "…" : f.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                  {foods.length > 4 && (
                    <Link
                      href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}#ne-yenir`}
                      className="mt-3 inline-block text-xs font-bold text-kiremit hover:underline"
                    >
                      Tüm {city.name} lezzetlerini gör ({foods.length}) →
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10">
        <ToursOffer />
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
