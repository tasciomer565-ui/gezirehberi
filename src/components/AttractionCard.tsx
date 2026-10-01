"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Ticket, Star, Camera, Accessibility, ParkingSquare } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import { Attraction } from "@/lib/types";
import { translateDataText, Locale } from "@/lib/i18n";
import SavePlaceButton from "./SavePlaceButton";

export default function AttractionCard({ attraction, locale = "tr", onClick }: { attraction: Attraction; locale?: string; onClick?: () => void }) {
  const IMPORTANCE_LABELS: Record<string, { label: string; color: string }> = {
    "must-see": {
      label: locale === "tr" ? "Mutlaka Görün" : locale === "de" ? "Unbedingt sehen" : locale === "ar" ? "يجب رؤيته" : "Must See",
      color: "bg-kiremit text-paper",
    },
    "should-see": {
      label: locale === "tr" ? "Görülmeli" : locale === "de" ? "Sehenswert" : locale === "ar" ? "يُنصح برؤيته" : "Should See",
      color: "bg-safran text-ink",
    },
    "nice-to-have": {
      label: locale === "tr" ? "Zaman Varsa" : locale === "de" ? "Optional" : locale === "ar" ? "إذا كان هناك وقت" : "Optional",
      color: "bg-ink/10 text-ink",
    },
  };

  const importance = IMPORTANCE_LABELS[attraction.importance] ?? IMPORTANCE_LABELS["nice-to-have"];

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl border border-ink/8 bg-paper shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] h-full flex flex-col justify-between cursor-pointer"
    >
      <div>
        <div className="relative">
          <PlaceholderImage seed={attraction.id} regionSlug={attraction.regionSlug} aspect="video" />
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${importance.color} shadow-sm`}
          >
            {importance.label}
          </span>
          <div className="absolute right-3 top-3 z-20">
            <SavePlaceButton place={attraction} category="attractions" citySlug={attraction.id.split('-')[0]} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display text-lg italic text-ink group-hover:text-kiremit transition-colors">
            {translateDataText(attraction.name, locale as Locale)}
          </h3>
          <p className="mt-1.5 text-sm text-ink/70 line-clamp-2 leading-relaxed">
            {translateDataText(attraction.description, locale as Locale)}
          </p>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink/65 border-t border-ink/5 pt-3">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {translateDataText(attraction.duration, locale as Locale)}
            </span>
            <span className="flex items-center gap-1">
              <Ticket size={12} /> {translateDataText(attraction.entranceFee, locale as Locale)}
            </span>
          </div>

          {attraction.tips.length > 0 && (
            <div className="mt-3 rounded-lg bg-safran/10 p-2.5">
              <p className="flex items-start gap-1.5 text-xs text-ink/75 leading-relaxed">
                <Star size={12} className="mt-0.5 shrink-0 text-safran" />
                <span className="font-medium">{translateDataText(attraction.tips[0], locale as Locale)}</span>
              </p>
            </div>
          )}

          {attraction.bestPhotoTime && (
            <div className="mt-2.5 flex items-start gap-1.5 text-xs text-turkuaz font-semibold">
              <Camera size={12} className="mt-0.5 shrink-0" />
              <span>{translateDataText(attraction.bestPhotoTime, locale as Locale)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="flex flex-col gap-1 border-t border-ink/5 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-ink/65">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{translateDataText(attraction.address, locale as Locale)}</span>
          </div>
        </div>

        {(attraction.accessibility || attraction.parkingTip) && (
          <div className="mt-2 space-y-1 border-t border-ink/5 pt-2">
            {attraction.accessibility && (
              <p className="flex items-start gap-1.5 text-[10px] text-ink/65 leading-normal font-medium">
                <Accessibility size={12} className="mt-0.5 shrink-0" />
                <span>{translateDataText(attraction.accessibility, locale as Locale)}</span>
              </p>
            )}
            {attraction.parkingTip && (
              <p className="flex items-start gap-1.5 text-[10px] text-ink/65 leading-normal font-medium">
                <ParkingSquare size={12} className="mt-0.5 shrink-0" />
                <span>{translateDataText(attraction.parkingTip, locale as Locale)}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
