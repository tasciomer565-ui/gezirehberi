// Tarifeli yolcu seferi olan havalimanları — koordinatlar OurAirports açık
// verisinden (ourairports.com, kamu malı; type large/medium_airport,
// scheduled_service=yes, iso_country=TR, 2026-10-01). Adana Şakirpaşa
// 2024'te kapanıp yerini Çukurova Uluslararası Havalimanı'na bıraktığı için
// listede yok. Şehir merkezine karayolu mesafeleri
// scripts/generate-airport-distances.ts ile airportDistances.json'a yazılır.
import airportDistances from "./airportDistances.json";

export interface Airport {
  iata: string;
  name: string;
  lat: number;
  lng: number;
}

export const airports: Airport[] = [
  { iata: "IST", name: "İstanbul Havalimanı", lat: 41.2748, lng: 28.7321 },
  { iata: "SAW", name: "İstanbul Sabiha Gökçen Havalimanı", lat: 40.8986, lng: 29.3092 },
  { iata: "ESB", name: "Ankara Esenboğa Havalimanı", lat: 40.1281, lng: 32.995 },
  { iata: "ADB", name: "İzmir Adnan Menderes Havalimanı", lat: 38.2924, lng: 27.157 },
  { iata: "AYT", name: "Antalya Havalimanı", lat: 36.8987, lng: 30.8005 },
  { iata: "GZP", name: "Gazipaşa-Alanya Havalimanı", lat: 36.2988, lng: 32.297 },
  { iata: "DLM", name: "Dalaman Havalimanı", lat: 36.7131, lng: 28.7925 },
  { iata: "BJV", name: "Milas-Bodrum Havalimanı", lat: 37.2493, lng: 27.664 },
  { iata: "COV", name: "Çukurova Uluslararası Havalimanı", lat: 36.8914, lng: 35.0712 },
  { iata: "HTY", name: "Hatay Havalimanı", lat: 36.3607, lng: 36.2855 },
  { iata: "GZT", name: "Gaziantep Havalimanı", lat: 36.9472, lng: 37.4786 },
  { iata: "KCM", name: "Kahramanmaraş Havalimanı", lat: 37.5388, lng: 36.9535 },
  { iata: "ADF", name: "Adıyaman Havalimanı", lat: 37.7314, lng: 38.4688 },
  { iata: "GNY", name: "Şanlıurfa GAP Havalimanı", lat: 37.4456, lng: 38.8955 },
  { iata: "MQM", name: "Mardin Havalimanı", lat: 37.2233, lng: 40.6316 },
  { iata: "DIY", name: "Diyarbakır Havalimanı", lat: 37.8939, lng: 40.201 },
  { iata: "BAL", name: "Batman Havalimanı", lat: 37.929, lng: 41.1166 },
  { iata: "NKT", name: "Şırnak Şerafettin Elçi Havalimanı", lat: 37.3647, lng: 42.0582 },
  { iata: "YKO", name: "Hakkari Yüksekova Havalimanı", lat: 37.5497, lng: 44.2381 },
  { iata: "VAN", name: "Van Ferit Melen Havalimanı", lat: 38.4682, lng: 43.3322 },
  { iata: "MSR", name: "Muş Havalimanı", lat: 38.7477, lng: 41.6612 },
  { iata: "BGG", name: "Bingöl Havalimanı", lat: 38.8601, lng: 40.5944 },
  { iata: "EZS", name: "Elazığ Havalimanı", lat: 38.5979, lng: 39.2834 },
  { iata: "MLX", name: "Malatya Havalimanı", lat: 38.4352, lng: 38.0909 },
  { iata: "ERC", name: "Erzincan Havalimanı", lat: 39.7102, lng: 39.527 },
  { iata: "ERZ", name: "Erzurum Havalimanı", lat: 39.9565, lng: 41.1702 },
  { iata: "AJI", name: "Ağrı Havalimanı", lat: 39.6556, lng: 43.0257 },
  { iata: "IGD", name: "Iğdır Havalimanı", lat: 39.9766, lng: 43.8766 },
  { iata: "KSY", name: "Kars Havalimanı", lat: 40.5621, lng: 43.115 },
  { iata: "TZX", name: "Trabzon Havalimanı", lat: 40.995, lng: 39.7897 },
  { iata: "RZV", name: "Rize-Artvin Havalimanı", lat: 41.1797, lng: 40.8488 },
  { iata: "OGU", name: "Ordu-Giresun Havalimanı", lat: 40.9668, lng: 38.0859 },
  { iata: "SZF", name: "Samsun Çarşamba Havalimanı", lat: 41.2539, lng: 36.5675 },
  { iata: "MZH", name: "Amasya Merzifon Havalimanı", lat: 40.8293, lng: 35.5219 },
  { iata: "TJK", name: "Tokat Havalimanı", lat: 40.3247, lng: 36.3905 },
  { iata: "NOP", name: "Sinop Havalimanı", lat: 42.0183, lng: 35.0717 },
  { iata: "KFS", name: "Kastamonu Havalimanı", lat: 41.3142, lng: 33.7957 },
  { iata: "ONQ", name: "Zonguldak Çaycuma Havalimanı", lat: 41.5064, lng: 32.0886 },
  { iata: "VAS", name: "Sivas Nuri Demirağ Havalimanı", lat: 39.8138, lng: 36.9035 },
  { iata: "ASR", name: "Kayseri Erkilet Havalimanı", lat: 38.7704, lng: 35.4953 },
  { iata: "NAV", name: "Nevşehir Kapadokya Havalimanı", lat: 38.7719, lng: 34.5345 },
  { iata: "KYA", name: "Konya Havalimanı", lat: 37.979, lng: 32.5619 },
  { iata: "ISE", name: "Isparta Süleyman Demirel Havalimanı", lat: 37.8554, lng: 30.3684 },
  { iata: "DNZ", name: "Denizli Çardak Havalimanı", lat: 37.7855, lng: 29.7012 },
  { iata: "KZR", name: "Zafer Havalimanı", lat: 39.1111, lng: 30.1304 },
  { iata: "AOE", name: "Eskişehir Hasan Polatkan Havalimanı", lat: 39.8116, lng: 30.5192 },
  { iata: "YEI", name: "Bursa Yenişehir Havalimanı", lat: 40.2551, lng: 29.5625 },
  { iata: "BZI", name: "Balıkesir Merkez Havalimanı", lat: 39.6193, lng: 27.926 },
  { iata: "EDO", name: "Balıkesir Koca Seyit Havalimanı (Edremit)", lat: 39.5525, lng: 27.0101 },
  { iata: "CKZ", name: "Çanakkale Havalimanı", lat: 40.1376, lng: 26.4267 },
  { iata: "TEQ", name: "Tekirdağ Çorlu Havalimanı", lat: 41.1381, lng: 27.9191 },
];

export interface CityAirport {
  airport: Airport;
  distanceKm: number;
  durationMin: number;
}

export function getCityAirports(citySlug: string): CityAirport[] {
  const list = (airportDistances as Record<string, { iata: string; distanceKm: number; durationMin: number }[]>)[citySlug] ?? [];
  return list
    .map((d) => {
      const airport = airports.find((a) => a.iata === d.iata);
      return airport ? { airport, distanceKm: d.distanceKm, durationMin: d.durationMin } : undefined;
    })
    .filter((d): d is CityAirport => Boolean(d));
}
