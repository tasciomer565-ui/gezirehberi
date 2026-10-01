"use client";

import { motion } from "framer-motion";
import { Calendar, Tag } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import { FoodItem } from "@/lib/types";
import { translateDataText, Locale } from "@/lib/i18n";
import SavePlaceButton from "./SavePlaceButton";

export default function FoodCard({ food, locale = "tr", onClick }: { food: FoodItem; locale?: string; onClick?: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl border border-ink/8 bg-paper shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] h-full flex flex-col justify-between cursor-pointer"
    >
      <div>
        <div className="relative">
          <PlaceholderImage seed={food.id} regionSlug={food.regionSlug} aspect="square" />
          <div className="absolute right-3 top-3 z-20">
            <SavePlaceButton place={food} category="localFood" citySlug={food.id.split('-')[0]} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display text-lg italic text-ink group-hover:text-kiremit transition-colors">
            {translateDataText(food.name, locale as Locale)}
          </h3>
          <p className="mt-1.5 text-sm text-ink/70 line-clamp-3 leading-relaxed">
            {translateDataText(food.description, locale as Locale)}
          </p>

          {food.ingredients && food.ingredients.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-ink/5 pt-3">
              {food.ingredients.slice(0, 4).map((ing) => (
                <span key={ing} className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px] font-semibold text-ink/65">
                  {translateDataText(ing, locale as Locale)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="flex items-center justify-between text-xs text-ink/65 border-t border-ink/5 pt-3 font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} /> {translateDataText(food.bestSeason, locale as Locale)}
          </span>
          {food.priceRange && (
            <span className="flex items-center gap-1.5 font-bold text-kiremit">
              <Tag size={12} /> {translateDataText(food.priceRange, locale as Locale)}
            </span>
          )}
        </div>

        {food.tips && (
          <p className="mt-3 rounded-lg bg-turkuaz/10 p-2.5 text-xs text-ink/75 leading-relaxed font-medium">
            💡 {translateDataText(food.tips, locale as Locale)}
          </p>
        )}
      </div>
    </motion.div>
  );
}
