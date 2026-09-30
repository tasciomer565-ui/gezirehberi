"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Search, X, MapPin } from "lucide-react";
import { searchCities, type SearchResult, type SearchableCity } from "@/lib/search";
import { getDictionary, Locale, translateDataText } from "@/lib/i18n";

const DEBOUNCE_MS = 200;

export default function SearchBar({ index }: { index: SearchableCity[] }) {
  const params = useParams();
  const locale = (params?.locale || "tr") as Locale;
  const dict = getDictionary(locale);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setResults(searchCities(query, index));
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, index]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xs z-50">
      <div className="flex items-center gap-2 rounded-full border border-ink/15 bg-paper/60 backdrop-blur-sm px-3.5 py-1.5 focus-within:border-kiremit focus-within:bg-paper transition-all">
        <Search size={14} className="text-ink/65 flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={dict.nav.search}
          className="w-full bg-transparent text-xs font-semibold text-ink placeholder:text-ink/65 focus:outline-none"
          aria-label="Search city"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="text-ink/65 hover:text-kiremit flex-shrink-0"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-ink/10 bg-paper shadow-xl">
          {results.length === 0 ? (
            <p className="p-4 text-xs font-semibold text-ink/65 leading-normal">
              &quot;{query}&quot; {dict.search.noResults}
            </p>
          ) : (
            results.map((r) => (
              <Link
                key={r.city.slug}
                href={`/${locale}/bolgeler/${r.city.regionSlug}/${r.city.slug}`}
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/${locale}/bolgeler/${r.city.regionSlug}/${r.city.slug}`);
                }}
                className="flex items-center gap-3 border-b border-ink/5 px-4 py-3 last:border-0 hover:bg-kiremit/5 transition-colors"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-kiremit/10 text-kiremit">
                  <MapPin size={14} />
                </span>
                <div>
                  <p className="text-xs font-bold text-ink">{translateDataText(r.city.name, locale)}</p>
                  <p className="text-[10px] font-semibold text-ink/65 uppercase tracking-wider">{translateDataText(r.city.region, locale)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
