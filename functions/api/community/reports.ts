import { json, readJson, supabaseFor, getAnonIdentity, withCookie, DB_NOT_CONFIGURED, type Ctx } from "../../../cloudflare/shared";
import { isRateLimited } from "../../../src/lib/communityRateLimit";
import { friendlyDbError } from "../../../src/lib/communityDbErrors";

interface CreateReportBody {
  targetType: "route" | "comment";
  targetId: string;
  reason: "spam" | "inappropriate" | "incorrect" | "other";
  hp?: string;
}

// Yalnızca yazma: bildirimler herkese açık değil, Supabase panelinden incelenir.
export async function onRequestPost(ctx: Ctx<string>): Promise<Response> {
  const supabase = supabaseFor(ctx.env);
  if (!supabase) return json({ error: DB_NOT_CONFIGURED }, 503);

  const body = await readJson<CreateReportBody>(ctx.request);
  if (!body) return json({ error: "Invalid JSON body" }, 400);
  if (body.hp) return json({ success: true });

  const { targetType, targetId, reason } = body;
  if (!targetType || !targetId || !reason) return json({ error: "Missing required fields" }, 400);

  const identity = getAnonIdentity(ctx.request);
  // 5 bildirim / saat / tarayıcı.
  if (await isRateLimited(supabase, "reports", identity.id, 60, 5)) {
    return withCookie(json({ error: "Çok sık bildirim yapıldı, lütfen daha sonra tekrar deneyin." }, 429), identity.setCookie);
  }

  const { error } = await supabase.from("reports").insert({
    target_type: targetType,
    target_id: targetId,
    reason,
    author_identity: identity.id,
  });
  if (error) return withCookie(json({ error: friendlyDbError(error) }, 400), identity.setCookie);
  return withCookie(json({ success: true }, 201), identity.setCookie);
}
