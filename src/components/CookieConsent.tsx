"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";
import { usePathname } from "next/navigation";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const pathname = usePathname() || "";
  const segments = pathname.split("/");
  const locale = ["tr", "en", "de", "ar"].includes(segments[1]) ? segments[1] : "tr";

  useEffect(() => {
    // Check if user already gave consent
    const consent = localStorage.getItem("yoldefteri_cookie_consent");
    if (!consent) {
      // Show banner after 1.5s delay for smooth entrance
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("yoldefteri_cookie_consent", "accepted");
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("yoldefteri_cookie_consent", "rejected");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-4xl no-print">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="rounded-2xl border border-ink/10 bg-paper/95 backdrop-blur-md p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
        >
          <div className="flex gap-4.5 items-start">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kiremit/10 text-kiremit">
              <Shield size={20} />
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-ink">
                {locale === "tr" ? "Çerez ve Gizlilik Onayı" : "Cookie & Privacy Consent"}
              </h4>
              <p className="text-xs text-ink/70 leading-relaxed font-semibold max-w-2xl">
                {locale === "tr" ? (
                  <>
                    Deneyiminizi optimize etmek, site trafiğini analiz etmek ve kişiselleştirilmiş reklamlar (Google AdSense) sunmak için çerezleri kullanıyoruz. Detaylı bilgi için{" "}
                    <Link href={`/${locale}/cerez-politikasi`} className="text-kiremit hover:underline font-bold">
                      Çerez Politikası
                    </Link>{" "}
                    ve{" "}
                    <Link href={`/${locale}/gizlilik-politikasi`} className="text-kiremit hover:underline font-bold">
                      Gizlilik Politikası
                    </Link>{" "}
                    metinlerini inceleyebilirsiniz.
                  </>
                ) : (
                  <>
                    We use cookies to optimize your experience, analyze site traffic, and serve personalized ads (Google AdSense). For more information, please review our{" "}
                    <Link href={`/${locale}/cerez-politikasi`} className="text-kiremit hover:underline font-bold">
                      Cookie Policy
                    </Link>{" "}
                    and{" "}
                    <Link href={`/${locale}/gizlilik-politikasi`} className="text-kiremit hover:underline font-bold">
                      Privacy Policy
                    </Link>
                    .
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex w-full md:w-auto items-center gap-3 justify-end shrink-0 border-t border-ink/5 pt-4 md:border-none md:pt-0">
            {/* Equal visual weight for both accept and reject buttons to comply with GDPR/KVKK */}
            <button
              onClick={handleReject}
              className="flex-1 md:flex-initial rounded-xl border border-ink/15 hover:border-ink/30 px-5 py-2.5 text-xs font-bold text-ink/75 hover:text-ink transition-colors cursor-pointer focus:outline-none"
            >
              {locale === "tr" ? "Reddet" : "Reject"}
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 md:flex-initial rounded-xl bg-kiremit hover:bg-ink px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-paper transition-colors cursor-pointer focus:outline-none shadow"
            >
              {locale === "tr" ? "Kabul Et" : "Accept"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
