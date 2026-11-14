"use client";

import { usePathname } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { code: "tr", name: "Türkçe" },
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "ar", name: "العربية" },
  { code: "ru", name: "Русский" },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pathname structure: /locale/...
  const segments = pathname ? pathname.split("/") : [];
  const currentLocale = LANGUAGES.some((l) => l.code === segments[1])
    ? segments[1]
    : "tr";

  const activeLang = LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLocale = (newLocale: string) => {
    if (!pathname) return;
    const nextSegments = [...segments];
    nextSegments[1] = newLocale;
    const newPath = nextSegments.join("/");
    setIsOpen(false);
    window.location.assign(newPath);
  };

  return (
    <div ref={dropdownRef} className="relative z-50">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-9 items-center gap-1.5 rounded-full border border-ink/10 bg-paper/60 px-3 text-xs font-semibold text-ink/75 hover:border-kiremit hover:text-kiremit transition-colors focus:outline-none"
        aria-label={`Dil seçimi: ${activeLang.code.toUpperCase()}`}
      >
        <Globe size={14} className="text-ink/65" />
        <span className="uppercase">{activeLang.code}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 text-ink/65 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute mt-1.5 w-32 rounded-xl border border-ink/10 bg-paper p-1.5 shadow-xl ${
              currentLocale === "ar" ? "left-0" : "right-0"
            }`}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLocale(lang.code)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                  currentLocale === lang.code
                    ? "bg-kiremit/10 text-kiremit"
                    : "text-ink/70 hover:bg-ink/[0.03]"
                }`}
              >
                <span>{lang.name}</span>
                {currentLocale === lang.code && <span className="text-[10px]">●</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
