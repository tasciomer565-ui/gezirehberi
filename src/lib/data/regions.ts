import { Region } from "@/lib/types";
import { regionMeta } from "@/lib/data/regionMeta";
import { getCityCount } from "@/lib/data/cities";

// Sunucu tarafı: şehir sayısıyla birlikte. İstemci bileşenlerinde
// regionMeta.ts kullanın (bkz. oradaki not).
export const regions: Region[] = regionMeta.map((r) => ({
  ...r,
  cityCount: getCityCount(r.slug),
}));

export function getRegion(slug: string): Region | undefined {
  return regions.find((r) => r.slug === slug);
}
