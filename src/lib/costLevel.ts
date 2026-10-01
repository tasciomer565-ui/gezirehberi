import type { CostLevel } from "@/lib/types";

// Şehirlerin birbirine göre maliyet düzeyi (bkz. data/cities/sanitize.ts →
// applyCostLevels). TL rakamı yerine göreli düzey: veri dosyalarındaki günlük
// bütçe rakamları 2026 fiyatlarının çok altında kalmıştı, ama şehirler
// arasındaki sıralama (Bodrum > Bayburt gibi) anlamlı.
const TEXT: Record<string, Record<CostLevel, { short: string; long: string }>> = {
  tr: {
    low: { short: "Uygun", long: "Uygun — Türkiye'deki diğer gezi rotalarına göre konaklama ve yeme-içme genelde daha ekonomik. Güncel fiyatları rezervasyon sitelerinden kontrol edin." },
    mid: { short: "Orta", long: "Orta — Türkiye'deki diğer gezi rotalarına göre ortalama maliyet. Güncel fiyatları rezervasyon sitelerinden kontrol edin." },
    high: { short: "Yüksek", long: "Yüksek — Türkiye'nin pahalı gezi rotalarından; özellikle sezonda konaklama fiyatları yükselir. Güncel fiyatları rezervasyon sitelerinden kontrol edin." },
  },
  en: {
    low: { short: "Affordable", long: "Affordable — accommodation and food are generally cheaper than on other Turkish travel routes. Check current prices on booking sites." },
    mid: { short: "Moderate", long: "Moderate — average cost compared with other Turkish travel routes. Check current prices on booking sites." },
    high: { short: "Expensive", long: "Expensive — one of Turkey's pricier destinations; accommodation costs rise in high season. Check current prices on booking sites." },
  },
  de: {
    low: { short: "Günstig", long: "Günstig — Unterkunft und Essen sind meist billiger als auf anderen Reiserouten in der Türkei. Aktuelle Preise auf Buchungsseiten prüfen." },
    mid: { short: "Mittel", long: "Mittel — durchschnittliche Kosten im Vergleich zu anderen Reiserouten in der Türkei. Aktuelle Preise auf Buchungsseiten prüfen." },
    high: { short: "Teuer", long: "Teuer — eines der teureren Reiseziele der Türkei; in der Hochsaison steigen die Unterkunftspreise. Aktuelle Preise auf Buchungsseiten prüfen." },
  },
  ar: {
    low: { short: "اقتصادي", long: "اقتصادي — الإقامة والطعام عادة أرخص من وجهات السفر الأخرى في تركيا. تحقق من الأسعار الحالية على مواقع الحجز." },
    mid: { short: "متوسط", long: "متوسط — تكلفة متوسطة مقارنة بوجهات السفر الأخرى في تركيا. تحقق من الأسعار الحالية على مواقع الحجز." },
    high: { short: "مرتفع", long: "مرتفع — من الوجهات الأغلى في تركيا؛ ترتفع أسعار الإقامة في الموسم. تحقق من الأسعار الحالية على مواقع الحجز." },
  },
  ru: {
    low: { short: "Недорого", long: "Недорого — жильё и еда обычно дешевле, чем на других туристических маршрутах Турции. Актуальные цены уточняйте на сайтах бронирования." },
    mid: { short: "Средне", long: "Средне — средние расходы по сравнению с другими маршрутами Турции. Актуальные цены уточняйте на сайтах бронирования." },
    high: { short: "Дорого", long: "Дорого — одно из самых дорогих направлений Турции; в сезон цены на жильё растут. Актуальные цены уточняйте на сайтах бронирования." },
  },
};

export function getCostLevelText(level: CostLevel | undefined, locale: string, variant: "short" | "long" = "long"): string {
  const l = level ?? "mid";
  return (TEXT[locale] ?? TEXT.tr)[l][variant];
}
