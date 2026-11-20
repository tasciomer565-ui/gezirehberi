import { BedDouble } from "lucide-react";

// Trip.com otel ortaklık bağlantısı (2026-11-20).
// Bağlantı yapısı Trip.com Affiliate Platform tarafından üretildiği şekliyle
// birebir korunur (Allianceid=11433199&SID=336551594&trip_sub3=D21384995).
// Yabancı script yok: düz <a>, rel="sponsored nofollow noopener", açık ortaklık notu.
export const TRIP_HOTELS_AFFILIATE_URL =
  "https://tr.trip.com/hotels/?Allianceid=11433199&SID=336551594&trip_sub1=&trip_sub3=D21384995";

export default function HotelOffer({ cityName }: { cityName?: string }) {
  return (
    <aside className="my-6 rounded-2xl border border-safran/30 bg-safran/10 p-5 text-sm no-print">
      <p className="flex items-center gap-2 font-bold text-ink">
        <BedDouble size={16} className="shrink-0 text-kiremit" />
        {cityName ? `${cityName} otel ve konaklama fiyatları` : "Türkiye otel ve konaklama fiyatları"}
      </p>
      <p className="mt-1 text-ink/75">
        {cityName
          ? `${cityName} bölgesindeki otel, pansiyon ve butik konaklama seçeneklerinin güncel gecelik fiyatlarını karşılaştırabilirsin.`
          : "Güncel otel ve konaklama fiyatlarını tarih seçerek karşılaştırabilirsin."}
      </p>
      <a
        href={TRIP_HOTELS_AFFILIATE_URL}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="mt-3 inline-flex items-center gap-1 rounded-full bg-kiremit px-4 py-2 font-bold text-paper transition-opacity hover:opacity-90"
      >
        Otel fiyatlarını karşılaştır →
      </a>
      <p className="mt-2 text-[11px] text-ink/55">
        Ortaklık bağlantısı (Trip.com): bu bağlantıyla yapılan konaklama rezervasyonlarından Yol Defteri komisyon alabilir; sana ek ücret yansımaz.
      </p>
    </aside>
  );
}
