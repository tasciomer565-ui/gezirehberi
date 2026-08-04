import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import "../globals.css";
import { getDictionary, Locale } from "@/lib/i18n";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = "https://yoldefterim.com.tr";

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
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "tr" ? "tr_TR" : locale === "ar" ? "ar_AR" : "en_US",
      siteName: dict.nav.logo,
      url: `${siteUrl}/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.home.title,
      description: dict.home.subtitle,
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
    >
      <body className="min-h-full flex flex-col bg-background text-ink selection:bg-kiremit/20">
        <Header />
        <main className="flex-1">{props.children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
