import Link from "@/components/PlainLink";
import { Route as RouteIcon, Clock, Fuel, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta } from "@/lib/i18n";
import { formatDuration, getTopAttractions, withColloquial, colloquialName } from "@/lib/data/distances";
import { allCities } from "@/lib/data/cities";
import { getPlacePairsForPlace, type PlacePairData } from "@/lib/data/placePairs";
import FuelCostCalculator from "@/components/FuelCostCalculator";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";
import { buildStopDirectionsUrl, haversineDistanceKm } from "@/lib/geo";
import { ablative, dative } from "@/lib/trSuffix";
import { jsonLd } from "@/lib/jsonLd";

// Merkez şehir -> tatil yeri mesafe sayfası (bkz. lib/data/placePairs.ts).
// Gerçek rota verisi (km, süre, ana yollar, kuş uçuşu mesafe, ortalama hız),
// yakıt hesabı, ulaşım seçenekleri, varış noktası ve bağlı il rehberi,
// aynı tatil yerine diğer şehirlerden mesafeler ve SSS.
const FUEL_L_PER_100KM = 7;

function titleParts(d: PlacePairData) {
  const km = Math.round(d.distanceKm);
  const h = Math.floor(d.durationMin / 60);
  const m = d.durationMin % 60;
  const short = [h > 0 ? `${h} Sa` : null, m > 0 ? `${m} Dk` : null].filter(Boolean).join(" ");
  const long = [h > 0 ? `${h} Saat` : null, m > 0 ? `${m} Dk` : null].filter(Boolean).join(" ");
  return { km, short, long };
}

export function buildPlaceDistanceMetadata(d: PlacePairData, locale: Locale): Metadata {
  const { km, short, long } = titleParts(d);
  const pair = `${d.city.name} - ${d.place.name}`;
  const candidates = [
    `${pair} Arası Kaç Km, Kaç Saat? ${km} Km, ${short}`,
    `${pair} Arası Kaç Km? ${km} Km, ${long}`,
    `${pair} Arası Kaç Km? ${km} Km, ${short}`,
    `${pair} Arası Kaç Km? ${km} Km`,
  ];
  const title = locale === "tr" ? candidates.find((t) => t.length <= 60) ?? candidates[candidates.length - 1] : `${d.city.name} to ${d.place.name}: ${km} km`;
  const liters = Math.round((d.distanceKm * FUEL_L_PER_100KM) / 100);
  const durationText = formatDuration(d.durationMin, locale);
  const descriptionParts =
    locale === "tr"
      ? [
          `${d.city.name} ${d.place.name} arası kaç km? Karayoluyla ${km} km (${km} kilometre), arabayla ~${durationText}.`,
          ` En kısa yol tarifi, ~${liters} L yakıt ve ${d.place.name} (${d.place.province}) güzergahı.`,
        ]
      : [
          `${d.city.name} to ${d.place.name}: ${km} km by road, about ${durationText} by car.`,
        ];
  const description = descriptionParts.reduce((acc, part) => (acc.length + part.length <= 160 ? acc + part : acc), "");
  const path = `/mesafe/${d.slug}`;
  return {
    title: locale === "tr" ? { absolute: title } : title,
    description,
    robots: buildRobots(locale),
    alternates: buildAlternates(locale, path),
    ...buildPageSocialMeta(locale, path, title, description),
  };
}

export default function PlaceDistanceView({ data, locale }: { data: PlacePairData; locale: Locale }) {
  const isTr = locale === "tr";
  const { city, place, distanceKm, durationMin, majorRoads } = data;
  const duration = formatDuration(durationMin, locale);
  const liters = Math.round((distanceKm * FUEL_L_PER_100KM) / 100);
  const liters5 = Math.round((distanceKm * 5) / 100);
  const liters9 = Math.round((distanceKm * 9) / 100);
  const avgSpeed = Math.round(distanceKm / (durationMin / 60));
  const airKm = Math.round(haversineDistanceKm(city.location, { lat: place.lat, lng: place.lng }));
  const others = getPlacePairsForPlace(place.slug).filter((o) => o.slug !== data.slug).slice(0, 8);
  const directionsUrl = buildStopDirectionsUrl({ lat: place.lat, lng: place.lng }, city.location, "driving");

  const parentCity = allCities.find((c) => c.slug === place.citySlug);
  const topPlaceCityAttractions = parentCity ? getTopAttractions(parentCity, 3) : [];
  const topOriginAttractions = getTopAttractions(city, 3);

  const faqItems = isTr
    ? [
        {
          q: `${city.name} ${place.name} arası kaç km (kaç kilometre)?`,
          a: `${withColloquial(city)} ile ${place.name} (${place.province}) arası karayoluyla yaklaşık ${distanceKm.toLocaleString("tr-TR")} km (${Math.round(distanceKm)} kilometre). İki nokta arasındaki kuş uçuşu mesafe ise yaklaşık ${airKm} km'dir.`,
        },
        {
          q: `${city.name} ${place.name} arası arabayla kaç saat sürer?`,
          a: `Trafiksiz ortalama sürüş süresi yaklaşık ${duration} (ortalama ${avgSpeed} km/sa hızla). Mola, yaz sezonu yoğunluğu ve trafik süreyi uzatabilir.`,
        },
        {
          q: `${place.name} ${city.name} arası dönüş yolu kaç km?`,
          a: `Dönüş yönünde (${place.name} - ${city.name}) de aynı karayolu güzergahı kullanılır; mesafe yaklaşık ${distanceKm.toLocaleString("tr-TR")} km ve sürüş süresi ortalama ${duration} civarındadır.`,
        },
        ...(majorRoads.length > 0
          ? [
              {
                q: `${city.name} ${place.name} yol tarifi hangi güzergahtan gidiliyor?`,
                a: `${ablative(city.name)} ${dative(place.name)} giderken güzergahın büyük bölümü ${majorRoads.slice(0, 3).join(", ")} üzerinden geçiyor.`,
              },
            ]
          : []),
        {
          q: `${city.name} ${place.name} arası kaç litre yakıt yakar?`,
          a: `100 km'de 5 L yakan araçla ~${liters5} L, 7 L yakan binek araçla ~${liters} L, 9 L yakan araçla ~${liters9} L yakıt tüketilir. Kendi aracınızın tüketimi ve güncel yakıt fiyatıyla aşağıdaki hesaplayıcıyı kullanabilirsiniz.`,
        },
      ]
    : [];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {faqItems.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />}
      <Breadcrumbs
        withSchema
        items={[
          { label: isTr ? "Ana Sayfa" : "Home", href: `/${locale}` },
          { label: isTr ? "Mesafeler" : "Distances", href: `/${locale}/mesafe` },
          { label: `${city.name} - ${place.name}` },
        ]}
      />
      <h1 className="mb-4 font-display text-3xl italic text-ink sm:text-4xl">
        {isTr ? `${city.name} ${place.name} Arası Kaç Km, Kaç Saat?` : `${city.name} to ${place.name}`}
      </h1>
      <p className="mb-8 text-base leading-relaxed text-ink/75">
        {isTr
          ? `${withColloquial(city)} ile ${place.name} (${place.province}) arası karayoluyla ${distanceKm.toLocaleString("tr-TR")} km (${Math.round(distanceKm)} kilometre); özel araçla trafiksiz yaklaşık ${duration} sürer (ortalama ${avgSpeed} km/sa, kuş uçuşu ${airKm} km).${place.summary ? ` ${place.summary}` : ""}`
          : `${distanceKm} km by road, about ${duration} by car.`}
      </p>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs"><RouteIcon size={12} /> {isTr ? "Mesafe" : "Distance"}</div>
          <div className="mt-1 text-lg font-bold text-ink sm:text-2xl">{Math.round(distanceKm)} km</div>
          {isTr && <div className="text-[11px] text-ink/55">Kuş uçuşu ~{airKm} km</div>}
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs"><Clock size={12} /> {isTr ? "Süre" : "Time"}</div>
          <div className="mt-1 text-sm font-bold text-ink sm:text-lg">{duration}</div>
          {isTr && <div className="text-[11px] text-ink/55">Ort. {avgSpeed} km/sa</div>}
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs"><Fuel size={12} /> {isTr ? "Yakıt" : "Fuel"}</div>
          <div className="mt-1 text-sm font-bold text-ink sm:text-lg">~{liters} L</div>
          {isTr && <div className="text-[11px] text-ink/55">7 L/100 km araçla</div>}
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg bg-kiremit px-4 py-3 text-sm font-bold text-paper shadow-sm hover:bg-kiremit/90 transition-colors"
        >
          <MapPin size={16} /> {isTr ? "Yol Tarifi Al" : "Directions"}
        </a>
      </div>

      {isTr && (
        <div className="mb-10 space-y-8">
          <section>
            <h2 className="mb-2 font-display text-2xl italic text-ink">
              {city.name} {place.name} Arası Kaç Kilometre ve Nasıl Gidilir?
            </h2>
            <p className="text-base leading-relaxed text-ink/80">
              {`${ablative(city.name)} ${dative(place.name)} (${place.province}) arabayla en kısa karayolu mesafesi ${distanceKm.toLocaleString("tr-TR")} kilometredir. `}
              {majorRoads.length > 0
                ? `Rota boyunca sürüşün büyük kısmı ${majorRoads.join(", ")} bağlantı yolları üzerinden ilerler. `
                : ""}
              {`Dönüş yönü olan ${place.name} - ${city.name} güzergahında da mesafe aynıdır ve normal trafik koşullarında yolculuk yaklaşık ${duration} sürer.${colloquialName(city) ? ` Halk arasında sıkça aranan ${colloquialName(city)} - ${place.name} hattı için de bu güzergah geçerlidir.` : ""}`}
            </p>
          </section>

          {parentCity && (
            <section>
              <h2 className="mb-2 font-display text-2xl italic text-ink">
                {city.name} ve {place.name} ({place.province}) Ulaşım ve Gezi Notları
              </h2>
              <div className="space-y-2 text-base leading-relaxed text-ink/80">
                <p>
                  {`${place.name}, ${parentCity.region} bölgesinde ${place.province} iline bağlı popüler bir turizm durağıdır. `}
                  {place.summary ? `${place.summary} ` : `${parentCity.summary} `}
                  {parentCity.whenToGo ? `Bölgeyi ziyaret etmek için en uygun dönem: ${parentCity.whenToGo}` : ""}
                </p>
                {(city.howToArrive.byAir || city.howToArrive.byBus || parentCity.howToArrive.byAir || parentCity.howToArrive.byBus) && (
                  <p>
                    {city.howToArrive.byBus ? `${city.name} çıkışlı ulaşım: ${city.howToArrive.byBus}. ` : ""}
                    {parentCity.howToArrive.byAir ? `${place.name} / ${parentCity.name} tarafında hava ulaşımı: ${parentCity.howToArrive.byAir}. ` : ""}
                    {parentCity.howToArrive.byBus ? `Otobüs ve yerel aktarma: ${parentCity.howToArrive.byBus}.` : ""}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {isTr && (
        <section className="mb-10">
          <h2 className="mb-3 font-display text-2xl italic text-ink">
            {city.name} {place.name} Arası Ne Kadar Yakıt Harcanır?
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-ink/75">
            {`${Math.round(distanceKm)} km'lik ${city.name} - ${place.name} rotasında 100 km'de 5 litre tüketen ekonomik bir araç yaklaşık ${liters5} litre, 7 litre tüketen standart bir binek araç yaklaşık ${liters} litre, 9 litre tüketen bir araç ise yaklaşık ${liters9} litre yakıt yakar. Güncel pompa fiyatına göre toplam yol maliyetinizi aşağıdan hesaplayabilirsiniz.`}
          </p>
          <FuelCostCalculator distanceKm={distanceKm} />
        </section>
      )}

      {isTr && (topPlaceCityAttractions.length > 0 || topOriginAttractions.length > 0) && (
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-kiremit">
            Rota Sonunda ve Başlangıcında Gezilecek Yerler
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {parentCity && topPlaceCityAttractions.length > 0 && (
              <div>
                <Link
                  href={`/${locale}${place.href}`}
                  className="text-sm font-bold text-ink hover:text-kiremit transition-colors"
                >
                  {`${place.name} ve ${parentCity.name} çevresinde gezilecek yerler →`}
                </Link>
                <ul className="mt-2 space-y-1.5">
                  {topPlaceCityAttractions.map((a) => (
                    <li key={a.id} className="text-sm text-ink/75">
                      <span className="font-semibold text-ink/85">{a.name}</span>
                      <span className="block text-xs text-ink/60 line-clamp-1">{a.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {topOriginAttractions.length > 0 && (
              <div>
                <Link
                  href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}`}
                  className="text-sm font-bold text-ink hover:text-kiremit transition-colors"
                >
                  {`${city.name} gezilecek yerler →`}
                </Link>
                <ul className="mt-2 space-y-1.5">
                  {topOriginAttractions.map((a) => (
                    <li key={a.id} className="text-sm text-ink/75">
                      <span className="font-semibold text-ink/85">{a.name}</span>
                      <span className="block text-xs text-ink/60 line-clamp-1">{a.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mb-10 grid gap-3 sm:grid-cols-2">
        <Link href={`/${locale}${place.href}`} className="rounded-xl border border-ink/8 bg-paper p-4 text-sm font-bold text-ink shadow-sm hover:border-kiremit/40 hover:text-kiremit">
          {isTr ? `${place.name} gezi rehberi →` : `${place.name} guide →`}
        </Link>
        <Link href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}`} className="rounded-xl border border-ink/8 bg-paper p-4 text-sm font-bold text-ink shadow-sm hover:border-kiremit/40 hover:text-kiremit">
          {isTr ? `${city.name} gezi rehberi →` : `${city.name} guide →`}
        </Link>
      </section>

      <AdSlot />

      {others.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-2xl italic text-ink">{isTr ? `Diğer şehirlerden ${place.name}` : `${place.name} from other cities`}</h2>
          <div className="flex flex-wrap gap-2">
            {others.map((o) => (
              <Link key={o.slug} href={`/${locale}/mesafe/${o.slug}`} className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-1.5 text-sm font-semibold text-ink/75 hover:border-kiremit hover:text-kiremit">
                <RouteIcon size={13} className="text-kiremit" />
                {isTr ? `${o.city.name} ${place.name} arası kaç km` : `${o.city.name} – ${place.name}`} · {Math.round(o.distanceKm)} km
              </Link>
            ))}
          </div>
        </section>
      )}

      {faqItems.length > 0 && (
        <section className="border-t border-ink/10 pt-10">
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
      )}
    </div>
  );
}
