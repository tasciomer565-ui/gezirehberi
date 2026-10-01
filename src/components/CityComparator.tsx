"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPinned, UtensilsCrossed, BedDouble } from "lucide-react";
import { getDictionary, Locale } from "@/lib/i18n";

export interface CitySummary {
  slug: string;
  regionSlug: string;
  name: string;
  budget: string;
  bestDuration: string;
  whenToGo: string;
  howToGetThere: string;
  highlights: string[];
  attractionsCount: number;
  restaurantsCount: number;
  accommodationsCount: number;
}

interface CityComparatorProps {
  cities: CitySummary[];
  locale: string;
}

function CitySelect({
  cities,
  value,
  onChange,
  label,
}: {
  cities: CitySummary[];
  value: string;
  onChange: (slug: string) => void;
  label: string;
}) {
  return (
    <div className="flex-1">
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-kiremit">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-kiremit"
      >
        {cities.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CityComparator({ cities, locale }: CityComparatorProps) {
  const dict = getDictionary(locale as Locale);
  const t = dict.city;
  const sorted = [...cities].sort((a, b) => a.name.localeCompare(b.name, "tr"));

  const [slugA, setSlugA] = useState(sorted[0]?.slug ?? "");
  const [slugB, setSlugB] = useState(sorted[1]?.slug ?? "");

  const cityA = sorted.find((c) => c.slug === slugA);
  const cityB = sorted.find((c) => c.slug === slugB);

  const rows: { label: string; render: (c: CitySummary) => React.ReactNode }[] = [
    { label: t.compareBudget, render: (c) => c.budget },
    { label: t.compareBestDuration, render: (c) => c.bestDuration },
    { label: t.compareWhenToGo, render: (c) => c.whenToGo },
    { label: t.compareHowToGetThere, render: (c) => c.howToGetThere },
    {
      label: t.compareAttractions,
      render: (c) => (
        <span className="inline-flex items-center gap-1.5">
          <MapPinned size={14} className="text-kiremit" /> {c.attractionsCount}
        </span>
      ),
    },
    {
      label: t.compareRestaurants,
      render: (c) => (
        <span className="inline-flex items-center gap-1.5">
          <UtensilsCrossed size={14} className="text-kiremit" /> {c.restaurantsCount}
        </span>
      ),
    },
    {
      label: t.compareAccommodations,
      render: (c) => (
        <span className="inline-flex items-center gap-1.5">
          <BedDouble size={14} className="text-kiremit" /> {c.accommodationsCount}
        </span>
      ),
    },
    {
      label: t.compareHighlights,
      render: (c) =>
        c.highlights.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {c.highlights.map((h) => (
              <span key={h} className="rounded-full bg-paper px-2 py-0.5 text-[11px] border border-ink/10 shadow-sm">
                {h}
              </span>
            ))}
          </div>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
        <CitySelect cities={sorted} value={slugA} onChange={setSlugA} label={t.compareSelectFirst} />
        <div className="hidden pb-2.5 text-ink/40 sm:block">
          <ArrowRight size={18} />
        </div>
        <CitySelect cities={sorted} value={slugB} onChange={setSlugB} label={t.compareSelectSecond} />
      </div>

      {cityA && cityB && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-ink/10 shadow-sm">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-ink/[0.03]">
                <th className="w-1/4 p-4 text-left text-xs font-bold uppercase tracking-wider text-ink/50" />
                <th className="p-4 text-left">
                  <Link href={`/${locale}/bolgeler/${cityA.regionSlug}/${cityA.slug}`} className="font-display text-lg italic text-kiremit hover:underline">
                    {cityA.name}
                  </Link>
                </th>
                <th className="p-4 text-left">
                  <Link href={`/${locale}/bolgeler/${cityB.regionSlug}/${cityB.slug}`} className="font-display text-lg italic text-kiremit hover:underline">
                    {cityB.name}
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-paper" : "bg-ink/[0.015]"}>
                  <td className="p-4 text-xs font-bold uppercase tracking-wider text-ink/50">{row.label}</td>
                  <td className="p-4 text-ink/80">{row.render(cityA)}</td>
                  <td className="p-4 text-ink/80">{row.render(cityB)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
