"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Heart, Search, ChevronDown, BookOpen, GitCompareArrows } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SearchableCity } from "@/lib/search";
import { regionMeta } from "@/lib/data/regionMeta";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import { getDictionary, Locale, translateDataText } from "@/lib/i18n";

// activeRegionSlugs sunucudan geliyor (layout/not-found) — bu istemci
// bileşeni şehir sayısı için regions.ts'i import ederse tüm şehir verisi
// her sayfanın JS paketine giriyordu. Verilmezse tüm bölgeler gösterilir.
export default function Header({
  activeRegionSlugs,
  searchIndex,
}: {
  activeRegionSlugs?: string[];
  searchIndex: SearchableCity[];
}) {
  const pathname = usePathname() || "";
  const segments = pathname.split("/");
  const locale = ["tr", "en", "de", "ar", "ru"].includes(segments[1])
    ? (segments[1] as Locale)
    : ("tr" as Locale);

  const dict = getDictionary(locale);
  const activeRegions = activeRegionSlugs
    ? regionMeta.filter((r) => activeRegionSlugs.includes(r.slug))
    : regionMeta;

  const [isRegionsOpen, setIsRegionsOpen] = useState(false);
  const regionsRef = useRef<HTMLDivElement>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (regionsRef.current && !regionsRef.current.contains(event.target as Node)) {
        setIsRegionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur-md shadow-sm no-print">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2 group">
          <span className="relative h-9 w-9 shrink-0 transition-transform group-hover:scale-105">
            <Image src="/logo-header.png" alt="" fill sizes="36px" className="object-contain" priority />
          </span>
          <span className="font-display text-xl italic text-ink group-hover:text-kiremit transition-colors">
            {dict.nav.logo}
          </span>
        </Link>
        
        <div className="hidden flex-1 justify-center px-6 md:flex">
          <SearchBar index={searchIndex} />
        </div>
        
        <nav className="hidden items-center gap-5 text-sm font-semibold text-ink/80 lg:flex">
          {/* All 7 regions in one dropdown instead of only the first 3 inline
              (report item 19) — keeps every region link reachable and internally
              linked without overflowing the nav bar. */}
          <div ref={regionsRef} className="relative">
            <button
              onClick={() => setIsRegionsOpen((v) => !v)}
              className="flex items-center gap-1 hover:text-kiremit transition-colors focus:outline-none"
              aria-label="Bölgeler menüsü"
            >
              {dict.nav.regions}
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${isRegionsOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {isRegionsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-1.5 w-56 rounded-xl border border-ink/10 bg-paper p-1.5 shadow-xl"
                >
                  <Link
                    href={`/${locale}/bolgeler`}
                    onClick={() => setIsRegionsOpen(false)}
                    className="block rounded-lg px-2.5 py-1.5 text-xs font-bold text-kiremit hover:bg-kiremit/5 transition-colors"
                  >
                    {locale === "tr" ? "Tüm Bölgeler" : "All Regions"}
                  </Link>
                  <div className="my-1 h-px bg-ink/5" />
                  {activeRegions.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/${locale}/bolgeler/${r.slug}`}
                      onClick={() => setIsRegionsOpen(false)}
                      className="block rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink/75 hover:bg-ink/[0.03] hover:text-kiremit transition-colors"
                    >
                      {translateDataText(r.name, locale)}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link
            href={`/${locale}/rehberler`}
            className="flex items-center gap-1.5 hover:text-kiremit transition-colors"
          >
            <BookOpen size={15} /> {dict.nav.guides}
          </Link>
          <Link
            href={`/${locale}/karsilastir`}
            className="flex items-center gap-1.5 hover:text-kiremit transition-colors"
          >
            <GitCompareArrows size={15} /> {dict.nav.compare}
          </Link>
          <Link
            href={`/${locale}/kayitlerim`}
            className="flex items-center gap-1.5 hover:text-kiremit transition-colors"
          >
            <Heart size={15} /> {dict.nav.wishlist}
          </Link>

          <div className="h-4 w-px bg-ink/15" />
          
          <ThemeToggle />
          <LanguageSwitcher />
        </nav>

        {/* Mobile menu triggers */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Search was only reachable on md+ widths before (report item 18) —
              this toggle gives mobile users the same SearchBar via a collapsible row. */}
          <button
            onClick={() => setIsMobileSearchOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink bg-paper/60 hover:text-kiremit transition-colors md:hidden"
            aria-label={isMobileSearchOpen ? "Aramayı kapat" : "Ara"}
            aria-expanded={isMobileSearchOpen}
          >
            <Search size={15} />
          </button>
          <ThemeToggle />
          <LanguageSwitcher />

          <Link
            href={`/${locale}/kayitlerim`}
            aria-label={dict.nav.wishlist}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink bg-paper/60 hover:text-kiremit transition-colors"
          >
            <Heart size={15} />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-ink/10 md:hidden"
          >
            <div className="px-4 py-3 sm:px-6">
              <SearchBar index={searchIndex} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
