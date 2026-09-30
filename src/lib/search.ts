import type { City } from "@/lib/types";

// Arama sadece bu 5 alanı kullanıyor. Önceden search.ts allCities'i import
// ediyordu; SearchBar (Header içinde, her sayfada) istemci bileşeni olduğu
// için 85 şehrin tüm verisi (~1,7 MB) her sayfanın JS paketine giriyordu
// (Lighthouse 2026-09-29). Dizin artık sunucuda getSearchIndex() ile
// üretilip layout -> Header -> SearchBar prop'u olarak geliyor (~10 KB).
export type SearchableCity = Pick<City, "slug" | "regionSlug" | "name" | "region" | "tags">;

function normalize(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

/** Basit Levenshtein mesafesi — yazım hatalarına tolerans için (Bölüm 5.6) */
function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export interface SearchResult {
  city: SearchableCity;
  score: number;
  matchedOn: string;
}

/**
 * Bölüm 5.5/5.6: Debounce'a hazır (çağıran component debounce'lar),
 * substring eşleşmesi + Levenshtein toleranslı fuzzy arama.
 */
export function searchCities(query: string, index: SearchableCity[], limit = 8): SearchResult[] {
  const q = normalize(query.trim());
  if (q.length < 2) return [];

  const results: SearchResult[] = [];

  for (const city of index) {
    const nameNorm = normalize(city.name);
    const tagsNorm = city.tags.map(normalize);
    const regionNorm = normalize(city.region);

    if (nameNorm.includes(q)) {
      results.push({ city, score: nameNorm === q ? 100 : 80, matchedOn: city.name });
      continue;
    }

    const tagMatch = tagsNorm.find((t) => t.includes(q));
    if (tagMatch) {
      results.push({ city, score: 60, matchedOn: tagMatch });
      continue;
    }

    if (regionNorm.includes(q)) {
      results.push({ city, score: 40, matchedOn: city.region });
      continue;
    }

    // Yazım hatası toleransı: il ismiyle mesafe <=2 ise fuzzy eşleşme
    const dist = levenshtein(q, nameNorm.slice(0, q.length + 2));
    if (q.length >= 3 && dist <= 2) {
      results.push({ city, score: 30 - dist * 5, matchedOn: city.name });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
