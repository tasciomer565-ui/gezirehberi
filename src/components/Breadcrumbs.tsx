import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/i18n";

export interface BreadcrumbItem {
  label: string;
  href?: string; // omit for the current (last) page
}

// Visible breadcrumb trail — the BreadcrumbList JSON-LD on city/district pages
// only helps search engines, it renders nothing a user or screen reader sees.
// This is the user-facing counterpart (report item 20).
//
// withSchema (2026-09-30 yapılandırılmış veri denetimi): mesafe, mesafe hub,
// bölge ve rehber sayfalarında BreadcrumbList JSON-LD hiç yoktu. Bu prop
// açıkken görünen yolun AYNISI şema olarak da basılır — görünen iz ile
// işaretleme ayrışamaz. Şehir/ilçe sayfaları kendi şemasını bastığı için
// orada kapalı (çift BreadcrumbList olmasın).
export default function Breadcrumbs({ items, withSchema = false }: { items: BreadcrumbItem[]; withSchema?: boolean }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.label,
      // Son öğe (mevcut sayfa) için item URL'si isteğe bağlı — Google sayfanın
      // kendi URL'sini kullanır.
      ...(item.href ? { "item": `${SITE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-4 overflow-x-auto">
      {withSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      )}
      <ol className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-ink/65">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            {idx > 0 && <ChevronRight size={12} className="text-ink/65 shrink-0" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-kiremit transition-colors">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink/75">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
