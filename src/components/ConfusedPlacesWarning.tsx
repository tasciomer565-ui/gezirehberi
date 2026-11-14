import Link from "@/components/PlainLink";
import { AlertTriangle } from "lucide-react";
import { ConfusablePlace } from "@/lib/data/confusablePlaces";
import { getDictionary, Locale } from "@/lib/i18n";

interface ConfusedPlacesWarningProps {
  places: ConfusablePlace[];
  locale: string;
}

// Parti 5, madde 15 — "sıkça karıştırılan yerler" uyarısı.
export default function ConfusedPlacesWarning({ places, locale }: ConfusedPlacesWarningProps) {
  if (places.length === 0) return null;
  const dict = getDictionary(locale as Locale);

  return (
    <div className="mb-8 rounded-xl border border-safran/30 bg-safran/5 p-4">
      {places.map((p) => (
        <div key={p.slug} className="flex items-start gap-2.5">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-safran" />
          <p className="text-sm text-ink/80">
            <Link
              href={
                p.citySlug
                  ? `/${locale}/bolgeler/${p.regionSlug}/${p.citySlug}/${p.slug}`
                  : `/${locale}/bolgeler/${p.regionSlug}/${p.slug}`
              }
              className="font-bold text-ink hover:text-kiremit transition-colors"
            >
              {p.name}
            </Link>{" "}
            {dict.city.confusedWith}: {p.reason}
          </p>
        </div>
      ))}
    </div>
  );
}
