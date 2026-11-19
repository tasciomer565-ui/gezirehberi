// Sitemap lastmod kaynağı. Cloudflare Pages derlemesi sığ (shallow) git klonu
// kullanır; orada `git log` her dosya için son commit tarihini verir ve tüm
// URL'ler aynı (sahte) lastmod'u alırdı. Bu script tam git geçmişi olan
// yerelde çalışır, gerçek son değişiklik tarihlerini JSON'a yazar; sitemap.ts
// yalnızca bu JSON'u okur. İçerik dosyaları değiştiğinde push'tan önce çalıştır:
//   npx tsx scripts/generate-sitemap-dates.ts
import { execFileSync } from "child_process";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "..");
const OUTPUT = join(ROOT, "src", "lib", "data", "sitemapDates.json");

function lastCommit(pathspec: string): string | undefined {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", pathspec], {
      cwd: ROOT,
      encoding: "utf-8",
    }).trim();
    return out || undefined;
  } catch {
    return undefined;
  }
}

const paths: Record<string, string> = {};
const sitemapSrc = readFileSync(join(ROOT, "src", "app", "sitemap.ts"), "utf-8");
const extra = [
  "src/lib/data/dayTrips.ts",
  "src/lib/data/districtGuides",
  "src/lib/data/placePairs.ts",
  "src/lib/data/distances.ts",
  "src/locales/generated/en.cache.json",
  "src/locales/generated/de.cache.json",
  "src/locales/generated/ru.cache.json",
  "src/locales/generated/ar.cache.json",
];
const found = new Set<string>([...sitemapSrc.matchAll(/"(src\/[^"$`]+)"/g)].map((m) => m[1]).concat(extra));
for (const p of found) {
  if (p.includes("[locale]") || !p.startsWith("src/")) {
    // sayfa dosyaları köşeli parantez içerir; pathspec olarak yine geçerli
  }
  const d = lastCommit(p);
  if (d) paths[p] = d;
}

// Şehir sayfaları: şehrin tanımlandığı dosyanın son commit tarihi.
const citiesDir = join(ROOT, "src", "lib", "data", "cities");
const cities: Record<string, string> = {};
for (const file of readdirSync(citiesDir).filter((f) => f.endsWith(".ts") && f !== "index.ts")) {
  const d = lastCommit(`src/lib/data/cities/${file}`);
  if (!d) continue;
  const content = readFileSync(join(citiesDir, file), "utf-8");
  for (const m of content.matchAll(/^\s{4}slug:\s*"([^"]+)"/gm)) cities[m[1]] = d;
}

writeFileSync(OUTPUT, JSON.stringify({ paths, cities }, null, 2) + "\n", "utf-8");
console.log(`paths: ${Object.keys(paths).length}, cities: ${Object.keys(cities).length}`);
