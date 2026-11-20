import Link from "@/components/PlainLink";
import { UtensilsCrossed, BedDouble, Soup, CloudSun, Store } from "lucide-react";
import type { City } from "@/lib/types";
import { withLocative } from "@/lib/turkish";
import HotelOffer from "@/components/HotelOffer";

// "X ne meşhur / X'te ne yenir / X'te nerede kalınır / X hava durumu" sorguları
// için sunucuda render edilen bölüm (2026-11-02). Önceden yemek, restoran ve
// konaklama içeriği yalnızca CityContentSections'ın istemci sekmelerinde (API
// ile yüklenerek) vardı; Google'ın gördüğü ilk HTML'de bu içerik yoktu ve Search
// Console'da bu niyetteki sorgularda hiç görünmüyorduk. İçerik, mevcut (sanitize
// edilmiş) şehir verisinden gelir: uydurma fiyat/puan/saat yok.
function cap(s: string, n: number) {
  return s.length > n ? s.slice(0, s.lastIndexOf(" ", n)) + "…" : s;
}

export default function CityFoodStay({ city }: { city: City }) {
  const loc = withLocative(city.name);
  const foods = city.localFood.slice(0, 10);
  const eats = city.restaurants.slice(0, 8);
  const stays = city.accommodations.slice(0, 8);

  return (
    <div className="mt-16 space-y-14 border-t border-ink/10 pt-16">
      {foods.length > 0 && (
        <section id="ne-yenir" className="scroll-mt-24">
          <h2 className="mb-2 flex items-center gap-2 font-display text-3xl italic text-ink">
            <Soup className="text-kiremit" size={26} />
            {loc} Ne Yenir? Meşhur Yemekleri ve Yöresel Lezzetler
          </h2>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-ink/70">
            {`${city.name} mutfağında denenmesi gereken ${foods.length} yöresel lezzet: ${foods.slice(0, 4).map((f) => f.name).join(", ")}${foods.length > 4 ? " ve daha fazlası" : ""}.`}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {foods.map((f) => (
              <article key={f.id} className="rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
                <h3 className="text-lg font-bold text-ink">{f.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{cap(f.longDescription || f.description, 320)}</p>
                {f.ingredients.length > 0 && (
                  <p className="mt-2 text-xs text-ink/65">
                    <span className="font-semibold text-ink/80">Başlıca malzemeler: </span>
                    {f.ingredients.slice(0, 6).join(", ")}
                  </p>
                )}
                {f.bestSeason && (
                  <p className="mt-1 text-xs text-ink/65">
                    <span className="font-semibold text-ink/80">En uygun mevsim: </span>
                    {f.bestSeason}
                  </p>
                )}
                {f.tips && <p className="mt-2 text-xs leading-relaxed text-ink/65">{f.tips}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {eats.length > 0 && (
        <section id="nerede-yenir" className="scroll-mt-24">
          <h2 className="mb-2 flex items-center gap-2 font-display text-3xl italic text-ink">
            <UtensilsCrossed className="text-kiremit" size={26} />
            {loc} Nerede Yenir?
          </h2>
          <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink/70">
            {`${city.name} için yemek yenebilecek bölgeler ve her birinde öne çıkan lezzetler. İşletme fiyat ve çalışma saatleri sık değiştiği için burada yer verilmez; gitmeden önce güncel bilgiyi kontrol edin.`}
          </p>
          <ul className="grid gap-3 md:grid-cols-2">
            {eats.map((r) => (
              <li key={r.id} className="rounded-xl border border-ink/10 bg-paper p-4 shadow-sm">
                <h3 className="font-bold text-ink">{r.name}</h3>
                {r.description && <p className="mt-1 text-sm leading-relaxed text-ink/75">{cap(r.description, 220)}</p>}
                {r.specialties.length > 0 && (
                  <p className="mt-1 text-xs text-ink/65">
                    <span className="font-semibold text-ink/80">Denenecekler: </span>
                    {r.specialties.slice(0, 5).join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(stays.length > 0 || city.whereToStay) && (
        <section id="nerede-kalinir" className="scroll-mt-24">
          <h2 className="mb-2 flex items-center gap-2 font-display text-3xl italic text-ink">
            <BedDouble className="text-kiremit" size={26} />
            {loc} Nerede Kalınır?
          </h2>
          {city.whereToStay && <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink/75">{city.whereToStay}</p>}
          {stays.length > 0 && (
            <ul className="grid gap-3 md:grid-cols-2">
              {stays.map((a) => (
                <li key={a.id} className="rounded-xl border border-ink/10 bg-paper p-4 shadow-sm">
                  <h3 className="font-bold text-ink">{a.name}</h3>
                  {a.description && <p className="mt-1 text-sm leading-relaxed text-ink/75">{cap(a.description, 220)}</p>}
                </li>
              ))}
            </ul>
          )}
          <HotelOffer cityName={city.name} />
        </section>
      )}

      <div className="rounded-xl border border-kiremit/25 bg-gradient-to-r from-safran/10 to-kiremit/5 p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-kiremit">
              <Store size={14} /> {loc} Otel, Kafe veya Restoran İşletmecisi misiniz?
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink/80">
              {city.name} gezi rehberinde ve {city.name} varışlı yol güzergahlarında işletmenizi gezginlere tanıtmak, sponsorlu mekan önerilerinde yer almak için bizimle iletişime geçin.
            </p>
          </div>
          <Link
            href="/tr/iletisim"
            className="shrink-0 rounded-full bg-kiremit px-5 py-2.5 text-center text-xs font-bold text-paper shadow-sm transition-colors hover:bg-kiremit/90"
          >
            İş Birliği & Tanıtım Başvurusu →
          </Link>
        </div>
      </div>

      <section id="iklim-ne-zaman" className="scroll-mt-24">
        <h2 className="mb-2 flex items-center gap-2 font-display text-3xl italic text-ink">
          <CloudSun className="text-kiremit" size={26} />
          {city.name} İklimi ve Ne Zaman Gidilir?
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {city.climate && (
            <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
              <h3 className="font-bold text-ink">İklim</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink/75">{city.climate}</p>
            </div>
          )}
          {city.whenToGo && (
            <div className="rounded-xl border border-ink/10 bg-paper p-5 shadow-sm">
              <h3 className="font-bold text-ink">En iyi ziyaret zamanı</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink/75">{city.whenToGo}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
