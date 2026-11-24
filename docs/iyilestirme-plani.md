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

1. [x] **Sitemap lastmod doğruluğu** (2026-11-19, baae5c2). 1.297 URL'nin lastmod'u 2026-10-01'de kalmış;
   rota/günübirlik sayfaları Kasım'da değişti. lastmod'u sayfanın gerçek son
   değişikliğinden üret (scripts/generate-content-dates.ts ya da git geçmişi).
   Doğru lastmod, değişen sayfaların daha hızlı yeniden taranmasını sağlar.
   Gerçek neden: Cloudflare sığ klonunda `git log` hepsine son commit gününü veriyordu
   (1.898 URL de 2026-11-18). Artık src/lib/data/sitemapDates.json okunuyor; içerik
   dosyaları değişince push öncesi `npx tsx scripts/generate-sitemap-dates.ts` çalıştır.
2. [x] **(2026-11-20: 8610948 ve 9dff171 ile yapılmış, doğrulandı)** Görsel boyutları (hız).** Kapak görselindeki `wikimediaSrcSet`'i bölge
   kartları, ilçe sayfası kapakları ve diğer Wikimedia görsellerine uygula;
   Unsplash kart görsellerinde `w=` parametresiyle srcset. Ekran dışı görseller
   `loading="lazy"`. Lighthouse mobil şehir sayfası LCP hedefi < 4 sn.
2b. [x] **(2026-11-20: 8610948 ile yapılmış: preconnect + CityHero sizes; yeniden Lighthouse ölçümü hâlâ yapılmadı)** Kapak görseli LCP (ölçüm 2026-11-18, Lighthouse mobil, canlı):** İstanbul
   şehir sayfası 75 puan, LCP 6,2 sn (önce 72 / 7,2 sn); Beşiktaş ilçe 81, LCP 5,0 sn.
   LCP dökümü: TTFB 0,7 sn, yükleme gecikmesi 1,8 sn, indirme 3,2 sn. Mobil (DPR 1,75)
   srcset'ten 960px'i seçiyor (166 KB). Yapılacak: (a) layout'a
   `<link rel="preconnect" href="https://upload.wikimedia.org">`, (b) CityHero `sizes`
   değerini mobilde 500px seçilecek şekilde ayarla (görsel zaten %65 karartılmış).
   Sonra aynı iki sayfayı yeniden ölç.
3. [x] **(9dff171, IntersectionObserver ile zaten yapılmış)** Harita tembel yükleme (hız).** Şehir sayfasındaki OpenStreetMap haritası
   açılışta ~15 kutucuk indiriyor; harita görünür alana gelince ya da tıklanınca yüklensin.
4. [x] **(8610948 ile yapılmış)** Günübirlik sayfalarına ItemList yapılandırılmış verisi.** Durak listesi
   (ad, sayfa URL'si) `ItemList` JSON-LD olarak; içerik zaten sayfada görünür.
5. [x] **(mesafe/[pair] sayfasında zaten var: 'X'ten N şehre mesafe tablosu →')** Rota sayfasından şehir mesafe tablosuna bağlantı.** Şehir tabloları
   (/tr/mesafe/sehir/X) TO %0,86 ile rota sayfalarının ~10 katı; her rota
   sayfasından iki şehrin tablosuna görünür bağlantı (yoksa ekle).
6. [x] **(2026-11-20: incelendi, değişiklik yok; GSC 28 gün 8,92 B gösterim, 16 tık, konum 9,1; sorgular 'X havalimanı Y kaç km' ve başlık zaten 'Kaç Km, Kaç Dk?' içeriyor; 2 hafta sonra yeniden bak)** Havalimanı sayfaları içerik kontrolü.** 48 sayfa, 6.665 gösterim, TO %0,18.
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
- 2026-11-18: **2. parti taslağı hazır, yayında DEĞİL** — git dalı `ilce-parti-2`
  (Beyoğlu, Üsküdar, Sarıyer, Adalar; 26 yeni yer, build temiz). 2026-12-02 ölçümü
  iyiyse: `git merge ilce-parti-2` → build → push. Kötüyse önce şablonu düzelt.
- 2026-11-19: Sağlık temiz (tüm URL 200, www 301, API 200, GA4 kimliği pakette; çerez onayına bağlı olduğundan HTML'de yok). Cloudflare son derlemeler başarılı. GSC son 7 gün (11-17'ye kadar): 592 tık, 467 B gösterim, TO %0,13, trend yukarı (günlük tık 58→85-100). Yapılan: sitemap lastmod düzeltmesi (baae5c2), canlıda 1.898 URL gerçek tarihlerle (Ağu–Kas). Sıradaki: madde 2b (preconnect + CityHero sizes).

- 2026-11-20: Sağlık temiz (tüm URL 200, www 301, API 200; GA4 çerez onayına bağlı, HTML'de yok). Cloudflare derlemeleri başarılı (biri sürüyordu, başka oturum push etmiş). GSC son 7 gün (11-12→11-18): 627 tık, ~494 B gösterim, TO %0,13, günlük tık 71→93, trend yukarı. Yapılan: dal origin/main'e fast-forward (9 commit). Plan eskimişti: madde 2-5 başka oturumlarda yapılmış, işaretlendi. Madde 6 analiz edildi, site değişikliği yok. Sıradaki: 7 (GetYourGuide/Trip.com kimliği bekleniyor), 8-9 tarih 2026-12-08.

- 2026-11-21: Sağlık temiz (tüm URL 200, www 301, API 200; GA4 kimliği JS paketinde). Cloudflare Pages son derleme başarılı (GitHub kontrolü, ed351e9 öncesi; Chrome'daki Cloudflare oturumu başka hesapta, panelden bakılamadı). GSC son 7 gün (11-13→11-19): 661 tık, ~523 B gösterim, TO %0,13, konum ~7,2; günlük tık 88→105, gösterim 71 B→83 B, trend yukarı. Yapılan: site değişikliği yok — açık maddeler ya kullanıcı girdisi bekliyor (7: GetYourGuide/Trip.com kimliği) ya da tarihli (8-9: 2026-12-08; 10: deneyler sonrası). Sıradaki: 2026-12-02 ilçe rehberi ölçümü, 2026-12-08 deney değerlendirmeleri.

- 2026-11-22: Sağlık temiz (tüm URL 200, www 301, API 200; GA4 kimliği JS paketinde). Cloudflare Pages son derleme başarılı (GitHub kontrolü, ea09c4a; Chrome'daki Cloudflare oturumu yine başka hesapta). GitHub'da eski Vercel kontrolü "Account is blocked" ile başarısız — site Cloudflare'de, canlıya etkisi yok. GSC son 7 gün (11-14→11-20): 659 tık, ~539 B gösterim, TO %0,12, konum 7,2; gösterim 72 B→88 B/gün, tık 85-105/gün, trend gösterimde yukarı, tıkta yatay. Yapılan: site değişikliği yok — açık maddeler kullanıcı girdisi (7) ya da tarih (8-10: 2026-12-08) bekliyor. Sıradaki: 2026-12-02 ilçe rehberi ölçümü (+ uygunsa `ilce-parti-2` birleştirme), 2026-12-08 deney değerlendirmeleri.

- 2026-11-23: Sağlık temiz (tüm URL 200, www 301, API 200; GA4 kimliği JS paketinde). Cloudflare Pages son derleme başarılı (GitHub kontrolü, 1096def; eski Vercel kontrolü yine başarısız, etkisiz). GSC son 7 gün (11-15→11-21): 655 tık, ~552 B gösterim, TO %0,12; 28 gün konum 7,4. Gösterim 73 B→86-88 B/gün yukarı, tık 85-105/gün yatay. Yapılan: site değişikliği yok — açık maddeler kullanıcı girdisi (7: GetYourGuide/Trip.com kimliği) ya da tarih (8-10: 2026-12-08) bekliyor. Sıradaki: 2026-12-02 ilçe rehberi ölçümü (+ uygunsa `ilce-parti-2`), 2026-12-08 deney değerlendirmeleri.

- 2026-11-24: Sağlık temiz (tüm URL 200, www 301, API 200; GA4 kimliği JS paketinde). Cloudflare Pages son derleme başarılı (GitHub kontrolü, 7f428d4; eski Vercel kontrolü yine başarısız, etkisiz). GSC henüz yenilenmedi, son gün yine 11-21: son 7 gün (11-15→11-21) 655 tık, ~552 B gösterim, TO %0,12; 28 gün 1,68 B tık, 1,45 Mn gösterim, konum 7,4. Gösterim 73 B→86-88 B/gün yukarı, tık 85-105/gün yatay. Yapılan: site değişikliği yok, açık maddeler kullanıcı girdisi (7) ya da tarih (8-10: 2026-12-08) bekliyor. Sıradaki: 2026-12-02 ilçe rehberi ölçümü (+ uygunsa `ilce-parti-2`), 2026-12-08 deney değerlendirmeleri.
