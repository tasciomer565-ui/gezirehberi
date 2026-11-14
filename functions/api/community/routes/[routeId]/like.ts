import { json, supabaseFor, getAnonIdentity, withCookie, DB_NOT_CONFIGURED, type Ctx } from "../../../../../cloudflare/shared";
import { friendlyDbError } from "../../../../../src/lib/communityDbErrors";

// Beğeniyi geri alma yok — tek yönlü "işime yaradı" sinyali.
export async function onRequestPost(ctx: Ctx<"routeId">): Promise<Response> {
  const supabase = supabaseFor(ctx.env);
  if (!supabase) return json({ error: DB_NOT_CONFIGURED }, 503);
  const { routeId } = ctx.params;
  const identity = getAnonIdentity(ctx.request);

  const { error } = await supabase.from("likes").insert({ route_id: routeId, author_identity: identity.id });
  if (error) {
    // unique(route_id, author_identity) — bu tarayıcı zaten beğenmiş.
    if (error.code === "23505") return withCookie(json({ success: true, alreadyLiked: true }), identity.setCookie);
    return withCookie(json({ error: friendlyDbError(error) }, 400), identity.setCookie);
  }

  const { count } = await supabase.from("likes").select("id", { count: "exact", head: true }).eq("route_id", routeId);
  return withCookie(json({ success: true, likeCount: count ?? 0 }), identity.setCookie);
}

export async function onRequestGet(ctx: Ctx<"routeId">): Promise<Response> {
  const supabase = supabaseFor(ctx.env);
  if (!supabase) return json({ error: DB_NOT_CONFIGURED }, 503);
  const { routeId } = ctx.params;
  const identity = getAnonIdentity(ctx.request);

  const [{ count }, { data: mine }] = await Promise.all([
    supabase.from("likes").select("id", { count: "exact", head: true }).eq("route_id", routeId),
    supabase.from("likes").select("id").eq("route_id", routeId).eq("author_identity", identity.id).maybeSingle(),
  ]);
  return withCookie(json({ likeCount: count ?? 0, likedByMe: !!mine }), identity.setCookie);
}
