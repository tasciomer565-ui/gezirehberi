# Yayın: Cloudflare Pages (ücretsiz)

2026-11-15'te Vercel Hobby limiti aşılıp ekip durdurulunca (402 DEPLOYMENT_DISABLED)
site Cloudflare Pages'e taşındı. Site tamamen statik dışa aktarım (`out/`), API
uç noktaları Cloudflare Pages Functions (`functions/api/**`).

## Proje ayarları (Workers & Pages → Create → Pages → Connect to Git)

| Ayar | Değer |
|---|---|
| Repo | `tasciomer565-ui/gezirehberi` |
| Production branch | `main` (geçiş süresince `cloudflare-statik`) |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `out` |
| Ortam değişkeni `NODE_VERSION` | `22` |

## Ortam değişkenleri (Settings → Variables and Secrets, Production)

Build sırasında sayfalara gömülenler (`NEXT_PUBLIC_*`) ve fonksiyonların kullandıkları:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (topluluk rotaları, yorumlar)
- `MAPBOX_ACCESS_TOKEN` (gün planı gerçek mesafeleri; secret olarak)
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID`,
  `NEXT_PUBLIC_CLARITY_PROJECT_ID`, `NEXT_PUBLIC_YANDEX_METRICA_ID`
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_YANDEX_VERIFICATION`

Değerler eski Vercel projesindeki (Settings → Environment Variables) değerlerle aynı.

## Alan adı

Pages projesi → Custom domains → `www.yoldefterim.com.tr` ve `yoldefterim.com.tr`.
En sorunsuzu alan adını Cloudflare'e eklemek (Add a site → Free) ve kayıt
firmasında nameserver'ları Cloudflare'in verdikleriyle değiştirmek.

## Sınırlar ve kurallar

- Ücretsiz plan: sürüm başına en fazla 20.000 dosya. `scripts/cloudflare-postbuild.mjs`
  RSC `.txt` dosyalarını siler ve 19.000'i aşarsa build'i durdurur.
- Statik dosya istekleri sınırsız ve ücretsiz; fonksiyonlar günde 100.000 istek.
- `next/link` yerine `@/components/PlainLink` (düz `<a>`) kullanılır; RSC
  dosyaları olmadığı için istemci gezinmesi/prefetch kullanılmaz.
- Sunucu gerektiren Next.js özellikleri (ISR/revalidate, proxy/middleware,
  route handler, `next.config` redirects/headers, görüntü optimizasyonu) çalışmaz.
  Yönlendirme: `public/_redirects`; başlık: `public/_headers`.
- Yerel deneme: `npm run build && npm run preview` (http://localhost:8788).
