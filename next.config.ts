import type { NextConfig } from "next";

// 2026-11-15: Vercel'den Cloudflare'e (ücretsiz, statik) taşındı. Vercel Hobby
// limiti aşılıp ekip durdurulunca site 402 dönmeye başladı. Site artık tamamen
// statik dosya olarak dışa aktarılıyor (`out/`):
// - Yönlendirmeler ve güvenlik başlıkları: public/_redirects, public/_headers
//   (statik dışa aktarımda next.config redirects()/headers() çalışmaz).
// - API rotaları: functions/api/** (Cloudflare Pages Functions).
// - Görseller Unsplash/Wikimedia'dan doğrudan yükleniyor (sunucu yok, Next
//   görüntü optimizasyonu kullanılamaz; Unsplash URL'leri zaten boyutlu).
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
