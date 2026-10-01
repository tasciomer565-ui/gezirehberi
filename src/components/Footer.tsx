"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary, Locale } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  const pathname = usePathname() || "";
  const segments = pathname.split("/");
  const locale = ["tr", "en", "de", "ar", "ru"].includes(segments[1])
    ? (segments[1] as Locale)
    : ("tr" as Locale);

  const dict = getDictionary(locale);

  const [email, setEmail] = useState("");
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && kvkkConsent) {
      setSubscribed(true);
      setEmail("");
    }
  };

  // Report items 141-144 (Lighthouse re-audit) — the footer is meant to
  // always render as a dark banner, but it was built with the theme-reactive
  // `ink`/`paper`/`safran` tokens. Those tokens FLIP under dark mode (ink
  // becomes near-white, paper becomes near-black — see globals.css), so in
  // dark mode this footer silently became a near-white banner with
  // safran-on-near-white text at 1.63:1 contrast (badly failing WCAG AA).
  // Fixed hex values below are intentionally NOT theme tokens — the footer
  // must look the same dark banner regardless of site theme.
  const footerBg = "#1f2937";
  const footerFg = "#ffffff";
  const footerAccent = "#e4a335";

  return (
    <footer className="mt-16 border-t border-ink/10 no-print" style={{ backgroundColor: footerBg, color: `${footerFg}cc` }}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <p className="font-display text-2xl italic" style={{ color: footerFg }}>
              {dict.nav.logo}
            </p>
            <p className="max-w-xs text-sm leading-relaxed font-medium" style={{ color: `${footerFg}99` }}>
              {dict.home.subtitle}
            </p>
          </div>

          {/* Quick Links Nav */}
          <div className="flex flex-col md:items-center">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: footerAccent }}>
                {locale === "tr" ? "Kurumsal" : "Corporate"}
              </p>
              <nav className="flex flex-col gap-2.5 text-sm font-medium footer-nav">
                <Link href={`/${locale}`} className="transition-colors">
                  {dict.nav.home}
                </Link>
                <Link href={`/${locale}/bolgeler`} className="transition-colors">
                  {dict.nav.regions}
                </Link>
                <Link href={`/${locale}/rehberler`} className="transition-colors">
                  {dict.nav.guides}
                </Link>
                <Link href={`/${locale}/karsilastir`} className="transition-colors">
                  {dict.nav.compare}
                </Link>
                <Link href={`/${locale}/mesafe`} className="transition-colors">
                  {dict.nav.distances}
                </Link>
                <Link href={`/${locale}/hakkimizda`} className="transition-colors">
                  {locale === "tr" ? "Hakkımızda" : "About Us"}
                </Link>
                <Link href={`/${locale}/gizlilik-politikasi`} className="transition-colors">
                  {locale === "tr" ? "Gizlilik Politikası" : "Privacy Policy"}
                </Link>
                <Link href={`/${locale}/cerez-politikasi`} className="transition-colors">
                  {locale === "tr" ? "Çerez Politikası" : "Cookie Policy"}
                </Link>
                <Link href={`/${locale}/kullanim-sartlari`} className="transition-colors">
                  {locale === "tr" ? "Kullanım Şartları" : "Terms of Use"}
                </Link>
                <Link href={`/${locale}/iletisim`} className="transition-colors">
                  {locale === "tr" ? "İletişim" : "Contact"}
                </Link>
              </nav>
            </div>
          </div>

          {/* Newsletter subscription form */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: footerAccent }}>
              {locale === "tr" ? "E-Bülten Aboneliği" : "Newsletter Subscription"}
            </p>
            <p className="text-xs font-medium" style={{ color: `${footerFg}99` }}>
              {locale === "tr"
                ? "Yeni rotalar ve güncel fiyat seyahat tüyolarından ilk siz haberdar olun."
                : "Be the first to know about new routes and daily travel tips."}
            </p>

            {subscribed ? (
              <div className="rounded-lg p-3 text-xs font-bold" style={{ backgroundColor: `${footerAccent}26`, color: footerAccent }}>
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
                    style={{ borderColor: `${footerFg}1a`, backgroundColor: `${footerFg}0d`, color: footerFg }}
                    className="w-full rounded-xl border py-3 pl-4 pr-12 text-sm outline-none footer-input transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!kvkkConsent}
                    style={{ backgroundColor: footerAccent, color: footerBg }}
                    className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg hover:scale-105 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    aria-label="Subscribe"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
                <label className="flex items-start gap-2 text-[11px] leading-snug cursor-pointer" style={{ color: `${footerFg}99` }}>
                  <input
                    type="checkbox"
                    required
                    checked={kvkkConsent}
                    onChange={(e) => setKvkkConsent(e.target.checked)}
                    style={{ borderColor: `${footerFg}33`, accentColor: footerAccent }}
                    className="mt-0.5 rounded cursor-pointer"
                  />
                  <span>
                    {locale === "tr" ? (
                      <>
                        <Link href={`/${locale}/gizlilik-politikasi#kvkk`} className="underline footer-link-accent">
                          KVKK Aydınlatma Metni
                        </Link>
                        &apos;ni okudum, e-posta adresimin bülten göndermek amacıyla işlenmesini kabul ediyorum.
                      </>
                    ) : (
                      <>
                        I have read the{" "}
                        <Link href={`/${locale}/gizlilik-politikasi#kvkk`} className="underline footer-link-accent">
                          privacy notice
                        </Link>{" "}
                        and consent to my email being processed to send this newsletter.
                      </>
                    )}
                  </span>
                </label>
              </form>
            )}
          </div>
        </div>

        <p className="mt-12 text-xs pt-6 text-center font-medium border-t" style={{ color: `${footerFg}80`, borderColor: `${footerFg}1a` }}>
          © {new Date().getFullYear()} {dict.nav.logo}. {locale === "tr" ? "Tüm hakları saklıdır." : locale === "de" ? "Alle Rechte vorbehalten." : locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
        </p>
        {/* General, truthful source note — we don't have per-image photographer/license
            data to generate accurate individual credits (report item 29), but this much
            is true and reduces the undisclosed-source legal risk in the meantime. */}
        <p className="mt-2 text-[11px] text-center font-medium" style={{ color: `${footerFg}80` }}>
          {locale === "tr"
            ? "Bölge ve şehir görselleri Wikimedia Commons ve Unsplash kaynaklıdır."
            : locale === "de"
            ? "Regions- und Stadtbilder stammen von Wikimedia Commons und Unsplash."
            : locale === "ar"
            ? "صور المناطق والمدن مصدرها Wikimedia Commons وUnsplash."
            : "Region and city images are sourced from Wikimedia Commons and Unsplash."}
        </p>
      </div>

      {/* Fixed-color hover states — can't express these with Tailwind's
          theme-reactive hover: utilities since we're intentionally bypassing
          the theme tokens above, so a tiny scoped style block covers them. */}
      <style jsx>{`
        .footer-nav :global(a) {
          color: ${footerFg}cc;
        }
        .footer-nav :global(a:hover) {
          color: ${footerAccent};
        }
        .footer-link-accent:hover {
          color: ${footerAccent};
        }
        .footer-input:focus {
          border-color: ${footerAccent};
          box-shadow: 0 0 0 1px ${footerAccent};
        }
      `}</style>
    </footer>
  );
}
