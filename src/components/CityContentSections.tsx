"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPinned, 
  UtensilsCrossed, 
  Soup, 
  BedDouble, 
  Search, 
  SlidersHorizontal, 
  RotateCcw,
  Loader2,
  ChevronDown,
  Layers
} from "lucide-react";
import AttractionCard from "./AttractionCard";
import RestaurantCard from "./RestaurantCard";
import FoodCard from "./FoodCard";
import AccommodationCard from "./AccommodationCard";
import PlaceDetailModal from "./PlaceDetailModal";
import { Attraction, Restaurant, FoodItem, Accommodation } from "@/lib/types";
import { getDictionary, Locale } from "@/lib/i18n";

// Dynamically load the Leaflet Map component on the client side to avoid SSR errors
const PlacesMap = dynamic(() => import("./PlacesMap"), { ssr: false });

interface CityContentSectionsProps {
  citySlug: string;
  cityCenter: [number, number];
  attractions: Attraction[];
  restaurants: Restaurant[];
  localFood: FoodItem[];
  accommodations: Accommodation[];
  locale?: string;
  districtSlug?: string;
}

export default function CityContentSections({
  citySlug,
  cityCenter,
  attractions: initialAttractions,
  restaurants: initialRestaurants,
  localFood: initialLocalFood,
  accommodations: initialAccommodations,
  locale = "tr",
  districtSlug,
}: CityContentSectionsProps) {
  const dict = getDictionary(locale as Locale);

  // Tab State
  const [activeTab, setActiveTab] = useState<string>("attractions"); // attractions, restaurants, accommodations, localFood
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("popularity"); // popularity, constructionYear, price, alphabetical
  const [subFilter, setSubFilter] = useState<string>("all"); // must-see/should-see OR budget/mid/luxury

  // Infinite Scroll / Paging State
  const [items, setItems] = useState<any[]>(() => {
    return initialAttractions || [];
  });
  const [offset, setOffset] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(() => {
    return initialAttractions ? initialAttractions.length : 0;
  });
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  // Map viewport boundary state
  const [mapViewportFilter, setMapViewportFilter] = useState<boolean>(false);
  const [mapBounds, setMapBounds] = useState<{ northEast: [number, number]; southWest: [number, number] } | null>(null);

  const PAGE_LIMIT = 24;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Debounce Search Queries (250ms) to prevent excessive API requests
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // 2. Fetch Places dynamically from server route on activeTab, sortOption, debouncedQuery changes
  useEffect(() => {
    setLoading(true);
    setOffset(0);
    
    const fetchPlaces = async () => {
      try {
        const queryParams = new URLSearchParams({
          type: activeTab,
          limit: PAGE_LIMIT.toString(),
          offset: "0",
          sort: sortOption,
          query: debouncedQuery,
        });
        if (districtSlug) {
          queryParams.append("district", districtSlug);
        }

        const res = await fetch(`/api/cities/${citySlug}/places?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch places");
        
        const data = await res.json();
        setItems(data.items || []);
        setTotalCount(data.totalCount || 0);
        setHasMore(data.hasMore);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [activeTab, sortOption, debouncedQuery, citySlug, districtSlug]);

  // 3. Load More Paginated Data (Offset shift)
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    
    const nextOffset = offset + PAGE_LIMIT;
    try {
      const queryParams = new URLSearchParams({
        type: activeTab,
        limit: PAGE_LIMIT.toString(),
        offset: nextOffset.toString(),
        sort: sortOption,
        query: debouncedQuery,
      });
      if (districtSlug) {
        queryParams.append("district", districtSlug);
      }

      const res = await fetch(`/api/cities/${citySlug}/places?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch more places");

      const data = await res.json();
      setItems((prev) => [...prev, ...(data.items || [])]);
      setOffset(nextOffset);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Reset Sub-filters and Sort Option when tab changes
  useEffect(() => {
    setSubFilter("all");
    setSortOption("popularity");
  }, [activeTab]);

  // 4. Compute categories lists based on active tab and filters
  const processedItems = useMemo(() => {
    let result = [...items];

    // Client-side Category Sub-Filters for immediate response
    if (subFilter !== "all") {
      if (activeTab === "attractions") {
        result = result.filter((item) => item.importance === subFilter);
      } else if (activeTab === "restaurants" || activeTab === "accommodations") {
        result = result.filter((item) => item.priceRange === subFilter);
      }
    }

    // Client-side Map Viewport bounds filter (Filters immediately as user pans map)
    if (mapViewportFilter && mapBounds) {
      const { northEast, southWest } = mapBounds;
      result = result.filter((item) => {
        if (!item.location || !item.location.lat) return false;
        const lat = item.location.lat;
        const lng = item.location.lng;
        return (
          lat <= northEast[0] &&
          lat >= southWest[0] &&
          lng <= northEast[1] &&
          lng >= southWest[1]
        );
      });
    }

    return result;
  }, [items, subFilter, activeTab, mapViewportFilter, mapBounds]);

  // UI Strings
  const tabs = [
    { id: "attractions", label: dict.city.attractions, icon: <MapPinned size={16} /> },
    { id: "restaurants", label: dict.city.whereToEat, icon: <UtensilsCrossed size={16} /> },
    { id: "accommodations", label: dict.city.whereToStay, icon: <BedDouble size={16} /> },
    { id: "localFood", label: dict.city.whatToEat, icon: <Soup size={16} /> },
  ];

  const ATTRACTION_FILTERS = [
    { value: "all", label: locale === "tr" ? "Tüm Önem Seviyeleri" : "All Importance" },
    { value: "must-see", label: locale === "tr" ? "Mutlaka Görün" : "Must See" },
    { value: "should-see", label: locale === "tr" ? "Görülmeli" : "Should See" },
    { value: "nice-to-have", label: locale === "tr" ? "Zaman Varsa" : "Nice to Have" },
  ];

  const BUDGET_FILTERS = [
    { value: "all", label: locale === "tr" ? "Tüm Bütçeler" : "All Budgets" },
    { value: "budget", label: locale === "tr" ? "Ekonomik" : "Budget" },
    { value: "mid", label: locale === "tr" ? "Orta" : "Mid-range" },
    { value: "luxury", label: locale === "tr" ? "Lüks" : "Luxury" },
  ];

  const sortOptions = useMemo(() => {
    if (activeTab === "attractions") {
      return [
        { value: "popularity", label: locale === "tr" ? "🌟 Google Popülerliği" : "🌟 Google Popularity" },
        { value: "constructionYear", label: locale === "tr" ? "⏳ Tarihsel Yaş (En Eski)" : "⏳ Oldest Year" },
        { value: "price", label: locale === "tr" ? "💰 Bütçe (Ücretsiz / Ücretli)" : "💰 Budget (Free first)" },
        { value: "alphabetical", label: locale === "tr" ? "🔤 Alfabetik (A-Z)" : "🔤 Alphabetical (A-Z)" },
      ];
    } else if (activeTab === "restaurants" || activeTab === "accommodations") {
      return [
        { value: "popularity", label: locale === "tr" ? "🌟 Google Popülerliği" : "🌟 Google Popularity" },
        { value: "price", label: locale === "tr" ? "💰 Fiyat Segmenti (Ekonomik - Lüks)" : "💰 Price (Budget to Luxury)" },
        { value: "alphabetical", label: locale === "tr" ? "🔤 Alfabetik (A-Z)" : "🔤 Alphabetical (A-Z)" },
      ];
    } else {
      return [
        { value: "popularity", label: locale === "tr" ? "🌟 Kökensel Popülerlik (İmza)" : "🌟 Signature Popularity" },
        { value: "alphabetical", label: locale === "tr" ? "🔤 Alfabetik (A-Z)" : "🔤 Alphabetical (A-Z)" },
      ];
    }
  }, [activeTab, locale]);

  return (
    <div className="space-y-8">
      {/* 1. Main Navigation Tabs */}
      <div className="flex border-b border-ink/10 overflow-x-auto scrollbar-none gap-2 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "border-kiremit text-kiremit"
                : "border-transparent text-ink/50 hover:text-ink/80 hover:border-ink/20"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. Interactive Discovery Layout: Split Panel (List & Sticky Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start relative">
        {/* Left Column: Filter Panel, Search Panel, Place Cards Grid (3/5 wide) */}
        <div className={`lg:col-span-3 space-y-6 ${mobileView === "list" ? "block" : "hidden lg:block"}`}>
          
          {/* Glassmorphic Search & Filters Bar */}
          <div className="rounded-2xl border border-ink/10 bg-paper/60 backdrop-blur-md p-4 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-3.5 text-ink/40" />
                <input
                  type="text"
                  placeholder={locale === "tr" ? "Mekan adı, kelime veya bölge ara..." : "Search places..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-ink/10 bg-paper py-3 pl-10 pr-4 text-sm text-ink placeholder:text-ink/40 focus:border-kiremit focus:ring-1 focus:ring-kiremit outline-none transition-all shadow-inner"
                />
              </div>

              {/* Sort Selector Dropdown */}
              <div className="relative min-w-[200px]">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-ink/10 bg-paper py-3 pl-4 pr-10 text-sm font-semibold text-ink/85 focus:border-kiremit focus:ring-1 focus:ring-kiremit outline-none transition-all cursor-pointer shadow-sm"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-4 text-ink/50 pointer-events-none" />
              </div>
            </div>

            {/* Filter buttons & Map bounding toggles */}
            <div className="flex flex-wrap gap-3 items-center justify-between border-t border-ink/5 pt-3.5">
              {/* Tab specific filter chips */}
              <div className="flex flex-wrap gap-1.5">
                {activeTab === "attractions" &&
                  ATTRACTION_FILTERS.map((filt) => (
                    <button
                      key={filt.value}
                      onClick={() => setSubFilter(filt.value)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        subFilter === filt.value
                          ? "bg-kiremit text-paper"
                          : "border border-ink/10 text-ink/65 hover:border-kiremit/40 bg-paper"
                      }`}
                    >
                      {filt.label}
                    </button>
                  ))}

                {(activeTab === "restaurants" || activeTab === "accommodations") &&
                  BUDGET_FILTERS.map((filt) => (
                    <button
                      key={filt.value}
                      onClick={() => setSubFilter(filt.value)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        subFilter === filt.value
                          ? "bg-kiremit text-paper"
                          : "border border-ink/10 text-ink/65 hover:border-kiremit/40 bg-paper"
                      }`}
                    >
                      {filt.label}
                    </button>
                  ))}
              </div>

              {/* Viewport Boundary Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-ink/75 hover:text-kiremit select-none">
                <input
                  type="checkbox"
                  checked={mapViewportFilter}
                  onChange={(e) => setMapViewportFilter(e.target.checked)}
                  className="rounded border-ink/20 text-kiremit focus:ring-kiremit cursor-pointer"
                />
                <Layers size={14} className="text-ink/60" />
                {locale === "tr" ? "Harita Sınırlarına Göre Filtrele" : "Filter by Map Bounds"}
              </label>
            </div>
          </div>

          {/* Place Count Summary */}
          <div className="flex items-center justify-between text-xs text-ink/40 font-semibold px-1">
            <p>
              {locale === "tr" 
                ? `${totalCount} kayıttan ${processedItems.length} adeti gösteriliyor`
                : `Showing ${processedItems.length} of ${totalCount} records`}
            </p>
            {loading && <Loader2 size={16} className="animate-spin text-kiremit" />}
          </div>

          {/* Loading Main Spinner */}
          {loading ? (
            <div className="flex h-64 w-full items-center justify-center">
              <Loader2 size={36} className="animate-spin text-kiremit" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Dynamic Place List Grid */}
              <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {processedItems.map((item, idx) => (
                    <motion.div 
                      key={item.id} 
                      layout 
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                    >
                      {activeTab === "attractions" && (
                        <AttractionCard attraction={item} locale={locale} onClick={() => setSelectedPlace(item)} />
                      )}
                      {activeTab === "restaurants" && (
                        <RestaurantCard restaurant={item} locale={locale} onClick={() => setSelectedPlace(item)} />
                      )}
                      {activeTab === "accommodations" && (
                        <AccommodationCard accommodation={item} locale={locale} onClick={() => setSelectedPlace(item)} />
                      )}
                      {activeTab === "localFood" && (
                        <FoodCard food={item} locale={locale} onClick={() => setSelectedPlace(item)} />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* No results message */}
              {processedItems.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/20 py-16 text-center">
                  <p className="text-sm font-semibold text-ink/50 mb-2">
                    {locale === "tr" ? "Aradığınız kriterlere uygun sonuç bulunamadı." : "No results match your filters."}
                  </p>
                  <button 
                    onClick={() => { setSearchQuery(""); setSubFilter("all"); setMapViewportFilter(false); }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink/15 px-3.5 py-1.5 text-xs font-bold text-ink hover:bg-ink/5 transition-colors"
                  >
                    <RotateCcw size={12} /> {locale === "tr" ? "Filtreleri Temizle" : "Reset Filters"}
                  </button>
                </div>
              )}

              {/* Paginated "Load More" Button */}
              {hasMore && processedItems.length > 0 && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 rounded-xl bg-kiremit px-8 py-3 text-sm font-bold uppercase tracking-wider text-paper hover:bg-kiremit-dark active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none transition-all"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {locale === "tr" ? "YÜKLENİYOR..." : "LOADING..."}
                      </>
                    ) : (
                      locale === "tr" ? "DAHA FAZLA GÖSTER" : "LOAD MORE"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`lg:col-span-2 relative h-[450px] lg:h-[calc(100vh-180px)] lg:sticky lg:top-24 ${mobileView === "map" ? "block h-[calc(100vh-180px)]" : "hidden lg:block"}`}>
          <PlacesMap
            center={cityCenter}
            zoom={12}
            places={processedItems}
            locale={locale}
            onBoundsChange={(bounds) => {
              setMapBounds(bounds);
            }}
          />
        </div>
      </div>

      {/* Place Details Modal overlay */}
      <AnimatePresence>
        {selectedPlace && (
          <PlaceDetailModal
            place={selectedPlace}
            category={activeTab}
            locale={locale}
            onClose={() => setSelectedPlace(null)}
          />
        )}
      </AnimatePresence>
      {/* Floating Mobile Toggle Button (Positioned higher to avoid overlapping iOS/Android browser bottom bars) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[40] lg:hidden">
        <button
          onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
          className="flex h-12 min-w-[170px] items-center justify-center gap-2.5 rounded-full bg-ink text-paper px-8 py-3.5 text-xs font-bold uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-[0.98] transition-all cursor-pointer border border-paper/10"
        >
          {mobileView === "list" ? (
            <>
              🗺️ {locale === "tr" ? "Haritayı Göster" : "Show Map"}
            </>
          ) : (
            <>
              📋 {locale === "tr" ? "Listeyi Göster" : "Show List"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
