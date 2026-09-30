import districtDistancesRaw from "./districtDistances.json";
import { RegionSlug } from "@/lib/types";

export interface District {
  slug: string;
  citySlug: string;
  regionSlug: RegionSlug;
  name: string;
  title: string;
  summary: string;
  longDescription: string;
  heroTagline: string;
  location: { lat: number; lng: number };
}

export const popularDistricts: District[] = [
  // Ege
  {
    slug: "cesme",
    citySlug: "izmir",
    regionSlug: "ege",
    name: "Çeşme",
    title: "İzmir Çeşme Gezi Rehberi",
    summary: "Ege'nin masmavi denizi, altın sarısı kumsalları ve dünyaca ünlü sörf okullarıyla meşhur tatil cenneti.",
    longDescription: "Çeşme, tarihi kalesi, şifalı termal suları, bembeyaz plajları ve Ilıca ile Alaçatı gibi ikonik noktalarıyla Türkiye'nin en seçkin turizm ilçelerinden biridir.",
    heroTagline: "Rüzgarın, Tarihin ve Turkuaz Plajların Buluşma Noktası",
    location: { lat: 38.3246, lng: 26.3040 }
  },
  {
    slug: "alacati",
    citySlug: "izmir",
    regionSlug: "ege",
    name: "Alaçatı",
    title: "İzmir Alaçatı Gezi Rehberi",
    summary: "Taş evleri, begonvillerle süslü dar sokakları, yel değirmenleri ve rüzgar sörfüne elverişli koylarıyla ünlü otantik Ege beldesi.",
    longDescription: "Arnavut kaldırımlı sokakları, şık butik otelleri ve dünya standartlarındaki sörf imkanlarıyla Alaçatı, her yıl binlerce yerli ve yabancı turisti ağırlayan koruma altındaki bir kentsel sit alanıdır.",
    heroTagline: "Tarihi Taş Evler ve Eşsiz Sörf Rüzgarları",
    location: { lat: 38.2818, lng: 26.3742 }
  },
  {
    slug: "ayvalik",
    citySlug: "balikesir",
    regionSlug: "marmara", // Bulgu (hreflang denetimi, Parti 4): gerçek Balıkesir City kaydı
    // regionSlug "marmara" — burada "ege" olması getCity() eşleşmesini
    // engelleyip sayfayı 404'e düşürüyordu (17.08.2026 tarihli 6-ilçe
    // düzeltmesinde kaçırılmıştı, çünkü o taramada sadece citySlug'ın hiç
    // var olmayan bir City'e işaret ettiği durumlar yakalanmıştı).
    name: "Ayvalık",
    title: "Balıkesir Ayvalık Gezi Rehberi",
    summary: "Tarihi Rum evleri, Cunda Adası, Şeytan Sofrası ve zeytinyağı kültürünün merkezi olan şirin Ege ilçesi.",
    longDescription: "Ayvalık, adaları, zeytin bahçeleri, taş sokakları ve Türkiye'nin en geniş tabiat parklarından biri olan Ayvalık Adaları Tabiat Parkı ile doğa ve tarih severler için eşsiz bir destinasyondur.",
    heroTagline: "Zeytin Kokulu Sokaklar ve Cunda Rüzgarı",
    location: { lat: 39.3178, lng: 26.6978 }
  },
  // Denetim bulgusu (2026-09, madde 284): Pamukkale — UNESCO Dünya Mirası
  // (Hierapolis-Pamukkale, 1988), Türkiye'nin en çok aranan doğa
  // harikalarından biri — hiçbir zaman kendi bağımsız sayfası olmadı,
  // sadece Denizli City kaydının içinde bir attraction olarak geçiyordu.
  // "Pamukkale" arayan biri /bolgeler/ege/denizli'ye değil kendi sayfasına
  // düşmeliydi. Koordinatlar ve gerçekler Denizli'nin zaten var olan,
  // doğrulanmış attraction kaydından (denizli-pamukkale) birebir alındı —
  // uydurma yeni veri yok.
  {
    slug: "pamukkale",
    citySlug: "denizli",
    regionSlug: "ege",
    name: "Pamukkale",
    title: "Denizli Pamukkale Gezi Rehberi",
    summary: "Kalsiyum karbonatlı sıcak su kaynaklarının binlerce yılda oluşturduğu bembeyaz travertenler ve üzerindeki Hierapolis antik kentiyle UNESCO Dünya Mirası listesindeki doğa ve tarih harikası.",
    longDescription: "Pamukkale, adını (\"pamuk kale\") aldığı pamuk beyazı kalsiyum teraslarıyla dünyanın en ikonik doğa oluşumlarından biri. Travertenlerin üzerinde kurulu Hierapolis antik kenti, Roma döneminden kalma iyi korunmuş tiyatrosu ve dünyanın en büyük antik nekropollerinden biriyle dikkat çekiyor. 1988'den beri Hierapolis-Pamukkale adıyla UNESCO Dünya Mirası listesinde yer alıyor.",
    heroTagline: "Pamuktan Beyaz Teraslar, Antik Bir Şehrin Kalıntıları",
    location: { lat: 37.9142, lng: 29.1189 }
  },
  // Denetim bulgusu (2026-09, madde 285): Selçuk/Efes — Türkiye'nin en çok
  // ziyaret edilen antik kenti, ne kendi sayfası ne İzmir'in curated
  // listesinde hiç yoktu (bkz. ege-extra.ts'e eklenen izmir-efes/
  // izmir-meryem-ana-evi attraction kayıtları). Koordinatlar ve tarihi
  // gerçekler (UNESCO 2015) doğrulanabilir/kalıcı bilgiler.
  {
    slug: "selcuk",
    citySlug: "izmir",
    regionSlug: "ege",
    name: "Selçuk",
    title: "İzmir Selçuk (Efes) Gezi Rehberi",
    summary: "Celsus Kütüphanesi ve dev antik tiyatrosuyla dünyaca ünlü Efes Antik Kenti'nin ve Meryem Ana Evi'nin bulunduğu, 2015'ten beri UNESCO Dünya Mirası listesindeki ilçe.",
    longDescription: "Selçuk, Roma döneminin en önemli liman kentlerinden Efes'in ve Hristiyanlık ile İslam'da kutsal kabul edilen Meryem Ana Evi'nin bulunduğu ilçe. Efes'in Celsus Kütüphanesi cephesi ve 24.000 kişilik tiyatrosu, Akdeniz'in en iyi korunmuş Roma kalıntıları arasında sayılıyor.",
    heroTagline: "Roma'nın İzinde, Antik Bir Liman Kentinin Kalıntıları",
    location: { lat: 37.9500, lng: 27.3667 }
  },
  {
    slug: "kusadasi",
    citySlug: "aydin",
    regionSlug: "ege",
    name: "Kuşadası",
    title: "Aydın Kuşadası Gezi Rehberi",
    summary: "Güvercinada Kalesi, Dilek Yarımadası Milli Parkı ve dev kurvaziyer limanıyla Ege'nin en eski turizm merkezlerinden biri.",
    longDescription: "Kuşadası, antik liman kentlerine olan yakınlığı, hareketli çarşısı, plajları ve koruma altındaki doğal tabiat alanıyla Ege seyahatinizin vazgeçilmez bir durağıdır.",
    heroTagline: "Ege'nin Liman Şehri ve Güvercinada Efsanesi",
    location: { lat: 37.8579, lng: 27.2610 }
  },
  
  // Akdeniz
  // Bulgu: bodrum/fethiye/marmaris citySlug'ı "mugla" idi ama "mugla" hiçbir
  // zaman kendi başına curated bir City girdisi olarak eklenmedi (bkz.
  // src/lib/data/cities/*.ts) — getCity() bu yüzden hep undefined dönüyor,
  // notFound() tetikleniyor ve bu 3 sayfa production'da 404 veriyordu.
  // Bodrum ve Fethiye'nin zaten kendi tam City sayfaları var (ege.ts,
  // akdeniz.ts) — citySlug o gerçek girdiye işaret edecek şekilde
  // düzeltildi (kendi kendine referans, çünkü aradaki gerçek bir "Muğla"
  // hub şehri hiç curate edilmedi). Marmaris için curate edilmiş hiçbir
  // City girdisi yok (kendi başına da, komşu bir şehir altında da) — uydurma
  // bir eşleşme yapmak yerine bu girdi tamamen kaldırıldı.
  {
    slug: "bodrum",
    citySlug: "bodrum",
    regionSlug: "ege",
    name: "Bodrum",
    title: "Muğla Bodrum Gezi Rehberi",
    summary: "Tarihi kalesi, beyaz badanalı evleri, Halikarnas Balıkçısı ve hareketli gece hayatıyla Türkiye'nin en popüler tatil yarımadası.",
    longDescription: "Antik dünyanın yedi harikasından biri olan Halikarnas Mozolesi'ne ev sahipliği yapmış olan Bodrum, günümüzde lüks marinaları, eşsiz koyları ve kültürel festivalleriyle küresel bir turizm markasıdır.",
    heroTagline: "Beyaz Evler, Mavi Sular ve Bitmeyen Bodrum Geceleri",
    location: { lat: 37.0344, lng: 27.4305 }
  },
  {
    slug: "fethiye",
    citySlug: "fethiye",
    regionSlug: "akdeniz",
    name: "Fethiye",
    title: "Muğla Fethiye Gezi Rehberi",
    summary: "Ölüdeniz'in sakin suları, Babadağ'dan yamaç paraşütü, Kelebekler Vadisi ve Likya Yolu'nun başlangıç noktası.",
    longDescription: "Fethiye, antik kaya mezarları, doğa harikası kanyonları, dünya çapında ödüllü plajları ve Likya uygarlığının izlerini taşıyan tarihi kalıntılarıyla benzersiz bir tatil ve doğa sporu merkezidir.",
    heroTagline: "Ölüdeniz'in Durgunluğu ve Babadağ'ın Özgürlüğü",
    location: { lat: 36.6219, lng: 29.1164 }
  },
  // Denetim bulgusu (2026-09, madde 285): Ölüdeniz — Türkiye'nin en tanınmış
  // lagünlerinden biri, sadece üstteki Fethiye City kaydının içinde bir
  // attraction/restoran/otel grubu olarak geçiyordu, kendi sayfası yoktu.
  // Koordinatlar ve gerçekler Fethiye'nin zaten var olan, doğrulanmış
  // "fethiye-oludeniz" attraction kaydından birebir alındı — uydurma yeni
  // veri yok.
  {
    slug: "oludeniz",
    citySlug: "fethiye",
    regionSlug: "akdeniz",
    name: "Ölüdeniz",
    title: "Fethiye Ölüdeniz Gezi Rehberi",
    summary: "Kum seti ile denizden ayrılmış sakin turkuaz lagünü ve Babadağ'ın 1969 metre yüksekliğinden yapılan yamaç paraşütü uçuşlarıyla dünyaca tanınan Akdeniz kıyısı.",
    longDescription: "Ölüdeniz, adını dalgasız, durgun sularından alan doğal bir lagün. Kelebekler Vadisi'ne tekneyle bu koydan ulaşılır, Babadağ'ın zirvesinden teleferikle çıkılıp tandem yamaç paraşütüyle lagünün üzerine inilir. Milli park sınırları içinde koruma altındadır.",
    heroTagline: "Turkuaz Bir Lagün, Gökyüzünden Bakan Bir Manzara",
    location: { lat: 36.5486, lng: 29.1164 }
  },
  {
    slug: "kas",
    citySlug: "antalya",
    regionSlug: "akdeniz",
    name: "Kaş",
    title: "Antalya Kaş Gezi Rehberi",
    summary: "Kaputaş Plajı, antik tiyatrosu, dalış noktaları ve Meis Adası'na bakan dar sokaklarıyla bohem Akdeniz kasabası.",
    longDescription: "Kaş, Türkiye'nin en iyi dalış noktalarından biridir. Likya lahitleriyle dolu sokakları, taş evleri, salaş balık lokantaları ve meşhur plajlarıyla dingin bir tatil arayanların favorisidir.",
    heroTagline: "Akdeniz'in Bohem ve Dalış Cenneti Köşesi",
    location: { lat: 36.2018, lng: 29.6377 }
  },
  {
    slug: "alanya",
    citySlug: "antalya",
    regionSlug: "akdeniz",
    name: "Alanya",
    title: "Antalya Alanya Gezi Rehberi",
    summary: "Tarihi kalesi, Kleopatra Plajı, Damlataş Mağarası ve devasa resort otelleriyle ünlü Akdeniz turizm merkezi.",
    longDescription: "Tarih boyunca Selçuklu İmparatorluğu'na kışlık başkentlik yapmış olan Alanya, surları, Tersanesi, geniş kum plajları ve eğlenceli turizm aktiviteleriyle öne çıkmaktadır.",
    heroTagline: "Tarihi Selçuklu Kalesi ve Altın Kum Kleopatra Plajı",
    location: { lat: 36.5438, lng: 31.9998 }
  },
  
  // İç Anadolu & Karabük & Trabzon
  // Bulgu: safranbolu'nun citySlug'ı "karabuk" idi ama "karabuk" curated bir
  // City girdisi olarak hiç eklenmedi — Safranbolu'nun kendi tam City sayfası
  // (karadeniz.ts) var, citySlug o girdiye işaret edecek şekilde düzeltildi.
  // urgup/goreme'nin citySlug'ı "nevsehir" idi, o da curate edilmedi —
  // Kapadokya bölgesi tek bir City girdisi olarak "kapadokya" slug'ıyla
  // curate edilmiş (ic-anadolu.ts), ikisi de ona işaret edecek şekilde
  // düzeltildi.
  {
    slug: "safranbolu",
    citySlug: "safranbolu",
    regionSlug: "karadeniz",
    name: "Safranbolu",
    title: "Karabük Safranbolu Gezi Rehberi",
    summary: "UNESCO Dünya Mirası Listesi'nde yer alan tarihi Osmanlı konakları, lokumu ve arasta çarşısıyla ünlü kültür kenti.",
    longDescription: "Geleneksel Türk toplum yaşantısını günümüze taşıyan Safranbolu, 18. ve 19. yüzyıl Osmanlı sivil mimarisini yansıtan ahşap konakları ve kanyonlarıyla açık hava müzesi niteliğindedir.",
    heroTagline: "Zamanın Durduğu Tarihi Osmanlı Konakları",
    location: { lat: 41.2508, lng: 32.6939 }
  },
  {
    slug: "urgup",
    citySlug: "kapadokya",
    regionSlug: "ic-anadolu",
    name: "Ürgüp",
    title: "Nevşehir Ürgüp Gezi Rehberi",
    summary: "Üç Güzeller peri bacaları, asmalı konakları ve şarap bağlarıyla Kapadokya'nın kalbindeki tarihi ilçe.",
    longDescription: "Ürgüp, peri bacalarının en yoğun göründüğü alanlardan biridir. Kaya oyma otelleri, butik şaraphaneleri ve tarihi yerleşimleriyle Kapadokya kültürünün simgelerindendir.",
    heroTagline: "Peri Bacalarının ve Eşsiz Kaya Konakların Vadisi",
    location: { lat: 38.6310, lng: 34.9120 }
  },
  {
    slug: "goreme",
    citySlug: "kapadokya",
    regionSlug: "ic-anadolu",
    name: "Göreme",
    title: "Nevşehir Göreme Gezi Rehberi",
    summary: "Açık Hava Müzesi, balon kalkış alanları ve peri bacalarının içinde oyulmuş antik kiliseleriyle Kapadokya'nın göz bebeği.",
    longDescription: "UNESCO Dünya Mirası alanı olan Göreme Açık Hava Müzesi'ne ev sahipliği yapan belde, her sabah gökyüzünü süsleyen yüzlerce rengarenk sıcak hava balonuyla büyüleyici bir manzara sunar.",
    heroTagline: "Sıcak Hava Balonları ve Antik Kaya Kiliseleri",
    location: { lat: 38.6431, lng: 34.8289 }
  },
  {
    slug: "bozcaada",
    citySlug: "canakkale",
    regionSlug: "marmara",
    name: "Bozcaada",
    title: "Çanakkale Bozcaada Gezi Rehberi",
    summary: "Ege Denizi'nin kuzeyinde yer alan tarihi kalesi, rüzgar gülleri, üzüm bağları ve Rum sokaklarıyla ünlü ada.",
    longDescription: "Bozcaada, berrak Ayazma plajı, tarihi taş Rum evleri, lezzetli bağ bozumu festivalleri ve eşsiz gün batımı manzaralarıyla sakin ve huzurlu bir Ege adası kaçamağıdır.",
    heroTagline: "Kuzey Ege'nin Sakin Ada Yaşamı ve Bağ Bozumları",
    location: { lat: 39.8347, lng: 26.0692 }
  },
  {
    slug: "gokceada",
    citySlug: "canakkale",
    regionSlug: "marmara",
    name: "Gökçeada",
    title: "Çanakkale Gökçeada Gezi Rehberi",
    summary: "Türkiye'nin en büyük adası, sörf merkezleri, taş Rum köyleri ve Cittaslow (Sakin Şehir) unvanına sahip tatil noktası.",
    longDescription: "Gökçeada, zengin su kaynakları, Rum köyleri, organik tarımı ve rüzgar sörfüne elverişli Aydıncık Plajı ile doğallığını korumuş eşsiz bir Ege adasıdır.",
    heroTagline: "Cittaslow Sakin Ada Yaşamı ve Taş Rum Köyleri",
    location: { lat: 40.1702, lng: 25.9080 }
  },
  {
    slug: "uzungol",
    citySlug: "trabzon",
    regionSlug: "karadeniz",
    name: "Uzungöl",
    title: "Trabzon Uzungöl Gezi Rehberi",
    summary: "Sarp dağların arasında göl manzarası, ahşap Karadeniz evleri ve sisli ormanlarıyla meşhur yayla beldesi.",
    longDescription: "Trabzon'un Çaykara ilçesinde yer alan Uzungöl, dik yamaçları, zengin bitki örtüsü ve dağların arasına sıkışmış göl manzarasıyla Doğu Karadeniz'in en popüler doğa turizmi destinasyonlarındandır.",
    heroTagline: "Karadeniz Dağları Arasında Sisli ve Eşsiz Göl Manzarası",
    location: { lat: 40.6190, lng: 40.2917 }
  }
];

export function getDistrict(citySlug: string, districtSlug: string): District | undefined {
  return popularDistricts.find((d) => d.citySlug === citySlug && d.slug === districtSlug);
}

export function getDistrictsByCity(citySlug: string): District[] {
  return popularDistricts.filter((d) => d.citySlug === citySlug);
}

export function getAllDistrictSlugs(): { region: string; city: string; district: string }[] {
  return popularDistricts.map((d) => ({
    region: d.regionSlug,
    city: d.citySlug,
    district: d.slug
  }));
}

// İlçenin bağlı olduğu şehir merkezine gerçek karayolu mesafesi/süresi
// (scripts/generate-district-distances.ts çıktısı). Kayıt yoksa (ilçe ile
// şehir aynı yer ya da rota alınamadı) undefined döner — sayfa o durumda
// kutuyu hiç göstermez.
const districtDistances = districtDistancesRaw as Record<string, { distanceKm: number; durationMin: number }>;

export function getDistrictDistance(
  citySlug: string,
  districtSlug: string
): { distanceKm: number; durationMin: number } | undefined {
  return districtDistances[`${citySlug}/${districtSlug}`];
}
