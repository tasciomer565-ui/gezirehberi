import { allCities } from "./cities";
import type { RegionSlug } from "@/lib/types";

export interface BeachItem {
  name: string;
  description: string;
  citySlug: string;
  cityName: string;
  regionSlug: RegionSlug;
}

// Şehir veri dosyalarındaki mevcut plaj/koy kayıtlarına ek olarak,
// Türkiye'nin kıyı illerindeki doğrulanmış ünlü halk plajları ve koyları.
// Uydurma fiyat/ücret/saat yok; yalnızca coğrafi özellikler.
const CURATED_BEACHES: BeachItem[] = [
  // Akdeniz
  { name: "Lara Halk Plajı", description: "Antalya doğu yakasında ince kumlu yapısı ve uzun sahil şeridiyle bilinen geniş halk plajı.", citySlug: "antalya", cityName: "Antalya", regionSlug: "akdeniz" },
  { name: "Kleopatra Plajı", description: "Alanya Kalesi eteklerinde yer alan, ince altın kumları ve berrak suyuyla ünlü şehir plajı.", citySlug: "alanya", cityName: "Alanya", regionSlug: "akdeniz" },
  { name: "Damlataş Plajı", description: "Damlataş Mağarası önündeki sakin ve sığ deniziyle aileler tarafından tercih edilen Alanya plajı.", citySlug: "alanya", cityName: "Alanya", regionSlug: "akdeniz" },
  { name: "Ayışığı Plajı ve Koyu", description: "Kemer merkezde çam ağaçlarıyla çevrili, dalgasız ve kumlu yapısıyla bilinen koy.", citySlug: "kemer", cityName: "Kemer", regionSlug: "akdeniz" },
  { name: "Phaselis Koyu", description: "Phaselis Antik Kenti kalıntıları arasında yer alan, çam gölgeli ve sakin sulara sahip tarihi koy.", citySlug: "kemer", cityName: "Kemer", regionSlug: "akdeniz" },
  { name: "Kızkalesi Halk Plajı", description: "Deniz ortasındaki Kızkalesi manzarasına karşı uzanan sığ ve kumlu Mersin sahili.", citySlug: "mersin", cityName: "Mersin", regionSlug: "akdeniz" },
  { name: "Susanoğlu (Atakent) Plajı", description: "Silifke yakınlarında geniş kumsalı ve sığ deniziyle bilinen Mersin halk plajı.", citySlug: "mersin", cityName: "Mersin", regionSlug: "akdeniz" },
  { name: "İncekum Plajı", description: "Alanya–Avsallar arasında adını ince sarı kumlarından alan, sığ ve çam ormanıyla çevrili plaj.", citySlug: "alanya", cityName: "Alanya", regionSlug: "akdeniz" },
  { name: "Çıralı Sahili", description: "Caretta caretta üreme alanı olarak korunan, çakıl ve kum karışımlı doğal Akdeniz sahili.", citySlug: "kemer", cityName: "Kemer", regionSlug: "akdeniz" },

  // Ege
  { name: "Ilıca Plajı", description: "Çeşme'de deniz içindeki termal kaynaklarla ılıyan suyu ve uzun beyaz kumsalıyla tanınan plaj.", citySlug: "izmir", cityName: "İzmir", regionSlug: "ege" },
  { name: "Altınkum Plajı (Çeşme)", description: "Çeşme yarımadasının güneyinde ince altın kumları ve berrak serin deniziyle bilinen plaj.", citySlug: "izmir", cityName: "İzmir", regionSlug: "ege" },
  { name: "Kum Denizi Halk Plajı", description: "Urla kıyısında sakin denizi ve düzenli yürüyüş yoluyla öne çıkan aile dostu halk plajı.", citySlug: "izmir", cityName: "İzmir", regionSlug: "ege" },
  { name: "İztuzu Plajı", description: "Dalyan'da tatlı su ile denizi ayıran doğal kumul şeridi ve caretta caretta koruma alanı.", citySlug: "fethiye", cityName: "Fethiye", regionSlug: "akdeniz" },
  { name: "Kumburnu Plajı", description: "Ölüdeniz Lagünü girişinde durgun ve sığ suyuyla bilinen korumalı tabiat parkı plajı.", citySlug: "fethiye", cityName: "Fethiye", regionSlug: "akdeniz" },
  { name: "Kabak Koyu", description: "Faralya eteklerinde çam ormanı ve kayalıklar arasına gizlenmiş doğal taşlık ve kumlu koy.", citySlug: "fethiye", cityName: "Fethiye", regionSlug: "akdeniz" },
  { name: "Bitez Plajı", description: "Bodrum yarımadasında sığ denizi, kumlu sahili ve mandalina bahçeleriyle bilinen koy.", citySlug: "bodrum", cityName: "Bodrum", regionSlug: "ege" },
  { name: "Gümbet Plajı", description: "Bodrum merkeze en yakın, su sporlarına elverişli uzun kumlu sahil şeridi.", citySlug: "bodrum", cityName: "Bodrum", regionSlug: "ege" },
  { name: "Yahşi (Ortakent) Plajı", description: "Bodrum'un en uzun sahillerinden birine sahip, berrak ve serin suyuyla bilinen koy.", citySlug: "bodrum", cityName: "Bodrum", regionSlug: "ege" },
  { name: "İçmeler Plajı", description: "Marmaris'in çam ormanlarıyla çevrili koyunda berrak ve dalgasız suyuyla öne çıkan plaj.", citySlug: "marmaris", cityName: "Marmaris", regionSlug: "ege" },
  { name: "Kleopatra (Sedir Adası) Plajı", description: "Gökova Körfezi'nde özel koruma altındaki organik kum taneleriyle bilinen tarihi ada plajı.", citySlug: "marmaris", cityName: "Marmaris", regionSlug: "ege" },
  { name: "Altınkum Plajı (Didim)", description: "Sığ ve uzun kumsalıyla çocuklu ailelerin yoğun ilgi gösterdiği Aydın kıyısı.", citySlug: "aydin", cityName: "Aydın", regionSlug: "ege" },
  { name: "Dilek Yarımadası Koyları", description: "Milli park sınırları içinde İçmeler, Aydınlık, Kavaklıburun ve Karasu koylarını kapsayan doğal sahiller.", citySlug: "aydin", cityName: "Aydın", regionSlug: "ege" },
  { name: "Kadınlar Denizi Plajı", description: "Kuşadası'nda ince kumlu yapısı ve merkezine yakınlığıyla bilinen uzun halk plajı.", citySlug: "aydin", cityName: "Aydın", regionSlug: "ege" },

  // Marmara
  { name: "Sarımsaklı Plajı", description: "Ayvalık'ta yaklaşık 7 km boyunca uzanan ince kumu ve berrak deniziyle bilinen Kuzey Ege sahili.", citySlug: "balikesir", cityName: "Balıkesir", regionSlug: "marmara" },
  { name: "Ayazma Plajı (Bozcaada)", description: "Bozcaada'nın güneyinde berrak turkuaz suyu ve ince kumuyla öne çıkan popüler ada plajı.", citySlug: "canakkale", cityName: "Çanakkale", regionSlug: "marmara" },
  { name: "Kadırga Koyu (Assos)", description: "Behramkale yakınlarında zeytin ağaçlarıyla çevrili uzun çakıl ve kum karışımlı temiz koy.", citySlug: "canakkale", cityName: "Çanakkale", regionSlug: "marmara" },
  { name: "Kilyos (Kumköy) Plajları", description: "İstanbul'un Karadeniz kıyısında geniş kumsalıyla yaz aylarında en çok tercih edilen yüzme alanı.", citySlug: "istanbul", cityName: "İstanbul", regionSlug: "marmara" },
  { name: "Şile Ayazma Plajı", description: "Şile merkezde ince kumlu yapısı ve uzun sahil şeridiyle bilinen Karadeniz plajı.", citySlug: "istanbul", cityName: "İstanbul", regionSlug: "marmara" },
  { name: "Kerpe ve Cebeci Plajları", description: "Kandıra kıyılarında kayalık koyları ve geniş kumlu aile plajlarıyla bilinen Karadeniz sahili.", citySlug: "kocaeli", cityName: "Kocaeli", regionSlug: "marmara" },
  { name: "Karasu Plajı", description: "Sakarya'nın Karadeniz kıyısında kilometrelerce kesintisiz uzanan geniş kumlu sahil şeridi.", citySlug: "sakarya", cityName: "Sakarya", regionSlug: "marmara" },

  // Karadeniz
  { name: "Amasra Büyük Liman Plajı", description: "Amasra Kalesi manzarasına karşı dalgalara korunaklı, sığ ve kumlu şehir içi plajı.", citySlug: "amasra", cityName: "Amasra", regionSlug: "karadeniz" },
  { name: "İnkumu Plajı", description: "Bartın merkeze yakın konumda yaklaşık 3 km uzanan ince kumlu Batı Karadeniz sahili.", citySlug: "amasra", cityName: "Amasra", regionSlug: "karadeniz" },
  { name: "Çakraz Plajı", description: "Amasra doğusunda sakin koyu, ince kumu ve yeşil yamaçlarıyla bilinen sahil köyü plajı.", citySlug: "amasra", cityName: "Amasra", regionSlug: "karadeniz" },
  { name: "Karakum Plajı", description: "Sinop yarımadasında volkanik koyu renkli kumu ve sakin suyuyla dikkat çeken plaj.", citySlug: "sinop", cityName: "Sinop", regionSlug: "karadeniz" },
  { name: "Kumkapı Plajı", description: "Sinop merkez yakınında düzenli halk plajı olarak hizmet veren berrak Karadeniz sahili.", citySlug: "sinop", cityName: "Sinop", regionSlug: "karadeniz" },
  { name: "Atakum Sahili", description: "Samsun'da kilometrelerce uzanan kumlu plajı ve kesintisiz sahil yürüyüş yolu.", citySlug: "samsun", cityName: "Samsun", regionSlug: "karadeniz" },
  { name: "Akçakoca Çuhallı Plajı", description: "Düzce Akçakoca'da fındık bahçeleri ve şehir merkezi önündeki ince kumlu Karadeniz sahili.", citySlug: "duzce", cityName: "Düzce", regionSlug: "karadeniz" },
];

export function getAllBeaches(): BeachItem[] {
  const seen = new Set<string>();
  const list: BeachItem[] = [];

  const add = (item: BeachItem) => {
    const key = `${item.citySlug}::${item.name.toLocaleLowerCase("tr").replace(/\s+/g, " ").trim()}`;
    if (seen.has(key)) return;
    seen.add(key);
    list.push(item);
  };

  for (const city of allCities) {
    for (const a of city.attractions) {
      const isBeach = a.category === "beach" || /(plajı|koyu|lagünü|sahili)$/i.test(a.name.trim());
      if (!isBeach) continue;
      if (/oteli|pansiyon|restoran|restaurant|balıkçısı/i.test(a.name)) continue;
      add({
        name: a.name,
        description: a.description,
        citySlug: city.slug,
        cityName: city.name,
        regionSlug: city.regionSlug,
      });
    }
  }

  for (const b of CURATED_BEACHES) {
    add(b);
  }

  return list;
}
