import { json, readJson, type Ctx } from "../../cloudflare/shared";

// POST /api/directions — gün planındaki duraklar arası gerçek Mapbox mesafe/süre.
// MAPBOX_ACCESS_TOKEN sunucuda kalır. Aynı rota için Cloudflare kenar önbelleği
// (24 saat) kullanılır; anahtar koordinat listesinden türetilen bir GET URL'si.
interface DirectionsRequestBody {
  coordinates: { lat: number; lng: number }[];
  mode: "walking" | "driving";
}

export async function onRequestPost(ctx: Ctx<string>): Promise<Response> {
  const token = ctx.env.MAPBOX_ACCESS_TOKEN;
  if (!token) return json({ error: "MAPBOX_ACCESS_TOKEN not configured" }, 503);

  const body = await readJson<DirectionsRequestBody>(ctx.request);
  if (!body) return json({ error: "Invalid JSON body" }, 400);
  const { coordinates, mode } = body;
  if (!Array.isArray(coordinates) || coordinates.length < 2 || coordinates.length > 25) {
    return json({ error: "2-25 coordinates required" }, 400);
  }

  const profile = mode === "driving" ? "driving" : "walking";
  const coordStr = coordinates.map((c) => `${Number(c.lng).toFixed(5)},${Number(c.lat).toFixed(5)}`).join(";");
  const cache = (globalThis as unknown as { caches: { default: Cache } }).caches.default;
  const cacheKey = new Request(`https://cache.yoldefterim.internal/directions/${profile}/${coordStr}`);
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordStr}?access_token=${token}&overview=false&geometries=geojson`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return json({ error: `Mapbox API error: ${res.status}` }, 502);
    const data = (await res.json()) as { routes?: { legs?: { distance: number; duration: number }[] }[] };
    const legs = data.routes?.[0]?.legs;
    if (!Array.isArray(legs)) return json({ error: "No route found" }, 502);

    const response = json({
      legs: legs.map((leg) => ({
        distanceKm: Math.round((leg.distance / 1000) * 10) / 10,
        durationMin: Math.max(1, Math.round(leg.duration / 60)),
      })),
    });
    const toCache = new Response(response.clone().body, response);
    toCache.headers.set("Cache-Control", "public, max-age=86400");
    ctx.waitUntil(cache.put(cacheKey, toCache));
    return response;
  } catch (error: unknown) {
    return json({ error: error instanceof Error && error.message ? error.message : "Mapbox request failed" }, 502);
  }
}
