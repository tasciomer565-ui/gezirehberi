// Kalıcı görsel-linki denetim script'i. src/lib/cityImages.ts'teki (REGION_IMAGES
// + CITY_IMAGES) tüm dış Wikimedia Commons URL'lerinin gerçekten 200 döndüğünü
// doğrular — Commons'taki dosyalar zamanla silinebilir/taşınabilir (bu script
// ilk çalıştırıldığında 8 kırık URL bulundu: goreme, bozcaada, alanya, urgup,
// alacati, gokceada, kusadasi, uzungol). Hiçbir düzeltme yapmaz, sadece rapor
// eder. Wikimedia sık istekte agresif 429 uygular, bu yüzden istekler arasında
// kasıtlı bir gecikme var — hızlı bitmesi gerekmiyor, kalıcı/periyodik
// çalıştırılması amaçlanıyor.
// Kullanım: npx tsx scripts/audit-images.ts
import { REGION_IMAGES, CITY_IMAGES } from "../src/lib/cityImages";

const DELAY_MS = 2500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function checkUrl(label: string, url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      // Wikimedia, tanımlayıcı User-Agent göndermeyen istekleri 429 ile
      // kısıtlıyor (2026-10-01: 75 sahte "kırık link" bulgusu bundandı).
      headers: { "User-Agent": "yoldefteri-image-audit/1.0 (https://www.yoldefterim.com.tr)" },
    });
    if (res.status !== 200) {
      console.log(`[${label}] HTTP ${res.status}: ${url}`);
      return false;
    }
    return true;
  } catch (e: any) {
    console.log(`[${label}] fetch hatası (${e?.message || e}): ${url}`);
    return false;
  }
}

async function main() {
  const entries = [
    ...Object.entries(REGION_IMAGES).map(([k, v]) => [`region:${k}`, v] as const),
    ...Object.entries(CITY_IMAGES).map(([k, v]) => [`city:${k}`, v] as const),
  ];
  console.log(`${entries.length} görsel URL'i denetleniyor (Wikimedia rate-limit'i nedeniyle yavaş)...\n`);

  let issues = 0;
  for (const [label, url] of entries) {
    const ok = await checkUrl(label, url);
    if (!ok) issues++;
    await sleep(DELAY_MS);
  }
  console.log(`\nBitti. Toplam bulgu: ${issues}`);
}

main();
