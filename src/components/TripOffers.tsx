import { Plane, Ticket } from "lucide-react";

// Trip.com uçak bileti ve tur/müze biletleri ortaklık bağlantıları (2026-11-20).
// Bağlantılar Trip.com Affiliate Platform tarafından üretildiği şekliyle
// birebir korunur (Allianceid=11433199&SID=336551594&trip_sub3=D21384995).
export const TRIP_FLIGHTS_AFFILIATE_URL =
  "https://tr.trip.com/flights/?Allianceid=11433199&SID=336551594&trip_sub1=&trip_sub3=D21384995";

export const TRIP_TOURS_AFFILIATE_URL =
  "https://tr.trip.com/things-to-do/?Allianceid=11433199&SID=336551594&trip_sub1=&trip_sub3=D21384995";

export function FlightOffer({ airportName, iata }: { airportName?: string; iata?: string }) {
  return (
    <aside className="my-6 rounded-2xl border border-safran/30 bg-safran/10 p-5 text-sm no-print">
      <p className="flex items-center gap-2 font-bold text-ink">
        <Plane size={16} className="shrink-0 text-kiremit" />
        {airportName && iata ? `${airportName} (${iata}) uçak bileti fiyatları` : "Türkiye uçak bileti fiyatları"}
      </p>
      <p className="mt-1 text-ink/75">
        {airportName
          ? `${airportName} kalkışlı ve varışlı iç hat ve dış hat uçuşlarını karşılaştırabilirsin.`
          : "İç hat ve dış hat uçak bileti fiyatlarını tarih seçerek karşılaştırabilirsin."}
      </p>
      <a
        href={TRIP_FLIGHTS_AFFILIATE_URL}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="mt-3 inline-flex items-center gap-1 rounded-full bg-kiremit px-4 py-2 font-bold text-paper transition-opacity hover:opacity-90"
      >
        Uçak bileti fiyatlarını gör →
      </a>
      <p className="mt-2 text-[11px] text-ink/55">
        Ortaklık bağlantısı (Trip.com): bu bağlantıyla yapılan uçak bileti alımlarından Yol Defteri komisyon alabilir; sana ek ücret yansımaz.
      </p>
    </aside>
  );
}

export function ToursOffer({ cityName }: { cityName?: string }) {
  return (
    <aside className="my-6 rounded-2xl border border-safran/30 bg-safran/10 p-5 text-sm no-print">
      <p className="flex items-center gap-2 font-bold text-ink">
        <Ticket size={16} className="shrink-0 text-kiremit" />
        {cityName ? `${cityName} müze, tur ve aktivite biletleri` : "Türkiye müze, tur ve aktivite biletleri"}
      </p>
      <p className="mt-1 text-ink/75">
        {cityName
          ? `${cityName} ve çevresindeki rehberli turlar, müze girişleri ve günübirlik aktiviteleri önceden inceleyebilirsin.`
          : "Popüler müzeler, ören yerleri ve rehberli turlar için bilet seçeneklerini tek ekranda inceleyebilirsin."}
      </p>
      <a
        href={TRIP_TOURS_AFFILIATE_URL}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="mt-3 inline-flex items-center gap-1 rounded-full bg-kiremit px-4 py-2 font-bold text-paper transition-opacity hover:opacity-90"
      >
        Tur ve aktivite biletlerini incele →
      </a>
      <p className="mt-2 text-[11px] text-ink/55">
        Ortaklık bağlantısı (Trip.com): bu bağlantıyla yapılan bilet ve tur rezervasyonlarından Yol Defteri komisyon alabilir; sana ek ücret yansımaz.
      </p>
    </aside>
  );
}
