import { ImageResponse } from "next/og";
import { getDictionary, Locale } from "@/lib/i18n";

// Default og:image for every page under [locale] that doesn't define its own
// (city/district/region pages already set a real hero photo in their own
// generateMetadata and take priority — this only fills the gap on hakkimizda,
// iletisim, gizlilik-politikasi, cerez-politikasi, bolgeler, and the homepage;
// see report items 275-277). Generated at request time via next/og, so no
// static image asset is needed and there's nothing fabricated about it.

// Build'de 5 dil için üretilsin; yoksa her istekte sunucuda çiziliyordu
// (Vercel Hobby CPU limiti, 2026-11-15). "ar" yok: next/og Arapça yazıyı
// şekillendiremiyor ("lookupType: 5 - substFormat: 3 is not yet supported"),
// build'i düşürüyor; o dil önceki gibi istek anında deneniyor.
export function generateStaticParams() {
  return ["tr", "en", "de", "ru"].map((locale) => ({ locale }));
}

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale || "tr") as Locale;
  const dict = getDictionary(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf9f6",
          backgroundImage: "linear-gradient(135deg, #fdf6ec 0%, #faf9f6 60%, #f3ece0 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              borderRadius: 42,
              background: "#b33a25",
              color: "#fdf6ec",
              fontSize: 46,
              fontWeight: 700,
              fontStyle: "italic",
            }}
          >
            Y
          </div>
          <div
            style={{
              fontSize: 64,
              fontStyle: "italic",
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            {dict.nav.logo}
          </div>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: "#4b5563",
            maxWidth: 820,
            textAlign: "center",
          }}
        >
          {dict.home.subtitle}
        </div>
      </div>
    ),
    { ...size }
  );
}
