import Link from "next/link";
import { Route as RouteIcon, Clock, Fuel, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta } from "@/lib/i18n";
import { formatDuration } from "@/lib/data/distances";
import { getPlacePairsForPlace, type PlacePairData } from "@/lib/data/placePairs";
import FuelCostCalculator from "@/components/FuelCostCalculator";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildStopDirectionsUrl } from "@/lib/geo";

// Merkez şehir -> tatil yeri mesafe sayfası (bkz. lib/data/placePairs.ts).
// Şehir çifti sayfasının sade hali: gerçek rota verisi (km, süre, ana yollar),
// yakıt, aynı tatil yerine diğer şehirlerden mesafeler ve SSS.
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
  const description =
    locale === "tr"
      ? `${d.city.name} ${d.place.name} arası kaç km? Karayoluyla ${km} km, arabayla yaklaşık ${formatDuration(d.durationMin, locale)}. ${d.place.name} (${d.place.province}) için güzergah ve yakıt hesabı.`
      : `${d.city.name} to ${d.place.name}: ${km} km by road, about ${formatDuration(d.durationMin, locale)} by car.`;
  const path = `/mesafe/${d.slug}`;
  return {
    title: locale === "tr" ? { absolute: title } : title,
    description: description.length > 158 ? description.slice(0, description.lastIndexOf(".", 155) + 1) : description,
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
  const avgSpeed = Math.round(distanceKm / (durationMin / 60));
  const others = getPlacePairsForPlace(place.slug).filter((o) => o.slug !== data.slug).slice(0, 8);
  const directionsUrl = buildStopDirectionsUrl({ lat: place.lat, lng: place.lng }, city.location, "driving");
  const placeHref = place.districtHref ?? `/bolgeler/${city.regionSlug}/${place.citySlug}`;

  const faqItems = isTr
    ? [
        {
          q: `${city.name} ${place.name} arası kaç km?`,
          a: `${city.name} ile ${place.name} (${place.province}) arası karayoluyla yaklaşık ${distanceKm.toLocaleString("tr-TR")} km.`,
        },
        {
          q: `${city.name} ${place.name} arası arabayla kaç saat?`,
          a: `Trafiksiz ortalama sürüş süresi yaklaşık ${duration}. Mola, yaz sezonu yoğunluğu ve trafik süreyi uzatabilir.`,
        },
        ...(majorRoads.length > 0
          ? [{ q: `${city.name} ${place.name} yolu hangi güzergahtan gidiliyor?`, a: `Güzergahın büyük bölümü ${majorRoads.slice(0, 3).join(", ")} üzerinden geçiyor.` }]
          : []),
        {
          q: `${city.name} ${place.name} arası kaç litre yakıt yakar?`,
          a: `100 km'de 7 litre yakan bir binek araçla tek yön yaklaşık ${liters} litre. Kendi aracınızın tüketimi ve güncel yakıt fiyatıyla aşağıdaki hesaplayıcıyı kullanabilirsiniz.`,
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
      {faqItems.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
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
          ? `${city.name} ile ${place.name} (${place.province}) arası karayoluyla ${distanceKm.toLocaleString("tr-TR")} km; arabayla trafiksiz yaklaşık ${duration} sürer (ortalama ${avgSpeed} km/sa).${place.summary ? ` ${place.summary}` : ""}`
          : `${distanceKm} km by road, about ${duration} by car.`}
      </p>

      <div className="mb-10 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs"><RouteIcon size={12} /> {isTr ? "Mesafe" : "Distance"}</div>
          <div className="mt-1 text-lg font-bold text-ink sm:text-2xl">{Math.round(distanceKm)} km</div>
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs"><Clock size={12} /> {isTr ? "Süre" : "Time"}</div>
          <div className="mt-1 text-sm font-bold text-ink sm:text-lg">{duration}</div>
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs"><Fuel size={12} /> {isTr ? "Yakıt" : "Fuel"}</div>
          <div className="mt-1 text-sm font-bold text-ink sm:text-lg">~{liters} L</div>
        </div>
      </div>

      {isTr && (
        <section className="mb-10">
          <h2 className="mb-3 font-display text-2xl italic text-ink">{city.name} {place.name} yolu nasıl gidilir?</h2>
          <p className="text-sm leading-relaxed text-ink/75">
            {majorRoads.length > 0
              ? `Karayolu güzergahının büyük bölümü ${majorRoads.join(", ")} üzerinden geçiyor. `
              : ""}
            Yol çalışmaları ve anlık trafik için yola çıkmadan önce güncel yol tarifine bakın.
          </p>
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-kiremit hover:underline">
            <MapPin size={14} /> Google Haritalar&apos;da yol tarifi
          </a>
        </section>
      )}

      {isTr && (
        <section className="mb-10">
          <h2 className="mb-3 font-display text-2xl italic text-ink">Yakıt maliyeti hesapla</h2>
          <FuelCostCalculator distanceKm={distanceKm} />
        </section>
      )}

      <section className="mb-10 grid gap-3 sm:grid-cols-2">
        <Link href={`/${locale}${placeHref}`} className="rounded-xl border border-ink/8 bg-paper p-4 text-sm font-bold text-ink shadow-sm hover:border-kiremit/40 hover:text-kiremit">
          {isTr ? `${place.name} gezi rehberi →` : `${place.name} guide →`}
        </Link>
        <Link href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}`} className="rounded-xl border border-ink/8 bg-paper p-4 text-sm font-bold text-ink shadow-sm hover:border-kiremit/40 hover:text-kiremit">
          {isTr ? `${city.name} gezi rehberi →` : `${city.name} guide →`}
        </Link>
      </section>

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
