import { Locale, buildAlternates, buildPageSocialMeta } from "@/lib/i18n";
import { Info, ShieldCheck, Compass } from "lucide-react";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const title = locale === "tr" ? "Hakkımızda" : "About Us";
  const description =
    locale === "tr"
      ? "Yol Defteri, Türkiye'nin 81 ili ve en popüler turistik bölgelerine dair veri odaklı, şeffaf bir seyahat rehberidir; her il için gerçek bilgi ve rotalar sunar."
      : "Yol Defteri is a data-driven, transparent travel guide covering Turkey's 81 provinces and most popular tourist regions, with real information and routes.";

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl italic text-ink sm:text-5xl mb-4">
          {locale === "tr" ? "Hakkımızda" : "About Us"}
        </h1>
        <p className="text-lg text-ink/75 max-w-2xl mx-auto font-medium">
          {locale === "tr" 
            ? "Yol Defteri, Türkiye'nin 81 ili ve en popüler turistik bölgelerine dair veri odaklı, şeffaf seyahat rehberidir."
            : "Yol Defteri is a data-driven, transparent travel guide covering Turkey's 81 cities and most popular tourist regions."}
        </p>
      </div>

      <div className="space-y-12 text-base text-ink/70 leading-relaxed font-medium">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="rounded-2xl border border-ink/10 bg-paper p-6 shadow-sm hover:border-kiremit/30 transition-colors">
            <Compass className="text-kiremit mb-3" size={32} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-kiremit mb-2">
              {locale === "tr" ? "Geniş Kapsam" : "Wide Coverage"}
            </h3>
            <p className="text-xs">
              {locale === "tr" 
                ? "81 il ve popüler turizm beldelerinin tamamında 500+ gezilecek yer, otel ve restoranı harita entegrasyonuyla listeliyoruz."
                : "We list 500+ places to visit, hotels, and restaurants across all 81 cities and popular tourism districts."}
            </p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-paper p-6 shadow-sm hover:border-kiremit/30 transition-colors">
            <ShieldCheck className="text-kiremit mb-3" size={32} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-kiremit mb-2">
              {locale === "tr" ? "Şeffaf Fiyat Garantisi" : "Transparent Pricing"}
            </h3>
            <p className="text-xs">
              {locale === "tr" 
                ? "Fiyatların eskimesini önlemek için sezonluk ve haftalık otomatik fiyat güncelleme motoru (pricing engine) kullanıyoruz."
                : "We use an automatic pricing engine updating prices weekly to simulate seasonal shifts and prevent outdated data."}
            </p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-paper p-6 shadow-sm hover:border-kiremit/30 transition-colors">
            <Info className="text-kiremit mb-3" size={32} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-kiremit mb-2">
              {locale === "tr" ? "Yol Defteri Vizyonu" : "Yol Defteri Vision"}
            </h3>
            <p className="text-xs">
              {locale === "tr" 
                ? "Gezginlerin seyahatlerini en gerçekçi ve güncel tahmini fiyatlarla planlamalarını hedefleyen kurumsal gezi rehberi."
                : "A corporate travel guide aimed at helping travelers plan their journeys with realistic estimated prices."}
            </p>
          </div>
        </div>

        <section className="space-y-4 border-t border-ink/10 pt-8">
          <h2 className="font-display text-2xl italic text-ink">
            {locale === "tr" ? "Neden Yol Defteri?" : "Why Yol Defteri?"}
          </h2>
          <p>
            {locale === "tr"
              ? "Geleneksel seyahat platformlarının aksine Yol Defteri, kullanıcıların veri yığınları arasında boğulmasını önler. Algoritmik veri eşleme katmanlarımız sayesinde, her şehrin en popüler noktaları google popülerlik endeksine, bütçe segmentine ve tarihi geçmişine göre kolayca filtrelenebilir."
              : "Unlike traditional travel platforms, Yol Defteri prevents users from drowning in data clutter. Thanks to our algorithmic data mapping layer, each city's top spots can be easily sorted by Google popularity index, budget segment, and historical timeline."}
          </p>
        </section>
      </div>
    </div>
  );
}
