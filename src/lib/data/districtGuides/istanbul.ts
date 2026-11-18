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
  // İkinci parti (taslak hazırlandı 2026-11-18; ilk partinin sonucu
  // 2026-12-02'de ölçüldükten sonra yayına alınacak).
  {
    slug: "beyoglu",
    citySlug: "istanbul",
    regionSlug: "marmara",
    urban: true,
    name: "Beyoğlu",
    title: "İstanbul Beyoğlu Gezi Rehberi",
    summary:
      "Galata Kulesi, İstiklal Caddesi, Taksim Meydanı ve Karaköy'le İstanbul'un sanat, eğlence ve gece hayatı merkezi; müzeleri, pasajları ve yokuşlu Cihangir sokaklarıyla.",
    longDescription:
      "Beyoğlu, Haliç'in kuzey kıyısında, eski adıyla Pera ve Galata semtlerini kapsar. 19. yüzyılda elçiliklerin, pasajların ve tiyatroların açıldığı bu bölge, bugün İstiklal Caddesi, Galata Kulesi, Karaköy'ün kafeleri ve Pera Müzesi ile İstanbul Modern gibi sanat kurumlarıyla şehrin kültür hayatının merkezidir.",
    heroTagline: "Pera'nın Pasajları, Galata'nın Yokuşları",
    location: { lat: 41.0284, lng: 28.9737 },
    guide: {
      intro: [
        "Beyoğlu'nu gezmenin klasik yolu Taksim Meydanı'ndan başlayıp İstiklal Caddesi boyunca Tünel'e yürümek, oradan Galip Dede Caddesi'nden Galata Kulesi'ne inmektir. Yol üzerindeki Çiçek Pasajı, Balık Pazarı ve Pera Müzesi kısa molalar için idealdir.",
        "Galata Kulesi'nden Kamondo Merdivenleri ile Karaköy'e inilir; kıyıdaki İstanbul Modern ve Karaköy'ün kafe sokakları günü tamamlar. Daha sakin bir öğleden sonra için Cihangir ve Çukurcuma'nın antikacılarla dolu yokuşları tercih edilir.",
      ],
      neighbourhoods: [
        { name: "Taksim ve İstiklal", description: "Cumhuriyet Anıtı'nın bulunduğu meydan ve Tünel'e uzanan, nostaljik tramvaylı yaya caddesi." },
        { name: "Galata", description: "Galata Kulesi, Galata Mevlevihanesi, Kamondo Merdivenleri ve tasarım dükkânlarıyla dolu yokuşlar." },
        { name: "Karaköy", description: "Kıyıdaki İstanbul Modern, vapur iskelesi, baklavacıları ve kafe sokaklarıyla eski liman semti." },
        { name: "Cihangir ve Çukurcuma", description: "Boğaz'a bakan sakin sokaklar, kafeler ve antikacılarla dolu Çukurcuma." },
        { name: "Asmalımescit ve Tünel", description: "Pera Müzesi, eski pasajlar ve akşamları dolan meyhane sokakları." },
      ],
      food: [
        { name: "Karaköy'de baklava ve börek", description: "Karaköy'ün köklü baklavacı ve börekçileri, Galata Köprüsü'ne yakın sokaklarda sıralanır." },
        { name: "Balık Pazarı ve Çiçek Pasajı", description: "Galatasaray'daki tarihi Balık Pazarı sokağında midye, kokoreç, meze ve balık; yanındaki Çiçek Pasajı'nda meyhane sofrası." },
        { name: "Asmalımescit meyhaneleri", description: "Tünel'e yakın dar sokaklarda akşamları dolan meze ve rakı sofraları." },
        { name: "Taksim'de ıslak hamburger", description: "Taksim Meydanı çevresindeki büfelerin gece geç saatlere kadar servis edilen meşhur ıslak hamburgeri." },
        { name: "Cihangir'de kahvaltı ve kahve", description: "Cihangir'in küçük kafeleri, sakin bir kahvaltı ya da kahve molası için semtin en sevilen durağıdır." },
      ],
      gettingThere: [
        "M2 metrosunun Taksim ve Şişhane istasyonları İstiklal Caddesi'nin iki ucundadır.",
        "Kabataş'tan F1 füniküler Taksim'e, Karaköy'den 1875'ten beri çalışan tarihi F2 Tünel füniküleri İstiklal'in Tünel ucuna çıkar.",
        "T1 tramvayının Karaköy ve Tophane durakları kıyı tarafındadır; Karaköy iskelesine Kadıköy vapurları yanaşır.",
        "İstiklal Caddesi boyunca Taksim ile Tünel arasında T2 nostaljik tramvay çalışır.",
      ],
      transitSummary: "M2 metro (Taksim, Şişhane), F1 ve F2 füniküler, T1 tramvay (Karaköy, Tophane), Karaköy vapur iskelesi ve İstiklal'deki nostaljik tramvayla ulaşılır.",
      idealDuration: "1 gün: Taksim'den Galata'ya İstiklal yürüyüşü, öğleden sonra Karaköy ve İstanbul Modern",
      tips: [
        "Galata Kulesi'nde sıra öğleden sonra ve gün batımında uzar; sabah erken gitmek en iyisidir.",
        "Galata ile Karaköy arasındaki yokuşlar diktir; inişi Kamondo Merdivenleri'nden yapın.",
        "İstiklal Caddesi hafta sonu akşamları çok kalabalıktır; yürüyüşü hafta içi sabahları yapmak daha rahattır.",
      ],
    },
  },
  {
    slug: "uskudar",
    citySlug: "istanbul",
    regionSlug: "marmara",
    urban: true,
    name: "Üsküdar",
    title: "İstanbul Üsküdar Gezi Rehberi",
    summary:
      "Kız Kulesi, Mimar Sinan'ın camileri, Beylerbeyi Sarayı, Kuzguncuk ve Çamlıca Tepesi ile Anadolu yakasının en köklü ilçesi; Salacak sahilinde gün batımıyla ünlü.",
    longDescription:
      "Üsküdar, Boğaz'ın Anadolu yakasında, antik Khrysopolis kentinin yerinde kurulmuştur. Osmanlı döneminde Anadolu'ya giden kervanların başlangıç noktasıydı; Mimar Sinan'ın Mihrimah Sultan ve Şemsi Paşa camileri, sahildeki Kız Kulesi manzarası ve Kuzguncuk'un ahşap evleri bu köklü geçmişin izlerini taşır.",
    heroTagline: "Kız Kulesi'ne Karşı Gün Batımı, Sinan'ın Camileri",
    location: { lat: 41.0265, lng: 29.0151 },
    guide: {
      intro: [
        "Üsküdar'a vapurla gelindiğinde iskelenin hemen karşısında Mihrimah Sultan Camii, birkaç dakika güneyde ise denize sıfır Şemsi Paşa Camii karşılar. Sahil boyunca Salacak'a yürüyüp Kız Kulesi'ne karşı çay içmek ilçenin en klasik keyfidir.",
        "Kuzeye doğru Kuzguncuk'un renkli ahşap evleri ve Beylerbeyi Sarayı, Boğaz kıyısında yarım günlük keyifli bir rota oluşturur. Şehrin tamamını yukarıdan görmek isteyenler için Büyük Çamlıca Tepesi en iyi seyir noktasıdır.",
      ],
      neighbourhoods: [
        { name: "İskele ve Meydan", description: "Mihrimah Sultan Camii, Şemsi Paşa Camii, vapur ve Marmaray bağlantılarıyla ilçenin merkezi." },
        { name: "Salacak", description: "Kız Kulesi'nin tam karşısındaki sahil; çay bahçeleri ve Tarihi Yarımada manzarasıyla gün batımı noktası." },
        { name: "Kuzguncuk", description: "Renkli ahşap evleri, bostanı ve cami, kilise ile sinagogun yan yana durduğu sokaklarıyla dizi ve film setlerinin vazgeçilmezi." },
        { name: "Beylerbeyi ve Çengelköy", description: "Beylerbeyi Sarayı, Boğaz kıyısındaki çınaraltı çay bahçeleri ve sahil yolu." },
        { name: "Çamlıca", description: "İstanbul'u iki yakasıyla birlikte gören tepe, korusu ve seyir terasları." },
      ],
      food: [
        { name: "Salacak'ta çay ve simit", description: "Kız Kulesi'ne karşı sahil çay bahçelerinde, özellikle gün batımında." },
        { name: "Çengelköy'de çınaraltı kahvaltısı", description: "Boğaz kıyısındaki asırlık çınarın altında kahvaltı ve çay; Çengelköy, adını taşıyan hıyarıyla da bilinir." },
        { name: "Kuzguncuk'ta kahvaltı", description: "Ahşap evlerin arasındaki küçük kahvaltıcı ve kafeler, hafta sonu sabahları dolar." },
        { name: "Çarşı'da esnaf lokantaları", description: "Üsküdar çarşısındaki köklü esnaf lokantaları ve tatlıcılar, vapur öncesi hızlı ve doyurucu bir öğle yemeği sunar." },
      ],
      gettingThere: [
        "Üsküdar iskelesine Eminönü, Karaköy ve Beşiktaş'tan vapur gelir.",
        "Marmaray'ın Üsküdar istasyonu Boğaz'ın altından Sirkeci'ye birkaç dakikada bağlanır.",
        "M5 metro hattı Üsküdar'dan başlayıp Anadolu yakasının iç kesimlerine uzanır.",
        "Kız Kulesi'ne tekneler Salacak ve Karaköy'den kalkar.",
      ],
      transitSummary: "Vapur (Eminönü, Karaköy, Beşiktaş), Marmaray (Üsküdar istasyonu) ve M5 metroyla ulaşılır; Kız Kulesi'ne Salacak'tan tekneyle geçilir.",
      idealDuration: "1 gün: sabah Sinan'ın camileri ve Salacak, öğleden sonra Kuzguncuk ve Beylerbeyi",
      tips: [
        "Salacak sahilinde gün batımında Tarihi Yarımada silüeti ve Kız Kulesi birlikte görülür.",
        "Kuzguncuk'tan Beylerbeyi'ne sahil boyunca yürüyerek gidilebilir.",
        "Çamlıca Tepesi'ne çıkmak için açık havalı bir gün seçin; puslu havada manzara kaybolur.",
      ],
    },
  },
  {
    slug: "sariyer",
    citySlug: "istanbul",
    regionSlug: "marmara",
    urban: true,
    name: "Sarıyer",
    title: "İstanbul Sarıyer Gezi Rehberi",
    summary:
      "Rumelihisarı, Emirgan Korusu, Sakıp Sabancı Müzesi, Belgrad Ormanı ve Kilyos plajlarıyla Boğaz'ın Karadeniz'e açılan yeşil ilçesi; Sarıyer böreği ve Rumelikavağı balıkçılarıyla bilinir.",
    longDescription:
      "Sarıyer, Boğaz'ın Avrupa yakasında Rumelihisarı'ndan Karadeniz kıyısına kadar uzanır. Fatih Sultan Mehmed'in 1452'de yaptırdığı Rumelihisarı, lale bahçeleriyle ünlü Emirgan Korusu, sahildeki yalılar ve kuzeyde Belgrad Ormanı ile Kilyos plajları, ilçeyi şehrin en yeşil ve en ferah köşelerinden biri yapar.",
    heroTagline: "Hisarlar, Korular ve Karadeniz'e Açılan Boğaz",
    location: { lat: 41.1686, lng: 29.0573 },
    guide: {
      intro: [
        "Sarıyer'i gezmek için sahil yolunu güneyden kuzeye takip etmek en mantıklısıdır: Rumelihisarı'nın surları, ardından Emirgan Korusu ve hemen yanındaki Sakıp Sabancı Müzesi. Yeniköy ve Tarabya'nın yalılarıyla devam eden yol, Büyükdere'deki Sadberk Hanım Müzesi'ne ulaşır.",
        "Günün sonunda Rumelikavağı'nda balık yemek ya da Sarıyer çarşısında börek almak klasiktir. Doğa arayanlar için Belgrad Ormanı'nın yürüyüş parkurları, yaz aylarında ise Karadeniz kıyısındaki Kilyos plajları tercih edilir.",
      ],
      neighbourhoods: [
        { name: "Rumelihisarı", description: "1452'de yapılan hisar, Boğaz'ın en dar noktasına bakan surlar ve sahildeki kafeler." },
        { name: "Emirgan", description: "Nisan'da lale festivaliyle dolan koru, köşkleri ve Sakıp Sabancı Müzesi." },
        { name: "Yeniköy, Tarabya ve Büyükdere", description: "Boğaz'ın en gösterişli yalıları, sahil yürüyüşü ve Sadberk Hanım Müzesi." },
        { name: "Sarıyer çarşı ve Rumelikavağı", description: "İlçenin merkezi, börekçileri ve Boğaz'ın Karadeniz ağzına yakın balıkçı köyü." },
        { name: "Belgrad Ormanı ve Kilyos", description: "Tarihi bentleri ve yürüyüş parkurlarıyla orman; Karadeniz kıyısında kumsallar." },
      ],
      food: [
        { name: "Sarıyer böreği", description: "İlçeye adını veren, kıymalı ya da peynirli kat kat çıtır börek; çarşıdaki börekçilerde bulunur." },
        { name: "Rumelikavağı'nda balık", description: "Karadeniz'e açılan Boğaz ağzındaki balıkçı köyünde, iskele çevresindeki balık lokantaları." },
        { name: "Emirgan'da çay ve kahvaltı", description: "Emirgan Korusu'ndaki köşklerde ve sahildeki çay bahçelerinde Boğaz'a karşı kahvaltı." },
        { name: "Rumelihisarı'nda Boğaz kenarı kahvaltısı", description: "Hisarın eteğindeki sahil kafelerinde, Boğaz'ın en dar noktasına karşı." },
      ],
      gettingThere: [
        "M2 metrosunun kuzey ucu Hacıosman istasyonu Sarıyer sınırlarındadır; buradan otobüs ve taksiyle sahile inilir.",
        "Beşiktaş'tan kuzeye giden sahil otobüsleri Rumelihisarı, Emirgan, Yeniköy ve Sarıyer'e uğrar.",
        "Şehir Hatları'nın uzun Boğaz turu vapuru Sarıyer ve Rumelikavağı iskelelerine yanaşır.",
        "Kilyos ve Belgrad Ormanı'na özel araçla ya da Sarıyer merkezden kalkan otobüslerle gidilir.",
      ],
      transitSummary: "M2 metro (Hacıosman), Beşiktaş'tan Boğaz sahil otobüsleri ve Boğaz turu vapuruyla (Sarıyer, Rumelikavağı) ulaşılır.",
      idealDuration: "1 gün: Rumelihisarı ve Emirgan, ardından sahil boyunca Sarıyer ve Rumelikavağı",
      tips: [
        "Emirgan Korusu'nun en güzel zamanı Nisan'daki lale dönemidir.",
        "Hafta sonu sahil yolunda trafik çok yoğunlaşır; Boğaz vapuru hem manzara hem zaman için daha iyi bir seçenektir.",
        "Kilyos'ta deniz akıntılı olabilir; yalnızca cankurtaranın olduğu bölümlerde denize girin.",
      ],
    },
  },
  {
    slug: "adalar",
    citySlug: "istanbul",
    regionSlug: "marmara",
    urban: true,
    name: "Adalar",
    title: "İstanbul Adalar (Büyükada, Heybeliada) Gezi Rehberi",
    summary:
      "Büyükada, Heybeliada, Burgazada ve Kınalıada'dan oluşan, motorlu araç trafiği olmayan ilçe; köşkleri, çam ormanları, Aya Yorgi Tepesi ve vapur yolculuğuyla İstanbul'un en sevilen günübirlik kaçamağı.",
    longDescription:
      "Adalar, Marmara Denizi'ndeki adalardan oluşan ilçedir; gezilerin odağı dört büyük ada olan Büyükada, Heybeliada, Burgazada ve Kınalıada'dır. Adalarda özel motorlu araç kullanılmaz; ulaşım bisiklet, yürüyüş ve belediyenin elektrikli araçlarıyla yapılır. 19. yüzyıl köşkleri, çam ormanları ve deniz kenarı çay bahçeleri, İstanbul'un kalabalığından vapurla bir saat uzakta sakin bir gün sunar.",
    heroTagline: "Arabasız Sokaklar, Köşkler ve Çam Kokulu Tepeler",
    location: { lat: 40.8742, lng: 29.1293 },
    guide: {
      intro: [
        "Adalar gezisi vapurla başlar: Kabataş ya da Bostancı'dan kalkan vapurlar sırasıyla Kınalıada, Burgazada, Heybeliada ve Büyükada'ya uğrar. Tek günde en çok tercih edilen plan, Büyükada'da Aya Yorgi Tepesi'ne yürümek ve dönüşte Heybeliada'da kısa bir mola vermektir.",
        "Büyükada'da iskeleden Çankaya Caddesi boyunca köşklerin arasından yürüyüp Aya Yorgi'ye tırmanmak, tepeden Marmara'yı izlemek adanın en klasik rotasıdır. Heybeliada'nın çam ormanları ve sakin koyları, Burgazada'daki Sait Faik Abasıyanık Müzesi ise daha sakin bir gün için idealdir.",
      ],
      neighbourhoods: [
        { name: "Büyükada", description: "En büyük ada; köşkleri, Aya Yorgi Tepesi, Çankaya Caddesi ve bisiklet turu." },
        { name: "Heybeliada", description: "Çam ormanları, Heybeliada Ruhban Okulu'nun bulunduğu tepe ve sakin koylar." },
        { name: "Burgazada", description: "Yazar Sait Faik Abasıyanık'ın evi olan müze ve küçük, sakin bir çarşı." },
        { name: "Kınalıada", description: "Karaya en yakın ada; kızıl toprakları ve iskele çevresindeki küçük plajlarıyla." },
      ],
      food: [
        { name: "İskele çevresinde balık", description: "Her adanın iskele çevresinde deniz kenarında balık ve meze lokantaları sıralanır." },
        { name: "Büyükada'da dondurma ve kahvaltı", description: "Büyükada çarşısındaki dondurmacılar ve bahçeli kahvaltıcılar, gün boyu ada gezisinin molalarıdır." },
        { name: "Vapurda çay ve simit", description: "Adalara giden vapurda martılara simit atarak çay içmek, yolculuğun ayrılmaz parçasıdır." },
      ],
      gettingThere: [
        "Avrupa yakasında Kabataş, Anadolu yakasında Bostancı iskelesinden Adalar vapurları kalkar; Bostancı'dan yolculuk daha kısadır.",
        "Vapurlar genellikle Kınalıada, Burgazada, Heybeliada ve Büyükada'ya sırasıyla uğrar.",
        "Adalarda özel motorlu araç yoktur; ada içinde yürüyüş, bisiklet ve belediyenin elektrikli araçları kullanılır.",
      ],
      transitSummary: "Kabataş ya da Bostancı'dan vapurla ulaşılır; adalarda araç yoktur, yürüyüş, bisiklet ve elektrikli araçlar kullanılır.",
      idealDuration: "1 gün: sabah vapuruyla Büyükada ve Aya Yorgi, dönüşte Heybeliada molası",
      tips: [
        "Yaz hafta sonlarında vapurlar çok kalabalıktır; sabahın ilk vapurlarını tercih edin.",
        "Aya Yorgi Tepesi'ne çıkan yol dik ve uzundur; rahat ayakkabı giyin, yanınıza su alın.",
        "Dönüş vapurlarının son sefer saatini ada iskelesinden önceden kontrol edin.",
      ],
    },
  },
];
