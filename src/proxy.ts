import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { distancePairs, distancePairSlug } from "@/lib/data/distancePairs";

const locales = ["tr", "en", "de", "ar", "ru"];
const defaultLocale = "tr";

// Mesafe sayfaları tek (alfabetik) yönde yayında; "mardin-gaziantep" gibi
// ters yön aramaları kanonik sayfaya 308 ile yönlenir. Önceden her çift için
// next.config redirects() kuralıydı — 1133 çiftte Next.js'in 1000 özel route
// performans uyarısını aşıyordu; tek bir Set araması aynı işi görüyor.
// Şehir slug'larında tire yok, bu yüzden "a-b" ayrıştırması belirsiz değil.
const distanceSlugs = new Set(distancePairs.map(distancePairSlug));
const REVERSE_DISTANCE = /^\/(tr|en|de|ar|ru)\/mesafe\/([a-z]+)-([a-z]+)\/?$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const reverse = pathname.match(REVERSE_DISTANCE);
  if (reverse && !distanceSlugs.has(`${reverse[2]}-${reverse[3]}`) && distanceSlugs.has(`${reverse[3]}-${reverse[2]}`)) {
    return NextResponse.redirect(new URL(`/${reverse[1]}/mesafe/${reverse[3]}-${reverse[2]}`, request.url), 308);
  }

  // Check if the pathname is missing a locale prefix
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Exclude static assets, Next.js system files, and sitemaps/robots.
  // /icon and /apple-icon are Next.js's file-convention metadata routes —
  // they have no dot in the URL (the extension only shows up in the
  // Content-Type response header), so they were falling through to the
  // locale-redirect below and 404ing at /tr/apple-icon, /tr/icon (found via
  // a real Lighthouse run — browsers probe these paths directly regardless
  // of the <link> tags' own correct absolute hrefs).
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") || // e.g. favicon.ico, images, sitemap.xml
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/icon" ||
    pathname === "/apple-icon" ||
    pathname === "/manifest.webmanifest"
  ) {
    return;
  }

  if (pathnameIsMissingLocale) {
    // Detect preferred language from headers or fallback
    const acceptLanguage = request.headers.get("accept-language") || "";
    let locale = defaultLocale;
    for (const loc of locales) {
      if (acceptLanguage.toLowerCase().includes(loc)) {
        locale = loc;
        break;
      }
    }

    return NextResponse.redirect(
      new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon|apple-icon|manifest.webmanifest).*)"],
};
