"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import DurationSelector from "./DurationSelector";
import ItineraryTimeline from "./ItineraryTimeline";
import { generateItinerary } from "@/lib/itinerary";
import { City } from "@/lib/types";
import { getDictionary, Locale } from "@/lib/i18n";

export default function ItinerarySection({ city, locale }: { city: City; locale: string }) {
  const [selectedDays, setSelectedDays] = useState(3);
  // İlk render'da giriş animasyonu yok (SSR çıktısı opacity:0 gelmesin);
  // kullanıcı gün sayısını değiştirdikten sonra geçiş animasyonu devrede.
  const [hasChangedDays, setHasChangedDays] = useState(false);
  const dict = getDictionary(locale as Locale);

  const itinerary = useMemo(() => generateItinerary(city, selectedDays), [city, selectedDays]);

  return (
    <div>
      <div className="mb-10 rounded-xl border border-ink/10 bg-gradient-to-b from-ink/5 to-transparent p-6 sm:p-8">
        <DurationSelector selected={selectedDays} onSelect={(days) => {
            setHasChangedDays(true);
            setSelectedDays(days);
          }}
        />
      </div>

      <motion.div
        key={selectedDays}
        initial={hasChangedDays ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="border-b border-ink/10 pb-5">
          <h2 className="font-display text-3xl italic text-ink mb-2">
            {locale === "tr" ? itinerary.title : `${city.name} - ${selectedDays} ${dict.city.daysCount} Itinerary`}
          </h2>
          <p className="text-ink/70 leading-relaxed">
            {locale === "tr" ? itinerary.summary : `${selectedDays} days plan generated from ${city.attractions.length} attractions and ${city.restaurants.length} restaurants.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-safran/20 px-3.5 py-1 text-kiremit font-semibold shadow-sm">
              💰 {dict.city.budget}: {itinerary.budgetPerPerson}
            </span>
            <span className="rounded-full bg-turkuaz/10 px-3.5 py-1 text-deniz font-semibold shadow-sm">
              📅 {dict.city.bestTime}: {itinerary.bestSeason}
            </span>
          </div>
        </div>

        <ItineraryTimeline
          citySlug={city.slug}
          cityName={city.name}
          days={selectedDays}
          dayPlans={itinerary.dayPlans}
          locale={locale}
          regionSlug={city.regionSlug}
        />
      </motion.div>
    </div>
  );
}
