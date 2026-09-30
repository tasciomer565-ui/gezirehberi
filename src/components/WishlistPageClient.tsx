"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  MapPin, 
  Trash2, 
  Compass, 
  LayoutGrid, 
  Rows3,
  MapPinned,
  UtensilsCrossed,
  Soup,
  BedDouble
} from "lucide-react";
import { getWishlist, removeFromWishlist, subscribeWishlist, WishlistItem } from "@/lib/wishlist";
import { getSavedPlaces, subscribeSavedPlaces, SavedPlaceItem } from "@/lib/savedPlaces";
import { regionMeta as regions } from "@/lib/data/regionMeta";
import { getDictionary, Locale, translateDataText } from "@/lib/i18n";
import { useParams } from "next/navigation";

// Import Card components to render saved places in full visual luxury
import AttractionCard from "@/components/AttractionCard";
import RestaurantCard from "@/components/RestaurantCard";
import AccommodationCard from "@/components/AccommodationCard";
import FoodCard from "@/components/FoodCard";
import PlaceDetailModal from "@/components/PlaceDetailModal";

type ViewMode = "region" | "list";

export default function WishlistPageClient() {
  const params = useParams();
  const locale = (params?.locale || "tr") as Locale;
  const dict = getDictionary(locale);

  // Main Tabs State: Saved Cities vs Saved Places
  const [activeMainTab, setActiveMainTab] = useState<"cities" | "places">("cities");

  // State Management
  const [cities, setCities] = useState<WishlistItem[]>([]);
  const [places, setPlaces] = useState<SavedPlaceItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("region");
  const [selectedPlace, setSelectedPlace] = useState<SavedPlaceItem | null>(null);

  // Load Saved Cities (Wishlist)
  useEffect(() => {
    setCities(getWishlist());
    const unsubscribe = subscribeWishlist(() => {
      setCities(getWishlist());
    });
    return unsubscribe;
  }, []);

  // Load Saved Places
  useEffect(() => {
    setPlaces(getSavedPlaces());
    const unsubscribe = subscribeSavedPlaces(() => {
      setPlaces(getSavedPlaces());
    });
    return unsubscribe;
  }, []);

  // Saved Cities Grouping by Region
  const groupedCities = useMemo(() => {
    const map = new Map<string, WishlistItem[]>();
    cities.forEach((item) => {
      const list = map.get(item.regionSlug) ?? [];
      list.push(item);
      map.set(item.regionSlug, list);
    });
    return Array.from(map.entries()).map(([regionSlug, citiesList]) => ({
      regionSlug,
      regionName: regions.find((r) => r.slug === regionSlug)?.name ?? regionSlug,
      cities: citiesList,
    }));
  }, [cities]);

  // Helper row component for listing saved cities
  function CityRow({ item }: { item: WishlistItem }) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-2xl border border-ink/8 bg-paper p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-200"
      >
        <Link href={`/${locale}/bolgeler/${item.regionSlug}/${item.citySlug}`} className="flex flex-1 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kiremit/10 text-kiremit">
            <MapPin size={18} />
          </div>
          <div>
            <p className="font-semibold text-ink">{translateDataText(item.cityName, locale)}</p>
            <p className="text-xs text-ink/65">
              {new Date(item.addedAt).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US")} {dict.wishlist.addedAt}
            </p>
          </div>
        </Link>
        <Link
          href={`/${locale}/bolgeler/${item.regionSlug}/${item.citySlug}#itinerary-section`}
          className="mr-1 flex h-9 w-9 items-center justify-center rounded-full text-ink/65 hover:bg-turkuaz/10 hover:text-turkuaz transition-colors"
          aria-label={dict.wishlist.goToItinerary}
          title={dict.wishlist.goToItinerary}
        >
          <Compass size={16} />
        </Link>
        <button
          onClick={() => removeFromWishlist(item.citySlug)}
          className="p-2 text-ink/65 transition-colors hover:text-kiremit cursor-pointer"
          aria-label={dict.wishlist.remove}
        >
          <Trash2 size={18} />
        </button>
      </motion.div>
    );
  }

  // Saved Places tab translations
  const placesTabTitle = locale === "tr" ? "Kaydedilen Mekanlar" : "Saved Places";
  const citiesTabTitle = locale === "tr" ? "Kaydedilen Şehirler" : "Saved Cities";
  const emptyPlacesText = locale === "tr" ? "Henüz kaydedilmiş bir gezi noktası veya restoran bulunmuyor." : "No saved places found yet.";

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-3">
          <Heart size={28} className="text-kiremit animate-pulse animate-duration-1000" fill="currentColor" />
          <h1 className="font-display text-4xl italic text-ink">{dict.wishlist.title}</h1>
        </div>

        {/* Saved Cities View Mode Toggles */}
        {activeMainTab === "cities" && cities.length > 0 && (
          <div className="flex gap-1 rounded-full border border-ink/10 p-1 bg-paper/60 backdrop-blur-sm">
            <button
              onClick={() => setViewMode("region")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === "region" ? "bg-kiremit text-paper" : "text-ink/65 hover:text-ink"
              }`}
            >
              <LayoutGrid size={13} /> {dict.wishlist.viewRegion}
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === "list" ? "bg-kiremit text-paper" : "text-ink/65 hover:text-ink"
              }`}
            >
              <Rows3 size={13} /> {dict.wishlist.viewList}
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Controls: Cities vs Places */}
      <div className="flex border-b border-ink/10 mb-8 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveMainTab("cities")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeMainTab === "cities"
              ? "border-kiremit text-kiremit"
              : "border-transparent text-ink/65 hover:text-ink/80"
          }`}
        >
          <MapPinned size={16} />
          {citiesTabTitle} ({cities.length})
        </button>
        <button
          onClick={() => setActiveMainTab("places")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            activeMainTab === "places"
              ? "border-kiremit text-kiremit"
              : "border-transparent text-ink/65 hover:text-ink/80"
          }`}
        >
          <Heart size={16} />
          {placesTabTitle} ({places.length})
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      <AnimatePresence mode="wait">
        {activeMainTab === "cities" ? (
          /* SECTION A: SAVED CITIES */
          <motion.div
            key="cities-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {cities.length === 0 ? (
              <div className="rounded-2xl border border-ink/8 bg-paper p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <p className="text-ink/65 font-medium mb-5">{dict.wishlist.empty}</p>
                <Link
                  href={`/${locale}/bolgeler`}
                  className="inline-flex items-center gap-2 rounded-xl bg-kiremit px-7 py-3 text-sm font-bold uppercase tracking-wider text-paper hover:bg-kiremit-dark active:scale-[0.98] shadow-md hover:shadow-lg transition-all"
                >
                  {dict.wishlist.exploreButton}
                </Link>
              </div>
            ) : viewMode === "list" ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {cities.map((item) => (
                  <CityRow key={item.citySlug} item={item} />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {groupedCities.map((group) => (
                  <div key={group.regionSlug} className="space-y-3">
                    <h2 className="font-display text-xl italic text-ink border-b border-ink/5 pb-2">
                      {translateDataText(group.regionName, locale)}{" "}
                      <span className="font-sans text-xs not-italic text-ink/65">({group.cities.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {group.cities.map((item) => (
                        <CityRow key={item.citySlug} item={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* SECTION B: SAVED PLACES */
          <motion.div
            key="places-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {places.length === 0 ? (
              <div className="rounded-2xl border border-ink/8 bg-paper p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <p className="text-ink/65 font-medium mb-5">{emptyPlacesText}</p>
                <Link
                  href={`/${locale}/bolgeler`}
                  className="inline-flex items-center gap-2 rounded-xl bg-kiremit px-7 py-3 text-sm font-bold uppercase tracking-wider text-paper hover:bg-kiremit-dark active:scale-[0.98] shadow-md hover:shadow-lg transition-all"
                >
                  {dict.wishlist.exploreButton}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {places.map((item) => (
                  <div key={item.id} className="h-full">
                    {item.category === "attractions" && (
                      <AttractionCard attraction={item as any} locale={locale} onClick={() => setSelectedPlace(item)} />
                    )}
                    {item.category === "restaurants" && (
                      <RestaurantCard restaurant={item as any} locale={locale} onClick={() => setSelectedPlace(item)} />
                    )}
                    {item.category === "accommodations" && (
                      <AccommodationCard accommodation={item as any} locale={locale} onClick={() => setSelectedPlace(item)} />
                    )}
                    {item.category === "localFood" && (
                      <FoodCard food={item as any} locale={locale} onClick={() => setSelectedPlace(item)} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Place Details Modal overlay */}
      <AnimatePresence>
        {selectedPlace && (
          <PlaceDetailModal
            place={selectedPlace}
            category={selectedPlace.category}
            locale={locale}
            onClose={() => setSelectedPlace(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
