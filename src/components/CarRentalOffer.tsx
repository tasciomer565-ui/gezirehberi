// DiscoverCars ortaklık bağlantısı (2026-11-18, ortaklık kimliği: yoldefterim).
// Yalnızca TR sayfalarda, havalimanı bağlamında gösterilir. Bağlantı
// rel="sponsored nofollow" (Google'ın ücretli bağlantı kuralı) ve kutuda açık
// "Ortaklık bağlantısı" notu var. Yabancı script yok: düz <a>.
// Havalimanı sayfa yolları discovercars.com/turkey sayfasındaki gerçek
// bağlantılardan alındı ve 200 döndüğü kontrol edildi; listede olmayan
// havalimanında Türkiye geneli sayfasına gider.
const AFFILIATE_ID = "yoldefterim";

const AIRPORT_PATHS: Record<string, string> = {
  IST: "turkey/istanbul",
  SAW: "turkey/istanbul/saw",
  ESB: "turkey/ankara/esb",
  ADB: "turkey/izmir/adb",
  AYT: "turkey/antalya/ayt",
  GZP: "turkey/gazipasa/gzp",
  DLM: "turkey/dalaman/dlm",
  BJV: "turkey/bodrum/bjv",
  COV: "turkey/tarsus/cukurova-airport-cov",
  GZT: "turkey/gaziantep/gzt",
  MQM: "turkey/mardin/mqm",
  DNZ: "turkey/denizli/dnz",
  ASR: "turkey/kayseri/asr",
  KYA: "turkey/konya/kya",
  NAV: "turkey/nevsehir/nav",
  SZF: "turkey/samsun/szf",
  TZX: "turkey/trabzon/tzx",
};

export function carRentalUrl(iata?: string): string {
  const path = (iata && AIRPORT_PATHS[iata]) || "turkey";
  return `https://www.discovercars.com/tr/${path}?a_aid=${AFFILIATE_ID}`;
}

export default function CarRentalOffer({ iata, airportName }: { iata?: string; airportName?: string }) {
  const specific = Boolean(iata && AIRPORT_PATHS[iata]);
  return (
    <aside className="my-8 rounded-2xl border border-safran/30 bg-safran/10 p-5 text-sm no-print">
      <p className="font-bold text-ink">
        {specific && airportName ? `${airportName} (${iata}) kiralık araç fiyatları` : "Türkiye'de kiralık araç fiyatları"}
      </p>
      <p className="mt-1 text-ink/75">
        Farklı kiralama firmalarının fiyatlarını tek ekranda karşılaştırıp aracı havalimanından teslim alabilirsin.
      </p>
      <a
        href={carRentalUrl(iata)}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="mt-3 inline-flex items-center gap-1 rounded-full bg-kiremit px-4 py-2 font-bold text-paper transition-opacity hover:opacity-90"
      >
        Kiralık araç fiyatlarını karşılaştır →
      </a>
      <p className="mt-2 text-[11px] text-ink/55">
        Ortaklık bağlantısı (DiscoverCars): bu bağlantıyla yapılan kiralamalardan Yol Defteri komisyon alabilir; sana ek ücret yansımaz.
      </p>
    </aside>
  );
}
