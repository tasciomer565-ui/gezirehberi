import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Region } from "@/lib/types";
import { translateDataText, Locale } from "@/lib/i18n";
import { REGION_IMAGES } from "@/lib/cityImages";

// eager: mobilde ilk kart ekranın ilk görünümünde ve LCP öğesi (Lighthouse
// 2026-09-29: ana sayfada 2,4 sn "load delay", düşük öncelikle yükleniyordu).
export default function RegionCard({
  region,
  locale,
  eager = false,
}: {
  region: Region;
  locale: string;
  eager?: boolean;
}) {
  const hasContent = region.cityCount > 0;

  const countText = hasContent
    ? locale === "tr"
      ? `${region.cityCount} şehir`
      : locale === "de"
      ? `${region.cityCount} Städte`
      : locale === "ar"
      ? `${region.cityCount} مدينة`
      : `${region.cityCount} cities`
    : locale === "tr"
    ? "Yakında"
    : locale === "de"
    ? "Demnächst"
    : locale === "ar"
    ? "قريباً"
    : "Coming Soon";

  const bgImage = REGION_IMAGES[region.slug] || REGION_IMAGES.marmara;

  return (
    <Link
      href={`/${locale}/bolgeler/${region.slug}`}
      className="group relative flex h-64 flex-col justify-between overflow-hidden rounded-2xl p-6 text-paper shadow-md transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl border border-ink/5"
    >
      {/* Background Image Container with Zoom effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={bgImage}
          alt={region.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 filter brightness-[0.85] contrast-[1.05]"
        />
        {/* Dark linear gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20 opacity-90 transition-opacity duration-300 group-hover:opacity-95" />
        
        {/* Inner colored ambient light block on hover */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 opacity-0 transition-opacity duration-500 group-hover:opacity-20 blur-xl pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at bottom, ${region.gradientFrom}, transparent 70%)`,
          }}
        />
      </div>

      {/* Top Header Row */}
      <div className="relative z-10 flex items-start justify-between">
        <h3 className="font-display text-2xl italic font-medium tracking-wide drop-shadow-md text-paper/95 group-hover:text-paper transition-colors">
          {translateDataText(region.name, locale as Locale)}
        </h3>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper/10 backdrop-blur-sm text-paper border border-paper/10 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
          <ArrowUpRight size={16} />
        </span>
      </div>

      {/* Bottom Description Area */}
      <div className="relative z-10 mt-auto">
        <p className="text-xs leading-relaxed text-paper/80 font-medium drop-shadow max-w-[90%] line-clamp-2">
          {translateDataText(region.tagline, locale as Locale)}
        </p>
        
        {/* Badge styling */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-paper shadow-sm`}
            style={{
              backgroundImage: `linear-gradient(135deg, ${region.gradientFrom}, ${region.gradientTo})`,
            }}
          >
            {countText}
          </span>
          {!hasContent && (
            <span className="inline-block rounded-full bg-paper/10 backdrop-blur-sm border border-paper/10 px-2 py-0.5 text-[9px] font-semibold text-paper/70">
              {locale === "tr" ? "Çok Yakında" : "Soon"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
