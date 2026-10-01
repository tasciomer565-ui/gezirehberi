"use client";

import { motion } from "framer-motion";
import { Phone, MapPin } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import { Restaurant } from "@/lib/types";
import { translateDataText, Locale } from "@/lib/i18n";
import SavePlaceButton from "./SavePlaceButton";

export default function RestaurantCard({ restaurant, locale = "tr", onClick }: { restaurant: Restaurant; locale?: string; onClick?: () => void }) {
  const PRICE_LABELS: Record<string, string> = {
    budget: locale === "tr" ? "₺ Ekonomik" : locale === "de" ? "₺ Günstig" : locale === "ar" ? "₺ اقتصادي" : "₺ Budget",
    mid: locale === "tr" ? "₺₺ Orta" : locale === "de" ? "₺₺ Mittel" : locale === "ar" ? "₺₺ متوسط" : "₺₺ Mid-Range",
    luxury: locale === "tr" ? "₺₺₺ Üst Segment" : locale === "de" ? "₺₺₺ Premium" : locale === "ar" ? "₺₺₺ فاخر" : "₺₺₺ Premium",
  };

  const DINING_LABELS: Record<string, string> = {
    restaurant: locale === "tr" ? "Restoran" : locale === "de" ? "Restaurant" : locale === "ar" ? "مطعم" : "Restaurant",
    cafe: locale === "tr" ? "Kafe" : locale === "de" ? "Café" : locale === "ar" ? "مقهى" : "Café",
    "street-food": locale === "tr" ? "Sokak Lezzeti" : locale === "de" ? "Straßenessen" : locale === "ar" ? "أكل شوارع" : "Street Food",
    market: locale === "tr" ? "Pazar" : locale === "de" ? "Markt" : locale === "ar" ? "سوق" : "Market",
  };

  const mapsQuery = restaurant.isAreaSuggestion
    ? `${restaurant.specialties[0] ?? "restoran"} ${restaurant.address}`
    : `${restaurant.name} ${restaurant.address}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl border border-ink/8 bg-paper shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] h-full flex flex-col justify-between cursor-pointer"
    >
      <div>
        <div className="relative">
          <PlaceholderImage seed={restaurant.id} regionSlug={restaurant.regionSlug} aspect="video" />
          <span className="absolute left-3 top-3 rounded-full bg-turkuaz/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-paper shadow-sm">
            {DINING_LABELS[restaurant.diningType] ?? restaurant.diningType}
          </span>
          <div className="absolute right-3 top-3 z-20">
            <SavePlaceButton place={restaurant} category="restaurants" citySlug={restaurant.id.split('-')[0]} />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg italic text-ink group-hover:text-kiremit transition-colors">
              {translateDataText(restaurant.name, locale as Locale)}
            </h3>
            {restaurant.priceRange && (
              <span className="shrink-0 rounded-full bg-safran/20 px-2.5 py-1 text-xs font-bold text-kiremit shadow-sm">
                {PRICE_LABELS[restaurant.priceRange]}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-ink/70 line-clamp-2 leading-relaxed">
            {translateDataText(restaurant.description, locale as Locale)}
          </p>

          {restaurant.specialties && restaurant.specialties.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-ink/5 pt-3">
              {restaurant.specialties.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-semibold text-ink/75"
                >
                  {translateDataText(s, locale as Locale)}
                </span>
              ))}
            </div>
          )}

          {(restaurant.priceSegment || restaurant.signatureDish) && (
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink/5 pt-2.5">
              {restaurant.priceSegment && (
                <span className="text-xs font-bold text-ink/65">
                  {"$".repeat(restaurant.priceSegment)}
                  <span className="text-ink/15">{"$".repeat(4 - restaurant.priceSegment)}</span>
                </span>
              )}
              {restaurant.signatureDish && (
                <p className="flex-1 text-right text-[11px] italic font-semibold text-kiremit">
                  ★ {translateDataText(restaurant.signatureDish, locale as Locale)}
                </p>
              )}
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
              ? restaurant.isAreaSuggestion
                ? "Bu bölgedeki mekanları haritada gör"
                : "Haritada gör, saat ve yorumlara bak"
              : "View on map"}
          </a>
          {restaurant.isAreaSuggestion && locale === "tr" && (
            <span className="text-[10px] text-ink/55 leading-tight">Belirli bir işletme değil, yeme-içme bölgesi önerisidir.</span>
          )}
        </div>

        {restaurant.phone && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-ink/65 border-t border-ink/5 pt-2 font-medium">
            <Phone size={12} /> <span>{restaurant.phone}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
