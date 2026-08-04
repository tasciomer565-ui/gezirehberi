"use client";

import { motion } from "framer-motion";
import { 
  X, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Navigation, 
  Star, 
  DollarSign, 
  Calendar, 
  Accessibility, 
  Info,
  KeyRound
} from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import { translateDataText, Locale } from "@/lib/i18n";
import { getLastMondayDate } from "@/lib/pricingEngine";

interface PlaceDetailModalProps {
  place: any;
  category: string;
  locale?: string;
  onClose: () => void;
}

export default function PlaceDetailModal({
  place,
  category,
  locale = "tr",
  onClose
}: PlaceDetailModalProps) {
  
  // Custom Google Maps deep link for interactive directions
  const directionsUrl = place.location
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        place.name + " " + (place.address || "")
      )}`;

  // UI translations helper
  const t = (key: string) => {
    const dicts = {
      tr: {
        duration: "Tahmini Gezi Süresi",
        bestTime: "En İyi Ziyaret Saati",
        entrance: "Giriş Ücreti",
        directions: "Yol Tarifi Al (Google Maps)",
        phone: "Telefon",
        website: "Web Sitesi",
        accessibility: "Erişilebilirlik",
        parking: "Otopark Durumu",
        tips: "Gezgin İpuçları",
        amenities: "Sunulan İmkanlar",
        signatureDish: "İmza Lezzet",
        averageCost: "Ortalama Fiyat",
        reservation: "Rezervasyon",
        reservationNeeded: "Rezervasyon Gerekli",
        reservationNotNeeded: "Rezervasyon Gerekli Değil",
        ingredients: "Malzemeler",
        bestSeason: "En İyi Mevsim",
        origin: "Köken",
        rating: "Popülerlik Puanı",
        address: "Adres",
        close: "Kapat",
        features: "Mekan Özellikleri"
      },
      en: {
        duration: "Estimated Duration",
        bestTime: "Best Visit Time",
        entrance: "Entrance Fee",
        directions: "Get Directions (Google Maps)",
        phone: "Phone",
        website: "Website",
        accessibility: "Accessibility",
        parking: "Parking Info",
        tips: "Traveler Tips",
        amenities: "Amenities",
        signatureDish: "Signature Dish",
        averageCost: "Average Cost",
        reservation: "Reservation",
        reservationNeeded: "Reservation Required",
        reservationNotNeeded: "Walk-ins Welcome",
        ingredients: "Ingredients",
        bestSeason: "Best Season",
        origin: "Origin",
        rating: "Popularity Rating",
        address: "Address",
        close: "Close",
        features: "Venue Features"
      }
    };
    return dicts[locale as "tr" | "en"]?.[key as keyof typeof dicts.tr] || dicts.tr[key as keyof typeof dicts.tr];
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink/50 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-ink/8 bg-paper shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Close Button overlay */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-paper/85 text-ink shadow-md hover:bg-paper cursor-pointer transition-colors border border-ink/5"
          aria-label={t("close")}
        >
          <X size={18} />
        </button>

        {/* Modal Scrollable area */}
        <div className="overflow-y-auto scrollbar-none flex-1">
          {/* Cover image banner */}
          <div className="relative">
            <PlaceholderImage seed={place.id} regionSlug={place.regionSlug} aspect="wide" />
            <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-transparent z-10 opacity-95" />
          </div>

          {/* Place Title, Category Badge and Ratings */}
          <div className="px-6 pb-6 relative z-20">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-full bg-kiremit/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-kiremit shadow-sm">
                {category === "attractions" ? (place.category || "attraction") : category}
              </span>
              {place.rating && (
                <span className="flex items-center gap-1 rounded-full bg-safran/10 px-2.5 py-0.5 text-xs font-bold text-kiremit">
                  <Star size={12} fill="currentColor" className="text-safran" /> {place.rating} ({place.reviewCount})
                </span>
              )}
            </div>

            <h2 className="font-display text-2xl sm:text-3xl italic text-ink mb-3 pr-8 leading-tight">
              {translateDataText(place.name, locale as Locale)}
            </h2>

            <p className="text-sm text-ink/75 leading-relaxed mb-6 font-medium">
              {translateDataText(place.longDescription || place.description, locale as Locale)}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-ink/5 pt-5">
              {/* Left Column: Categorized Details */}
              <div className="space-y-4">
                
                {/* --- ATTRACTION FIELDS --- */}
                {category === "attractions" && (
                  <>
                    <div className="flex items-start gap-3">
                      <Clock size={16} className="text-kiremit mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-kiremit uppercase tracking-wider">{t("duration")}</p>
                        <p className="text-sm text-ink/85 font-semibold">{translateDataText(place.duration, locale as Locale)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="text-kiremit mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-kiremit uppercase tracking-wider">{t("bestTime")}</p>
                        <p className="text-sm text-ink/85 font-semibold">{translateDataText(place.bestTime || place.bestPhotoTime || "", locale as Locale)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign size={16} className="text-kiremit mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-kiremit uppercase tracking-wider">{t("entrance")}</p>
                        <p className="text-sm text-ink/85 font-semibold">{translateDataText(place.entranceFee, locale as Locale)}</p>
                        {place.entranceFee && !String(place.entranceFee).toLowerCase().includes("ücretsiz") && !String(place.entranceFee).toLowerCase().includes("free") && (
                          <>
                            <p className="text-[10px] text-ink/40 font-bold mt-0.5 block">
                              Son Fiyat Güncellemesi: {getLastMondayDate(locale)}
                            </p>
                            <p className="text-[9px] text-kiremit/70 font-semibold mt-0.5 leading-tight">
                              🛡️ Sezonluk Ortalama Tahmini Fiyattır (Tesisle Teyit Ediniz)
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* --- RESTAURANT FIELDS --- */}
                {category === "restaurants" && (
                  <>
                    <div className="flex items-start gap-3">
                      <DollarSign size={16} className="text-kiremit mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-kiremit uppercase tracking-wider">{t("averageCost")}</p>
                        <p className="text-sm text-ink/85 font-semibold">{translateDataText(place.averageCost, locale as Locale)}</p>
                        <p className="text-[10px] text-ink/40 font-bold mt-0.5 block">
                          Son Fiyat Güncellemesi: {getLastMondayDate(locale)}
                        </p>
                        <p className="text-[9px] text-kiremit/70 font-semibold mt-0.5 leading-tight">
                          🛡️ Sezonluk Ortalama Tahmini Fiyattır (Tesisle Teyit Ediniz)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Star size={16} className="text-kiremit mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-kiremit uppercase tracking-wider">{t("signatureDish")}</p>
                        <p className="text-sm text-ink/85 font-semibold italic">{translateDataText(place.signatureDish || "", locale as Locale)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <KeyRound size={16} className="text-kiremit mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-kiremit uppercase tracking-wider">{t("reservation")}</p>
                        <p className="text-sm text-ink/85 font-semibold">
                          {place.reservationNeeded ? t("reservationNeeded") : t("reservationNotNeeded")}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* --- ACCOMMODATION FIELDS --- */}
                {category === "accommodations" && (
                  <>
                    <div className="flex items-start gap-3">
                      <DollarSign size={16} className="text-kiremit mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-kiremit uppercase tracking-wider">{locale === "tr" ? "Gecelik Ücret" : "Price Per Night"}</p>
                        <p className="text-sm text-ink/85 font-semibold">{translateDataText(place.pricePerNight, locale as Locale)}</p>
                        <p className="text-[10px] text-ink/40 font-bold mt-0.5 block">
                          Son Fiyat Güncellemesi: {getLastMondayDate(locale)}
                        </p>
                        <p className="text-[9px] text-kiremit/70 font-semibold mt-0.5 leading-tight">
                          🛡️ Sezonluk Ortalama Tahmini Fiyattır (Tesisle Teyit Ediniz)
                        </p>
                      </div>
                    </div>
                    {place.amenities && place.amenities.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Info size={16} className="text-kiremit mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-kiremit uppercase tracking-wider">{t("amenities")}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {place.amenities.map((am: string) => (
                              <span key={am} className="rounded-md bg-ink/5 px-2 py-0.5 text-[10px] font-semibold text-ink/75">
                                {translateDataText(am, locale as Locale)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* --- LOCAL FOOD FIELDS --- */}
                {category === "localFood" && (
                  <>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-kiremit mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-kiremit uppercase tracking-wider">{t("origin")}</p>
                        <p className="text-sm text-ink/85 font-semibold">{translateDataText(place.origin || "", locale as Locale)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="text-kiremit mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-kiremit uppercase tracking-wider">{t("bestSeason")}</p>
                        <p className="text-sm text-ink/85 font-semibold">{translateDataText(place.bestSeason || "", locale as Locale)}</p>
                      </div>
                    </div>
                    {place.ingredients && place.ingredients.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Info size={16} className="text-kiremit mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-kiremit uppercase tracking-wider">{t("ingredients")}</p>
                          <p className="text-sm text-ink/80">{place.ingredients.join(", ")}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Map Address & Direct directions link */}
                {place.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-kiremit mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-kiremit uppercase tracking-wider">{t("address")}</p>
                      <p className="text-sm text-ink/85 leading-relaxed">{translateDataText(place.address, locale as Locale)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Contact details, directions button, and tips */}
              <div className="space-y-4">
                {/* Contact Phone & Website */}
                {(place.phone || place.website) && (
                  <div className="rounded-2xl border border-ink/5 bg-ink/5 p-4 space-y-2.5">
                    {place.phone && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-ink/75">
                        <Phone size={14} className="text-kiremit" />
                        <span>{place.phone}</span>
                      </div>
                    )}
                    {place.website && (
                      <a 
                        href={place.website.startsWith("http") ? place.website : `https://${place.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-bold text-kiremit hover:underline"
                      >
                        <Globe size={14} />
                        <span>{t("website")}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Interactive Direction Link */}
                {place.address && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-kiremit text-paper py-3.5 text-xs font-bold uppercase tracking-wider shadow hover:bg-kiremit-dark active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Navigation size={14} />
                    {t("directions")}
                  </a>
                )}

                {/* Traveler Tips block */}
                {place.tips && (
                  <div className="rounded-2xl border border-safran/10 bg-safran/5 p-4">
                    <p className="text-xs font-bold text-kiremit uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      💡 {t("tips")}
                    </p>
                    <p className="text-xs text-ink/80 leading-relaxed font-semibold">
                      {Array.isArray(place.tips) 
                        ? translateDataText(place.tips[0], locale as Locale) 
                        : translateDataText(place.tips, locale as Locale)}
                    </p>
                  </div>
                )}

                {/* Attraction specific accessibility and parking info */}
                {category === "attractions" && (
                  <div className="space-y-2">
                    {place.accessibility && (
                      <div className="flex items-start gap-2 text-[11px] text-ink/65 font-medium leading-relaxed">
                        <Accessibility size={14} className="text-turkuaz shrink-0 mt-0.5" />
                        <span>{translateDataText(place.accessibility, locale as Locale)}</span>
                      </div>
                    )}
                    {place.parkingTip && (
                      <div className="flex items-start gap-2 text-[11px] text-ink/65 font-medium leading-relaxed">
                        <Info size={14} className="text-turkuaz shrink-0 mt-0.5" />
                        <span>{translateDataText(place.parkingTip, locale as Locale)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Restaurant Features info */}
                {category === "restaurants" && place.features && place.features.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-kiremit uppercase tracking-wider mb-1">{t("features")}</p>
                    <div className="flex flex-wrap gap-1">
                      {place.features.map((feat: string) => (
                        <span key={feat} className="rounded-md bg-ink/5 px-2 py-0.5 text-[9px] font-semibold text-ink/75">
                          {translateDataText(feat, locale as Locale)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
