"use client";

import { useState } from "react";
import { Fuel, Gauge, ArrowLeftRight, Users, Coffee, Share2, Check, Zap, AlertCircle } from "lucide-react";

// "Batman Siirt arası kaç TL?" Google'ın "İnsanlar bunu da sordu" kutusunda
// çıkan sorulardan (2026-09-30 SERP incelemesi). Pompa fiyatı ve otoyol
// tarifeleri sık değiştiği için sayfaya sabit veya eski fiyat yazmıyoruz:
// kullanıcı güncel yakıt/kWh fiyatını ve kendi aracının 90 km/sa temel tüketimini
// girer; hız arttıkça artan hava direnci (aerodinamik pay) şeffaf biçimde
// gösterilir ve yalnızca yasal azami hız sınırları üzerinden süre hesaplanır.
type FuelType = "benzin" | "dizel" | "lpg" | "elektrik";

const FUEL_TYPES: Record<FuelType, { label: string; unit: string; defaultConsumption: string; placeholderPrice: string }> = {
  benzin: { label: "Benzin", unit: "L", defaultConsumption: "7", placeholderPrice: "Örn: 43,50" },
  dizel: { label: "Dizel", unit: "L", defaultConsumption: "5.5", placeholderPrice: "Örn: 44,00" },
  lpg: { label: "LPG", unit: "L", defaultConsumption: "8.5", placeholderPrice: "Örn: 25,50" },
  elektrik: { label: "Elektrikli", unit: "kWh", defaultConsumption: "17", placeholderPrice: "Örn: 8,50" },
};

// Karayolları Trafik Yönetmeliği Md. 100 — Otomobil (M1) yasal azami hız sınırları
// ve 90 km/sa temel tüketimine göre yüksek hızdaki yaklaşık aerodinamik artış payı.
const ROAD_SPEEDS = [
  { speed: 90, label: "Çift Yönlü Yol", dragFactor: 1.0, note: "Temel tüketim" },
  { speed: 110, label: "Bölünmüş Yol", dragFactor: 1.12, note: "+%12 hız payı" },
  { speed: 130, label: "KGM Otoyol", dragFactor: 1.25, note: "+%25 hız payı" },
  { speed: 140, label: "YİD Otoyol", dragFactor: 1.33, note: "+%33 hız payı" },
] as const;

const PASSENGER_PRESETS = [1, 2, 3, 4, 5] as const;

function formatMin(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  if (h === 0) return `${m} dk`;
  if (m === 0) return `${h} saat`;
  return `${h} sa ${m} dk`;
}

export default function FuelCostCalculator({
  distanceKm,
  tollHighways = [],
}: {
  distanceKm: number;
  tollHighways?: string[];
}) {
  const [fuelType, setFuelType] = useState<FuelType>("benzin");
  const [consumption, setConsumption] = useState("7");
  const [price, setPrice] = useState("");
  const [roundTrip, setRoundTrip] = useState(false);
  const [selectedRoadIdx, setSelectedRoadIdx] = useState<number>(1); // 110 km/sa Bölünmüş Yol
  const [applySpeedDrag, setApplySpeedDrag] = useState(true);
  const [passengers, setPassengers] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const meta = FUEL_TYPES[fuelType];
  const road = ROAD_SPEEDS[selectedRoadIdx];

  const handleFuelChange = (next: FuelType) => {
    setFuelType(next);
    setConsumption(FUEL_TYPES[next].defaultConsumption);
  };

  const parse = (v: string) => {
    const n = parseFloat(v.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  const baseConsumption = parse(consumption);
  const effectiveConsumption =
    baseConsumption !== undefined ? baseConsumption * (applySpeedDrag ? road.dragFactor : 1) : undefined;
  const p = parse(price);
  const activeDistance = roundTrip ? distanceKm * 2 : distanceKm;
  const totalEnergy = effectiveConsumption !== undefined ? (activeDistance * effectiveConsumption) / 100 : undefined;
  const cost = totalEnergy !== undefined && p !== undefined ? totalEnergy * p : undefined;
  const perPersonCost = cost !== undefined && passengers > 1 ? cost / passengers : undefined;
  const estMinutes = Math.round((activeDistance / road.speed) * 60);
  const suggestedBreaks = estMinutes >= 150 ? Math.floor(estMinutes / 120) : 0;
  const totalWithBreaksMin = estMinutes + suggestedBreaks * 15;

  const buildShareText = () => {
    const parts = [
      `Yol Hesabı (${roundTrip ? "Gidiş-Dönüş" : "Tek Yön"}): ${Math.round(activeDistance)} km`,
      `Hız (${road.label} azami ${road.speed} km/sa): ~${formatMin(estMinutes)}${suggestedBreaks > 0 ? ` (${suggestedBreaks} mola ile ~${formatMin(totalWithBreaksMin)})` : ""}`,
    ];
    if (totalEnergy !== undefined) {
      parts.push(`${meta.label}: ~${totalEnergy.toFixed(1).replace(".", ",")} ${meta.unit}`);
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
      // Ignore clipboard errors in restricted contexts
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(buildShareText())}`;

  return (
    <div className="rounded-xl border border-ink/10 bg-paper p-4 sm:p-5 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-kiremit">
          {fuelType === "elektrik" ? <Zap size={14} /> : <Fuel size={14} />}
          Yakıt, Yasal Hız ve Maliyet Planlayıcı
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

      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(FUEL_TYPES) as FuelType[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleFuelChange(key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              fuelType === key
                ? "border-kiremit bg-kiremit text-paper font-bold"
                : "border-ink/15 bg-background text-ink/75 hover:border-kiremit/50"
            }`}
          >
            {FUEL_TYPES[key].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-ink/70">
          Aracınızın 90 km/sa Tüketimi ({meta.unit}/100 km)
          <input
            type="text"
            inputMode="decimal"
            value={consumption}
            onChange={(e) => setConsumption(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-background px-3 py-2 text-sm text-ink focus:border-kiremit focus:outline-none"
          />
        </label>
        <label className="text-xs font-semibold text-ink/70">
          Güncel {fuelType === "elektrik" ? "kWh Birim Fiyatı" : "Litre Fiyatı"} (TL)
          <input
            type="text"
            inputMode="decimal"
            value={price}
            placeholder={meta.placeholderPrice}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-background px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-kiremit focus:outline-none"
          />
        </label>
      </div>

      <div className="border-t border-ink/10 pt-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-ink/70">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-kiremit">
            <Gauge size={13} /> Yol Tipi (Yasal Azami Hız Sınırı)
          </span>
          <span className="font-bold text-ink">
            {road.speed} km/sa → ~{formatMin(estMinutes)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {ROAD_SPEEDS.map((r, idx) => (
            <button
              key={r.speed}
              type="button"
              onClick={() => setSelectedRoadIdx(idx)}
              className={`rounded-lg border px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                selectedRoadIdx === idx
                  ? "border-kiremit bg-kiremit/10 text-kiremit font-bold"
                  : "border-ink/10 bg-background text-ink/75 hover:border-kiremit/40"
              }`}
            >
              <span className="block font-bold">{r.speed} km/sa</span>
              <span className="block text-[11px] opacity-80">{r.label}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-ink/65">
          <span>
            Süre ve tüketim, seçilen yol tipinin yasal azami hız sınırında kesintisiz sürüş varsayımına göre hesaplanır.
          </span>
          {road.dragFactor > 1 && (
            <label className="inline-flex items-center gap-1.5 font-semibold text-ink/80 cursor-pointer">
              <input
                type="checkbox"
                checked={applySpeedDrag}
                onChange={(e) => setApplySpeedDrag(e.target.checked)}
                className="accent-kiremit"
              />
              Hız artış payı ({road.note})
            </label>
          )}
        </div>
        {suggestedBreaks > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-ink/70">
            <Coffee size={13} className="shrink-0 text-kiremit" />
            <span>
              Her 2 saatte 15 dk dinlenme ile <strong>{suggestedBreaks} mola</strong> önerilir (molalı toplam:{" "}
              <strong>~{formatMin(totalWithBreaksMin)}</strong>).
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-4">
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
        {totalEnergy === undefined || effectiveConsumption === undefined ? (
          "Geçerli bir tüketim değeri girin."
        ) : (
          <>
            <strong>{roundTrip ? "Gidiş-dönüş" : "Tek yön"} ({Math.round(activeDistance)} km, {road.speed} km/sa):</strong>{" "}
            ~{effectiveConsumption.toFixed(1).replace(".", ",")} {meta.unit}/100 km ile yaklaşık{" "}
            <strong>{totalEnergy.toFixed(1).replace(".", ",")} {meta.unit}</strong> {meta.label.toLowerCase()}
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
              <span className="text-ink/65"> — TL ve kişi başı tutarı görmek için birim fiyatı girin.</span>
            )}
          </>
        )}
      </div>

      {tollHighways.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-ink/10 bg-background px-3.5 py-2.5 text-xs text-ink/75">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-kiremit" />
          <div>
            <span className="font-bold text-ink">Ücretli Otoyol / HGS Uyarısı: </span>
            Bu güzergah üzerinde <strong>{tollHighways.join(", ")}</strong> kesimleri yer alabilir. Otoyol ve köprü geçiş tarifeleri dönemsel olarak güncellendiği için yola çıkmadan güncel tutarı{" "}
            <a
              href="https://www.kgm.gov.tr"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-bold text-kiremit hover:underline"
            >
              Karayolları Genel Müdürlüğü (KGM)
            </a>{" "}
            üzerinden kontrol etmeniz önerilir (eski/yanıltıcı olabilecek sabit TL tutarı gösterilmez).
          </div>
        </div>
      )}

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
