// Arama sonucu snippet'leri için kısaltma (2026-10-01 tarama denetimi: 98
// açıklama 160, 147 çeviri başlığı 60 karakteri aşıyordu ve Google'da yarım
// cümleyle kesiliyordu). Önce cümle sonunda, olmazsa kelime sınırında keser.
export function clampDescription(text: string, max = 155): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sentenceEnd = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (sentenceEnd >= max * 0.5) return cut.slice(0, sentenceEnd + 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:—–-]$/, "").trimEnd() + "…";
}

// "Bolu Travel Guide — The Mirror of Abant..." gibi başlıklarda marka eki
// (" | Yol Defteri") dahil 60'ı aşınca ayraçtan sonrası atılır.
export function clampTitle(title: string, max = 60 - " | Yol Defteri".length): string {
  if (title.length <= max) return title;
  const head = title.split(/\s[—–-]\s/)[0];
  return head.length <= max ? head : clampDescription(head, max).replace(/…$/, "");
}
