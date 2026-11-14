import { json, readJson, supabaseFor, getAnonIdentity, withCookie, DB_NOT_CONFIGURED, type Ctx } from "../../../cloudflare/shared";
import { isRateLimited } from "../../../src/lib/communityRateLimit";
import { friendlyDbError } from "../../../src/lib/communityDbErrors";

interface CreateFeedbackBody {
  citySlug: string;
  isAccurate: boolean;
  note?: string;
  hp?: string;
}

export async function onRequestPost(ctx: Ctx<string>): Promise<Response> {
  const supabase = supabaseFor(ctx.env);
  if (!supabase) return json({ error: DB_NOT_CONFIGURED }, 503);

  const body = await readJson<CreateFeedbackBody>(ctx.request);
  if (!body) return json({ error: "Invalid JSON body" }, 400);
  if (body.hp) return json({ success: true });

  const { citySlug, isAccurate, note } = body;
  if (!citySlug || typeof isAccurate !== "boolean") return json({ error: "Missing required fields" }, 400);

  const identity = getAnonIdentity(ctx.request);
  // 10 geri bildirim / saat.
  if (await isRateLimited(supabase, "content_feedback", identity.id, 60, 10)) {
    return withCookie(json({ error: "Çok sık geri bildirim gönderildi, lütfen daha sonra tekrar deneyin." }, 429), identity.setCookie);
  }

  const { error } = await supabase.from("content_feedback").insert({
    city_slug: citySlug,
    is_accurate: isAccurate,
    note: note?.trim() || null,
    author_identity: identity.id,
  });
  if (error) return withCookie(json({ error: friendlyDbError(error) }, 400), identity.setCookie);
  return withCookie(json({ success: true }, 201), identity.setCookie);
}
