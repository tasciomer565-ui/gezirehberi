"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  ChevronDown,
  Footprints,
  Car,
  AlertTriangle,
  Printer,
  Copy,
  StickyNote,
  BedDouble,
  MapPin,
  UtensilsCrossed,
  ShoppingBag,
  Compass,
  Zap,
} from "lucide-react";
import { DayPlan, TransferBlock, RegionSlug } from "@/lib/types";
import { TIME_SLOT_LABELS, optimizeTSP, estimateTransfer } from "@/lib/geo";
import { REGION_THEMES } from "@/lib/regionTheme";
import { getDictionary, Locale, translateDataText } from "@/lib/i18n";
import {
  loadItineraryLocalState,
  saveItineraryLocalState,
  getMockWeather,
  ItineraryLocalState,
} from "@/lib/itineraryLocal";
import BudgetTracker, { DayBudget } from "./BudgetTracker";

const Map = dynamic(() => import("./Map"), { ssr: false });

const TYPE_ICON: Record<string, React.ReactNode> = {
  attraction: <MapPin size={15} />,
  dining: <UtensilsCrossed size={15} />,
  accommodation: <BedDouble size={15} />,
  shopping: <ShoppingBag size={15} />,
  activity: <Compass size={15} />,
  travel: <Car size={15} />,
};

function TransferRow({ transfer, locale }: { transfer: TransferBlock; locale: string }) {
  const isRtl = locale === "ar";
  const dict = getDictionary(locale as Locale);

  const modeText = transfer.mode === "walk"
    ? locale === "tr" ? "yürüyüş" : locale === "de" ? "Zu Fuß" : locale === "ar" ? "مشياً" : "walk"
    : locale === "tr" ? "sürüş" : locale === "de" ? "Fahren" : locale === "ar" ? "قيادة" : "drive";

  return (
    <div
      className={`flex items-center gap-2 border-dashed py-2 text-xs ${
        isRtl ? "mr-5 border-r-2 pr-4 pl-0" : "ml-5 border-l-2 pl-4 pr-0"
      } ${transfer.isLongTransfer ? "border-safran text-kiremit font-semibold" : "border-ink/15 text-ink/50"}`}
    >
      {transfer.mode === "walk" ? <Footprints size={13} /> : <Car size={13} />}
      <span>
        {transfer.distanceKm} km · ~{transfer.estimatedMinutes} {locale === "tr" ? "dk" : locale === "de" ? "Min" : locale === "ar" ? "د" : "mins"} {modeText}
      </span>
      {transfer.isLongTransfer && (
        <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-safran/20 px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider">
          <AlertTriangle size={11} /> {locale === "tr" ? "UZUN TRANSFER" : locale === "de" ? "LANGER TRANSFER" : locale === "ar" ? "انتقال طويل" : "LONG TRANSFER"}
        </span>
      )}
    </div>
  );
}

function DayCard({
  plan,
  citySlug,
  isOpen,
  onToggle,
  localState,
  onToggleCheck,
  onNoteChange,
  onDuplicate,
  onBudgetChange,
  onOptimize,
  totalDays,
  locale,
}: {
  plan: DayPlan;
  citySlug: string;
  isOpen: boolean;
  onToggle: () => void;
  localState: ItineraryLocalState;
  onToggleCheck: (day: number, order: number) => void;
  onNoteChange: (day: number, note: string) => void;
  onDuplicate: (fromDay: number, toDay: number) => void;
  onBudgetChange: (day: number, budget: DayBudget) => void;
  onOptimize: (day: number) => void;
  totalDays: number;
  locale: string;
}) {
  const dict = getDictionary(locale as Locale);
  const isRtl = locale === "ar";
  const weather = getMockWeather(citySlug, plan.day);
  const checkedCount = plan.stops.filter((s) => localState.checked[`${plan.day}-${s.order}`]).length;
  const progress = plan.stops.length > 0 ? Math.round((checkedCount / plan.stops.length) * 100) : 0;

  const grouped: Record<string, typeof plan.stops> = { morning: [], afternoon: [], evening: [] };
  plan.stops.forEach((s) => {
    const slot = s.timeSlot ?? "morning";
    grouped[slot].push(s);
  });

  const [showDuplicateMenu, setShowDuplicateMenu] = useState(false);
  const [noteValue, setNoteValue] = useState(localState.notes[plan.day] ?? "");

  // Local weather condition translation
  const weatherConditionText = locale === "tr"
    ? weather.condition
    : locale === "de"
    ? weather.condition === "güneşli" ? "Sonnig" : weather.condition === "parçalı bulutlu" ? "Teilweise bewölkt" : weather.condition === "yağmurlu" ? "Regnerisch" : weather.condition === "karlı" ? "Schneebedeckt" : "Nebelig"
    : locale === "ar"
    ? weather.condition === "güneşli" ? "مشمس" : weather.condition === "parçalı bulutlu" ? "غائم جزئياً" : weather.condition === "yağmurlu" ? "ممطر" : weather.condition === "karlı" ? "ثلجي" : "ضبابي"
    : weather.condition === "güneşli" ? "Sunny" : weather.condition === "parçalı bulutlu" ? "Partly cloudy" : weather.condition === "yağmurlu" ? "Rainy" : weather.condition === "karlı" ? "Snowy" : "Foggy";

  const totalBudget = localState.budgets?.[plan.day]
    ? localState.budgets[plan.day].accommodation +
      localState.budgets[plan.day].food +
      localState.budgets[plan.day].tickets +
      localState.budgets[plan.day].transport
    : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-paper/95 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-ink/[0.02] sm:p-6"
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl italic text-ink sm:text-2xl">
              {dict.city.daysCount} {plan.day}: {translateDataText(plan.title, locale as Locale)}
            </h3>
            <span className="rounded-full bg-kiremit/10 px-2.5 py-1 text-xs font-bold text-kiremit">
              {plan.stops.length} {dict.city.stopsCount}
            </span>
            <span className="flex items-center gap-1 text-xs text-ink/55 bg-ink/[0.03] px-2 py-0.5 rounded-full">
              {weather.icon} {weather.tempC}°C · {weatherConditionText}
            </span>
          </div>
          <div className={`mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/50 ${isRtl ? "flex-row-reverse" : ""}`}>
            {plan.totalWalkingKm !== undefined && plan.totalWalkingKm > 0 && (
              <span className="flex items-center gap-1 font-semibold">
                <Footprints size={12} /> {plan.totalWalkingKm} km {dict.city.walkingDistance}
              </span>
            )}
            {totalBudget > 0 ? (
              <span className="font-semibold text-kiremit">💰 {totalBudget} ₺</span>
            ) : (
              plan.estimatedSpend && <span className="font-semibold">💰 {translateDataText(plan.estimatedSpend, locale as Locale)}</span>
            )}
            <span>⏱ {translateDataText(plan.totalDuration, locale as Locale)}</span>
          </div>
          <div className="mt-3.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-turkuaz transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-ink/40 flex-shrink-0">
          <ChevronDown size={20} />
        </motion.span>
      </button>

      <motion.div
        initial={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="border-t border-ink/10 px-5 pb-6 pt-4 sm:px-6">
          {/* Premium Control Bar */}
          <div className="mb-5 flex flex-wrap gap-2 border-b border-ink/5 pb-4">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-paper/60 px-3 py-1.5 text-xs font-bold text-ink/70 hover:border-kiremit hover:text-kiremit transition-colors focus:outline-none"
            >
              <Printer size={13} /> {dict.city.printItinerary}
            </button>
            
            <button
              onClick={() => onOptimize(plan.day)}
              className="inline-flex items-center gap-1.5 rounded-full bg-kiremit/10 px-3 py-1.5 text-xs font-bold text-kiremit hover:bg-kiremit hover:text-paper transition-all focus:outline-none"
              title="Optimize route geographically using TSP algorithm"
            >
              <Zap size={13} /> {dict.city.optimizeRoute}
            </button>

            {plan.stops.filter((s) => s.location).length > 0 && (
              <a
                href={(() => {
                  const validStops = plan.stops.filter((s) => s.location);
                  if (validStops.length === 0) return "#";
                  const origin = validStops[0];
                  const destination = validStops[validStops.length - 1];
                  const waypoints = validStops.slice(1, -1).map((s) => `${s.location!.lat},${s.location!.lng}`).join("|");
                  return `https://www.google.com/maps/dir/?api=1&origin=${origin.location!.lat},${origin.location!.lng}&destination=${destination.location!.lat},${destination.location!.lng}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-paper/60 px-3.5 py-1.5 text-xs font-bold text-ink/70 hover:border-kiremit hover:text-kiremit transition-colors focus:outline-none"
                title="Open all stops for this day in Google Maps Navigation"
              >
                🗺️ {locale === "tr" ? "Günü Haritada Aç" : "Open Day in Maps"}
              </a>
            )}

            <div className="relative">
              <button
                onClick={() => setShowDuplicateMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-paper/60 px-3 py-1.5 text-xs font-bold text-ink/70 hover:border-kiremit hover:text-kiremit transition-colors focus:outline-none"
              >
                <Copy size={13} /> {dict.city.duplicateDay}
              </button>
              {showDuplicateMenu && (
                <div className={`absolute z-10 mt-1.5 rounded-xl border border-ink/10 bg-paper p-1.5 shadow-xl ${isRtl ? "right-0" : "left-0"}`}>
                  {Array.from({ length: totalDays }, (_, i) => i + 1)
                    .filter((d) => d !== plan.day)
                    .map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          onDuplicate(plan.day, d);
                          setShowDuplicateMenu(false);
                        }}
                        className="block w-full whitespace-nowrap rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-ink/70 hover:bg-kiremit/10 hover:text-kiremit transition-colors"
                      >
                        {dict.city.duplicateTo} {d}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Stops list grouped by Time Slots */}
          {(["morning", "afternoon", "evening"] as const).map((slot) => {
            const stopsInSlot = grouped[slot];
            if (stopsInSlot.length === 0) return null;
            
            let slotLabel = TIME_SLOT_LABELS[slot].label;
            if (locale === "de") {
              slotLabel = slot === "morning" ? "Morgen" : slot === "afternoon" ? "Nachmittag" : "Abend";
            } else if (locale === "ar") {
              slotLabel = slot === "morning" ? "الصباح" : slot === "afternoon" ? "الظهيرة" : "المساء";
            } else if (locale === "en") {
              slotLabel = slot === "morning" ? "Morning" : slot === "afternoon" ? "Afternoon" : "Evening";
            }

            return (
              <div key={slot} className="mb-6 last:mb-0">
                <div className={`mb-3 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <span className="text-sm font-bold text-deniz">
                    {slotLabel}
                  </span>
                  <span className="text-xs text-ink/40">{TIME_SLOT_LABELS[slot].range}</span>
                </div>
                <div className="space-y-1">
                  {stopsInSlot.map((stop) => {
                    const isChecked = !!localState.checked[`${plan.day}-${stop.order}`];
                    const transfer = plan.transfers?.find((t) => t.fromOrder === stop.order);
                    return (
                      <div key={stop.order}>
                        <div className={`flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-ink/[0.02] ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                          <button
                            onClick={() => onToggleCheck(plan.day, stop.order)}
                            className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                              isChecked
                                ? "border-turkuaz bg-turkuaz text-paper"
                                : "border-ink/20 text-ink/40 hover:border-kiremit hover:scale-105"
                            }`}
                            aria-label={isChecked ? "Remove completed tick" : "Mark completed"}
                          >
                            {isChecked ? "✓" : stop.order}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                              <span className="text-kiremit shrink-0">{TYPE_ICON[stop.type]}</span>
                              <h4
                                className={`font-semibold text-sm text-ink truncate ${
                                  isChecked ? "line-through text-ink/30" : ""
                                }`}
                              >
                                {translateDataText(stop.title, locale as Locale)}
                              </h4>
                            </div>
                            {stop.description && (
                              <p className={`mt-1.5 text-xs text-ink/65 leading-relaxed ${isChecked ? "line-through text-ink/30" : ""}`}>
                                {translateDataText(stop.description, locale as Locale)}
                              </p>
                            )}
                            <div className="mt-1.5 flex items-center gap-3">
                              <p className="text-[10px] font-bold text-ink/35 uppercase tracking-wide">
                                ⏱ {translateDataText(stop.duration, locale as Locale)}
                              </p>
                              {stop.location && (
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${stop.location.lat},${stop.location.lng}&travelmode=walking`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-kiremit hover:underline focus:outline-none"
                                >
                                  🗺️ {locale === "tr" ? "Yol Tarifi" : "Directions"}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        {transfer && <TransferRow transfer={transfer} locale={locale} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Dynamic Budget Panel */}
          <BudgetTracker
            citySlug={citySlug}
            day={plan.day}
            locale={locale}
            initialBudget={
              localState.budgets?.[plan.day] || { accommodation: 0, food: 0, tickets: 0, transport: 0 }
            }
            onBudgetChange={onBudgetChange}
          />

          {/* Day Note Editor */}
          <div className="mt-4 rounded-xl border border-ink/10 bg-ink/[0.01] p-4">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink/60">
              <StickyNote size={13} /> {dict.city.notes}
            </label>
            <textarea
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              onBlur={() => onNoteChange(plan.day, noteValue)}
              placeholder={dict.city.notesPlaceholder}
              className="w-full resize-none rounded-lg border border-ink/10 bg-paper p-2 text-sm text-ink placeholder:text-ink/30 focus:border-kiremit focus:outline-none"
              rows={2}
            />
          </div>

          {plan.notes && (
            <p className="mt-3.5 rounded-lg bg-safran/10 p-3 text-xs text-ink/75 leading-relaxed">💡 {translateDataText(plan.notes, locale as Locale)}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ItineraryTimeline({
  citySlug,
  days,
  dayPlans,
  locale,
  regionSlug,
}: {
  citySlug: string;
  days: number;
  dayPlans: DayPlan[];
  locale: string;
  regionSlug?: string;
}) {
  const [openDay, setOpenDay] = useState<number>(1);
  const [localState, setLocalState] = useState<ItineraryLocalState>({ checked: {}, notes: {}, budgets: {} });
  const [plans, setPlans] = useState<DayPlan[]>(dayPlans);
  const dict = getDictionary(locale as Locale);

  useEffect(() => {
    setLocalState(loadItineraryLocalState(citySlug, days));
  }, [citySlug, days]);

  const persist = useCallback(
    (next: ItineraryLocalState) => {
      setLocalState(next);
      saveItineraryLocalState(citySlug, days, next);
    },
    [citySlug, days]
  );

  const handleToggleCheck = (day: number, order: number) => {
    const key = `${day}-${order}`;
    persist({
      ...localState,
      checked: { ...localState.checked, [key]: !localState.checked[key] },
    });
  };

  const handleNoteChange = (day: number, note: string) => {
    persist({ ...localState, notes: { ...localState.notes, [day]: note } });
  };

  const handleBudgetChange = (day: number, budget: DayBudget) => {
    persist({
      ...localState,
      budgets: {
        ...(localState.budgets || {}),
        [day]: budget,
      },
    });
  };

  const handleDuplicate = (fromDay: number, toDay: number) => {
    const source = plans.find((p) => p.day === fromDay);
    if (!source) return;
    setPlans((prev) =>
      prev.map((p) =>
        p.day === toDay
          ? {
              ...p,
              stops: source.stops.map((s) => ({ ...s })),
              transfers: source.transfers,
              title: `${source.title} (${locale === "tr" ? "kopya" : "copy"})`,
            }
          : p
      )
    );
  };

  // TSP Optimization Handler
  const handleOptimizeTSP = (day: number) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.day !== day) return p;
        const optimizedStops = optimizeTSP(p.stops);
        
        // Recalculate transfers
        const transfers = [];
        let totalWalkingKm = 0;
        for (let i = 0; i < optimizedStops.length - 1; i++) {
          const transfer = estimateTransfer(
            optimizedStops[i].order,
            optimizedStops[i + 1].order,
            optimizedStops[i].location,
            optimizedStops[i + 1].location
          );
          if (transfer) {
            transfers.push(transfer);
            if (transfer.mode === "walk") totalWalkingKm += transfer.distanceKm;
          }
        }

        return {
          ...p,
          stops: optimizedStops,
          transfers,
          totalWalkingKm: Math.round(totalWalkingKm * 10) / 10,
        };
      })
    );
  };

  const overallProgress = useMemo(() => {
    const totalStops = plans.reduce((sum, p) => sum + p.stops.length, 0);
    const totalChecked = plans.reduce(
      (sum, p) => sum + p.stops.filter((s) => localState.checked[`${p.day}-${s.order}`]).length,
      0
    );
    return totalStops > 0 ? Math.round((totalChecked / totalStops) * 100) : 0;
  }, [plans, localState]);

  // Calculate Map Parameters based on selected active Day
  const activePlan = plans.find((p) => p.day === openDay) || plans[0];
  const activeStops = openDay === -1 ? plans.flatMap((p) => p.stops) : activePlan.stops;
  
  const mapMarkers = useMemo(() => {
    return activeStops
      .filter((s) => s.location)
      .map((s, idx) => ({
        id: s.itemId || `${s.order}-${idx}`,
        name: translateDataText(s.title, locale as Locale),
        position: [s.location!.lat, s.location!.lng] as [number, number],
        category: s.type,
      }));
  }, [activeStops, locale]);

  const mapPolyline = useMemo(() => {
    if (openDay === -1) return [];
    return activePlan.stops
      .filter((s) => s.location)
      .map((s) => [s.location!.lat, s.location!.lng] as [number, number]);
  }, [activePlan, openDay]);

  const mapCenter = useMemo(() => {
    const firstStop = activeStops.find((s) => s.location);
    if (firstStop?.location) {
      return [firstStop.location.lat, firstStop.location.lng] as [number, number];
    }
    return [41.0082, 28.9784] as [number, number]; // default Istanbul
  }, [activeStops]);

  const themeColor = regionSlug && REGION_THEMES[regionSlug as RegionSlug]
    ? REGION_THEMES[regionSlug as RegionSlug].primary
    : "#b33a25";

  return (
    <div className="print-itinerary">
      {/* Overall Progress Header */}
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-deniz/5 px-5 py-4 border border-deniz/10 no-print">
        <span className="text-sm font-semibold text-deniz">{dict.city.generalProgress}</span>
        <div className="flex items-center gap-3">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-turkuaz transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="text-sm font-bold text-deniz">{overallProgress}%</span>
        </div>
      </div>

      {/* Mobile Map Component */}
      <div className="block lg:hidden w-full h-[350px] mb-6 no-print">
        <Map
          center={mapCenter}
          zoom={12}
          markers={mapMarkers}
          polylineCoords={mapPolyline}
          themeColor={themeColor}
          locale={locale}
        />
      </div>

      {/* Split view: Timeline (left) + Sticky Map (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-4">
          {plans.map((plan) => (
            <DayCard
              key={plan.day}
              plan={plan}
              citySlug={citySlug}
              isOpen={openDay === plan.day}
              onToggle={() => setOpenDay(openDay === plan.day ? -1 : plan.day)}
              localState={localState}
              onToggleCheck={handleToggleCheck}
              onNoteChange={handleNoteChange}
              onDuplicate={handleDuplicate}
              onBudgetChange={handleBudgetChange}
              onOptimize={handleOptimizeTSP}
              totalDays={days}
              locale={locale}
            />
          ))}
        </div>
        
        {/* Desktop Sticky Map Component */}
        <div className="lg:col-span-2 sticky top-28 hidden lg:block h-[550px] w-full no-print">
          <Map
            center={mapCenter}
            zoom={12}
            markers={mapMarkers}
            polylineCoords={mapPolyline}
            themeColor={themeColor}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
