import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

// Parti 2, madde 9 — şehir sayfasındaki topluluk istatistiği rozeti için
// (rota/yorum/beğeni sayısı). "Gezgin sayısı" yerine bu üç somut, doğrudan
// sayılabilir metriği kullanıyoruz — "gezgin" kelimesi hangi eylemlerin
// birini benzersiz bir kişi saydıracağı belirsiz olduğundan (rota mı
// paylaşmalı, yorum mu yapmalı, ikisi de mi?), tanımı net olmayan bir
// rakam uydurmak yerine üç ayrı, dürüst sayı gösteriyoruz.

interface CityStats {
  routeCount: number;
  commentCount: number;
  likeCount: number;
}

// Bulgu (madde 307): bu route citySlug'a göre değişen bir query-param'lı GET
// olduğu için Next.js "dynamic route handler" sayıyor — Route Handler'lar
// öntanımlı olarak cache'lenmiyor ve `export const dynamic = 'force-static'`
// (tek opt-in yolu) searchParams okumayı engelleyip her citySlug için aynı
// dondurulmuş yanıtı döndürürdü (yanlış veri). Bu yüzden yanıt üzerinde
// manuel `Cache-Control` set etmek (önceki versiyon) hiçbir işe yaramıyordu —
// Next.js bunu "dynamic route" varsayılanıyla (no-cache) sessizce override
// ediyor (production'da doğrulandı: X-Vercel-Cache: MISS, Age: 0, her istekte).
// Gerçek CDN/edge cache'i için citySlug'ın bir path param'a (/stats/[citySlug])
// taşınması gerekir — bu ayrı, daha büyük bir değişiklik. Bunun yerine burada
// asıl amaca (Supabase sorgu yükünü azaltmak) hizmet eden, gerçekten çalışan
// bir çözüm var: sorgunun kendisini unstable_cache ile sarmalamak — citySlug
// argümanına göre otomatik anahtarlanır, revalidate penceresi içinde aynı
// şehir için tekrar Supabase'e gitmez.
const getCachedStats = unstable_cache(
  async (citySlug: string): Promise<CityStats | { error: string }> => {
    const supabase = getSupabaseServerClient();
    if (!supabase) return { error: "Community DB not configured" };

    const { data: routeRows, error: routesError } = await supabase
      .from("routes")
      .select("id, like_count")
      .eq("city_slug", citySlug);

    if (routesError) return { error: routesError.message };

    const routeIds = (routeRows ?? []).map((r) => r.id);
    const routeCount = routeIds.length;
    const likeCount = (routeRows ?? []).reduce((sum, r) => sum + (r.like_count ?? 0), 0);

    let commentCount = 0;
    if (routeIds.length > 0) {
      const { count } = await supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .in("route_id", routeIds);
      commentCount = count ?? 0;
    }

    return { routeCount, commentCount, likeCount };
  },
  ["community-stats"],
  // 30 sn'den 10 dk'ya (2026-11-15): Hobby ISR yazım limiti; bkz. routes/route.ts.
  { revalidate: 600 }
);

export async function GET(request: NextRequest) {
  const citySlug = request.nextUrl.searchParams.get("citySlug");
  if (!citySlug) return NextResponse.json({ error: "citySlug is required" }, { status: 400 });

  const result = await getCachedStats(citySlug);
  if ("error" in result) {
    const status = result.error === "Community DB not configured" ? 503 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json(result);
}
