import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Fuel, Coffee, Route as RouteIcon } from "lucide-react";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta, translateDataText } from "@/lib/i18n";
import {
  getAllDistancePageData,
  getDistancePageData,
  buildDistanceDescription,
  formatDuration,
  getTopAttractions,
} from "@/lib/data/distances";
import { buildStopDirectionsUrl } from "@/lib/geo";
import { getGuidesForCity } from "@/lib/data/guides";
import AdSlot from "@/components/AdSlot";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BookOpen } from "lucide-react";

export async function generateStaticParams() {
  return getAllDistancePageData().map((d) => ({ pair: d.slug }));
}

export async function generateMetadata(props: { params: Promise<{ pair: string; locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const data = getDistancePageData(params.pair);
  if (!data) return { title: locale === "tr" ? "Sayfa bulunamadı" : "Page not found" };

  // Bulgu (Search Console, 2026-09): "X-Y arası kaç km" sorgusunda Google
  // sonucu doğrudan bir AI özetiyle veriyor, tıklama neredeyse hiç gelmiyor
  // (1072 gösterim / 0 tık gibi örnekler). Başlığa gerçek sayıyı koymak
  // (rakip "mesafe hesaplama" siteleri de böyle yapıyor) taramada öne çıkma
  // ve olası AI-özet/People-Also-Ask alıntısı ihtimalini artırmak için —
  // tıklamayı garanti etmiyor ama elimizdeki tek gerçekçi kaldıraç bu.
  // Başlıkta yuvarlanmış tam sayı (rakip sitelerin çoğu da böyle gösteriyor,
  // "237.1" yerine "237" taranabilirliği artırıyor) — sayfa içeriğinde
  // (istatistik kutusu, açıklama) tam ondalıklı Mapbox değeri değişmeden kalıyor.
  // Düzeltme (2026-09 denetim): önceki "— Yol Tarifi" suffix'i kendi
  // uzunluğuyla 60 altındaydı ama root layout'un otomatik eklediği
  // " | Yol Defteri" marka ekini (14 karakter) hesaba katmamıştım — gerçek
  // render edilen title'ların 61/150'si hâlâ 60'ı aşıyordu. "Arası"
  // kelimesi (dominant sorgu deseniyle birebir eşleşiyor) korunup "Yol
  // Tarifi" suffix'i kaldırıldı — marka eki dahil en uzun başlık artık 51
  // karakter (TR) / 47 karakter (EN), hiçbiri kesilmiyor.
  //
  // Güncelleme (Search Console, 2026-09-29): "X Y arası kaç saat" sorguları
  // 3.147 gösterim / 1 tık — başlıkta süre yoktu. Süre de başlığa ekleniyor;
  // marka eki (" | Yol Defteri", 14 karakter) dahil 60'ı aşmamak için
  // adaylar uzundan kısaya deneniyor, sığan ilk başlık kullanılıyor.
  const roundedKm = Math.round(data.distanceKm);
  const { cityA, cityB } = data;
  const h = Math.floor(data.durationMin / 60);
  const m = data.durationMin % 60;
  const MAX_TITLE = 60 - " | Yol Defteri".length;
  const titleCandidates =
    locale === "tr"
      ? [
          `${cityA.name} - ${cityB.name} Arası ${roundedKm} Km, ${[h > 0 ? `${h} Saat` : null, m > 0 ? `${m} Dk` : null].filter(Boolean).join(" ")}`,
          `${cityA.name} - ${cityB.name} Arası ${roundedKm} Km, ${[h > 0 ? `${h} Sa` : null, m > 0 ? `${m} Dk` : null].filter(Boolean).join(" ")}`,
          `${cityA.name} - ${cityB.name} ${roundedKm} Km, ${[h > 0 ? `${h} Saat` : null, m > 0 ? `${m} Dk` : null].filter(Boolean).join(" ")}`,
          `${cityA.name} - ${cityB.name} Arası ${roundedKm} Km`,
        ]
      : [
          `${cityA.name} to ${cityB.name}: ${roundedKm} km, ${[h > 0 ? `${h}h` : null, m > 0 ? `${m}min` : null].filter(Boolean).join(" ")} Drive`,
          `${cityA.name} to ${cityB.name}: ${roundedKm} km`,
        ];
  const title = titleCandidates.find((t) => t.length <= MAX_TITLE) ?? titleCandidates[titleCandidates.length - 1];
  // Açıklama: ~155 karakterde kesilmemesi için kısa; km + süre + ters yön
  // (ters sorgular binlerce gösterim alıyor) + Google'ın cevap kutusunun
  // vermediği şeyler (güzergah, gezi önerileri) tıklama sebebi olarak.
  // Mapbox yol adları gürültülü/tekrarlı olduğu için açıklamaya konmuyor.
  // Yol üstü şehir varsa (gerçek güzergahtan hesaplanan) o da ekleniyor —
  // parçalar sırayla, 155'i aşmayanlar eklenerek birleştiriyor.
  const durationText = formatDuration(data.durationMin, locale);
  const stopNames = data.stopCities.slice(0, 3).map((s) => s.city.name).join(", ");
  const descriptionParts =
    locale === "tr"
      ? [
          `${cityA.name} ${cityB.name} arası karayoluyla ${roundedKm} km, arabayla yaklaşık ${durationText}.`,
          stopNames ? ` Yol üstü: ${stopNames}.` : "",
          ` ${cityB.name} ${cityA.name} yönü, güzergah ve gezilecek yerler.`,
        ]
      : [
          `${cityA.name} to ${cityB.name} is ${roundedKm} km by road, about ${durationText} by car.`,
          stopNames ? ` On the way: ${stopNames}.` : "",
          ` Route, stops and places to see.`,
        ];
  const description = descriptionParts.reduce((acc, part) => (acc.length + part.length <= 155 ? acc + part : acc), "");

  return {
    title,
    description,
    robots: buildRobots(locale),
    alternates: buildAlternates(locale, `/mesafe/${data.slug}`),
    ...buildPageSocialMeta(locale, `/mesafe/${data.slug}`, title, description),
  };
}

export default async function DistancePage(props: { params: Promise<{ pair: string; locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const data = getDistancePageData(params.pair);

  if (!data) {
    notFound();
  }

  const { cityA, cityB, distanceKm, durationMin, majorRoads, stopCities, stopAttractions } = data;
  const description = buildDistanceDescription(data, locale);
  // Madde 84 tutarlılığı — mesafe sayfaları önceden ilgili rehber
  // makalelerine hiç link vermiyordu (şehir sayfalarında zaten vardı).
  // İki şehrin relatedCitySlugs eşleşen makaleleri birleştirilip
  // tekilleştiriliyor — boşsa hiç render edilmiyor, uydurma link yok.
  const relatedGuides = [...getGuidesForCity(cityA.slug), ...getGuidesForCity(cityB.slug)].filter(
    (g, i, arr) => arr.findIndex((g2) => g2.slug === g.slug) === i
  );
  const directionsUrl = buildStopDirectionsUrl(cityB.location, cityA.location, "driving");
  const hours = Math.floor(durationMin / 60);
  const minutes = durationMin % 60;
  const durationLabel =
    locale === "tr"
      ? [hours > 0 ? `${hours} sa` : null, minutes > 0 ? `${minutes} dk` : null].filter(Boolean).join(" ")
      : [hours > 0 ? `${hours}h` : null, minutes > 0 ? `${minutes}min` : null].filter(Boolean).join(" ");

  // Google bu sorgu tipinde ("X-Y arası kaç km") kendi AI özetini gösteriyor
  // — bu şema, o özetin/People-Also-Ask'ın kaynağı olma ihtimalimizi
  // artırmak için. Cevap tamamen gerçek Mapbox verisinden (distanceKm/
  // durationLabel), uydurma değil.
  //
  // Güncelleme (Search Console, 2026-09-29): sorguların üç ana kalıbı var —
  // "kaç km", "kaç saat" ve ters yön ("mardin gaziantep" = ~760 gösterim).
  // Her biri ayrı soru; aynı liste sayfada görünür SSS olarak da render
  // ediliyor (Google, şemadaki içeriğin sayfada da görünmesini istiyor).
  const durationText = formatDuration(durationMin, locale);
  // Yakıt: fiyat değil litre — pompa fiyatı haftalık değişiyor, sayfaya
  // yazılan TL tutarı hızla yanlışa dönerdi. 7 L/100 km, binek araç için
  // yuvarlak bir varsayım ve sayfada açıkça belirtiliyor.
  const FUEL_L_PER_100KM = 7;
  const fuelLiters = Math.round((distanceKm * FUEL_L_PER_100KM) / 100);
  // 2,5 saatten uzun yolculukta rotanın ortasına en yakın yol üstü şehir
  // mola önerisi olarak gösteriliyor (gerçek güzergah verisinden).
  const breakStop =
    durationMin >= 150 && stopCities.length > 0
      ? stopCities.reduce((best, s) =>
          Math.abs(s.kmFromA - distanceKm / 2) < Math.abs(best.kmFromA - distanceKm / 2) ? s : best
        )
      : undefined;
  const stopNamesText = stopCities.map((s) => translateDataText(s.city.name, locale)).join(", ");
  const faqItems =
    locale === "tr"
      ? [
          {
            q: `${cityA.name} ile ${cityB.name} arası kaç km?`,
            a: `${cityA.name} ile ${cityB.name} arası karayoluyla yaklaşık ${distanceKm} km, ortalama sürüş süresi ${durationText}.`,
          },
          {
            q: `${cityA.name} ${cityB.name} arası arabayla kaç saat sürer?`,
            a: `Normal trafik koşullarında ${cityA.name} ile ${cityB.name} arası arabayla yaklaşık ${durationText} sürüyor. Mola ve trafik durumuna göre süre uzayabilir.`,
          },
          {
            q: `${cityB.name} ile ${cityA.name} arası kaç km?`,
            a: `${cityB.name} - ${cityA.name} yönünde de mesafe aynı: karayoluyla yaklaşık ${distanceKm} km, ortalama sürüş süresi ${durationText}.`,
          },
          ...(stopCities.length > 0
            ? [
                {
                  q: `${cityA.name} ${cityB.name} yolu üzerinde hangi şehirler var?`,
                  a: `${cityA.name} - ${cityB.name} karayolu güzergahı ${stopNamesText} üzerinden ya da yakınından geçiyor.${breakStop ? ` Yolun ortalarındaki ${breakStop.city.name}, mola vermek için uygun bir ara durak.` : ""}`,
                },
              ]
            : []),
        ]
      : [
          {
            q: `How many km between ${cityA.name} and ${cityB.name}?`,
            a: `${cityA.name} and ${cityB.name} are approximately ${distanceKm} km apart by road, roughly ${durationText} by car.`,
          },
          {
            q: `How long is the drive from ${cityA.name} to ${cityB.name}?`,
            a: `Under normal traffic the drive takes about ${durationText}; breaks and traffic can add to it.`,
          },
          {
            q: `How far is ${cityB.name} from ${cityA.name}?`,
            a: `The distance is the same in the ${cityB.name} to ${cityA.name} direction: about ${distanceKm} km, roughly ${durationText} by car.`,
          },
          ...(stopCities.length > 0
            ? [
                {
                  q: `Which cities are on the way from ${cityA.name} to ${cityB.name}?`,
                  a: `The driving route passes through or near ${stopNamesText}.${breakStop ? ` ${translateDataText(breakStop.city.name, locale)}, around the midpoint, is a good place for a break.` : ""}`,
                },
              ]
            : []),
        ];
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
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Breadcrumbs
        withSchema
        items={[
          { label: locale === "tr" ? "Ana Sayfa" : "Home", href: `/${locale}` },
          { label: locale === "tr" ? "Mesafeler" : "Distances", href: `/${locale}/mesafe` },
          { label: `${translateDataText(cityA.name, locale)} - ${translateDataText(cityB.name, locale)}` },
        ]}
      />
      <Link
        href={`/${locale}/bolgeler/${cityA.regionSlug}/${cityA.slug}`}
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-ink/65 hover:text-kiremit transition-colors"
      >
        <ArrowLeft size={15} /> {translateDataText(cityA.name, locale)}
      </Link>

      <h1 className="font-display text-3xl italic text-ink sm:text-4xl mb-6">
        {locale === "tr"
          ? `${cityA.name} - ${cityB.name} Arası Kaç Km?`
          : `${cityA.name} to ${cityB.name} Distance`}
      </h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-ink/10 bg-paper p-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-kiremit mb-1 flex items-center gap-1.5">
            <RouteIcon size={13} /> {locale === "tr" ? "Mesafe" : "Distance"}
          </div>
          <p className="text-lg font-bold text-ink">{distanceKm} km</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper p-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-kiremit mb-1 flex items-center gap-1.5">
            <Clock size={13} /> {locale === "tr" ? "Sürüş Süresi" : "Drive Time"}
          </div>
          <p className="text-lg font-bold text-ink">{durationLabel}</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper p-4 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-kiremit mb-1 flex items-center gap-1.5">
            <Fuel size={13} /> {locale === "tr" ? "Yakıt" : "Fuel"}
          </div>
          <p className="text-lg font-bold text-ink">~{fuelLiters} L</p>
          <p className="text-[11px] text-ink/55">
            {locale === "tr" ? `${FUEL_L_PER_100KM} L/100 km araçla` : `at ${FUEL_L_PER_100KM} L/100 km`}
          </p>
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg bg-kiremit px-4 py-4 text-sm font-bold text-paper shadow-sm hover:bg-kiremit/90 transition-colors"
        >
          <MapPin size={16} /> {locale === "tr" ? "Yol Tarifi Al" : "Get Directions"}
        </a>
      </div>

      <p className="text-base text-ink/80 leading-relaxed mb-8">{description}</p>

      {majorRoads.length > 0 && (
        <div className="mb-10 rounded-lg border border-ink/10 bg-safran/5 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-kiremit mb-2">
            {locale === "tr" ? "Güzergah Üzerindeki Ana Yollar" : "Main Roads on This Route"}
          </div>
          <p className="text-sm text-ink/75">{majorRoads.join(", ")}</p>
        </div>
      )}

      {stopCities.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-kiremit">
            {locale === "tr" ? "Yol Üstü Duraklar" : "Stops on the Way"}
          </h2>
          <ol className="relative border-l-2 border-kiremit/25 pl-5 space-y-3">
            {[
              { city: cityA, kmFromA: 0 },
              ...stopCities,
              { city: cityB, kmFromA: Math.round(distanceKm) },
            ].map((s, i, arr) => {
              const isEndpoint = i === 0 || i === arr.length - 1;
              return (
                <li key={s.city.slug} className="relative">
                  <span
                    className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-paper ${isEndpoint ? "bg-kiremit" : "bg-safran"}`}
                  />
                  <Link
                    href={`/${locale}/bolgeler/${s.city.regionSlug}/${s.city.slug}`}
                    className={`text-sm hover:text-kiremit transition-colors ${isEndpoint ? "font-bold text-ink" : "font-semibold text-ink/80"}`}
                  >
                    {translateDataText(s.city.name, locale)}
                  </Link>
                  <span className="ml-2 text-xs text-ink/55">{s.kmFromA} km</span>
                </li>
              );
            })}
          </ol>
          {breakStop && (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-safran/10 p-3 text-sm text-ink/80">
              <Coffee size={16} className="mt-0.5 shrink-0 text-kiremit" />
              {locale === "tr"
                ? `${durationText} süren bu yolculukta, yolun ortalarındaki ${breakStop.city.name} (${breakStop.kmFromA}. km) mola vermek için uygun bir ara durak.`
                : `On this ${durationText} drive, ${translateDataText(breakStop.city.name, locale)} (km ${breakStop.kmFromA}), around the midpoint, is a good place for a break.`}
            </p>
          )}
          <p className="mt-3 text-xs text-ink/50">
            {locale === "tr"
              ? "Duraklar, gerçek karayolu güzergahının içinden ya da yakınından geçtiği şehirlerdir; km değerleri yaklaşıktır."
              : "Stops are cities the actual driving route passes through or near; km values are approximate."}
          </p>
        </div>
      )}

      {stopAttractions.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-kiremit">
            {locale === "tr" ? "Yol Üstünde Görülecek Yerler" : "Places to See on the Way"}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {stopAttractions.map((s) => (
              <Link
                key={`${s.city.slug}-${s.attraction.id}`}
                href={`/${locale}/bolgeler/${s.city.regionSlug}/${s.city.slug}`}
                className="group rounded-xl border border-ink/8 bg-paper p-4 shadow-sm hover:border-kiremit/40 transition-colors"
              >
                <span className="block text-sm font-bold text-ink group-hover:text-kiremit transition-colors">
                  {translateDataText(s.attraction.name, locale)}
                </span>
                <span className="block text-xs text-ink/55 mt-0.5">
                  {translateDataText(s.city.name, locale)} ·{" "}
                  {locale === "tr"
                    ? `${s.kmFromA}. km civarı, yoldan ~${Math.max(1, Math.round(s.offsetKm))} km`
                    : `around km ${s.kmFromA}, ~${Math.max(1, Math.round(s.offsetKm))} km off the road`}
                </span>
                <span className="block text-xs text-ink/70 mt-1.5 line-clamp-2">
                  {translateDataText(s.attraction.description, locale)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-10">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-kiremit">
          {locale === "tr" ? "Varınca Gezilecek Yerler" : "What to See at Each End"}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[cityB, cityA].map((city) => {
            const top = getTopAttractions(city, 3);
            if (top.length === 0) return null;
            return (
              <div key={city.slug}>
                <Link
                  href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}`}
                  className="text-sm font-bold text-ink hover:text-kiremit transition-colors"
                >
                  {locale === "tr"
                    ? `${city.name} gezilecek yerler`
                    : `Things to do in ${translateDataText(city.name, locale)}`}
                </Link>
                <ul className="mt-2 space-y-1.5">
                  {top.map((a) => (
                    <li key={a.id} className="text-sm text-ink/75">
                      <span className="font-semibold text-ink/85">{translateDataText(a.name, locale)}</span>
                      <span className="block text-xs text-ink/60 line-clamp-1">
                        {translateDataText(a.description, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-kiremit">
          {locale === "tr" ? "Sık Sorulan Sorular" : "Frequently Asked Questions"}
        </h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.q}>
              <h3 className="text-base font-bold text-ink">{item.q}</h3>
              <p className="mt-1 text-sm text-ink/75 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      <AdSlot />

      <Link
        href={`/${locale}/mesafe`}
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-kiremit hover:underline"
      >
        <RouteIcon size={14} /> {locale === "tr" ? "Tüm şehirler arası mesafe tablosu" : "All city-to-city distances"}
      </Link>

      <div className="mt-12 border-t border-ink/10 pt-8">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-kiremit">
          {locale === "tr" ? "İlgili Şehirler" : "Related Cities"}
        </h2>
        <div className="flex flex-wrap gap-3">
          {[cityA, cityB].map((city) => (
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

      {relatedGuides.length > 0 && (
        <div className="mt-12 border-t border-ink/10 pt-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-kiremit">
            {locale === "tr" ? "İlgili Rehberler" : "Related Guides"}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {relatedGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/${locale}/rehberler/${guide.slug}`}
                className="group flex items-start gap-3 rounded-xl border border-ink/8 bg-paper p-4 shadow-sm hover:border-kiremit/40 transition-colors"
              >
                <BookOpen size={18} className="mt-0.5 shrink-0 text-kiremit" />
                <span>
                  <span className="block text-sm font-bold text-ink group-hover:text-kiremit transition-colors">
                    {guide.title}
                  </span>
                  <span className="block text-xs text-ink/65 mt-0.5 line-clamp-2">{guide.summary}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
