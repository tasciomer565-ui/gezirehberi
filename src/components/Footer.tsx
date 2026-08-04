"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary, Locale } from "@/lib/i18n";
import { Mail, ArrowRight } from "lucide-react";

export default function Footer() {
  const pathname = usePathname() || "";
  const segments = pathname.split("/");
  const locale = ["tr", "en", "de", "ar"].includes(segments[1])
    ? (segments[1] as Locale)
    : ("tr" as Locale);

  const dict = getDictionary(locale);

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="mt-16 border-t border-ink/10 bg-ink text-paper/80 no-print">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <p className="font-display text-2xl italic text-paper">
              {dict.nav.logo}
            </p>
            <p className="max-w-xs text-sm text-paper/60 leading-relaxed font-medium">
              {dict.home.subtitle}
            </p>
          </div>

          {/* Quick Links Nav */}
          <div className="flex flex-col md:items-center">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-safran">
                {locale === "tr" ? "Kurumsal" : "Corporate"}
              </p>
              <nav className="flex flex-col gap-2.5 text-sm font-medium">
                <Link href={`/${locale}`} className="hover:text-safran transition-colors">
                  {dict.nav.home}
                </Link>
                <Link href={`/${locale}/bolgeler`} className="hover:text-safran transition-colors">
                  {dict.nav.regions}
                </Link>
                <Link href={`/${locale}/hakkimizda`} className="hover:text-safran transition-colors">
                  {locale === "tr" ? "Hakkımızda" : "About Us"}
                </Link>
                <Link href={`/${locale}/gizlilik-politikasi`} className="hover:text-safran transition-colors">
                  {locale === "tr" ? "Gizlilik Politikası" : "Privacy Policy"}
                </Link>
                <Link href={`/${locale}/cerez-politikasi`} className="hover:text-safran transition-colors">
                  {locale === "tr" ? "Çerez Politikası" : "Cookie Policy"}
                </Link>
                <Link href={`/${locale}/iletisim`} className="hover:text-safran transition-colors">
                  {locale === "tr" ? "İletişim" : "Contact"}
                </Link>
              </nav>
            </div>
          </div>

          {/* Newsletter subscription form */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-safran">
              {locale === "tr" ? "E-Bülten Aboneliği" : "Newsletter Subscription"}
            </p>
            <p className="text-xs text-paper/60 font-medium">
              {locale === "tr" 
                ? "Yeni rotalar ve güncel fiyat seyahat tüyolarından ilk siz haberdar olun." 
                : "Be the first to know about new routes and daily travel tips."}
            </p>

            {subscribed ? (
              <div className="rounded-lg bg-safran/15 p-3 text-xs font-bold text-safran">
                ✓ {locale === "tr" ? "Başarıyla Abone Olundu!" : "Subscribed Successfully!"}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <div className="relative flex">
                  <input
                    type="email"
                    required
                    placeholder={locale === "tr" ? "E-posta adresiniz" : "Your email address"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-paper/10 bg-paper/5 py-3 pl-4 pr-12 text-sm text-paper placeholder:text-paper/40 outline-none focus:border-safran focus:ring-1 focus:ring-safran transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg bg-safran text-ink hover:scale-105 transition-all cursor-pointer"
                    aria-label="Subscribe"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="flex items-start gap-2 px-1">
                  <input
                    type="checkbox"
                    id="kvkk-newsletter"
                    required
                    className="mt-0.5 h-3.5 w-3.5 rounded border-paper/20 bg-paper/5 text-safran focus:ring-safran cursor-pointer"
                  />
                  <label htmlFor="kvkk-newsletter" className="text-[10px] text-paper/50 leading-normal font-semibold cursor-pointer selection:bg-transparent">
                    {locale === "tr" ? (
                      <>
                        <a href="/tr/gizlilik-politikasi" target="_blank" className="text-safran hover:underline">Gizlilik Politikası</a> şartlarını okudum ve kabul ediyorum.
                      </>
                    ) : (
                      <>
                        I accept the <a href={`/${locale}/gizlilik-politikasi`} target="_blank" className="text-safran hover:underline">Privacy Policy</a> terms.
                      </>
                    )}
                  </label>
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="mt-12 text-xs text-paper/40 border-t border-paper/10 pt-6 text-center font-medium">
          © {new Date().getFullYear()} {dict.nav.logo}. {locale === "tr" ? "Tüm hakları saklıdır." : locale === "de" ? "Alle Rechte vorbehalten." : locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
        </p>
      </div>
    </footer>
  );
}
