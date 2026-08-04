"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Heart, LogIn, LogOut, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { regions } from "@/lib/data/regions";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import AuthModal from "./AuthModal";
import { getDictionary, Locale, translateDataText } from "@/lib/i18n";
import { getActiveUser, logoutUser, initializeSocialDB, SocialUser } from "@/lib/socialDb";

export default function Header() {
  const pathname = usePathname() || "";
  const segments = pathname.split("/");
  const locale = ["tr", "en", "de", "ar"].includes(segments[1])
    ? (segments[1] as Locale)
    : ("tr" as Locale);

  const dict = getDictionary(locale);
  const [user, setUser] = useState<SocialUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSocialDB();
    setUser(getActiveUser());

    const handleAuthChange = () => {
      setUser(getActiveUser());
    };
    
    window.addEventListener("yoldefteri_auth_change", handleAuthChange);
    return () => window.removeEventListener("yoldefteri_auth_change", handleAuthChange);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setIsDropdownOpen(false);
    window.dispatchEvent(new Event("yoldefteri_auth_change"));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur-md shadow-sm no-print">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-kiremit text-paper transition-transform group-hover:scale-105">
            <MapPin size={18} strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl italic text-ink group-hover:text-kiremit transition-colors">
            {dict.nav.logo}
          </span>
        </Link>
        
        <div className="hidden flex-1 justify-center px-6 md:flex">
          <SearchBar />
        </div>
        
        <nav className="hidden items-center gap-5 text-sm font-semibold text-ink/80 lg:flex">
          <Link href={`/${locale}/bolgeler`} className="hover:text-kiremit transition-colors">
            {dict.nav.regions}
          </Link>
          {regions
            .filter((r) => r.cityCount > 0)
            .slice(0, 3)
            .map((r) => (
              <Link
                key={r.slug}
                href={`/${locale}/bolgeler/${r.slug}`}
                className="hover:text-kiremit transition-colors"
              >
                {translateDataText(r.name, locale)}
              </Link>
            ))}
          <Link
            href={`/${locale}/kayitlerim`}
            className="flex items-center gap-1.5 hover:text-kiremit transition-colors"
          >
            <Heart size={15} /> {dict.nav.wishlist}
          </Link>
          
          <div className="h-4 w-px bg-ink/15" />
          
          <ThemeToggle />
          <LanguageSwitcher />

          {/* Social Auth Account Area */}
          <div ref={dropdownRef} className="relative">
            {user ? (
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-ink/10 bg-paper/60 px-2.5 py-1 focus:outline-none hover:border-kiremit transition-colors"
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-6 w-6 rounded-full object-cover"
                />
                <span className="text-xs font-bold text-ink max-w-[80px] truncate">{user.username}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1 rounded-full border border-ink/10 bg-paper/60 px-3 py-1.5 text-xs font-bold text-ink/75 hover:border-kiremit hover:text-kiremit transition-colors focus:outline-none"
              >
                <LogIn size={13} />
                <span>{locale === "tr" ? "Giriş" : "Sign In"}</span>
              </button>
            )}

            <AnimatePresence>
              {isDropdownOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute mt-2 w-48 rounded-xl border border-ink/10 bg-paper p-1.5 shadow-xl ${
                    locale === "ar" ? "left-0" : "right-0"
                  }`}
                >
                  <div className="border-b border-ink/5 px-2.5 py-2">
                    <p className="text-xs font-bold text-ink">{user.username}</p>
                    <p className="text-[10px] text-ink/40 truncate mt-0.5">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-bold text-kiremit hover:bg-kiremit/5 transition-colors mt-1 focus:outline-none"
                  >
                    <LogOut size={13} />
                    <span>{locale === "tr" ? "Çıkış Yap" : "Sign Out"}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
        
        {/* Mobile menu triggers */}
        <div className="flex items-center gap-2 lg:!hidden">
          <ThemeToggle />
          <LanguageSwitcher />
          
          {user ? (
            <button
              onClick={() => {
                if (window.confirm(locale === "tr" ? "Çıkış yapmak istiyor musunuz?" : "Do you want to log out?")) {
                  handleLogout();
                }
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink bg-paper/60"
              title={locale === "tr" ? "Çıkış Yap" : "Sign Out"}
            >
              <LogOut size={14} className="text-kiremit" />
            </button>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink bg-paper/60"
              title={locale === "tr" ? "Giriş Yap" : "Sign In"}
            >
              <User size={14} />
            </button>
          )}

          <Link
            href={`/${locale}/kayitlerim`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink bg-paper/60 hover:text-kiremit transition-colors"
          >
            <Heart size={15} />
          </Link>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setUser(getActiveUser());
          setIsAuthOpen(false);
        }}
      />
    </header>
  );
}
