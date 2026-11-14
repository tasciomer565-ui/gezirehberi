import Link from "@/components/PlainLink";
import { Info, Sparkles, Users, ArrowRight, MapPin, Mountain, Car } from "lucide-react";
import type { CityQuickFacts } from "@/lib/data/quickFacts";
import type { Locale } from "@/lib/i18n";

interface QuickFactsCardProps {
  facts: CityQuickFacts;
  cityName: string;
  locale: Locale;
}

// Madde 146/148/149/152 — "Hızlı Bilgi Kartı" + "İlginç Bilgiler" +
// "Ünlü Kişiler" + gezi rehberine köprü cümlesi. PİLOT: 12 şehir, bkz.
// src/lib/data/quickFacts.ts. KnownForSection ile aynı mimari desende
// (ayrı overlay dosyası, curated City verisine dokunmuyor).
export default function QuickFactsCard({ facts, cityName, locale }: QuickFactsCardProps) {
  const isTr = locale === "tr";

  return (
    <div className="mb-10 space-y-6">
      {/* Madde 146 — Hızlı Bilgi Kartı */}
      <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Info size={15} className="text-kiremit shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-kiremit">
            {isTr ? "Hızlı Bilgi" : "Quick Facts"}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-1 text-ink/50 text-xs">
              <Users size={12} /> {isTr ? "Nüfus" : "Population"}
            </div>
            <div className="font-semibold text-ink">{facts.population}</div>
            <div className="text-[11px] text-ink/45">{facts.populationNote}</div>
          </div>
          {facts.elevationM !== undefined && (
            <div>
              <div className="flex items-center gap-1 text-ink/50 text-xs">
                <Mountain size={12} /> {isTr ? "Rakım" : "Elevation"}
              </div>
              <div className="font-semibold text-ink">{facts.elevationM} m</div>
            </div>
          )}
          <div>
            <div className="flex items-center gap-1 text-ink/50 text-xs">
              <Car size={12} /> {isTr ? "Plaka Kodu" : "Plate Code"}
            </div>
            <div className="font-semibold text-ink">{facts.plateCode}</div>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <div className="flex items-center gap-1 text-ink/50 text-xs">
              <MapPin size={12} /> {isTr ? "Komşu İl/İlçeler" : "Neighboring Provinces"}
            </div>
            <div className="font-semibold text-ink">{facts.neighboring.join(", ")}</div>
          </div>
          {facts.founded && (
            <div className="col-span-2 sm:col-span-3">
              <div className="text-ink/50 text-xs">{isTr ? "Kısa Tarihçe" : "Brief History"}</div>
              <div className="text-ink/80">{facts.founded}</div>
            </div>
          )}
        </div>
      </div>

      {/* Madde 149 — İlginç Bilgiler */}
      <div className="rounded-xl border border-ink/10 bg-gradient-to-br from-safran/5 to-transparent p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={15} className="text-kiremit shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-kiremit">
            {isTr ? "İlginç Bilgiler" : "Did You Know?"}
          </h2>
        </div>
        <ul className="space-y-2 text-sm text-ink/80">
          {facts.trivia.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-kiremit shrink-0">•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Madde 148 — Ünlü Kişiler (sadece gerçek/doğrulanmış isim varsa) */}
      {facts.famousPeople && facts.famousPeople.length > 0 && (
        <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Users size={15} className="text-kiremit shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-kiremit">
              {isTr ? `${cityName}'in Ünlü İsimleri` : `Notable People from ${cityName}`}
            </h2>
          </div>
          <ul className="space-y-2 text-sm">
            {facts.famousPeople.map((p, i) => (
              <li key={i}>
                <span className="font-semibold text-ink">{p.name}</span>
                <span className="text-ink/70"> — {p.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Madde 152 — genel merak içeriğinden aşağıdaki gezi rehberi bölümüne
          köprü cümlesi. Site mimarisinde "genel bilgi" ve "gezi rehberi" ayrı
          sayfalar değil — bu kart zaten rehber sayfasının en üstünde, o yüzden
          köprü ayrı bir URL'e değil, sayfanın kendi itinerary bölümüne. */}
      <Link
        href="#itinerary-section"
        className="flex items-center justify-between gap-2 rounded-xl border border-kiremit/20 bg-kiremit/5 px-5 py-4 text-sm font-semibold text-kiremit hover:bg-kiremit/10 transition-colors"
      >
        <span>
          {isTr
            ? // "için" edatı kullanılıyor — şehir ismine ünlü uyumuna göre
              // değişen bir hal eki ("'a"/"'e") eklemek yerine (ki bu, sabit
              // bir şablon dizgisinde kolayca "İstanbul'e" gibi yanlış bir
              // forma yol açar), edat tüm şehir isimleriyle değişmeden çalışır.
              `Bunu merak ettiysen, ${cityName} için bir gezi planlıyor olabilirsin — aşağıdaki gezi rehberimize göz at.`
            : `Curious about more? You might be planning a trip to ${cityName} — check out our travel guide below.`}
        </span>
        <ArrowRight size={16} className="shrink-0" />
      </Link>
    </div>
  );
}
