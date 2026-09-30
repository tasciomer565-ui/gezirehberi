import Link from "next/link";
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Compass } from "lucide-react";
import { getSearchIndex } from "@/lib/data/cities";
import { regions } from "@/lib/data/regions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/lib/ThemeContext";
import "./globals.css";

// Denetim bulgusu (2026-09): [locale]/not-found.tsx sadece bilinen route'lar
// içinde notFound() çağrıldığında devreye giriyordu — gerçekten hiç
// eşleşmeyen bir URL'de (yazım hatası, kırık eski link) [locale] segmenti
// hiç render edilmediği için font/globals.css/Header/Footer'ı da yükleyen
// bu layout hiç mount olmuyor, Next.js'in tamamen çıplak/markasız varsayılan
// 404'üne düşülüyordu. Bu dosya kendi html/body'sini ve aynı font/CSS/nav
// setini yükleyerek o boşluğu kapatıyor. Locale bilgisi bu seviyede yok —
// site genelindeki "tr her zaman varsayılan" kuralına uyarak Türkçe
// gösteriliyor (diğer tüm fallback noktalarıyla aynı mantık).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  style: ["italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı | Yol Defteri",
  robots: { index: false, follow: true },
};

export default function RootNotFound() {
  return (
    <html lang="tr" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-ink selection:bg-kiremit/20">
        <ThemeProvider>
          <Header
            activeRegionSlugs={regions.filter((r) => r.cityCount > 0).map((r) => r.slug)}
            searchIndex={getSearchIndex()}
          />
          <main className="flex-1">
            <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center sm:px-6">
              <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-kiremit/10 text-kiremit">
                <Compass size={32} />
              </span>
              <h1 className="font-display text-4xl italic text-ink">Bu yol henüz haritada yok</h1>
              <p className="mt-4 text-ink/70">
                Aradığınız sayfa bulunamadı. Belki bölgeler sayfasından yeni bir rota keşfetmek istersiniz.
              </p>
              <Link
                href="/tr/bolgeler"
                className="mt-8 rounded-full bg-kiremit px-6 py-3 text-sm font-semibold text-paper hover:bg-ink transition-colors"
              >
                Bölgeleri Keşfet
              </Link>
            </div>
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
