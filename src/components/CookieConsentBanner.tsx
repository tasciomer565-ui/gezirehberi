"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "@/components/PlainLink";
import { Cookie } from "lucide-react";
import { getCookieConsent, setCookieConsent } from "@/lib/cookieConsent";
import { Locale } from "@/lib/i18n";

// A real accept/decline banner (report items 30, 132, 143) — until now the
// Çerez Politikası page told users to manage cookies via their own browser
// settings, with no in-site consent mechanism at all. "Reddet" is styled with
// the same size/weight as "Kabul Et" (not a faint dismiss link) so this is a
// genuine choice rather than a GDPR dark pattern (report item 132).
export default function CookieConsentBanner() {
  const params = useParams();
  const locale = (params?.locale || "tr") as Locale;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);
  }, []);

  const decide = (value: "accepted" | "declined") => {
    setCookieConsent(value);
    setVisible(false);
  };

  const t = {
    tr: {
      text: "Yol Defteri, temel site işlevleri ve (varsa) reklam/analiz amaçlı çerezler kullanır.",
      accept: "Kabul Et",
      decline: "Reddet",
      policy: "Çerez Politikası",
    },
    en: {
      text: "Yol Defteri uses cookies for core site features and, where enabled, for advertising/analytics.",
      accept: "Accept",
      decline: "Decline",
      policy: "Cookie Policy",
    },
    de: {
      text: "Yol Defteri verwendet Cookies für Kernfunktionen und, sofern aktiviert, für Werbung/Analyse.",
      accept: "Akzeptieren",
      decline: "Ablehnen",
      policy: "Cookie-Richtlinie",
    },
    ar: {
      text: "يستخدم Yol Defteri ملفات تعريف الارتباط للوظائف الأساسية للموقع، وعند التفعيل، للإعلانات والتحليلات.",
      accept: "قبول",
      decline: "رفض",
      policy: "سياسة ملفات تعريف الارتباط",
    },
    ru: {
      text: "Yol Defteri использует файлы cookie для основных функций сайта и, если включено, для рекламы/аналитики.",
      accept: "Принять",
      decline: "Отклонить",
      policy: "Политика использования cookie",
    },
  }[locale];

  if (!visible) return null;

  return (
    <div
      className="no-print fixed bottom-0 left-0 right-0 z-[60] border-t border-ink/10 bg-paper/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      role="dialog"
      aria-live="polite"
      aria-label={t.policy}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-2.5 text-xs text-ink/70 sm:items-center">
          <Cookie size={18} className="mt-0.5 shrink-0 text-kiremit sm:mt-0" />
          <p>
            {t.text}{" "}
            <Link href={`/${locale}/cerez-politikasi`} className="underline hover:text-kiremit">
              {t.policy}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => decide("declined")}
            className="rounded-full border border-ink/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:border-kiremit hover:text-kiremit transition-colors"
          >
            {t.decline}
          </button>
          <button
            onClick={() => decide("accepted")}
            className="rounded-full bg-kiremit px-4 py-2 text-xs font-bold uppercase tracking-wider text-paper hover:bg-ink transition-colors"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
