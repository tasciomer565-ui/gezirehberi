import Link from "@/components/PlainLink";
import { notFound } from "next/navigation";
import { Route as RouteIcon, Clock, MapPin } from "lucide-react";
import { Locale, buildAlternates, buildRobots, buildPageSocialMeta } from "@/lib/i18n";
import { getDayTrips, getDayTripSlugs, type DayTripStop } from "@/lib/data/dayTrips";
import { formatDuration } from "@/lib/data/distances";
import { ablative, dative } from "@/lib/trSuffix";
import { CITY_CODES } from "@/lib/data/cityCodes";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";
import { jsonLd } from "@/lib/jsonLd";

// "İstanbul'a yakın günübirlik gidilecek yerler" gibi gezi sorguları için
// (Search Console 2026-11-02: gezi niyetli sorgular neredeyse hiç görünmüyordu).
// Tüm km/süre değerleri sitenin gerçek rota verisinden; uydurma yer yok.
export async function generateStaticParams() {
  return getDayTripSlugs().map((city) => ({ city }));
}

// "İl" diyebilmek için durak gerçekten bir il merkezi olmalı: sitedeki şehir
// listesinde Kapadokya, Bodrum, Safranbolu gibi ilçe/bölgeler de var. Plaka
// tablosunda kendi adıyla kayıtlı olan (Kapadokya -> "Nevşehir" değil) il sayılır.
// "En yakın" km'ye göre (sayfadaki listeler sürüş süresine göre sıralı).
// Şapka farkı yok sayılır: plaka tablosunda "Hakkâri", şehir listesinde "Hakkari".
const noCircumflex = (s: string) => s.normalize("NFD").replace(/̂/g, "").normalize("NFC");
function provinceStops(stops: DayTripStop[]): DayTripStop[] {
  return stops
    .filter((s) => {
      if (s.kind !== "city") return false;
      const slug = s.href.split("/").pop() ?? "";
      const province = CITY_CODES[slug]?.[0];
      return province !== undefined && noCircumflex(province) === noCircumflex(s.name);
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

function band(stops: DayTripStop[], from: number, to: number) {
  return stops.filter((s) => s.durationMin > from && s.durationMin <= to);
}

export async function generateMetadata(props: { params: Promise<{ city: string; locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const data = getDayTrips(params.city);
  if (!data || data.stops.length < 4) return { title: locale === "tr" ? "Sayfa bulunamadı" : "Page not found" };
  const { city, stops } = data;
  const n = stops.length;
  // 2026-11-18 (GSC 15 Kasım): bu sayfalara gelen sorgular "kırşehire en yakın
  // iller", "gaziantep yakın iller", "konya yakını gezilecek yerler" — başlıkta
  // "yakın" hiç geçmiyordu. Başlık artık "X'e Yakın Yerler" ile başlıyor,
  // "günübirlik" ve gerçek rota sayısı korunuyor.
  const to = dative(city.name);
  const candidates = [
    `${to} Yakın Yerler ve İller: ${n} Günübirlik Rota, Km`,
    `${to} Yakın Yerler: ${n} Günübirlik Rota, Km ve Süre`,
    `${to} Yakın Yerler: ${n} Günübirlik Rota`,
    `${to} Yakın Günübirlik Gezi Rotaları`,
  ];
  const title = locale === "tr" ? candidates.find((t) => t.length <= 60) ?? candidates[candidates.length - 1] : `Day trips from ${city.name}`;
  const nearestCity = provinceStops(stops)[0];
  const description =
    locale === "tr"
      ? `${to} yakın ${n} yer ve il, arabayla 3 saate kadar: km ve süreleriyle günübirlik rotalar.${nearestCity ? ` En yakın il ${nearestCity.name} (${Math.round(nearestCity.distanceKm)} km, ${formatDuration(nearestCity.durationMin, locale)}).` : ""}`
      : `${n} day trips from ${city.name} within 3 hours by car, with distance and drive time.`;
  const path = `/gunubirlik/${city.slug}`;
  return {
    title: locale === "tr" ? { absolute: title } : title,
    description,
    robots: buildRobots(locale),
    alternates: buildAlternates(locale, path),
    ...buildPageSocialMeta(locale, path, title, description),
  };
}

function StopCard({ s, locale, cityName }: { s: DayTripStop; locale: Locale; cityName: string }) {
  return (
    <li className="rounded-xl border border-ink/10 bg-paper p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-bold text-ink">
          <Link href={`/${locale}${s.href}`} className="hover:text-kiremit">{s.name}</Link>
        </h3>
        <span className="flex items-center gap-3 text-xs font-semibold text-ink/70">
          <span className="flex items-center gap-1"><RouteIcon size={12} className="text-kiremit" />{Math.round(s.distanceKm)} km</span>
          <span className="flex items-center gap-1"><Clock size={12} className="text-kiremit" />{formatDuration(s.durationMin, locale)}</span>
        </span>
      </div>
      {s.attractions.length > 0 && (
        <p className="mt-2 text-sm leading-relaxed text-ink/75">
          <span className="font-semibold text-ink/85">Görülecekler: </span>
          {s.attractions.join(", ")}.
        </p>
      )}
      {s.kind === "place" && s.note && <p className="mt-2 text-sm leading-relaxed text-ink/75">{s.note}</p>}
      {s.kind === "city" && s.note && (
        <p className="mt-1 text-sm leading-relaxed text-ink/65">
          <span className="font-semibold text-ink/80">Ne zaman gidilir: </span>
          {s.note}
        </p>
      )}
      <Link href={`/${locale}/mesafe/${s.pairSlug}`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-kiremit hover:underline">
        <MapPin size={12} />
        {cityName} {s.name} arası yol tarifi ve yakıt hesabı
      </Link>
    </li>
  );
}

export default async function DayTripsPage(props: { params: Promise<{ city: string; locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const isTr = locale === "tr";
  const data = getDayTrips(params.city);
  if (!data || data.stops.length < 4) notFound();
  if (!isTr) notFound();
  const { city, stops } = data;
  const from = ablative(city.name);
  const hour1 = band(stops, 0, 60);
  const hour2 = band(stops, 60, 120);
  const hour3 = band(stops, 120, 180);
  const nearest = stops[0];
  const to = dative(city.name);
  const names = (list: DayTripStop[]) => list.slice(0, 5).map((s) => s.name).join(", ");
  // "Yakın iller" sorusu yalnızca il/şehir duraklarıyla cevaplanıyor (tatil
  // yerleri ayrı); 2 saate kadar olanlar, yoksa en yakın üç il.
  const cityStops = provinceStops(stops);
  const nearCities = cityStops.filter((s) => s.durationMin <= 120);
  const nearCityList = (nearCities.length > 0 ? nearCities : cityStops.slice(0, 3))
    .slice(0, 6)
    .map((s) => `${s.name} (${Math.round(s.distanceKm)} km)`)
    .join(", ");
  const nearestCity = cityStops[0];

  const faqItems = [
    ...(nearestCity
      ? [
          {
            q: `${to} en yakın il hangisi?`,
            a: `Karayoluyla ${to} en yakın il ${nearestCity.name}: ${Math.round(nearestCity.distanceKm)} km, trafiksiz yaklaşık ${formatDuration(nearestCity.durationMin, locale)}.`,
          },
          {
            q: `${to} yakın iller hangileri?`,
            a: `${nearCities.length > 0 ? `${from} arabayla 2 saate kadar ulaşılan iller` : `${to} en yakın iller`}: ${nearCityList}.`,
          },
        ]
      : []),
    {
      q: `${city.name} yakınında günübirlik nereye gidilir?`,
      a: `${city.name} çıkışlı, arabayla 3 saate kadar ulaşılabilecek ${stops.length} rota var. En yakınları: ${names(stops)}.`,
    },
    {
      q: `${from} 1 saatte nereye gidilir?`,
      a:
        hour1.length > 0
          ? `Karayoluyla 1 saat içinde ulaşılanlar: ${names(hour1)}.`
          : `Listedeki rotaların hiçbiri 1 saatten kısa sürmüyor; en yakını ${nearest.name}, yaklaşık ${formatDuration(nearest.durationMin, locale)}.`,
    },
    {
      q: `${city.name} çıkışlı en yakın günübirlik rota hangisi?`,
      a: `${nearest.name}: karayoluyla ${Math.round(nearest.distanceKm)} km, trafiksiz yaklaşık ${formatDuration(nearest.durationMin, locale)}.`,
    },
    {
      q: "Günübirlik gezi için kaç saatlik yol makul?",
      a: "Gidiş-dönüş yolu aynı gün yapmak için tek yön en fazla 2–2,5 saatlik sürüş genellikle makul kabul edilir; 3 saate yaklaşan rotalarda gün erken başlatılmalı ya da bir gece konaklama düşünülmelidir. Verilen süreler trafiksiz ortalamadır.",
    },
  ];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const sections: { title: string; list: DayTripStop[] }[] = [
    { title: `${from} 1 Saate Kadar Uzaklıktaki Yerler`, list: hour1 },
    { title: `${from} 1–2 Saat Uzaklıktaki Yerler`, list: hour2 },
    { title: `${from} 2–3 Saat Uzaklıktaki Yerler`, list: hour3 },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <Breadcrumbs
        withSchema
        items={[
          { label: "Ana Sayfa", href: `/${locale}` },
          { label: city.name, href: `/${locale}/bolgeler/${city.regionSlug}/${city.slug}` },
          { label: "Günübirlik Gezi" },
        ]}
      />
      <h1 className="mb-4 font-display text-3xl italic text-ink sm:text-4xl">{`${to} Yakın Yerler: Günübirlik Gidilecek ${stops.length} Rota`}</h1>
      <p className="mb-8 max-w-3xl text-base leading-relaxed text-ink/75">
        {`${city.name} çıkışlı, arabayla en fazla 3 saatte ulaşılan ${stops.length} günübirlik gezi rotası. En yakını ${nearest.name} (${Math.round(nearest.distanceKm)} km, ${formatDuration(nearest.durationMin, locale)})${nearestCity && nearestCity !== nearest ? `; ${to} en yakın il ise ${nearestCity.name} (${Math.round(nearestCity.distanceKm)} km)` : ""}. Süreler gerçek karayolu güzergahından, trafiksiz ortalama olarak hesaplanmıştır; her rotanın yol tarifine ve yakıt hesabına satırdaki bağlantıdan ulaşabilirsin.`}
      </p>

      {sections.map(
        (sec) =>
          sec.list.length > 0 && (
            <section key={sec.title} className="mb-10">
              <h2 className="mb-4 font-display text-2xl italic text-ink">{sec.title}</h2>
              <ul className="space-y-3">
                {sec.list.map((s) => (
                  <StopCard key={`${s.kind}-${s.pairSlug}`} s={s} locale={locale} cityName={city.name} />
                ))}
              </ul>
            </section>
          )
      )}

      <section className="mb-10 rounded-xl border border-ink/10 bg-paper p-5 text-sm leading-relaxed text-ink/75">
        <h2 className="mb-2 font-display text-xl italic text-ink">Günübirlik gezi planlarken</h2>
        <p>
          Gün ışığını verimli kullanmak için yola sabah erken çıkmak ve dönüş saatini baştan belirlemek önemlidir. Süreler trafiksizdir; hafta sonu ve tatil dönemlerinde büyük şehir çıkışlarında 30–60 dakika eklemek gerçekçi olur. Kış aylarında dağlık geçişlerde yol durumunu kontrol edin. Her şehrin sayfasında gezilecek yerler, ne yenir ve en iyi ziyaret zamanı bilgisi yer alır.
        </p>
      </section>

      <p className="mb-10 text-sm text-ink/65">
        <Link href={`/${locale}/bolgeler/${city.regionSlug}/${city.slug}`} className="font-bold text-kiremit hover:underline">{`${city.name} gezi rehberi →`}</Link>
        {" · "}
        <Link href={`/${locale}/mesafe/sehir/${city.slug}`} className="font-bold text-kiremit hover:underline">{`${from} illere mesafe tablosu →`}</Link>
      </p>

      <AdSlot />

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
    </div>
  );
}
