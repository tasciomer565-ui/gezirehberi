"use client";

import { motion } from "framer-motion";
import { Star, Wifi, MapPin } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import { Accommodation } from "@/lib/types";
import { translateDataText, Locale } from "@/lib/i18n";
import SavePlaceButton from "./SavePlaceButton";

export default function AccommodationCard({ accommodation, locale = "tr", onClick }: { accommodation: Accommodation; locale?: string; onClick?: () => void }) {
  const TYPE_LABELS: Record<string, string> = {
    hotel: locale === "tr" ? "Otel" : locale === "de" ? "Hotel" : locale === "ar" ? "فندق" : "Hotel",
    guesthouse: locale === "tr" ? "Pansiyon" : locale === "de" ? "Gästehaus" : locale === "ar" ? "بيت ضiafe" : "Guesthouse",
    boutique: locale === "tr" ? "Butik Otel" : locale === "de" ? "Boutique-Hotel" : locale === "ar" ? "فندق بوتيك" : "Boutique Hotel",
    resort: locale === "tr" ? "Resort" : locale === "de" ? "Resort" : locale === "ar" ? "منتجع" : "Resort",
  };

  const mapsQuery = accommodation.isAreaSuggestion
    ? `${TYPE_LABELS[accommodation.type] ?? "otel"} ${accommodation.address}`
    : `${accommodation.name} ${accommodation.address}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl border border-ink/8 bg-paper shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] h-full flex flex-col justify-between cursor-pointer"
    >
      <div>
        <div className="relative">
          <PlaceholderImage seed={accommodation.id} regionSlug={accommodation.regionSlug} aspect="video" />
          <span className="absolute left-3 top-3 rounded-full bg-deniz/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-paper shadow-sm">
            {TYPE_LABELS[accommodation.type] ?? accommodation.type}
          </span>
          <div className="absolute right-3 top-3 z-20">
            <SavePlaceButton place={accommodation} category="accommodations" citySlug={accommodation.id.split('-')[0]} />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg italic text-ink group-hover:text-kiremit transition-colors">
              {translateDataText(accommodation.name, locale as Locale)}
            </h3>
            {accommodation.rating !== undefined && (
              <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-safran">
                <Star size={14} fill="currentColor" /> {accommodation.rating}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-ink/70 line-clamp-2 leading-relaxed">
            {translateDataText(accommodation.description, locale as Locale)}
          </p>

          {accommodation.amenities && accommodation.amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-ink/5 pt-3">
              {accommodation.amenities.slice(0, 3).map((a) => (
                <span key={a} className="flex items-center gap-1 rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-semibold text-ink/70">
                  <Wifi size={10} className="text-ink/65" /> {translateDataText(a, locale as Locale)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="flex flex-col gap-1 border-t border-ink/5 pt-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs font-bold text-kiremit hover:underline"
          >
            <MapPin size={12} />
            {locale === "tr"
              ? accommodation.isAreaSuggestion
                ? "Bu bölgedeki seçenekleri haritada gör"
                : "Haritada gör, fiyat ve yorumlara bak"
              : "View on map"}
          </a>
          {accommodation.isAreaSuggestion && locale === "tr" && (
            <span className="text-[10px] text-ink/55 leading-tight">Belirli bir tesis değil, konaklama bölgesi önerisidir.</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
