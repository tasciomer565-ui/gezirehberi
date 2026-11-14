import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["tr", "en", "de", "ar", "ru"];
const defaultLocale = "tr";

// Proxy yalnızca dil öneki OLMAYAN adreslerde çalışır (matcher'a bakın): "/",
// "/mesafe/..." gibi eski/öneksiz adresleri dil önekli adrese yönlendirir.
// Önceden her sayfa isteğinde çalışıyordu (ters yön mesafe yönlendirmesi için);
// Vercel Hobby'de her istek bir fonksiyon çağrısı + CPU demek olduğundan ters
// yön yönlendirmesi mesafe sayfasının kendisine taşındı (2026-11-15).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // /icon ve /apple-icon Next.js'in dosya-kuralı metadata rotaları — URL'de
  // nokta yok, bu yüzden açıkça hariç tutuluyor (yoksa /tr/icon'a yönlenip 404).
  if (
    !pathnameIsMissingLocale ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/icon" ||
    pathname === "/apple-icon"
  ) {
    return;
  }

  const acceptLanguage = (request.headers.get("accept-language") || "").toLowerCase();
  const locale = locales.find((loc) => acceptLanguage.includes(loc)) ?? defaultLocale;
  return NextResponse.redirect(new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url));
}

export const config = {
  // Dil önekli sayfalar (sitenin neredeyse tüm trafiği) proxy'ye hiç girmiyor.
  matcher: [
    "/((?!api|_next/static|_next/image|tr/|en/|de/|ar/|ru/|favicon.ico|robots.txt|sitemap.xml|icon|apple-icon|manifest.webmanifest).*)",
  ],
};
