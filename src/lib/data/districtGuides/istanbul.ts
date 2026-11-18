import type { District } from "../districts";

// İstanbul ilçe rehberleri (2026-11-18). İlk parti: turistik yoğunluğu en
// yüksek üç ilçe. Kurallar:
//   - Koordinatlar OpenStreetMap (Nominatim) kayıtlarından alındı.
//   - İşletme adı yok (kapanır, el değiştirir); yemek önerileri semt/sokak
//     ve yemek türü düzeyinde.
//   - Fiyat ve açılış saati yazılmıyor; ulaşım bilgisi kalıcı hatlar
//     (T1, M2, M4, Marmaray, vapur iskeleleri) üzerinden.
// Gezilecek yerler İstanbul şehir verisinde (marmara.ts) adresindeki ilçe
// adıyla eşleşerek bu sayfalara düşer (bkz. lib/places.ts).
export const istanbulDistricts: District[] = [
  {
    slug: "fatih",
    citySlug: "istanbul",
    regionSlug: "marmara",
    urban: true,
    name: "Fatih",
    title: "İstanbul Fatih (Tarihi Yarımada) Gezi Rehberi",
    summary:
      "Ayasofya, Topkapı Sarayı, Sultanahmet Camii ve Kapalıçarşı'nın bulunduğu, surlarla çevrili tarihi yarımadayı kapsayan ve 1985'ten beri UNESCO Dünya Mirası listesindeki ilçe.",
    longDescription:
      "Fatih, İstanbul'un surlarla çevrili tarihi yarımadasının tamamını kapsar. Bizans'ın başkenti Konstantinopolis'in ve ardından Osmanlı İstanbul'unun kalbi burasıydı; şehrin en çok ziyaret edilen anıtlarının neredeyse hepsi birbirine yürüme mesafesindedir.",
    heroTagline: "İki İmparatorluğun Başkenti, Tek Bir Yarımada",
    location: { lat: 41.0064, lng: 28.9759 },
    guide: {
      intro: [
        "Fatih'i gezmenin en kolay yolu yarımadayı üç parçaya bölmektir: Sultanahmet'teki anıtlar, Eminönü-Süleymaniye-Beyazıt çarşı hattı ve Haliç kıyısındaki Fener-Balat. Sultanahmet Meydanı (antik Hipodrom) çevresindeki Ayasofya, Sultanahmet Camii, Yerebatan Sarnıcı ve Topkapı Sarayı tek bir günü rahatça doldurur.",
        "İkinci gün Mısır Çarşısı'ndan başlayıp Süleymaniye Camii'ne çıkmak, oradan Kapalıçarşı'ya inmek klasik bir yürüyüş rotasıdır. Haliç kıyısındaki Fener ve Balat ise renkli ahşap evleri, yokuşlu sokakları ve tarihi kiliseleriyle kalabalıktan uzak, fotoğraf için en sevilen semtlerdir.",
      ],
      neighbourhoods: [
        { name: "Sultanahmet", description: "Ayasofya, Sultanahmet Camii, Topkapı Sarayı, Yerebatan Sarnıcı ve Arkeoloji Müzeleri; hepsi birkaç yüz metre içinde." },
        { name: "Eminönü", description: "Mısır Çarşısı, Yeni Cami, Galata Köprüsü ve Boğaz vapurlarının kalktığı iskeleler." },
        { name: "Süleymaniye ve Beyazıt", description: "Mimar Sinan'ın Süleymaniye Camii, İstanbul Üniversitesi ve dünyanın en eski kapalı çarşılarından Kapalıçarşı." },
        { name: "Fener ve Balat", description: "Haliç kıyısında renkli ahşap evler, yokuşlu sokaklar, Fener Rum Patrikhanesi ve tarihi kiliseler." },
        { name: "Kariye ve Fatih Camii çevresi", description: "Bizans mozaikleriyle ünlü Kariye Camii ve şehrin ilk büyük Osmanlı külliyesi Fatih Camii." },
      ],
      food: [
        { name: "Sultanahmet köftesi", description: "Semte adını veren ızgara köfte; yanında piyaz ile Sultanahmet ve Divanyolu çevresinde servis edilir." },
        { name: "Süleymaniye'de kuru fasulye", description: "Süleymaniye Camii'nin yanındaki sokakta sıralanan kuru fasulye-pilav lokantaları, yarımadanın en bilinen öğle yemeği durağıdır." },
        { name: "Eminönü'nde balık ekmek", description: "Galata Köprüsü'nün Eminönü ayağında, kıyıdaki teknelerde ve büfelerde ızgara balık ekmek." },
        { name: "Mısır Çarşısı'nda lokum ve baharat", description: "Lokum, baharat, kuru meyve ve kahve için yüzyıllardır alışveriş yapılan çarşı; çevresindeki sokaklar da aynı ürünlerle dolu." },
        { name: "Vefa bozası", description: "Kış aylarında Vefa semtinde, üzerine leblebi serpilerek içilen geleneksel boza." },
      ],
      gettingThere: [
        "T1 Kabataş–Bağcılar tramvayı yarımadanın içinden geçer; Eminönü, Sirkeci, Gülhane, Sultanahmet ve Beyazıt-Kapalıçarşı durakları anıtların hemen yanındadır.",
        "Marmaray ile Sirkeci ve Yenikapı istasyonlarına, M2 metrosuyla Vezneciler ve Haliç istasyonlarına inilir.",
        "Anadolu yakasından Kadıköy ve Üsküdar vapurları Eminönü iskelesine yanaşır.",
        "Fener ve Balat'a Haliç vapur hattı ya da Eminönü–Eyüp yönündeki sahil otobüsleriyle gidilir.",
      ],
      transitSummary: "T1 tramvayı (Sultanahmet, Eminönü), Marmaray (Sirkeci), M2 metro (Vezneciler) ve Eminönü vapur iskelesiyle ulaşılır; anıtlar arası yürünür.",
      idealDuration: "2 gün: bir gün Sultanahmet anıtları, bir gün Eminönü-Süleymaniye-Kapalıçarşı ve Fener-Balat",
      tips: [
        "Ayasofya, Sultanahmet Camii ve Süleymaniye Camii ibadete açık camilerdir; namaz vakitlerinde ziyaret kısıtlanır, omuz ve dizleri örten kıyafet gerekir.",
        "Topkapı Sarayı ve Yerebatan Sarnıcı'nda sıra sabah erken saatlerde en kısadır.",
        "Sultanahmet'ten Kapalıçarşı'ya Divanyolu boyunca yürümek, tramvay beklemekten çoğu zaman daha hızlıdır.",
      ],
    },
  },
  {
    slug: "besiktas",
    citySlug: "istanbul",
    regionSlug: "marmara",
    urban: true,
    name: "Beşiktaş",
    title: "İstanbul Beşiktaş Gezi Rehberi",
    summary:
      "Dolmabahçe Sarayı, Ortaköy Camii, Bebek ve Arnavutköy sahilleriyle Boğaz'ın Avrupa yakasındaki en canlı ilçe; Çarşı'daki kahvaltıcıları ve Ortaköy kumpiriyle bilinir.",
    longDescription:
      "Beşiktaş, Dolmabahçe'den Bebek'e kadar Boğaz kıyısı boyunca uzanır. Osmanlı'nın son döneminde saraylar Topkapı'dan buraya taşındı; Dolmabahçe, Yıldız ve Çırağan bu dönemin eseridir. Bugün iskele çevresindeki Çarşı'sı, öğrenci kafeleri, sahil yürüyüş yolları ve yalılarıyla şehrin en hareketli semtlerinden biridir.",
    heroTagline: "Saraylar, Yalılar ve Boğaz Kıyısında Bir Sabah Kahvaltısı",
    location: { lat: 41.0428, lng: 29.0075 },
    guide: {
      intro: [
        "Beşiktaş gezisine Dolmabahçe Sarayı'ndan başlayıp sahil boyunca kuzeye ilerlemek en keyifli rotadır: Beşiktaş iskelesi ve Deniz Müzesi, ardından Ortaköy Meydanı ve Boğaz Köprüsü'nün hemen altındaki Ortaköy Camii. Yürüyüşe devam edenler Arnavutköy'ün ahşap yalılarından Bebek koyuna ulaşır.",
        "Sahilden içeri doğru Yıldız Parkı ve Ihlamur Kasrı, kalabalıktan uzak yeşil alanlar sunar. Hafta sonu sabahları Çarşı'daki kahvaltıcılar dolup taşar; akşamları ise Ortaköy ve Bebek sahili Boğaz manzarası için en çok tercih edilen noktalardır.",
      ],
      neighbourhoods: [
        { name: "Çarşı ve iskele", description: "Vapur iskelesi, Deniz Müzesi, balık pazarı ve kahvaltıcılarla dolu dar sokaklar; ilçenin kalbi." },
        { name: "Ortaköy", description: "Boğaz Köprüsü'nün dibindeki Ortaköy Camii, meydanı, kumpir tezgâhları ve hafta sonu el sanatları tezgâhları." },
        { name: "Arnavutköy", description: "Boğaz'a dizilmiş ahşap yalılar ve kıyıdaki balık lokantalarıyla sakin bir sahil semti." },
        { name: "Bebek", description: "Koyu, sahil parkı ve yürüyüş yoluyla Boğaz'ın en sevilen kıyılarından." },
        { name: "Yıldız ve Ihlamur", description: "Yıldız Parkı'nın korulukları ve 19. yüzyıldan kalma Ihlamur Kasrı." },
      ],
      food: [
        { name: "Çarşı'da serpme kahvaltı", description: "Beşiktaş Çarşı'daki kahvaltıcılar sokağı, hafta sonu serpme kahvaltının İstanbul'daki en bilinen adresidir; erken gitmek sıra beklememek için önemlidir." },
        { name: "Ortaköy kumpiri", description: "Ortaköy Meydanı'ndaki tezgâhlarda istediğin malzemeyle doldurulan fırın patates; yanında waffle tezgâhları da vardır." },
        { name: "Balık pazarı ve balık", description: "Çarşı'daki balık pazarı ve çevresindeki küçük lokantalarda mevsim balığı; Arnavutköy kıyısında da balık lokantaları sıralanır." },
        { name: "Boğaz kıyısında çay", description: "Bebek ve Ortaköy sahilinde, Boğaz'a karşı simit-çay molası semtin en klasik keyfidir." },
      ],
      gettingThere: [
        "Beşiktaş iskelesine Kadıköy ve Üsküdar'dan vapurla gelinir; Anadolu yakasından en hızlı yoldur.",
        "T1 tramvayının son durağı Kabataş, Dolmabahçe Sarayı'na birkaç dakikalık yürüme mesafesindedir; Taksim'den Kabataş'a F1 füniküler iner.",
        "M2 metrosunun Gayrettepe ve Levent istasyonları ilçenin iş merkezi tarafındadır.",
        "Ortaköy, Arnavutköy ve Bebek'e Beşiktaş'tan Sarıyer yönüne giden sahil otobüsleriyle ulaşılır.",
      ],
      transitSummary: "Beşiktaş vapur iskelesi (Kadıköy, Üsküdar), Kabataş'taki T1 tramvay ve F1 füniküler, M2 metro (Gayrettepe, Levent) ve Boğaz sahil otobüsleriyle ulaşılır.",
      idealDuration: "1 gün: sabah Dolmabahçe ve Çarşı, öğleden sonra Ortaköy'den Bebek'e sahil yürüyüşü",
      tips: [
        "Dolmabahçe Sarayı pazartesi günleri kapalıdır; saray içinde fotoğraf çekmek yasaktır.",
        "Hafta sonu Ortaköy ve Bebek sahilinde trafik çok yoğunlaşır; araç yerine vapur ve yürüyüş tercih edin.",
        "Ortaköy Camii'ni Boğaz Köprüsü'yle birlikte fotoğraflamak için en iyi saat gün batımıdır.",
      ],
    },
  },
  {
    slug: "kadikoy",
    citySlug: "istanbul",
    regionSlug: "marmara",
    urban: true,
    name: "Kadıköy",
    title: "İstanbul Kadıköy Gezi Rehberi",
    summary:
      "Moda sahili, tarihi Kadıköy Çarşısı, Bağdat Caddesi ve Süreyya Operası'yla Anadolu yakasının kültür ve yeme-içme merkezi; Avrupa yakasına vapurla yaklaşık 20 dakika.",
    longDescription:
      "Kadıköy, antik Kalkedon kentinin üzerinde kuruludur ve bugün Anadolu yakasının en canlı ilçesidir. Balıkçıları, şarküterileri ve meyhaneleriyle tarihi çarşısı, Moda'nın deniz kıyısı yürüyüşleri, Yeldeğirmeni'nin duvar resimleri ve kilometrelerce uzanan Bağdat Caddesi, ilçeyi gezmek kadar yaşamak için de cazip kılar.",
    heroTagline: "Çarşısı, Sahili ve Vapuruyla Anadolu Yakasının Kalbi",
    location: { lat: 40.9913, lng: 29.0246 },
    guide: {
      intro: [
        "Kadıköy'e en güzel varış vapurla olur: Eminönü, Karaköy ya da Beşiktaş'tan kalkan vapurlar iskeleye yanaşır ve çarşı hemen karşıdadır. Tarihi Kadıköy Çarşısı'nın balıkçı, turşucu ve şarküteri dükkânlarını dolaştıktan sonra Bahariye Caddesi üzerinden Süreyya Operası'na, oradan Moda'ya yürünür.",
        "Moda sahilinden Fenerbahçe'ye uzanan kıyı yolu, şehrin en uzun ve en keyifli deniz kenarı yürüyüşlerinden biridir. İskelenin kuzeyindeki Yeldeğirmeni sokak sanatıyla, hemen yanındaki Haydarpaşa Garı ise 1908'den kalma binasıyla görülmeye değer.",
      ],
      neighbourhoods: [
        { name: "Çarşı", description: "İskelenin karşısındaki tarihi çarşı; balıkçılar, turşucular, şarküteriler, kitapçılar ve meyhaneler." },
        { name: "Moda", description: "Deniz kenarı parkı, sahil yürüyüşü, dondurmacıları ve gün batımı manzarasıyla Kadıköy'ün en sevilen semti." },
        { name: "Yeldeğirmeni", description: "Duvar resimleri, küçük kafeleri ve eski apartmanlarıyla iskelenin hemen kuzeyindeki semt." },
        { name: "Bahariye ve Süreyya Operası", description: "Yayalaştırılmış Bahariye Caddesi ve 1927'de açılan Süreyya Operası." },
        { name: "Fenerbahçe ve Bağdat Caddesi", description: "Fenerbahçe Parkı'nın deniz feneri ve korusu, alışveriş ve kafeleriyle Bağdat Caddesi." },
      ],
      food: [
        { name: "Çarşı'da balık", description: "Kadıköy Çarşısı'nın balıkçılar bölümünde tezgâhlar ve hemen yanında taze balık pişiren küçük lokantalar." },
        { name: "Meze, turşu ve şarküteri", description: "Çarşı'daki turşucular, mezeciler ve şarküteriler; turşu suyu içmek Kadıköy klasiğidir." },
        { name: "Moda'da dondurma", description: "Moda'nın dondurmacıları, sahil yürüyüşü öncesi ya da sonrası semtin en bilinen durağıdır." },
        { name: "Yeldeğirmeni'nde kahve", description: "Küçük üçüncü dalga kahvecileri ve kafeleriyle Yeldeğirmeni, gündüz molası için idealdir." },
        { name: "Akşam meyhaneleri", description: "Çarşı'nın ara sokakları akşamları meyhaneleri ve canlı müzik mekânlarıyla dolar." },
      ],
      gettingThere: [
        "Kadıköy iskelesine Eminönü, Karaköy ve Beşiktaş'tan vapur kalkar; yolculuk yaklaşık 20 dakikadır.",
        "M4 Kadıköy–Sabiha Gökçen Havalimanı metro hattı Kadıköy'den başlar; havalimanından doğrudan gelinebilir.",
        "Marmaray'ın Söğütlüçeşme istasyonu ve metrobüsün Söğütlüçeşme son durağı ilçe merkezindedir.",
        "Kadıköy ile Moda arasında T3 nostaljik tramvay halka şeklinde çalışır.",
      ],
      transitSummary: "Vapur (Eminönü, Karaköy, Beşiktaş; yaklaşık 20 dakika), M4 metro (Sabiha Gökçen'den doğrudan), Marmaray ve metrobüs (Söğütlüçeşme) ile ulaşılır.",
      idealDuration: "1 gün: Çarşı ve Yeldeğirmeni, ardından Moda'dan Fenerbahçe'ye sahil yürüyüşü",
      tips: [
        "Avrupa yakasına dönüşte vapurun üst güvertesinden Tarihi Yarımada silüeti görünür; gün batımı saatleri en güzelidir.",
        "Çarşı'daki balıkçılar ve meyhaneler cuma ve cumartesi akşamları çok kalabalıktır.",
        "Sabiha Gökçen Havalimanı'na inenler için M4 metrosu, Kadıköy'e trafiğe takılmadan ulaşmanın en kolay yoludur.",
      ],
    },
  },
];
