import { notFound, permanentRedirect } from "next/navigation";
import Link from "@/components/PlainLink";
import { ArrowLeft, MapPin, Clock, Fuel, Coffee, Route as RouteIcon, Plane, Compass, Store } from "lucide-react";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta, translateDataText } from "@/lib/i18n";
import {
  getAllDistancePageData,
  getDistancePageData,
  buildDistanceDescription,
  formatDuration,
  getTopAttractions,
  buildDistanceSections,
  getDistanceLinksForCity,
  colloquialName,
  withColloquial,
  CITY_TABLE_MIN_ROWS,
} from "@/lib/data/distances";
import { getGuidesCoveringPair } from "@/lib/data/guideLinks";
import FuelCostCalculator from "@/components/FuelCostCalculator";
import { buildStopDirectionsUrl } from "@/lib/geo";
import { getGuidesForCity } from "@/lib/data/guides";
import { getDayTripSlugs } from "@/lib/data/dayTrips";
import { getCityAirports, airportSlug } from "@/lib/data/airports";
import { getAirportPageSlugs } from "@/lib/data/airportTransfers";
import AdSlot from "@/components/AdSlot";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BookOpen } from "lucide-react";
import PlaceDistanceView, { buildPlaceDistanceMetadata } from "@/components/PlaceDistanceView";
import { getAllPlacePairData, getPlacePairData } from "@/lib/data/placePairs";
import { ablative, dative } from "@/lib/trSuffix";
import { jsonLd } from "@/lib/jsonLd";

// Başlık deneyi grubu: deterministik, slug'ın karakter kodları toplamının
// paritesi. GSC dışa aktarımında aynı kuralla gruplanıp karşılaştırılır.
function titleExperimentGroup(slug: string): "A" | "B" {
  let sum = 0;
  for (const ch of slug) sum += ch.charCodeAt(0);
  return sum % 2 === 1 ? "B" : "A";
}

export async function generateStaticParams() {
  return [...getAllDistancePageData(), ...getAllPlacePairData()].map((d) => ({ pair: d.slug }));
}

export async function generateMetadata(props: { params: Promise<{ pair: string; locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const data = getDistancePageData(params.pair);
  if (!data) {
    const placeData = getPlacePairData(params.pair);
    if (placeData) return buildPlaceDistanceMetadata(placeData, locale);
    return { title: locale === "tr" ? "Sayfa bulunamadı" : "Page not found" };
  }

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
  //
  // Güncelleme (2026-09-30, GSC + canlı SERP incelemesi): en büyük sayfalar
  // 19-20 Eylül'de ana sorgusu "X Y arası kaç km"de tamamen kayboldu
  // (gaziantep-mardin haftalık 1.324 -> 26 gösterim). Google bu sorgularda
  // artık yol tarifi kutusu + AI özeti gösterip ilk sayfada 7 organik sonuç
  // bırakıyor; o 7 sonucun hepsinin başlığında sorgunun kendisi birebir
  // geçiyor ("... Arası Kaç Km? Kaç Saat?"). Bizim başlıkta rakam vardı ama
  // "kaç km" ifadesi 9 Eylül'de çıkarılmıştı. Artık ikisi birlikte: soru
  // ifadesi + cevap (km ve süre). 60 karaktere sığması için TR'de marka eki
  // kullanılmıyor (title.absolute) — marka bu sorgularda tıklama sebebi değil.
  const roundedKm = Math.round(data.distanceKm);
  const { cityA, cityB } = data;
  const h = Math.floor(data.durationMin / 60);
  const m = data.durationMin % 60;
  const durShort = [h > 0 ? `${h} Sa` : null, m > 0 ? `${m} Dk` : null].filter(Boolean).join(" ");
  const durLong = [h > 0 ? `${h} Saat` : null, m > 0 ? `${m} Dk` : null].filter(Boolean).join(" ");
  const pairName = `${cityA.name} - ${cityB.name}`;
  const MAX_TITLE = locale === "tr" ? 60 : 60 - " | Yol Defteri".length;
  // BAŞLIK DENEYİ (2026-11-15'te başladı): 15 Kasım GSC verisi — rota sayfaları
  // 894 bin gösterim, TO %0,09; "kaç km" sorgularında %0,06. Başlık cevabın
  // tamamını (km + süre) veriyor, kullanıcı sonuç sayfasında cevabı alıp
  // tıklamıyor olabilir. Sayfaların yarısında (titleExperimentGroup === "B")
  // başlık rakam yerine sayfaya özgü değeri vaat ediyor; diğer yarı (A) aynı.
  // Değerlendirme: GSC'de iki grubun TO'su karşılaştırılır (grup kuralı:
  // slug karakter kodları toplamı tek ise B). Kazanan tüm sayfalara uygulanmalı.
  const titleCandidates =
    locale === "tr" && titleExperimentGroup(data.slug) === "B"
      ? [
          `${pairName} Arası Kaç Km, Kaç Saat? Yol Tarifi ve Yakıt Hesabı`,
          `${pairName} Arası Kaç Km, Kaç Saat? Yol Tarifi ve Yakıt`,
          `${pairName} Arası Kaç Km? Yol Tarifi ve Yakıt Hesabı`,
          `${pairName} Arası Kaç Km? Yol Tarifi`,
        ]
      : locale === "tr"
      ? [
          `${pairName} Arası Kaç Km, Kaç Saat? ${roundedKm} Km, ${durShort}`,
          `${pairName} Arası Kaç Km? ${roundedKm} Km, ${durLong}`,
          `${pairName} Arası Kaç Km? ${roundedKm} Km, ${durShort}`,
          `${pairName} Arası Kaç Km? ${roundedKm} Km`,
        ]
      : [
          `${cityA.name} to ${cityB.name}: ${roundedKm} km, ${[h > 0 ? `${h}h` : null, m > 0 ? `${m}min` : null].filter(Boolean).join(" ")} Drive`,
          `${cityA.name} to ${cityB.name}: ${roundedKm} km`,
        ];
  const title = titleCandidates.find((t) => t.length <= MAX_TITLE) ?? titleCandidates[titleCandidates.length - 1];
  // Açıklama: ~158 karakterde kesilmemesi için özlü; km + süre + halk adı
  // + Google'ın cevap kutusunun vermediği tıklama sebepleri (en kısa yol
  // tarifi, yakıt litresi, yol üstü duraklar ve ters yön).
  // Önceden 155 karakter sınırında 1133 sayfanın %80'inde yakıt/mola/yol
  // tarifi cümlesi düşüyordu; artık her sayfada tıklama gerekçesi yer alıyor.
  const durationText = formatDuration(data.durationMin, locale);
  const stopNames = data.stopCities.slice(0, 2).map((s) => s.city.name).join(", ");
  const liters = Math.round((data.distanceKm * 7) / 100);
  const hasColloquial = Boolean(colloquialName(cityA) || colloquialName(cityB));
  const colloquialPair = hasColloquial
    ? `${colloquialName(cityA) ?? cityA.name}-${colloquialName(cityB) ?? cityB.name}`
    : "";
  const descriptionParts =
    locale === "tr"
      ? [
          `${cityA.name} ${cityB.name} arası kaç km? Karayoluyla ${roundedKm} km, arabayla ~${durationText}.`,
          stopNames
            ? ` Yol tarifi, ~${liters} L yakıt ve ${stopNames} güzergahı.`
            : ` En kısa yol tarifi, ~${liters} L yakıt ve mola durakları.`,
          hasColloquial
            ? ` ${colloquialPair} kaç saat, dönüş yönü.`
            : ` ${cityB.name} ${cityA.name} kaç saat, kilometre hesabı.`,
        ]
      : [
          `${cityA.name} to ${cityB.name} is ${roundedKm} km by road, about ${durationText} by car.`,
          stopNames ? ` On the way: ${stopNames}.` : "",
          ` Route, stops and places to see.`,
        ];
  const description = descriptionParts.reduce((acc, part) => (acc.length + part.length <= 160 ? acc + part : acc), "");

  return {
    title: locale === "tr" ? { absolute: title } : title,
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
    const placeData = getPlacePairData(params.pair);
    if (placeData) return <PlaceDistanceView data={placeData} locale={locale} />;
    // Ters yön ("mardin-gaziantep") kanonik sayfaya kalıcı yönlenir. Not: statik
    // dışa aktarımda (Cloudflare, 2026-11-15) bilinmeyen slug için bu sayfa hiç
    // üretilmez; orada yönlendirmeyi src/app/not-found.tsx'teki betik yapar.
    // Bu dal, sunuculu bir ortama dönülürse diye duruyor.
    const m = params.pair.match(/^([a-z]+)-([a-z]+)$/);
    if (m) {
      const reversed = `${m[2]}-${m[1]}`;
      if (getDistancePageData(reversed) || getPlacePairData(reversed)) permanentRedirect(`/${locale}/mesafe/${reversed}`);
    }
    notFound();
  }

  const { cityA, cityB, distanceKm, durationMin, majorRoads, stopCities, stopAttractions } = data;
  const description = buildDistanceDescription(data, locale);
  // TR'de aynı gerçek veri soru başlıklı bölümlere ayrılıyor (bkz.
  // buildDistanceSections); diğer dillerde kısa özet paragrafı kalıyor.
  const sections = locale === "tr" ? buildDistanceSections(data) : [];
  // Komşu mesafe sayfalarına iç link — rakip sayfalarda 26-85 iç link varken
  // bizde 7-11 vardı; Google'ın bu sorgudaki "ilgili aramalar"ı da komşu
  // çiftler ("Batman Diyarbakır arası kaç km"). Mevcut çift hariç.
  // Önce rota bölümleri (km, süre, güzergah) — hemen ardından ana yollar ve
  // durak çizelgesi geliyor; yakıt/ulaşım/hakkında onlardan sonra.
  const routeSections = sections.filter((x) => ["km", "sure", "guzergah"].includes(x.id));
  const detailSections = sections.filter((x) => !["km", "sure", "guzergah"].includes(x.id));
  const renderSection = (section: (typeof sections)[number]) => (
    <section key={section.id}>
      <h2 className="mb-2 font-display text-xl italic text-ink sm:text-2xl">{section.heading}</h2>
      <div className="space-y-2">
        {section.paragraphs.map((text, i) => (
          <p key={i} className="text-base text-ink/80 leading-relaxed">
            {text}
          </p>
        ))}
      </div>
      {section.id === "yakit" && (
        <div className="mt-4">
          <FuelCostCalculator distanceKm={distanceKm} />
        </div>
      )}
    </section>
  );
  const otherDistances = [cityA, cityB].map((city) => {
    const allLinks = getDistanceLinksForCity(city.slug);
    return {
      city,
      totalCount: allLinks.length,
      links: allLinks
        .filter((l) => l.slug !== data.slug)
        .sort((x, y) => x.distanceKm - y.distanceKm)
        .slice(0, 8),
    };
  });
  // Madde 84 tutarlılığı — mesafe sayfaları önceden ilgili rehber
  // makalelerine hiç link vermiyordu (şehir sayfalarında zaten vardı).
  // İki şehrin relatedCitySlugs eşleşen makaleleri birleştirilip
  // tekilleştiriliyor — boşsa hiç render edilmiyor, uydurma link yok.
  const relatedGuides = [...getGuidesForCity(cityA.slug), ...getGuidesForCity(cityB.slug)].filter(
    (g, i, arr) => arr.findIndex((g2) => g2.slug === g.slug) === i
  );
  const directionsUrl = buildStopDirectionsUrl(cityB.location, cityA.location, "driving");
  const dayTripSlugSet = new Set(getDayTripSlugs());
  const dayTripCities = [cityA, cityB].filter((c) => dayTripSlugSet.has(c.slug));
  const airportSlugSet = new Set(getAirportPageSlugs());
  const routeAirports = [
    ...getCityAirports(cityA.slug).slice(0, 1).map((x) => ({ ...x, cityName: cityA.name })),
    ...getCityAirports(cityB.slug).slice(0, 1).map((x) => ({ ...x, cityName: cityB.name })),
  ].filter(
    (x, i, arr) =>
      airportSlugSet.has(airportSlug(x.airport)) &&
      arr.findIndex((y) => y.airport.iata === x.airport.iata) === i
  );
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
            q: `${cityA.name} ile ${cityB.name} arası kaç km (kaç kilometre)?`,
            a: `${cityA.name} ile ${cityB.name} arası karayoluyla yaklaşık ${distanceKm} km (${Math.round(distanceKm)} kilometre), ortalama sürüş süresi ${durationText}.`,
          },
          {
            q: `${cityA.name} ${cityB.name} arası arabayla kaç saat sürer?`,
            a: `Normal trafik koşullarında ${cityA.name} ile ${cityB.name} arası arabayla yaklaşık ${durationText} sürüyor. Mola ve trafik durumuna göre süre uzayabilir.`,
          },
          {
            q: `${cityB.name} ile ${cityA.name} arası kaç km, kaç saat?`,
            a: `${cityB.name} - ${cityA.name} yönünde de mesafe aynı: karayoluyla yaklaşık ${distanceKm} km (${Math.round(distanceKm)} kilometre), ortalama sürüş süresi ${durationText}.`,
          },
          ...(colloquialName(cityA) || colloquialName(cityB)
            ? [
                {
                  q: `${colloquialName(cityA) ?? cityA.name} ${colloquialName(cityB) ?? cityB.name} arası kaç km, kaç saat?`,
                  a: `${withColloquial(cityA)} ile ${withColloquial(cityB)} arası karayoluyla yaklaşık ${distanceKm} km; arabayla normal trafikte yaklaşık ${durationText} sürer.`,
                },
              ]
            : []),
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
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
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
          ? `${cityA.name} - ${cityB.name} Arası Kaç Km, Kaç Saat?`
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

      {sections.length > 0 ? (
        <div className="mb-10 space-y-8">{routeSections.map(renderSection)}</div>
      ) : (
        <p className="text-base text-ink/80 leading-relaxed mb-8">{description}</p>
      )}

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

      {detailSections.length > 0 && <div className="mb-10 space-y-8">{detailSections.map(renderSection)}</div>}

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

      {locale === "tr" && (
        <div className="mt-8 rounded-xl border border-ink/10 bg-gradient-to-br from-safran/10 to-kiremit/5 p-5 shadow-sm">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-kiremit">
            {cityA.name} - {cityB.name} Mola, Yemek & Konaklama Planı
          </h2>
          <p className="text-sm text-ink/80 leading-relaxed mb-3">
            Yola çıkmadan önce her iki şehirde (ve ara durakta) ne yenir, nerede kalınır inceleyebilir; günübirlik gezi ve havalimanı ulaşım rehberlerine göz atabilirsiniz:
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {[cityA, ...(breakStop ? [breakStop.city] : []), cityB].map((c) => (
              <Link
                key={`food-${c.slug}`}
                href={`/${locale}/bolgeler/${c.regionSlug}/${c.slug}#ne-yenir`}
                className="rounded-full border border-ink/15 bg-paper px-3 py-1.5 text-xs font-semibold text-ink/80 hover:border-kiremit hover:text-kiremit transition-colors"
              >
                {c.name} Ne Yenir & Nerede Kalınır?
              </Link>
            ))}
            {dayTripCities.map((c) => (
              <Link
                key={`daytrip-${c.slug}`}
                href={`/${locale}/gunubirlik/${c.slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-kiremit/30 bg-paper px-3 py-1.5 text-xs font-bold text-kiremit hover:bg-kiremit hover:text-paper transition-colors"
              >
                <Compass size={12} /> {dative(c.name)} Yakın Yerler
              </Link>
            ))}
            {routeAirports.map(({ airport, cityName, distanceKm: airKm }) => (
              <Link
                key={`air-${airport.iata}`}
                href={`/${locale}/havalimani/${airportSlug(airport)}`}
                className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-paper px-3 py-1.5 text-xs font-semibold text-ink/80 hover:border-kiremit hover:text-kiremit transition-colors"
              >
                <Plane size={12} className="text-kiremit" /> {airport.name} ({cityName}: {Math.round(airKm)} km)
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-3 text-xs text-ink/70">
            <span className="flex items-center gap-1.5">
              <Store size={14} className="shrink-0 text-kiremit" />
              <span>
                <strong>{cityA.name} – {cityB.name}</strong> güzergahında otel, kafe, restoran veya dinlenme tesisi işletiyor musunuz?
              </span>
            </span>
            <Link href="/tr/iletisim" className="font-bold text-kiremit hover:underline">
              Mekan Tanıtımı & Sponsorluk →
            </Link>
          </div>
        </div>
      )}

      <Link
        href={`/${locale}/mesafe`}
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-kiremit hover:underline"
      >
        <RouteIcon size={14} /> {locale === "tr" ? "Tüm şehirler arası mesafe tablosu" : "All city-to-city distances"}
      </Link>

      {locale === "tr" && getGuidesCoveringPair(cityA.slug, cityB.slug).length > 0 && (
        <div className="mt-10 rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-kiremit">Bu Rota İçin Rehber</h2>
          <ul className="space-y-1">
            {getGuidesCoveringPair(cityA.slug, cityB.slug).map((g) => (
              <li key={g.slug}>
                <Link href={`/${locale}/rehberler/${g.slug}`} className="text-sm font-semibold text-ink/80 hover:text-kiremit">
                  {g.title} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {otherDistances.some((g) => g.links.length > 0) && (
        <div className="mt-12 border-t border-ink/10 pt-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-kiremit">
            {locale === "tr" ? "Diğer Şehirlere Mesafeler" : "Other Distances"}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {otherDistances
              .filter((g) => g.links.length > 0)
              .map((g) => (
                <div key={g.city.slug}>
                  <h3 className="mb-2 text-sm font-bold text-ink">
                    {locale === "tr"
                      ? `${g.city.name} çıkışlı mesafeler`
                      : `From ${translateDataText(g.city.name, locale)}`}
                  </h3>
                  <ul className="divide-y divide-ink/5 text-sm">
                    {g.links.map((l) => (
                      <li key={l.slug}>
                        <Link
                          href={`/${locale}/mesafe/${l.slug}`}
                          className="flex items-center justify-between gap-3 py-2 text-ink/80 hover:text-kiremit transition-colors"
                        >
                          <span>
                            {locale === "tr"
                              ? `${g.city.name} ${l.otherCityName} arası kaç km`
                              : `${translateDataText(g.city.name, locale)} – ${translateDataText(l.otherCityName, locale)}`}
                          </span>
                          <span className="shrink-0 text-xs text-ink/60">{Math.round(l.distanceKm)} km</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {g.totalCount >= CITY_TABLE_MIN_ROWS && (
                    <Link
                      href={`/${locale}/mesafe/sehir/${g.city.slug}`}
                      className="mt-2.5 inline-block text-xs font-bold text-kiremit hover:underline"
                    >
                      {locale === "tr"
                        ? `${ablative(g.city.name)} ${g.totalCount} şehre mesafe tablosu →`
                        : `All ${g.totalCount} distances from ${translateDataText(g.city.name, locale)} →`}
                    </Link>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

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
