"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowRight, ArrowLeft, Send, Sparkles, MapPin, Loader2 } from "lucide-react";
import { Attraction } from "@/lib/types";
import { getLocalAuthorName, setLocalAuthorName } from "@/lib/socialDb";
import { createCommunityRoute, CommunityRoute, CommunityStop } from "@/lib/communityApi";
import { getDictionary, Locale } from "@/lib/i18n";

// routes tablosundaki title CHECK kısıtıyla (3-120 karakter) eşleşiyor —
// client burada engellemezse kullanıcı ham bir Postgres hata mesajıyla
// karşılaşıyordu (rapor follow-up).
const MIN_TITLE_LENGTH = 3;

interface RouteBuilderProps {
  citySlug: string;
  regionSlug: string;
  attractions: Attraction[];
  locale: string;
  onPublish: (newRoute: CommunityRoute) => void;
  onClose: () => void;
}

export default function RouteBuilder({ citySlug, regionSlug, attractions, locale, onPublish, onClose }: RouteBuilderProps) {
  const dict = getDictionary(locale as Locale);
  const t = dict.community;
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState(() => getLocalAuthorName());
  const [days, setDays] = useState(3);
  const [selectedAttractions, setSelectedAttractions] = useState<Attraction[]>([]);
  const [stopsInfo, setStopsInfo] = useState<Record<string, { note: string; duration: string }>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const handleToggleSelect = (attraction: Attraction) => {
    setSelectedAttractions((prev) => {
      const exists = prev.some((a) => a.id === attraction.id);
      if (exists) {
        return prev.filter((a) => a.id !== attraction.id);
      } else {
        // Pre-populate note and duration
        setStopsInfo((info) => ({
          ...info,
          [attraction.id]: { note: attraction.description.slice(0, 100), duration: attraction.duration },
        }));
        return [...prev, attraction];
      }
    });
  };

  const handleInfoChange = (id: string, field: "note" | "duration", value: string) => {
    setStopsInfo((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handlePublish = async () => {
    if (title.trim().length < MIN_TITLE_LENGTH || selectedAttractions.length === 0 || isPublishing) return;

    setLocalAuthorName(authorName);
    setIsPublishing(true);
    setPublishError(null);

    const stops: CommunityStop[] = selectedAttractions.map((attraction, index) => {
      const info = stopsInfo[attraction.id] || { note: "", duration: "1 saat" };
      return {
        order: index + 1,
        title: attraction.name,
        description: info.note || attraction.description,
        duration: info.duration || attraction.duration,
        type: "attraction",
      };
    });

    const res = await createCommunityRoute({
      citySlug,
      regionSlug,
      title: title.trim(),
      days,
      stops,
      authorName: authorName.trim() || "Misafir Gezgin",
    });

    setIsPublishing(false);

    if (res.route) {
      onPublish(res.route);
      onClose();
    } else {
      setPublishError(res.error || t.publishError);
    }
  };

  return (
    <div className="rounded-2xl border border-ink/10 bg-paper/95 p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Sparkle backgrounds */}
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-kiremit/5 blur-xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-turkuaz/5 blur-xl pointer-events-none" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-xs font-bold uppercase tracking-wider text-ink/65 hover:text-kiremit focus:outline-none"
      >
        {t.cancel}
      </button>

      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="text-kiremit" size={20} />
        <h2 className="font-display text-2xl italic text-ink">{t.builderTitle}</h2>
      </div>

      {/* Steps indicator */}
      <div className="mb-8 flex items-center gap-3">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex-1 flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step >= num ? "bg-kiremit text-paper" : "bg-ink/10 text-ink/65"
              }`}
            >
              {num}
            </div>
            <div className={`h-1 flex-1 rounded-full ${step > num ? "bg-kiremit" : "bg-ink/10"}`} />
          </div>
        ))}
      </div>

      {/* Step Contents */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink/65">
                {t.routeTitleLabel}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.routeTitlePlaceholder}
                className="w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 text-sm text-ink focus:border-kiremit focus:outline-none font-semibold"
              />
              {title.trim().length > 0 && title.trim().length < MIN_TITLE_LENGTH && (
                <p className="text-[11px] font-semibold text-kiremit">
                  {t.titleMinLengthHint.replace("{min}", String(MIN_TITLE_LENGTH))}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink/65">
                {t.yourNameLabel}
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={t.yourNamePlaceholder}
                maxLength={40}
                className="w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 text-sm text-ink focus:border-kiremit focus:outline-none font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink/65">
                {t.tripDurationLabel}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 5, 7].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`rounded-lg py-2 text-xs font-bold border transition-all ${
                      days === d
                        ? "border-kiremit bg-kiremit/10 text-kiremit"
                        : "border-ink/10 bg-paper text-ink hover:border-kiremit"
                    }`}
                  >
                    {d} {t.daysUnit}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={title.trim().length < MIN_TITLE_LENGTH}
                className="flex items-center gap-1.5 rounded-full bg-kiremit px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-paper shadow disabled:opacity-45 focus:outline-none hover:bg-ink transition-colors"
              >
                {t.selectPlaces} <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink/65 block">
              {t.addPlacesToVisit}
            </label>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {attractions.map((attraction) => {
                const isSelected = selectedAttractions.some((a) => a.id === attraction.id);
                return (
                  <button
                    key={attraction.id}
                    type="button"
                    onClick={() => handleToggleSelect(attraction)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-kiremit bg-kiremit/5 text-kiremit"
                        : "border-ink/10 bg-paper hover:border-kiremit"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className={isSelected ? "text-kiremit" : "text-ink/65"} />
                      <div>
                        <p className="text-xs font-bold text-ink">{attraction.name}</p>
                        <p className="text-[10px] text-ink/65 font-semibold">{attraction.category}</p>
                      </div>
                    </div>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs font-bold ${
                        isSelected ? "border-kiremit bg-kiremit text-paper" : "border-ink/20"
                      }`}
                    >
                      {isSelected ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-ink/70 hover:border-kiremit hover:text-kiremit transition-colors focus:outline-none"
              >
                <ArrowLeft size={13} /> {t.back}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={selectedAttractions.length === 0}
                className="flex items-center gap-1.5 rounded-full bg-kiremit px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-paper shadow disabled:opacity-45 focus:outline-none hover:bg-ink transition-colors"
              >
                {t.editAndFinalize} <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink/65 block">
              {t.editStopNotes}
            </label>

            <div className="max-h-60 overflow-y-auto space-y-3.5 pr-1">
              {selectedAttractions.map((attraction, idx) => {
                const info = stopsInfo[attraction.id] || { note: "", duration: "1.5 saat" };
                return (
                  <div key={attraction.id} className="rounded-xl border border-ink/10 bg-ink/[0.01] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-kiremit text-[9px] font-bold text-paper">
                          {idx + 1}
                        </span>
                        {attraction.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(attraction)}
                        className="text-ink/65 hover:text-kiremit transition-colors"
                        aria-label="Remove stop"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={info.note}
                          onChange={(e) => handleInfoChange(attraction.id, "note", e.target.value)}
                          placeholder={t.stopNotePlaceholder}
                          className="w-full rounded-lg border border-ink/10 bg-paper px-2 py-1.5 text-[11px] text-ink focus:border-kiremit focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={info.duration}
                          onChange={(e) => handleInfoChange(attraction.id, "duration", e.target.value)}
                          placeholder="1.5 saat"
                          className="w-full rounded-lg border border-ink/10 bg-paper px-2 py-1.5 text-[11px] text-ink focus:border-kiremit focus:outline-none text-center"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {publishError && (
              <p className="rounded-lg border border-kiremit/30 bg-kiremit/5 px-3 py-2 text-xs font-semibold text-kiremit">
                {publishError}
              </p>
            )}

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isPublishing}
                className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-ink/70 hover:border-kiremit hover:text-kiremit transition-colors focus:outline-none disabled:opacity-45"
              >
                <ArrowLeft size={13} /> {t.back}
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={selectedAttractions.length === 0 || isPublishing || title.trim().length < MIN_TITLE_LENGTH}
                className="flex items-center gap-1.5 rounded-full bg-kiremit px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-paper shadow disabled:opacity-45 focus:outline-none hover:bg-ink transition-all hover:scale-[1.02]"
              >
                {isPublishing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> {t.publishing}
                  </>
                ) : (
                  <>
                    <Send size={13} /> {t.publishRoute}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
