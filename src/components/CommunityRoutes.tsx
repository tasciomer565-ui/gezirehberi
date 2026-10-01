"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Plus, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCommunityRoutes, fetchCommunityStats, CommunityRoute, CommunityStats } from "@/lib/communityApi";
import { getDictionary, Locale } from "@/lib/i18n";
import { Attraction } from "@/lib/types";
import UserRouteCard from "./UserRouteCard";
import RouteBuilder from "./RouteBuilder";

interface CommunityRoutesProps {
  // Genel tutuldu (City objesi değil) — hem şehir hem ilçe sayfalarından aynı
  // bileşen kullanılabiliyor. İlçelerin kendi curated attraction listesi yok,
  // bu yüzden ilçe sayfası kendi slug'ını (identitySlug) + ebeveyn şehrin
  // attractions listesini geçiriyor (report follow-up, Bulgu 3).
  identitySlug: string;
  regionSlug: string;
  attractions: Attraction[];
  locale: string;
}

export default function CommunityRoutes({ identitySlug, regionSlug, attractions, locale }: CommunityRoutesProps) {
  const dict = getDictionary(locale as Locale);
  const [routes, setRoutes] = useState<CommunityRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [sort, setSort] = useState<"newest" | "popular">("newest");
  const [stats, setStats] = useState<CommunityStats | null>(null);

  const loadRoutes = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    const res = await fetchCommunityRoutes(identitySlug, sort);
    setRoutes(res.routes);
    if (res.error) setLoadError(res.error);
    setIsLoading(false);
  }, [identitySlug, sort]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  useEffect(() => {
    fetchCommunityStats(identitySlug).then(setStats);
  }, [identitySlug]);

  const handlePublish = (newRoute: CommunityRoute) => {
    setRoutes((prev) => [newRoute, ...prev]);
    setIsBuilderOpen(false);
  };

  const handleCreateClick = () => {
    setIsBuilderOpen(true);
  };

  return (
    <div className="mt-16 border-t border-ink/10 pt-16 no-print">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-kiremit/10 text-kiremit shadow-sm">
            <Users size={18} />
          </span>
          <div>
            <h3 className="font-display text-2xl italic text-ink">
              {dict.community.title}
            </h3>
            <p className="text-xs text-ink/65 font-semibold">
              {isLoading ? dict.community.loading : `${routes.length} ${dict.community.routesSharedCountSuffix}`}
            </p>
            {stats && (stats.routeCount > 0 || stats.commentCount > 0 || stats.likeCount > 0) && (
              <p className="mt-0.5 text-[11px] text-ink/50 font-semibold">
                {dict.community.statsSummary
                  .replace("{routes}", String(stats.routeCount))
                  .replace("{comments}", String(stats.commentCount))
                  .replace("{likes}", String(stats.likeCount))}
              </p>
            )}
          </div>
        </div>

        {!isBuilderOpen && (
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-1.5 rounded-full bg-kiremit px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-paper shadow-md hover:bg-ink hover:scale-105 transition-all focus:outline-none"
          >
            <Plus size={14} />
            {dict.community.shareYourRoute}
          </button>
        )}
      </div>

      {/* Custom Route Builder Wizard */}
      <AnimatePresence>
        {isBuilderOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <RouteBuilder
              citySlug={identitySlug}
              regionSlug={regionSlug}
              attractions={attractions}
              locale={locale}
              onPublish={handlePublish}
              onClose={() => setIsBuilderOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared Community Routes Feed */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-ink/10 p-10 text-sm font-semibold text-ink/65">
          <Loader2 size={16} className="animate-spin" />
          {dict.community.loadingRoutes}
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-dashed border-kiremit/30 bg-kiremit/5 p-8 text-center">
          <p className="text-xs text-kiremit font-semibold mb-3">
            {dict.community.loadError} ({loadError})
          </p>
          <button
            onClick={loadRoutes}
            className="inline-flex items-center gap-1 rounded-full border border-kiremit/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-kiremit hover:bg-kiremit/5 transition-colors focus:outline-none"
          >
            <RefreshCw size={12} /> {dict.community.retry}
          </button>
        </div>
      ) : routes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink/20 p-8 text-center bg-paper/30">
          <p className="text-xs text-ink/65 font-semibold mb-3">
            {dict.community.emptyState}
          </p>
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center gap-1 rounded-full border border-kiremit/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-kiremit hover:bg-kiremit/5 transition-colors focus:outline-none"
          >
            <Plus size={12} /> {dict.community.shareFirstOne}
          </button>
        </div>
      ) : (
        <>
          {routes.length > 1 && (
            <div className="mb-4 flex items-center justify-end gap-2">
              {(["newest", "popular"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setSort(option)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                    sort === option
                      ? "bg-kiremit text-paper"
                      : "border border-ink/15 text-ink/65 hover:border-kiremit hover:text-kiremit"
                  }`}
                >
                  {option === "newest" ? dict.community.sortNewest : dict.community.sortPopular}
                </button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {routes.map((route) => (
              <UserRouteCard key={route.id} route={route} locale={locale} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
