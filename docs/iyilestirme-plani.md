# Yol Defteri — günlük iyileştirme planı

Amaç: Google'dan gelen gösterim ve tıklamayı artırmak, Google'a zarar verecek
hiçbir şey yapmadan. Her gün **en fazla bir** madde uygulanır, build + kontrol
geçmeden yayınlanmaz, yapılan iş aşağıdaki "Günlük kayıt"a yazılır.

## Dokunma listesi (deney ve güvenlik)

- **/tr/mesafe/[çift] başlıkları ve açıklamaları — 2026-12-08'e kadar dokunma.**
  A/B başlık deneyi sürüyor (grup kuralı: slug karakter kodları toplamı tek → B).
  Taban: A TO %0,091, B TO %0,094. Karşılaştırma 2026-11-17 sonrası verilerle.
- **/tr/gunubirlik/[şehir] başlıkları — 2026-12-08'e kadar dokunma** (2026-11-18'de
  "X'e Yakın Yerler" olarak değişti; etkisi ölçülüyor).
- Aynı gün birden fazla SEO değişikliği yapma (hangisinin işe yaradığı ayırt edilemez).
- Sunucu gerektiren hiçbir şey ekleme: ISR/revalidate, middleware/proxy, route
  handler, `next.config` redirects/headers. Site Cloudflare Pages'te statik
  (bkz. CLOUDFLARE.md). Dosya sayısı 19.000'i geçmemeli.
- Uydurma veri yok: km/süre/fiyat/yer bilgisi yalnızca projedeki gerçek veriden.
- Sayfa silme, URL değiştirme, toplu noindex, toplu yönlendirme yok.
- Gizli/aldatıcı SEO yok: gizli metin, anahtar kelime doldurma, otomatik üretilmiş
  ince sayfa, ücretli dofollow link.

## Sıradaki işler (öncelik sırasıyla)

Durum: `[ ]` bekliyor, `[x]` yapıldı (tarih ve commit ile).

1. [ ] **Sitemap lastmod doğruluğu.** 1.297 URL'nin lastmod'u 2026-10-01'de kalmış;
   rota/günübirlik sayfaları Kasım'da değişti. lastmod'u sayfanın gerçek son
   değişikliğinden üret (scripts/generate-content-dates.ts ya da git geçmişi).
   Doğru lastmod, değişen sayfaların daha hızlı yeniden taranmasını sağlar.
2. [ ] **Görsel boyutları (hız).** Kapak görselindeki `wikimediaSrcSet`'i bölge
   kartları, ilçe sayfası kapakları ve diğer Wikimedia görsellerine uygula;
   Unsplash kart görsellerinde `w=` parametresiyle srcset. Ekran dışı görseller
   `loading="lazy"`. Lighthouse mobil şehir sayfası LCP hedefi < 4 sn.
3. [ ] **Harita tembel yükleme (hız).** Şehir sayfasındaki OpenStreetMap haritası
   açılışta ~15 kutucuk indiriyor; harita görünür alana gelince ya da tıklanınca yüklensin.
4. [ ] **Günübirlik sayfalarına ItemList yapılandırılmış verisi.** Durak listesi
   (ad, sayfa URL'si) `ItemList` JSON-LD olarak; içerik zaten sayfada görünür.
5. [ ] **Rota sayfasından şehir mesafe tablosuna bağlantı.** Şehir tabloları
   (/tr/mesafe/sehir/X) TO %0,86 ile rota sayfalarının ~10 katı; her rota
   sayfasından iki şehrin tablosuna görünür bağlantı (yoksa ekle).
6. [ ] **Havalimanı sayfaları içerik kontrolü.** 48 sayfa, 6.665 gösterim, TO %0,18.
   Hangi sorgulardan geldiğine bak (GSC), başlık/açıklama sorguyla eşleşiyor mu.
   (Deney dışı sayfa türü; tek seferde değiştir, sonra 2 hafta ölç.)
7. [ ] **Ortaklık (affiliate) entegrasyonu** — kullanıcı Travelpayouts (Trip.com
   otel, GetYourGuide tur) ve DiscoverCars hesaplarını açıp kimliklerini verince.
   Bağlantılar `rel="sponsored nofollow"`, sayfada "Ortaklık bağlantısı" notu.
8. [ ] **2026-12-08 sonrası: A/B başlık deneyi değerlendirmesi.** GSC'den
   /tr/mesafe/ sayfaları (17 Kasım sonrası) dışa aktar, gruplara ayır, TO
   karşılaştır; anlamlı fark varsa kazananı tüm sayfalara uygula, deney kodunu kaldır.
9. [ ] **2026-12-08 sonrası: günübirlik başlık etkisi** (gösterim/TO, 17 Kasım öncesi-sonrası).
10. [ ] **Kısa ve uzun vadeli içerik fikirleri** (deneyler bittikten sonra, veriyle):
    GSC'de gösterimi olup sayfası olmayan sorgu kalıpları (ör. "X'e yakın tatil
    yerleri", havalimanı-ilçe çiftleri) — yalnızca gerçek veriyle cevaplanabilenler.

## Günlük kayıt

- 2026-11-18: Plan oluşturuldu. Bugün yapılanlar: günübirlik "yakın yerler"
  başlıkları (5077101), GA4 (964d39f), kapak görseli srcset + Arapça OG (44ff864),
  Bing'e site eklendi, GSC'de 4xx doğrulaması başlatıldı, build önbelleği açıldı.
