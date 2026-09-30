import { Region } from "@/lib/types";

// Bölgelerin statik bilgileri (ad, slogan, açıklama, renkler) — şehir
// verisine BAĞIMLI DEĞİL. İstemci bileşenleri (Header, CityHero,
// WishlistPageClient) bunu kullanmalı: regions.ts şehir sayısı için
// cities modülünü import ediyor ve istemciye alınırsa 85 şehrin tüm verisi
// (~1,7 MB, gzip ~390 KB) her sayfanın JS paketine giriyordu (Lighthouse
// denetimi 2026-09-29, mobil LCP 5-6,6 sn).
export type RegionMeta = Omit<Region, "cityCount">;

export const regionMeta: RegionMeta[] = [
  {
    slug: "karadeniz",
    name: "Karadeniz",
    tagline: "Yeşilin bin tonu, bulutlara değen yaylalar",
    description:
      "Sisli yaylalar, çay bahçeleri ve denize dik inen vadileriyle Türkiye'nin en yemyeşil bölgesi. Amasra'dan Ayder yaylalarına, her köşede farklı bir doğa deneyimi.",
    gradientFrom: "#0F5257",
    gradientTo: "#16909C",
  },
  {
    slug: "ege",
    name: "Ege",
    tagline: "Zeytinlikler, antik kentler ve turkuaz koylar",
    description:
      "Antik uygarlıkların izleri, zeytinlikler arasında saklı köyler ve gün batımıyla altın rengine bürünen sahiller; tarih ile deniz tatilini buluşturan bölge.",
    gradientFrom: "#B7791F",
    gradientTo: "#16909C",
  },
  {
    slug: "akdeniz",
    name: "Akdeniz",
    tagline: "Turkuaz sular, dağ başında antik şehirler",
    description:
      "Toroslar'ın denize dik indiği koylar, Likya uygarlığından kalma antik kentler ve yıl boyu güneşli plajlar. Akdeniz, macera ile dinlenmeyi bir arada sunar; Türkiye'nin turkuaz kıyısı.",
    gradientFrom: "#0F5257",
    gradientTo: "#B33A25",
  },
  {
    slug: "marmara",
    name: "Marmara",
    tagline: "İki kıtanın, iki denizin buluştuğu bölge",
    description:
      "İstanbul'un tarihi dokusundan Bursa'nın Osmanlı mirasına, Gelibolu'nun sessizliğinden Bozcaada'nın bağlarına uzanan çeşitlilik; iki kıtanın buluştuğu bölge.",
    gradientFrom: "#8A3A2B",
    gradientTo: "#B33A25",
  },
  {
    slug: "ic-anadolu",
    name: "İç Anadolu",
    tagline: "Peri bacaları, bozkır ve yüzyıllık kervansaraylar",
    description:
      "Kapadokya'nın peri bacalarından Konya'nın Mevlevi mirasına, bozkırın ortasında yükselen tarih ve gelenek; Türkiye'nin kalbinde uzanan İç Anadolu bölgesi.",
    gradientFrom: "#B7791F",
    gradientTo: "#E4A335",
  },
  {
    slug: "dogu-anadolu",
    name: "Doğu Anadolu",
    tagline: "Yüksek dağlar, buz tutmuş göller, el değmemiş doğa",
    description:
      "Ağrı Dağı'nın gölgesinde, Van Gölü'nün kıyısında, Türkiye'nin en vahşi ve en az keşfedilmiş coğrafyası; yüksek dağlar ve buz tutmuş göllerle dolu bölge.",
    gradientFrom: "#0F5257",
    gradientTo: "#8A2B45",
  },
  {
    slug: "guneydogu-anadolu",
    name: "Güneydoğu Anadolu",
    tagline: "Bin yıllık taş şehirler, mezopotamya lezzetleri",
    description:
      "Mardin'in taş evleri, Göbeklitepe'nin gizemi ve Gaziantep mutfağıyla Türkiye'nin en köklü topraklarından biri; bin yıllık taş şehirlerin bölgesi.",
    gradientFrom: "#8A2B45",
    gradientTo: "#B33A5E",
  },
];

export function getRegionMeta(slug: string): RegionMeta | undefined {
  return regionMeta.find((r) => r.slug === slug);
}
