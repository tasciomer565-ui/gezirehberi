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
- 2026-11-18: Instagram/TikTok (@yoldefterim.tr) footer, Hakkımızda, İletişim'e
  eklendi; Organization JSON-LD'ye `sameAs` (liste: src/lib/social.ts).
- 2026-11-18: DiscoverCars ortaklığı (kimlik `yoldefterim`): havalimanı sayfaları ve
  şehir sayfası havalimanı bölümünde kiralık araç kutusu (src/components/CarRentalOffer.tsx),
  rel="sponsored nofollow", açık ortaklık notu. Travelpayouts Drive script'i
  REDDEDİLDİ (tıklamaları ele geçiriyor, kendini gizliyor) — siteye ekleme.
  Bekleyen: GetYourGuide ve Trip.com ortaklık kimlikleri.
- 2026-11-18: **İlçe rehberleri başladı** — İstanbul Fatih, Beşiktaş, Kadıköy
  (src/lib/data/districtGuides/istanbul.ts). Analiz: mevcut 14 ilçe sayfası 28 günde
  257 gösterim, ort. konum 65, 0 tık; nedenleri ince içerik + şehir sayfasından hiç
  link olmaması. Yapılanlar: ilçeye özel bölümler (semtler, ne yenir, nasıl gidilir,
  ipuçları, ideal süre), İstanbul'a 19 gerçek yer (OSM koordinatlı), ilçe filtresi
  artık adresle de eşleşiyor, şehir sayfasına "İlçe ve Semt Rehberleri" bölümü.
  **Ölçüm:** 2026-12-02'de bu 3 sayfanın gösterim/konumuna bak; iyiyse sıradaki
  parti: Beyoğlu, Üsküdar, Sarıyer, Adalar → sonra diğer büyükşehirler
  (İzmir Konak/Karşıyaka, Ankara Çankaya, Antalya Muratpaşa/Kaleiçi). Kural:
  partide en fazla 3-4 ilçe, işletme adı yok, fiyat/saat yok, koordinat OSM'den.
