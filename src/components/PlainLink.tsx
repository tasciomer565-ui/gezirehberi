import type { AnchorHTMLAttributes } from "react";

// next/link yerine düz <a> (2026-11-15). Site Cloudflare'de statik dışa aktarım
// olarak yayında ve 20.000 dosya sınırı yüzünden Next.js'in istemci gezinme
// verisi (RSC .txt dosyaları) yüklenmiyor (bkz. scripts/cloudflare-postbuild.mjs).
// next/link her görünen link için bu dosyaları önceden istiyor ve 404 alıyordu
// (sayfa başına ~18 istek, her biri ~58 KB'lık 404 sayfası). Düz link, normal
// tam sayfa yüklemesi yapar; statik HTML zaten CDN'den hızlı geliyor.
type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean };

export default function Link({ prefetch: _prefetch, ...rest }: Props) {
  void _prefetch;
  return <a {...rest} />;
}
