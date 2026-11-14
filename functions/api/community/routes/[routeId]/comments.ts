import { cachedGet, json, readJson, supabaseFor, getAnonIdentity, withCookie, DB_NOT_CONFIGURED, type Ctx } from "../../../../../cloudflare/shared";
import { isRateLimited } from "../../../../../src/lib/communityRateLimit";
import { friendlyDbError } from "../../../../../src/lib/communityDbErrors";

interface CreateCommentBody {
  text: string;
  rating: number;
  authorName?: string;
  hp?: string;
}

// GET /api/community/routes/:routeId/comments — 30 sn önbellek (yorum yazan
// kendi yorumunu kısa sürede görsün).
export async function onRequestGet(ctx: Ctx<"routeId">): Promise<Response> {
  const { routeId } = ctx.params;
  return cachedGet(ctx, 30, async () => {
    const supabase = supabaseFor(ctx.env);
    if (!supabase) return json({ error: DB_NOT_CONFIGURED }, 503);
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("route_id", routeId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return json({ error: friendlyDbError(error) }, 500);
    return json({ comments: data });
  });
}

export async function onRequestPost(ctx: Ctx<"routeId">): Promise<Response> {
  const supabase = supabaseFor(ctx.env);
  if (!supabase) return json({ error: DB_NOT_CONFIGURED }, 503);
  const { routeId } = ctx.params;

  const body = await readJson<CreateCommentBody>(ctx.request);
  if (!body) return json({ error: "Invalid JSON body" }, 400);
  if (body.hp) return json({ success: true });

  const { text, rating, authorName } = body;
  if (!text?.trim() || !rating || rating < 1 || rating > 5) {
    return json({ error: "Missing or invalid fields" }, 400);
  }

  const identity = getAnonIdentity(ctx.request);
  // 10 yeni yorum / saat / tarayıcı.
  if (await isRateLimited(supabase, "comments", identity.id, 60, 10)) {
    return withCookie(json({ error: "Çok sık yorum yapıldı, lütfen daha sonra tekrar deneyin." }, 429), identity.setCookie);
  }

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      route_id: routeId,
      text: text.trim(),
      rating,
      author_name: authorName?.trim() || "Misafir Gezgin",
      author_identity: identity.id,
    })
    .select()
    .single();

  if (error) return withCookie(json({ error: friendlyDbError(error) }, 400), identity.setCookie);
  // rating_avg/rating_count güncellemesi DB trigger'ında (migration 0002).
  return withCookie(json({ comment }, 201), identity.setCookie);
}
