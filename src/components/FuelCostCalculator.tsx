"use client";

import { useState } from "react";
import { Fuel } from "lucide-react";

// "Batman Siirt arası kaç TL?" Google'ın "İnsanlar bunu da sordu" kutusunda
// çıkan sorulardan (2026-09-30 SERP incelemesi). Pompa fiyatı sık değiştiği
// için sayfaya sabit bir TL tutarı yazmıyoruz — kullanıcı güncel litre
// fiyatını kendisi giriyor, sonuç gerçek mesafeden hesaplanıyor. Fiyat
// alanı bilerek boş başlıyor: varsayılan bir fiyat göstermek, eskimiş bir
// rakamı gerçekmiş gibi sunmak olurdu.
export default function FuelCostCalculator({ distanceKm }: { distanceKm: number }) {
  const [consumption, setConsumption] = useState("7");
  const [price, setPrice] = useState("");

  const parse = (v: string) => {
    const n = parseFloat(v.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const c = parse(consumption);
  const p = parse(price);
  const liters = c !== undefined ? (distanceKm * c) / 100 : undefined;
  const cost = liters !== undefined && p !== undefined ? liters * p : undefined;

  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-kiremit">
        <Fuel size={13} /> Yakıt Maliyeti Hesapla
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs font-semibold text-ink/70">
          Tüketim (L/100 km)
          <input
            type="text"
            inputMode="decimal"
            value={consumption}
            onChange={(e) => setConsumption(e.target.value)}
            className="mt-1 w-full rounded-md border border-ink/15 bg-background px-3 py-2 text-sm text-ink focus:border-kiremit focus:outline-none"
          />
        </label>
        <label className="text-xs font-semibold text-ink/70">
          Litre fiyatı (TL)
          <input
            type="text"
            inputMode="decimal"
            value={price}
            placeholder="Güncel fiyatı girin"
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-md border border-ink/15 bg-background px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-kiremit focus:outline-none"
          />
        </label>
      </div>
      <p className="mt-3 text-sm text-ink/80" aria-live="polite">
        {liters === undefined ? (
          "Geçerli bir tüketim değeri girin."
        ) : (
          <>
            Yaklaşık <strong>{liters.toFixed(1).replace(".", ",")} litre</strong> yakıt
            {cost !== undefined ? (
              <>
                , tek yön yaklaşık{" "}
                <strong>{Math.round(cost).toLocaleString("tr-TR")} TL</strong> (gidiş-dönüş{" "}
                {Math.round(cost * 2).toLocaleString("tr-TR")} TL).
              </>
            ) : (
              ". Tutarı görmek için litre fiyatını girin."
            )}
          </>
        )}
      </p>
    </div>
  );
}
