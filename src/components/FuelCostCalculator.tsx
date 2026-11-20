"use client";

import { useState } from "react";
import { Fuel, Gauge, ArrowLeftRight, Users, Coffee, Share2, Check } from "lucide-react";

// "Batman Siirt arası kaç TL?" Google'ın "İnsanlar bunu da sordu" kutusunda
// çıkan sorulardan (2026-09-30 SERP incelemesi). Pompa fiyatı sık değiştiği
// için sayfaya sabit bir TL tutarı yazmıyoruz — kullanıcı güncel litre
// fiyatını kendisi giriyor, sonuç gerçek mesafeden hesaplanıyor. Fiyat
// alanı bilerek boş başlıyor: varsayılan bir fiyat göstermek, eskimiş bir
// rakamı gerçekmiş gibi sunmak olurdu.
// Tek yön / gidiş-dönüş seçimi, kişi başı paylaşım, 2 saatte 15 dk mola planı,
// ortalama hıza göre (80..120 km/sa) sürüş süresi ve WhatsApp/kopyala paylaşımı sunar.
const SPEED_PRESETS = [80, 90, 100, 110, 120] as const;
const PASSENGER_PRESETS = [1, 2, 3, 4, 5] as const;

function formatMin(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  if (h === 0) return `${m} dk`;
  if (m === 0) return `${h} saat`;
  return `${h} sa ${m} dk`;
}

export default function FuelCostCalculator({ distanceKm }: { distanceKm: number }) {
  const [consumption, setConsumption] = useState("7");
  const [price, setPrice] = useState("");
  const [roundTrip, setRoundTrip] = useState(false);
  const [speed, setSpeed] = useState<number>(95);
  const [passengers, setPassengers] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const parse = (v: string) => {
    const n = parseFloat(v.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const c = parse(consumption);
  const p = parse(price);
  const activeDistance = roundTrip ? distanceKm * 2 : distanceKm;
  const liters = c !== undefined ? (activeDistance * c) / 100 : undefined;
  const cost = liters !== undefined && p !== undefined ? liters * p : undefined;
  const perPersonCost = cost !== undefined && passengers > 1 ? cost / passengers : undefined;
  const estMinutes = Math.round((activeDistance / speed) * 60);
  const suggestedBreaks = estMinutes >= 150 ? Math.floor(estMinutes / 120) : 0;
  const totalWithBreaksMin = estMinutes + suggestedBreaks * 15;

  const buildShareText = () => {
    const parts = [
      `Yol Hesabı (${roundTrip ? "Gidiş-Dönüş" : "Tek Yön"}): ${Math.round(activeDistance)} km`,
      `Süre (~${speed} km/sa): ${formatMin(estMinutes)}${suggestedBreaks > 0 ? ` (${suggestedBreaks} mola ile ~${formatMin(totalWithBreaksMin)})` : ""}`,
    ];
    if (liters !== undefined) {
      parts.push(`Yakıt: ~${liters.toFixed(1).replace(".", ",")} L`);
    }
    if (cost !== undefined) {
      parts.push(
        `Toplam Maliyet: ${Math.round(cost).toLocaleString("tr-TR")} TL${perPersonCost !== undefined ? ` (Kişi başı ${Math.round(perPersonCost).toLocaleString("tr-TR")} TL)` : ""}`
      );
    }
    const url = typeof window !== "undefined" ? window.location.href : "";
    return `${parts.join(" | ")}${url ? `\n${url}` : ""}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard permission errors on unsupported contexts
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(buildShareText())}`;

  return (
    <div className="rounded-xl border border-ink/10 bg-paper p-4 sm:p-5 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-kiremit">
          <Fuel size={14} /> Yakıt, Kişi Başı Maliyet ve Süre Planlayıcı
        </div>
        <button
          type="button"
          onClick={() => setRoundTrip((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
            roundTrip
              ? "border-kiremit bg-kiremit text-paper"
              : "border-ink/15 bg-background text-ink/75 hover:border-kiremit hover:text-kiremit"
          }`}
        >
          <ArrowLeftRight size={12} />
          {roundTrip ? `Gidiş-Dönüş (${Math.round(distanceKm * 2)} km)` : `Tek Yön (${Math.round(distanceKm)} km)`}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-ink/70">
          Ortalama Tüketim (L/100 km)
          <input
            type="text"
            inputMode="decimal"
            value={consumption}
            onChange={(e) => setConsumption(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-background px-3 py-2 text-sm text-ink focus:border-kiremit focus:outline-none"
          />
        </label>
        <label className="text-xs font-semibold text-ink/70">
          Güncel Litre Fiyatı (TL)
          <input
            type="text"
            inputMode="decimal"
            value={price}
            placeholder="Örn: 43,50"
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-background px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-kiremit focus:outline-none"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/70">
          <Users size={13} className="text-kiremit" /> Yolcu Sayısı (Maliyet Paylaşımı):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PASSENGER_PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPassengers(n)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                passengers === n
                  ? "border-kiremit bg-kiremit/10 text-kiremit font-bold"
                  : "border-ink/10 bg-background text-ink/70 hover:border-kiremit/40"
              }`}
            >
              {n} Kişi
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-safran/10 px-3.5 py-2.5 text-sm text-ink/85" aria-live="polite">
        {liters === undefined ? (
          "Geçerli bir tüketim değeri girin."
        ) : (
          <>
            <strong>{roundTrip ? "Gidiş-dönüş" : "Tek yön"} ({Math.round(activeDistance)} km):</strong>{" "}
            yaklaşık <strong>{liters.toFixed(1).replace(".", ",")} litre</strong> yakıt
            {cost !== undefined ? (
              <>
                {" "}· toplam maliyet <strong>{Math.round(cost).toLocaleString("tr-TR")} TL</strong>
                {perPersonCost !== undefined && (
                  <>
                    {" "}· kişi başı <strong>{Math.round(perPersonCost).toLocaleString("tr-TR")} TL</strong>
                  </>
                )}
                {!roundTrip && (
                  <span className="text-ink/65">
                    {" "}(gidiş-dönüş {Math.round(cost * 2).toLocaleString("tr-TR")} TL)
                  </span>
                )}
                .
              </>
            ) : (
              <span className="text-ink/65"> — TL ve kişi başı tutarı görmek için litre fiyatını girin.</span>
            )}
          </>
        )}
      </div>

      <div className="border-t border-ink/10 pt-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-ink/70">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-kiremit">
            <Gauge size={13} /> Ortalama Hıza Göre Sürüş Süresi
          </span>
          <span className="font-bold text-ink">
            {speed} km/sa → ~{formatMin(estMinutes)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SPEED_PRESETS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                speed === s
                  ? "border-kiremit bg-kiremit/10 text-kiremit font-bold"
                  : "border-ink/10 bg-background text-ink/70 hover:border-kiremit/40"
              }`}
            >
              {s} km/sa ({formatMin((activeDistance / s) * 60)})
            </button>
          ))}
        </div>
        {suggestedBreaks > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-ink/70 pt-1">
            <Coffee size={13} className="shrink-0 text-kiremit" />
            <span>
              Her 2 saatte 15 dk dinlenme ile <strong>{suggestedBreaks} mola</strong> önerilir (molalı toplam:{" "}
              <strong>~{formatMin(totalWithBreaksMin)}</strong>).
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-3">
        <span className="text-xs text-ink/60">Hesabı yol arkadaşlarınla paylaş:</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-background px-3 py-1 text-xs font-semibold text-ink/80 transition-colors hover:border-kiremit hover:text-kiremit cursor-pointer"
          >
            {copied ? <Check size={12} className="text-kiremit" /> : <Share2 size={12} />}
            {copied ? "Kopyalandı!" : "Özeti Kopyala"}
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-kiremit/30 bg-kiremit/10 px-3 py-1 text-xs font-bold text-kiremit transition-colors hover:bg-kiremit hover:text-paper"
          >
            WhatsApp&apos;ta Paylaş
          </a>
        </div>
      </div>
    </div>
  );
}
