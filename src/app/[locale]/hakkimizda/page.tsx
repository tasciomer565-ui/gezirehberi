import { Locale, buildAlternates, buildPageSocialMeta } from "@/lib/i18n";
import { Route, ShieldCheck, Compass } from "lucide-react";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const title = locale === "tr" ? "Hakkımızda" : "About Us";
  const description =
    locale === "tr"
      ? "Yol Defteri, Türkiye'nin 85 şehir ve tatil beldesine dair veri odaklı, şeffaf bir seyahat rehberidir; her biri için gerçek bilgi ve rotalar sunar."
      : "Yol Defteri is a data-driven, transparent travel guide covering 85 cities and resorts across Turkey, with real information and routes.";

  return {
    title,
    description,
    alternates: buildAlternates(locale, "/hakkimizda"),
    ...buildPageSocialMeta(locale, "/hakkimizda", title, description),
  };
}

export default async function AboutPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;

  const tr = locale === "tr";
  const cards = [
    {
      Icon: Compass,
      title: tr ? "Geniş Kapsam" : "Wide Coverage",
      text: tr
        ? "85 şehir ve tatil beldesi için gezilecek yerler, yöresel lezzetler ve konaklama bölgeleri; harita üzerinde ve şehir sayfalarında."
        : "Places to visit, local food and lodging areas for 85 cities and resorts, on maps and city pages.",
    },
    {
      Icon: Route,
      title: tr ? "Gerçek Yol Verisi" : "Real Road Data",
      text: tr
        ? "1000'den fazla şehir çifti ve tatil yeri için karayolu mesafesi ve süresi, harita verisinden hesaplanır ve Karayolları Genel Müdürlüğü tablosuyla karşılaştırılır."
        : "Road distance and drive time for over a thousand city and resort pairs, computed from map data and cross-checked against the official highway table.",
    },
    {
      Icon: ShieldCheck,
      title: tr ? "Dürüst Bilgi" : "Honest Information",
      text: tr
        ? "Doğrulayamadığımız fiyat, puan ve çalışma saati göstermiyoruz; bunların yerine maliyet seviyesi gibi genel ifadeler kullanıyoruz."
        : "We do not show prices, ratings or opening hours we cannot verify; we use general cost levels instead.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl italic text-ink sm:text-5xl mb-4">{tr ? "Hakkımızda" : "About Us"}</h1>
        <p className="text-lg text-ink/75 max-w-2xl mx-auto font-medium">
          {tr
            ? "Yol Defteri, Türkiye'nin 85 şehir ve tatil beldesi için yola çıkmadan önce okunacak bir gezi ve yol rehberidir."
            : "Yol Defteri is a travel and road guide to read before you set out, covering 85 cities and resorts in Turkey."}
        </p>
      </div>

      <div className="space-y-12 text-base text-ink/70 leading-relaxed font-medium">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          {cards.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-ink/10 bg-paper p-6 shadow-sm hover:border-kiremit/30 transition-colors">
              <Icon className="text-kiremit mb-3" size={32} />
              <h3 className="text-sm font-bold uppercase tracking-wider text-kiremit mb-2">{title}</h3>
              <p className="text-xs">{text}</p>
            </div>
          ))}
        </div>

        <section className="space-y-4 border-t border-ink/10 pt-8">
          <h2 className="font-display text-2xl italic text-ink">{tr ? "Neden Yol Defteri?" : "Why Yol Defteri?"}</h2>
          <p>
            {tr
              ? "Gezi planı yaparken en çok sorulan sorular genellikle şunlardır: Oraya kaç km, kaç saat? Yolda nerede durulur? Gidince ne görülür? Yol Defteri bu soruları tek yerde, birbirine bağlı sayfalarla yanıtlar: iki şehir arasındaki mesafe sayfasından şehrin gezi rehberine, oradan yol üstü duraklara ve havalimanı transferlerine geçebilirsiniz."
              : "The questions people ask most when planning a trip are: how far is it, where to stop on the way, and what to see on arrival. Yol Defteri answers them in one place, with connected pages: from a distance page to the city guide, then to stops along the way and airport transfers."}
          </p>
        </section>

        <section className="space-y-4 border-t border-ink/10 pt-8">
          <h2 className="font-display text-2xl italic text-ink">{tr ? "Verileri nasıl hazırlıyoruz?" : "How we prepare the data"}</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              {tr
                ? "Mesafe ve süre: OpenStreetMap tabanlı rota motoru ile hesaplanır; trafiksiz sürüş süresidir. Sonuçlar Karayolları Genel Müdürlüğü'nün resmî il merkezleri arası mesafe tablosuyla karşılaştırılır; sapma gösteren çiftler tek tek incelenip düzeltilir."
                : "Distance and time: calculated with an OpenStreetMap-based routing engine, as no-traffic drive times. Results are compared against the official inter-city distance table and outliers are reviewed and corrected one by one."}
            </li>
            <li>
              {tr
                ? "Havalimanları: konumlar OurAirports açık verisinden, havalimanı–merkez mesafeleri aynı rota motorundan alınır."
                : "Airports: locations come from the OurAirports open dataset; airport-to-centre distances use the same routing engine."}
            </li>
            <li>
              {tr
                ? "Gezilecek yerler ve rehber yazıları: elle yazılır ve gözden geçirilir. Doğrulayamadığımız işletme adı, fiyat, puan ve çalışma saati yayımlamayız."
                : "Places and guide articles: written and reviewed by hand. We do not publish business names, prices, ratings or opening hours that we cannot verify."}
            </li>
          </ul>
        </section>

        <section className="space-y-4 border-t border-ink/10 pt-8">
          <h2 className="font-display text-2xl italic text-ink">{tr ? "Hata bulursanız" : "Found a mistake?"}</h2>
          <p>
            {tr
              ? "Yanlış bir mesafe, kapanmış bir yer ya da eksik bir bilgi görürseniz iletişim sayfasından bize yazın. Düzeltmeleri inceleyip sayfalara yansıtıyoruz."
              : "If you spot a wrong distance, a closed place or missing information, write to us through the contact page. We review corrections and update the pages."}
          </p>
        </section>
      </div>
    </div>
  );
}
