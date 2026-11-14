"use client";

import { useEffect, useState } from "react";
import { Thermometer, Wind, Droplets, Sun, CloudSun, Cloud, CloudFog, CloudRain, CloudSnow, CloudDrizzle, CloudLightning } from "lucide-react";
import { fetchWeather, type WeatherData, type WeatherIcon } from "@/lib/weather";
import { withLocative } from "@/lib/turkish";

// Anlık durum + 7 günlük tahmin (2026-11-02). Veri MET Norway'den, ziyaretçinin
// tarayıcısında çekilir (2026-11-15: sunucuda saatlik ISR, Vercel Hobby
// limitlerini aşıp siteyi durdurdu). Çekilemezse bölüm hiç gösterilmez.
const ICONS: Record<WeatherIcon, typeof Sun> = {
  sun: Sun,
  partly: CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  snow: CloudSnow,
  sleet: CloudDrizzle,
  thunder: CloudLightning,
};
const dateFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long" });
const timeFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit" });

export default function CityWeather({ city }: { city: { name: string; location: { lat: number; lng: number } } }) {
  const [w, setW] = useState<WeatherData | null>(null);
  const { lat, lng } = city.location;
  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    fetchWeather(lat, lng, ctrl.signal).then((d) => {
      if (!ctrl.signal.aborted) setW(d);
    });
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [lat, lng]);
  if (!w) return null;
  const updated = new Date(w.updatedAt);
  const updatedText = Number.isNaN(updated.getTime()) ? "" : `${dateFmt.format(updated)} ${timeFmt.format(updated)}`;

  return (
    <section className="mt-16 border-t border-ink/10 pt-16" id="hava-durumu">
      <h2 className="mb-2 font-display text-3xl italic text-ink">{city.name} Hava Durumu: Şu An ve 7 Günlük Tahmin</h2>
      <p className="mb-6 max-w-3xl text-sm leading-relaxed text-ink/70">
        {`${withLocative(city.name)} şu an hava ${w.now.label ? w.now.label.toLowerCase() + " ve " : ""}${w.now.temp}°C. Aşağıda önümüzdeki ${w.days.length} günün en düşük ve en yüksek sıcaklıkları var. Gezi planı yapmadan önce güncel tahmini kontrol etmek, giyim ve rota seçimini kolaylaştırır.`}
      </p>

      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs"><Thermometer size={12} /> Sıcaklık</div>
          <div className="mt-1 text-lg font-bold text-ink sm:text-2xl">{w.now.temp}°C</div>
          {w.now.label && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-ink/65">
              {(() => { const I = ICONS[w.now.icon]; return <I size={14} className="shrink-0 text-kiremit" aria-hidden="true" />; })()}
              {w.now.label}
            </div>
          )}
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs"><Wind size={12} /> Rüzgar</div>
          <div className="mt-1 text-lg font-bold text-ink sm:text-2xl">{w.now.wind} km/sa</div>
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:p-4">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-kiremit sm:text-xs"><Droplets size={12} /> Nem</div>
          <div className="mt-1 text-lg font-bold text-ink sm:text-2xl">%{w.now.humidity}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink/10 bg-paper shadow-sm">
        <table className="w-full min-w-[340px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs font-bold uppercase tracking-wider text-ink/65">
              <th className="px-4 py-3">Gün</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 text-right">En düşük</th>
              <th className="px-4 py-3 text-right">En yüksek</th>
            </tr>
          </thead>
          <tbody>
            {w.days.map((d) => (
              <tr key={d.date} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-2.5 font-semibold text-ink/85">
                  {d.weekday} <span className="text-xs font-normal text-ink/55">{dateFmt.format(new Date(`${d.date}T12:00:00+03:00`))}</span>
                </td>
                <td className="px-4 py-2.5 text-ink/75">
                  <span className="inline-flex items-center gap-1.5">
                    {(() => { const I = ICONS[d.icon]; return <I size={16} className="shrink-0 text-kiremit" aria-hidden="true" />; })()}
                    {d.label || "—"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-ink/75">{d.min}°C</td>
                <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">{d.max}°C</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink/55">
        {`${updatedText ? `Son güncelleme: ${updatedText} (Türkiye saati). ` : ""}Veri: `}
        <a href="https://www.met.no/en" target="_blank" rel="noopener noreferrer" className="underline hover:text-kiremit">MET Norway</a>
        {" (CC BY 4.0). Tahmindir; resmî uyarılar ve ayrıntılı bilgi için "}
        <a href="https://www.mgm.gov.tr" target="_blank" rel="noopener noreferrer nofollow" className="underline hover:text-kiremit">Meteoroloji Genel Müdürlüğü</a>
        {"'ne bakın. İlk gün, günün kalan saatlerini kapsar."}
      </p>
    </section>
  );
}
