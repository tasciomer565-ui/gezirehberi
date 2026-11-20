import Link from "@/components/PlainLink";
import { notFound } from "next/navigation";
import { Waves, MapPin } from "lucide-react";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta } from "@/lib/i18n";
import { getAllBeaches } from "@/lib/data/beaches";
import { regions } from "@/lib/data/regions";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";
import HotelOffer from "@/components/HotelOffer";
import { ToursOffer } from "@/components/TripOffers";
import { jsonLd } from "@/lib/jsonLd";

const PATH = "/plajlar";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const total = getAllBeaches().length;
  const title = "Türkiye Plajları ve Koyları Rehberi: Deniz Tatili";
  const description = `Ege, Akdeniz, Marmara ve Karadeniz kıyılarında ${total} popüler plaj, koy ve lagün: kumlu sahiller, sakin koylar ve şehir rehberi bağlantıları tek listede.`;
  return {
    title,
    description,
    robots: buildRobots(locale),
    alternates: buildAlternates(locale, PATH),
    ...buildPageSocialMeta(locale, PATH, title, description),
  };
}

export default async function BeachesPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  if (locale !== "tr") notFound();

  const allBeaches = getAllBeaches();
  const byRegion = regions
    .map((region) => {
      const items = allBeaches.filter((b) => b.regionSlug === region.slug);
      const cityMap = new Map<string, { cityName: string; citySlug: string; beaches: typeof items }>();
      for (const b of items) {
        if (!cityMap.has(b.citySlug)) {
          cityMap.set(b.citySlug, { cityName: b.cityName, citySlug: b.citySlug, beaches: [] });
        }
        cityMap.get(b.citySlug)!.beaches.push(b);
      }
      return {
        region,
        cities: Array.from(cityMap.values()).sort(
          (a, b) => b.beaches.length - a.beaches.length || a.cityName.localeCompare(b.cityName, "tr")
        ),
      };
    })
    .filter((g) => g.cities.length > 0);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Türkiye Plajları ve Koyları (${allBeaches.length} Sahil)`,
    numberOfItems: allBeaches.length,
    itemListElement: allBeaches.slice(0, 20).map((b, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `${b.name} (${b.cityName})`,
      url: `https://www.yoldefterim.com.tr/tr/bolgeler/${b.regionSlug}/${b.citySlug}#gezilecek-yerler`,
    })),
  };

  const faqItems = [
    {
      q: "Türkiye'de çocuklu aileler için en uygun sığ ve kumlu plajlar hangileri?",
      a: "Sığ ve ince kumlu yapısıyla öne çıkan sahiller arasında Ölüdeniz Kumburnu (Fethiye), İncekum ve Kleopatra (Alanya), Ilıca (Çeşme), Sarımsaklı (Ayvalık), Altınkum (Didim), Kızkalesi (Mersin) ve Amasra Büyük Liman sayılabilir.",
    },
    {
      q: "Caretta caretta kaplumbağalarının koruma altındaki plajları hangileri?",
      a: "Patara Plajı (Kaş/Kalkan), Çıralı Sahili (Kemer) ve İztuzu Plajı (Dalyan) caretta caretta deniz kaplumbağalarının başlıca yuvalama alanlarıdır ve belirli saatlerde özel koruma kuralları uygulanır.",
    },
    {
      q: "Plajlara giriş ücretli mi?",
      a: "Halk plajlarına giriş ücretsizdir; ancak şezlong, şemsiye, otopark veya tabiat parkı/milli park giriş ücretleri belediye ve işletmelere göre sezonluk değiştiği için gitmeden önce güncel duyurular kontrol edilmelidir.",
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
          { label: "Türkiye Plajları ve Koyları" },
        ]}
      />

      <h1 className="mb-4 font-display text-3xl italic text-ink sm:text-4xl">
        Türkiye Plajları ve Koyları Rehberi
      </h1>
      <p className="mb-8 max-w-3xl text-base leading-relaxed text-ink/75">
        Akdeniz, Ege, Marmara ve Karadeniz kıyılarında öne çıkan <strong>{allBeaches.length} plaj, koy ve lagün</strong>, bölge ve şehir başlıkları altında tek listede. Şehir bağlantısına tıklayarak ulaşım, konaklama ve diğer gezilecek yerleri inceleyebilirsiniz.
      </p>

      <nav aria-label="Bölgeye git" className="mb-10 flex flex-wrap gap-2">
        {byRegion.map(({ region }) => (
          <a
            key={region.slug}
            href={`#${region.slug}`}
            className="rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink/80 transition-colors hover:border-kiremit hover:text-kiremit"
          >
            {region.name}
          </a>
        ))}
      </nav>

      <HotelOffer />

      <div className="my-8">
        <AdSlot />
      </div>

      <div className="space-y-14">
        {byRegion.map(({ region, cities }) => (
          <section key={region.slug} id={region.slug} className="scroll-mt-24">
            <h2 className="mb-5 font-display text-2xl italic text-ink sm:text-3xl">
              {region.name} Plajları ve Koyları
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {cities.map((c) => (
                <article key={c.citySlug} className="rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-2 border-b border-ink/8 pb-3">
                    <h3 className="font-display text-xl italic text-ink">
                      <Link
                        href={`/${locale}/bolgeler/${region.slug}/${c.citySlug}#gezilecek-yerler`}
                        className="hover:text-kiremit transition-colors"
                      >
                        {c.cityName} Plajları ({c.beaches.length})
                      </Link>
                    </h3>
                    <Link
                      href={`/${locale}/bolgeler/${region.slug}/${c.citySlug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-kiremit hover:underline shrink-0"
                    >
                      <MapPin size={12} /> Şehir Rehberi
                    </Link>
                  </div>
                  <ul className="space-y-2.5">
                    {c.beaches.map((b) => (
                      <li key={b.name} className="text-sm">
                        <span className="flex items-start gap-2 font-semibold text-ink/90">
                          <Waves size={14} className="mt-1 shrink-0 text-kiremit" />
                          <span>{b.name}</span>
                        </span>
                        {b.description && (
                          <p className="mt-0.5 pl-6 text-xs leading-relaxed text-ink/65">{b.description}</p>
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
