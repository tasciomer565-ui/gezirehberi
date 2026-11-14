import { cachedGet, json, type Ctx } from "../../../../cloudflare/shared";
import { getPlacesForCity } from "../../../../src/lib/places";

// GET /api/cities/:citySlug/places?type=&limit=&offset=&sort=&query=&district=
// Statik şehir verisinden filtreleme/sıralama/sayfalama; yalnızca kullanıcı
// sekme, sıralama, arama veya "daha fazla" kullandığında çağrılır. 1 gün önbellek.
export async function onRequestGet(ctx: Ctx<"citySlug">): Promise<Response> {
  return cachedGet(ctx, 86400, async () => {
    const sp = new URL(ctx.request.url).searchParams;
    const result = getPlacesForCity(ctx.params.citySlug, {
      type: sp.get("type") || "attractions",
      limit: Math.min(100, parseInt(sp.get("limit") || "20", 10) || 20),
      offset: Math.max(0, parseInt(sp.get("offset") || "0", 10) || 0),
      sort: sp.get("sort") || "popularity",
      query: sp.get("query") || "",
      districtSlug: sp.get("district") || "",
    });
    if (!result) return json({ error: "City not found" }, 404);
    return json(result);
  });
}
