import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { getSearchIndex } from "@/lib/data/cities";
import { regions } from "@/lib/data/regions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import YandexMetrica from "@/components/YandexMetrica";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Clarity from "@/components/Clarity";
import { ThemeProvider } from "@/lib/ThemeContext";
import "../globals.css";
import { getDictionary, Locale, buildRobots, OG_LOCALE_MAP } from "@/lib/i18n";

// Lighthouse (2026-09-30, şehir sayfası mobil): 5 font dosyasının ikisi (123 KB,
// Türkçe ş/ğ/ı/İ harflerini taşıyan latin-ext alt kümeleri) ancak 3. saniyede
// iniyordu — yalnızca "latin" ön yükleniyordu, Türkçe metin önce yedek
// fontla çizilip font gelince yeniden düzenleniyordu. latin-ext artık ön
// yükleniyor. Fraunces sitede sadece italik kullanılıyor (tüm font-display
// sınıfları italic); kullanılmayan normal stil kaldırıldı.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  style: ["italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const siteUrl = "https://www.yoldefterim.com.tr";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const locale = (params.locale || "tr") as Locale;
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: dict.home.title + " | " + dict.nav.logo,
      template: `%s | ${dict.nav.logo}`,
    },
    description: dict.home.subtitle,
    // Temporary noindex for untranslated locales (report items 22/283) — every
    // page inherits this unless it explicitly overrides robots itself.
    robots: buildRobots(locale),
    // Search-engine site ownership verification (Yandex Webmaster + Google
    // Search Console, report items 264-267) + AdSense site verification.
    // Each key is only added when its env var is actually set, never
    // rendering an empty/placeholder verification tag. "google-adsense-account"
    // has no dedicated field in Next's Metadata.verification type (only
    // google/yahoo/yandex/me/other are typed), so it goes through the same
    // `other` bag as yandex-verification — merged into one object rather than
    // two separate `other` keys, which would otherwise just overwrite each other.
    ...((process.env.NEXT_PUBLIC_YANDEX_VERIFICATION ||
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID)
      ? {
          verification: {
            ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
              ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
              : {}),
            ...((process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID)
              ? {
                  other: {
                    ...(process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
                      ? { "yandex-verification": process.env.NEXT_PUBLIC_YANDEX_VERIFICATION }
                      : {}),
                    ...(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
                      ? { "google-adsense-account": process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID }
                      : {}),
                  },
                }
              : {}),
          },
        }
      : {}),
    openGraph: {
      type: "website",
      locale: OG_LOCALE_MAP[locale] || "tr_TR",
      siteName: dict.nav.logo,
      url: `${siteUrl}/${locale}`,
      // Fallback og:image for any page that doesn't set its own (report items
      // 275-277) — city/district/region pages override this with a real hero photo.
      images: [{ url: `${siteUrl}/${locale}/opengraph-image`, width: 1200, height: 630, alt: dict.nav.logo }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.home.title,
      description: dict.home.subtitle,
      images: [`${siteUrl}/${locale}/opengraph-image`],
    },
  };
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const activeLocale = (locale || "tr") as Locale;
  const dir = activeLocale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={activeLocale}
      dir={dir}
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
      style={{ scrollBehavior: "smooth" }}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-background text-ink selection:bg-kiremit/20">
        <ThemeProvider>
          <Header
            activeRegionSlugs={regions.filter((r) => r.cityCount > 0).map((r) => r.slug)}
            searchIndex={getSearchIndex()}
          />
          <main className="flex-1">{props.children}</main>
          <Footer />
          <CookieConsentBanner />
          <YandexMetrica />
          <GoogleAnalytics />
          <Clarity />
        </ThemeProvider>
      </body>
    </html>
  );
}
