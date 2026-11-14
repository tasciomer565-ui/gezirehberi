import { cachedGet, json, supabaseFor, DB_NOT_CONFIGURED, type Ctx } from "../../../cloudflare/shared";

// GET /api/community/stats?citySlug=x — şehir sayfasındaki topluluk rozeti
// (rota/yorum/beğeni sayısı). 10 dk kenar önbelleği.
export async function onRequestGet(ctx: Ctx<string>): Promise<Response> {
  const citySlug = new URL(ctx.request.url).searchParams.get("citySlug");
  if (!citySlug) return json({ error: "citySlug is required" }, 400);

  return cachedGet(ctx, 600, async () => {
    const supabase = supabaseFor(ctx.env);
    if (!supabase) return json({ error: DB_NOT_CONFIGURED }, 503);

    const { data: routeRows, error } = await supabase.from("routes").select("id, like_count").eq("city_slug", citySlug);
    if (error) return json({ error: error.message }, 500);

    const routeIds = (routeRows ?? []).map((r) => r.id);
    const likeCount = (routeRows ?? []).reduce((sum, r) => sum + (r.like_count ?? 0), 0);
    let commentCount = 0;
    if (routeIds.length > 0) {
      const { count } = await supabase.from("comments").select("id", { count: "exact", head: true }).in("route_id", routeIds);
      commentCount = count ?? 0;
    }
    return json({ routeCount: routeIds.length, commentCount, likeCount });
  });
}
