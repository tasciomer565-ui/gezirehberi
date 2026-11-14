import Link from "@/components/PlainLink";
import { MapPinned, Users, Gift } from "lucide-react";
import type { City } from "@/lib/types";
import { CITY_CODES } from "@/lib/data/cityCodes";
import { allCities } from "@/lib/data/cities";
import facts from "@/lib/data/provinceFacts.json";
import { withLocative } from "@/lib/turkish";

// "X ilçeleri", "X nüfusu", "X komşu illeri", "X hediyelik eşya / meşhur ürünleri"
// aramaları için il düzeyinde doğrulanmış bilgi (2026-11-02). Kaynaklar ve
// doğrulama adımları scripts/build-province-facts.py başlığında:
// nüfus TÜİK ADNKS 2025 (81 ilin toplamı 86.092.168 ile eşleşir), ilçeler İçişleri
// Bakanlığı verisi (973 ilçe), komşu iller il sınırı çokgenleri, ürünler Türk
// Patent ve Marka Kurumu coğrafi işaret sicili. Yalnızca il olarak modellenen
// sayfalarda gösterilir (Bodrum, Kapadokya gibi ilçe sayfalarında değil).
type Fact = {
  pop: number;
  districts: string[];
  neighbors: string[];
  giTotal: number;
  gi: Record<string, { n: string; t: "M" | "H" }[]>;
};
const FACTS = facts as unknown as Record<string, Fact>;

const fold = (s: string) =>
  s
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/[âÂ]/g, "a")
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u");

export function getProvinceFacts(city: { slug: string; name: string }): { province: string; f: Fact } | undefined {
  const row = CITY_CODES[city.slug];
  if (!row || fold(row[0]) !== fold(city.name)) return undefined;
  const key = Object.keys(FACTS).find((k) => fold(k) === fold(row[0]));
  return key ? { province: key, f: FACTS[key] } : undefined;
}

const GI_SECTIONS: { key: string; title: string }[] = [
  { key: "elsanati", title: "El sanatları, halı ve dokumalar" },
  { key: "tatli", title: "Tatlı, şekerleme ve bal" },
  { key: "sut_et", title: "Peynir, et, süt ürünleri ve yağlar" },
  { key: "meyve", title: "Meyve ve sebzeler" },
  { key: "yemek", title: "Yöresel yemekler" },
];
const MAX_PER_GROUP = 10;

export default function CityProvinceFacts({ city, locale }: { city: City; locale: string }) {
  const data = getProvinceFacts(city);
  if (!data) return null;
  const { f } = data;
  const loc = withLocative(city.name);
  const neighborLinks = f.neighbors.map((n) => {
    const target = allCities.find((c) => fold(c.name) === fold(n));
    return { name: n, href: target ? `/${locale}/bolgeler/${target.regionSlug}/${target.slug}` : undefined };
  });
  const giGroups = GI_SECTIONS.filter((s) => f.gi[s.key]?.length);

  return (
    <div className="mt-16 space-y-14 border-t border-ink/10 pt-16">
      <section>
        <h2 className="mb-2 flex items-center gap-2 font-display text-3xl italic text-ink">
          <Users className="text-kiremit" size={26} />
          {city.name} Nüfusu ve İlçeleri
        </h2>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink/75">
          {`${city.name} ilinin nüfusu ${f.pop.toLocaleString("tr-TR")} (TÜİK, Adrese Dayalı Nüfus Kayıt Sistemi, 2025 sonu). İl, merkez ilçe dahil ${f.districts.length} ilçeden oluşur.`}
        </p>
        <h3 className="mb-3 text-base font-bold text-ink">{city.name} ilçeleri</h3>
        <ul className="flex flex-wrap gap-2">
          {f.districts.map((d) => (
            <li key={d} className="rounded-full border border-ink/15 px-3 py-1 text-sm font-semibold text-ink/75">
              {d}
            </li>
          ))}
        </ul>
      </section>

      {neighborLinks.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 font-display text-3xl italic text-ink">
            <MapPinned className="text-kiremit" size={26} />
            {city.name} Komşu İlleri
          </h2>
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-ink/75">
            {`${city.name}, ${neighborLinks.length} il ile kara sınırı paylaşır: ${neighborLinks.map((n) => n.name).join(", ")}.`}
          </p>
          <ul className="flex flex-wrap gap-2">
            {neighborLinks.map((n) => (
              <li key={n.name}>
                {n.href ? (
                  <Link href={n.href} className="rounded-full border border-ink/15 px-3 py-1.5 text-sm font-semibold text-ink/75 hover:border-kiremit hover:text-kiremit">
                    {n.name}
                  </Link>
                ) : (
                  <span className="rounded-full border border-ink/15 px-3 py-1.5 text-sm font-semibold text-ink/75">{n.name}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {giGroups.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 font-display text-3xl italic text-ink">
            <Gift className="text-kiremit" size={26} />
            {loc} Hediyelik Ne Alınır? Meşhur ve Yöresel Ürünler
          </h2>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-ink/75">
            {`Türk Patent ve Marka Kurumu'nun tescilli coğrafi işaretleri arasında ${city.name} ile ilişkilendirilmiş ${f.giTotal} ürün bulunur. Bu ürünler yörenin gerçekten tanınan yerel lezzetleri ve el sanatlarıdır; el sanatları, halı, tatlı ve bal gibi gruplar hediyelik olarak da tercih edilir. Aşağıda grup grup öne çıkanlar listelenmiştir.`}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {giGroups.map((g) => {
              const list = f.gi[g.key];
              const shown = list.slice(0, MAX_PER_GROUP);
              return (
                <div key={g.key} className="rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
                  <h3 className="mb-2 text-base font-bold text-ink">{g.title}</h3>
                  <ul className="space-y-1 text-sm text-ink/75">
                    {shown.map((p) => (
                      <li key={p.n}>{p.n}</li>
                    ))}
                  </ul>
                  {list.length > shown.length && (
                    <p className="mt-2 text-xs text-ink/55">{`ve ${list.length - shown.length} tescilli ürün daha`}</p>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink/55">
            Kaynak: Türk Patent ve Marka Kurumu coğrafi işaret sicili. Tescil listesi zamanla güncellenir; satın almadan önce ürünün güncel durumunu ve üreticisini kontrol edin.
          </p>
        </section>
      )}
    </div>
  );
}
