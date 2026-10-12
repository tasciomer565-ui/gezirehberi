// Havalimanı transfer sayfaları için, sitede ayrı şehir/ilçe sayfası olmayan
// ama transfer aramalarında çok geçen tatil merkezleri (2026-10-01). Konumlar
// kasaba merkezleri; airportTransfers.json üretilirken OSRM mesafeleri bilinen
// havalimanı-kasaba mesafeleriyle karşılaştırılarak kontrol edildi.
export interface TransferPlace {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  // Linklenecek en yakın şehir sayfası (allCities slug'ı).
  citySlug: string;
  // Bağlı olduğu il (metinde "Kemer (Antalya)" gibi).
  province: string;
}

export const transferPlaces: TransferPlace[] = [
  { slug: "kemer", name: "Kemer", lat: 36.598, lng: 30.56, citySlug: "antalya", province: "Antalya" },
  { slug: "belek", name: "Belek", lat: 36.862, lng: 31.055, citySlug: "antalya", province: "Antalya" },
  { slug: "side", name: "Side", lat: 36.767, lng: 31.389, citySlug: "antalya", province: "Antalya" },
  { slug: "manavgat", name: "Manavgat", lat: 36.787, lng: 31.443, citySlug: "antalya", province: "Antalya" },
  { slug: "gocek", name: "Göcek", lat: 36.753, lng: 28.94, citySlug: "fethiye", province: "Muğla" },
  { slug: "dalyan", name: "Dalyan", lat: 36.835, lng: 28.642, citySlug: "marmaris", province: "Muğla" },
  { slug: "turgutreis", name: "Turgutreis", lat: 37.007, lng: 27.257, citySlug: "bodrum", province: "Muğla" },
  { slug: "yalikavak", name: "Yalıkavak", lat: 37.105, lng: 27.293, citySlug: "bodrum", province: "Muğla" },
  { slug: "didim", name: "Didim", lat: 37.375, lng: 27.268, citySlug: "aydin", province: "Aydın" },
  { slug: "datca", name: "Datça", lat: 36.725, lng: 27.688, citySlug: "marmaris", province: "Muğla" },
];
