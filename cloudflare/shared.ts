// Cloudflare Pages Functions için ortak yardımcılar (2026-11-15).
// Önceden src/app/api/** altındaki Next.js Route Handler'larıydı; site statik
// dışa aktarıma geçince (Vercel Hobby limiti → Cloudflare ücretsiz) aynı
// uç noktalar functions/api/** altında, aynı URL'lerle yeniden yazıldı.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabaseServer";

export interface Env {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  MAPBOX_ACCESS_TOKEN?: string;
}

export interface Ctx<P extends string = never> {
  request: Request;
  env: Env;
  params: Record<P, string>;
  waitUntil(promise: Promise<unknown>): void;
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

export function supabaseFor(env: Env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient<Database>(url, anonKey, { auth: { persistSession: false } });
}

export const DB_NOT_CONFIGURED = "Community DB not configured";

// Hesapsız, rastgele tarayıcı kimliği (bkz. eski src/lib/anonIdentity.ts):
// yalnızca hız sınırı ve "bir tarayıcı bir kez beğenir" için. Kişisel veri yok.
const IDENTITY_COOKIE = "ydf_identity";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function getAnonIdentity(request: Request): { id: string; setCookie?: string } {
  const cookie = request.headers.get("Cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)ydf_identity=([^;]+)/);
  if (match) return { id: decodeURIComponent(match[1]) };
  const id = crypto.randomUUID();
  return {
    id,
    setCookie: `${IDENTITY_COOKIE}=${id}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
  };
}

export function withCookie(response: Response, setCookie?: string): Response {
  if (setCookie) response.headers.append("Set-Cookie", setCookie);
  return response;
}

// Okuma uç noktaları için Cloudflare kenar önbelleği (eski unstable_cache'in
// karşılığı). Önbellekte varsa fonksiyon Supabase'e hiç gitmez.
export async function cachedGet(ctx: Ctx<string>, seconds: number, produce: () => Promise<Response>): Promise<Response> {
  const cache = (globalThis as unknown as { caches: { default: Cache } }).caches.default;
  const key = new Request(ctx.request.url, { method: "GET" });
  const hit = await cache.match(key);
  if (hit) return hit;
  const response = await produce();
  if (response.status === 200) {
    const toCache = new Response(response.clone().body, response);
    toCache.headers.set("Cache-Control", `public, max-age=${seconds}`);
    ctx.waitUntil(cache.put(key, toCache));
  }
  return response;
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
