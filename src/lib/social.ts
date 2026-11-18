// Sitenin resmî sosyal medya hesapları (2026-11-18). Footer, Hakkımızda,
// İletişim ve Organization JSON-LD `sameAs` buradan beslenir; hesap
// eklenince/değişince yalnızca bu liste güncellenir.
export const SOCIAL_LINKS = [
  { id: "instagram", label: "Instagram", handle: "@yoldefterim.tr", url: "https://www.instagram.com/yoldefterim.tr/" },
  { id: "tiktok", label: "TikTok", handle: "@yoldefterim.tr", url: "https://www.tiktok.com/@yoldefterim.tr" },
] as const;

export type SocialId = (typeof SOCIAL_LINKS)[number]["id"];

export const SOCIAL_SAME_AS = SOCIAL_LINKS.map((s) => s.url);
