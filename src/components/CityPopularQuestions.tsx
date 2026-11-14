import Link from "@/components/PlainLink";
import type { City } from "@/lib/types";
import { CITY_CODES } from "@/lib/data/cityCodes";
import { getCityKnownFor } from "@/lib/data/knownFor";
import { getCityAirports, airportFrom, airportSlug } from "@/lib/data/airports";
import { getAirportPageSlugs } from "@/lib/data/airportTransfers";
import { getDistanceLinksForCity, formatDuration } from "@/lib/data/distances";
import { ablative, dative } from "@/lib/trSuffix";
import { withLocative } from "@/lib/turkish";
import { getProvinceFacts } from "@/components/CityProvinceFacts";
import { haversineDistanceKm } from "@/lib/geo";
import { getDayTripSlugs } from "@/lib/data/dayTrips";

// "X plaka kodu", "X alan kodu", "X hangi bölgede", "İstanbul'dan X kaç km",
// "X neyle ünlü", "X'e en yakın havalimanı" gibi şehir hakkında en çok aranan,
// kısa cevaplı sorular (2026-11-02). Her cevap mevcut gerçek veriden; sayfada
// görünür metin olarak sunulur (FAQ şeması FAQSection'da zaten var).
const HUBS = [
  { slug: "istanbul", name: "İstanbul" },
  { slug: "ankara", name: "Ankara" },
  { slug: "izmir", name: "İzmir" },
];

function firstSentences(text: string, n: number) {
  const parts = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return parts.slice(0, n).join(" ").trim();
}

export interface PopularQA {
  q: string;
  a: string;
  href?: string; // cevabın altında gösterilecek iç bağlantı (yalnızca görünür metinde)
  linkLabel?: string;
}

// Hem görünür bölümde hem FAQPage şemasında (FAQSection.extraFaqs) kullanılır;
// cevaplar düz metindir, sayfada görünen metinle birebir aynıdır.
export function buildPopularQA(city: City, locale: string): PopularQA[] {
  const codes = CITY_CODES[city.slug];
  const links = getDistanceLinksForCity(city.slug);
  const known = getCityKnownFor(city.slug);
  const airports = getCityAirports(city.slug);
  const isDistrict = Boolean(codes) && codes[0] !== city.name;

  const qa: PopularQA[] = [];

  if (codes) {
    const [province, plate, area] = codes;
    const plateText = String(plate).padStart(2, "0");
    qa.push({
      q: `${city.name} plaka kodu kaç?`,
      a: isDistrict
        ? `${city.name}, ${province} iline bağlıdır; araç plaka kodu ${plateText}'dir.`
        : `${city.name} plaka kodu ${plateText}'dir.`,
    });
    qa.push({
      q: `${city.name} telefon alan kodu kaç?`,
      a: isDistrict
        ? `${city.name} için telefon alan kodu ${area} (${province} il kodu).`
        : `${city.name} telefon alan kodu ${area}.`,
    });
  }

  qa.push({
    q: isDistrict && codes ? `${city.name} hangi ilde, hangi bölgede?` : `${city.name} hangi bölgede?`,
    a:
      isDistrict && codes
        ? `${city.name}, ${codes[0]} iline bağlıdır ve ${city.region} bölgesinde yer alır.`
        : `${city.name}, ${city.region} bölgesinde yer alır.`,
  });

  if (known) {
    qa.push({ q: `${city.name} neyle ünlü, ne meşhur?`, a: firstSentences(known, 3) });
  }

  for (const h of HUBS) {
    if (h.slug === city.slug) continue;
    const l = links.find((x) => x.otherCitySlug === h.slug);
    if (!l) continue;
    qa.push({
      q: `${ablative(h.name)} ${dative(city.name)} kaç km, kaç saat?`,
      a: `${h.name} ile ${city.name} arası karayoluyla yaklaşık ${Math.round(l.distanceKm)} km, arabayla trafiksiz yaklaşık ${formatDuration(l.durationMin, "tr")}.`,
      href: `/${locale}/mesafe/${l.slug}`,
      linkLabel: "Yol tarifi ve güzergah →",
    });
  }

  const pf = getProvinceFacts(city);
  if (pf) {
    const { f } = pf;
    qa.push({
      q: `${city.name} nüfusu kaç?`,
      a: `${city.name} ilinin nüfusu ${f.pop.toLocaleString("tr-TR")} (TÜİK, Adrese Dayalı Nüfus Kayıt Sistemi, 2025 sonu).`,
    });
    qa.push({
      q: `${city.name} kaç ilçesi var, ilçeleri nelerdir?`,
      a: `${city.name} ${f.districts.length} ilçeden oluşur: ${f.districts.join(", ")}.`,
    });
    if (f.neighbors.length > 0) {
      qa.push({
        q: `${city.name} komşu illeri hangileri?`,
        a: `${city.name}, ${f.neighbors.length} il ile komşudur: ${f.neighbors.join(", ")}.`,
      });
    }
    const gifts = [...(f.gi.elsanati ?? []).slice(0, 3), ...(f.gi.tatli ?? []).slice(0, 3)].map((x) => x.n);
    if (gifts.length > 0) {
      qa.push({
        q: `${withLocative(city.name)} hediyelik ne alınır?`,
        a: `Tescilli yöresel ürünler arasından hediyelik olarak öne çıkanlar: ${gifts.join(", ")}. Tüm liste sayfadaki ürünler bölümünde.`,
      });
    }
  }

  if (airports.length > 0) {
    const a = airports[0];
    const km = Math.round(a.distanceKm);
    const aPageOk = getAirportPageSlugs().includes(airportSlug(a.airport));
    qa.push({
      q: `${airportFrom(a.airport)} ${city.name} şehir merkezine nasıl gidilir?`,
      a: `${airportFrom(a.airport)} ${city.name} merkezine karayoluyla yaklaşık ${km} km; taksi, özel transfer veya kiralık araçla trafiksiz yaklaşık ${formatDuration(a.durationMin, "tr")} sürer. Toplu taşıma hatları, seferler ve ücretler sık değiştiği için havalimanının güncel duyurularına bakmanız önerilir.`,
      href: aPageOk ? `/${locale}/havalimani/${airportSlug(a.airport)}` : `/${locale}/havalimani`,
      linkLabel: "Havalimanı ulaşım sayfası →",
    });
    qa.push({
      q: `${airportFrom(a.airport)} ${city.name} merkezine taksiyle kaç dakika?`,
      a: `Trafiksiz yaklaşık ${formatDuration(a.durationMin, "tr")} (${km} km). Yoğun saatlerde, yaz sezonunda ve hava koşullarında süre uzayabilir.`,
    });
    qa.push({
      q: `${city.name} en yakın havalimanı hangisi?`,
      a: `${city.name} için en yakın havalimanı ${a.airport.name} (${a.airport.iata}): karayoluyla yaklaşık ${Math.round(a.distanceKm)} km, ${formatDuration(a.durationMin, "tr")}.`,
    });
  }

  if (city.bestDuration) qa.push({ q: `${city.name} kaç günde gezilir?`, a: city.bestDuration });
  if (city.whenToGo) qa.push({ q: `${dative(city.name)} hangi ay gidilir?`, a: city.whenToGo });
  if (city.attractions.length > 0) {
    qa.push({
      q: `${withLocative(city.name)} ne yapılır, nereler gezilir?`,
      a: `Öne çıkan yerler: ${city.attractions.slice(0, 5).map((x) => x.name).join(", ")}.`,
    });
  }

  // "X'te araba kiralamak gerekli mi?" — gerçek veriden: öne çıkan yerlerin
  // şehir merkezine uzaklığı. Kesin hüküm değil, veriye dayalı yönlendirme.
  const spots = city.attractions.slice(0, 8).filter((a) => a.location);
  if (spots.length >= 3) {
    const far = Math.max(...spots.map((a) => haversineDistanceKm(city.location, a.location)));
    const farKm = Math.round(far);
    qa.push({
      q: `${withLocative(city.name)} araba kiralamak gerekli mi?`,
      a:
        far <= 8
          ? `${city.name} için öne çıkan yerlerin çoğu merkeze yakın (merkezden en uzağı yaklaşık ${farKm} km); merkezde yürüyerek ve toplu taşımayla gezmek mümkündür. Çevre şehirlere ve günübirlik rotalara çıkmayı planlıyorsanız araç yine de zaman kazandırır.`
          : `${city.name} için öne çıkan yerler geniş bir alana yayılıyor (merkezden en uzağı yaklaşık ${farKm} km). Birden fazla noktayı aynı gün görmek için araçla gezmek çoğu zaman daha pratiktir; sadece merkezde kalacaksanız toplu taşıma da yeterli olabilir.`,
    });
  }

  const dayTrips = links.filter((l) => l.durationMin <= 180).slice(0, 4);
  if (dayTrips.length >= 2) {
    qa.push({
      q: `${ablative(city.name)} günübirlik nereye gidilir?`,
      a: `Arabayla 3 saate kadar ulaşılan en yakın rotalar: ${dayTrips.map((l) => `${l.otherCityName} (${Math.round(l.distanceKm)} km, ${formatDuration(l.durationMin, "tr")})`).join(", ")}.`,
      href: getDayTripSlugs().includes(city.slug) ? `/${locale}/gunubirlik/${city.slug}` : undefined,
      linkLabel: "Tüm günübirlik rotalar →",
    });
  }

  return qa;
}

export default function CityPopularQuestions({ city, locale }: { city: City; locale: string }) {
  const qa = buildPopularQA(city, locale);
  if (qa.length < 4) return null;

  return (
    <section className="mt-16 border-t border-ink/10 pt-16">
      <h2 className="mb-6 font-display text-3xl italic text-ink">{city.name} Hakkında En Çok Sorulanlar</h2>
      <dl className="grid gap-4 md:grid-cols-2">
        {qa.map((item) => (
          <div key={item.q} className="rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
            <dt className="text-base font-bold text-ink">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-ink/75">
              {item.a}
              {item.href && (
                <>
                  {" "}
                  <Link href={item.href} className="font-semibold text-kiremit hover:underline">
                    {item.linkLabel ?? "Devamı →"}
                  </Link>
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
