import { cachedGet, json, readJson, supabaseFor, getAnonIdentity, withCookie, DB_NOT_CONFIGURED, type Ctx } from "../../../../cloudflare/shared";
import { isRateLimited } from "../../../../src/lib/communityRateLimit";
import { friendlyDbError } from "../../../../src/lib/communityDbErrors";

interface CreateRouteBody {
  citySlug: string;
  regionSlug: string;
  title: string;
  days: number;
  stops: unknown[];
  authorName?: string;
  hp?: string; // honeypot
}

// GET /api/community/routes?citySlug=x&sort=newest|popular — 10 dk kenar önbelleği.
export async function onRequestGet(ctx: Ctx<string>): Promise<Response> {
  const url = new URL(ctx.request.url);
  const citySlug = url.searchParams.get("citySlug");
  if (!citySlug) return json({ error: "citySlug is required" }, 400);
  const sort = url.searchParams.get("sort") === "popular" ? "popular" : "newest";

  return cachedGet(ctx, 600, async () => {
    const supabase = supabaseFor(ctx.env);
    if (!supabase) return json({ error: DB_NOT_CONFIGURED }, 503);
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("city_slug", citySlug)
      .order(sort === "popular" ? "like_count" : "created_at", { ascending: false })
      .limit(50);
    if (error) return json({ error: friendlyDbError(error) }, 500);
    return json({ routes: data });
  });
}

export async function onRequestPost(ctx: Ctx<string>): Promise<Response> {
  const supabase = supabaseFor(ctx.env);
  if (!supabase) return json({ error: DB_NOT_CONFIGURED }, 503);

  const body = await readJson<CreateRouteBody>(ctx.request);
  if (!body) return json({ error: "Invalid JSON body" }, 400);
  if (body.hp) return json({ success: true });

  const { citySlug, regionSlug, title, days, stops, authorName } = body;
  if (!citySlug || !regionSlug || !title || !days || !Array.isArray(stops) || stops.length === 0) {
    return json({ error: "Missing required fields" }, 400);
  }

  const identity = getAnonIdentity(ctx.request);
  // 3 yeni rota / saat / tarayıcı.
  if (await isRateLimited(supabase, "routes", identity.id, 60, 3)) {
    return withCookie(json({ error: "Çok sık rota paylaşıldı, lütfen daha sonra tekrar deneyin." }, 429), identity.setCookie);
  }

  const { data, error } = await supabase
    .from("routes")
    .insert({
      city_slug: citySlug,
      region_slug: regionSlug,
      title,
      days,
      stops,
      author_name: authorName?.trim() || "Misafir Gezgin",
      author_identity: identity.id,
    })
    .select()
    .single();

  if (error) return withCookie(json({ error: friendlyDbError(error) }, 400), identity.setCookie);
  return withCookie(json({ route: data }, 201), identity.setCookie);
}
