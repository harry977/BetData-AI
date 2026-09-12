"use client";

import { cn } from "@/lib/utils";
import type { DayBucket } from "@/lib/types";

const TABS: { id: DayBucket; label: string }[] = [
  { id: "today", label: "Pronósticos Gratis de Hoy" },
  { id: "tomorrow", label: "Pronósticos de Mañana" },
  { id: "yesterday", label: "Pronósticos de Ayer (Resueltos)" },
];

type DayTabsProps = {
  value: DayBucket;
  onChange: (day: DayBucket) => void;
};

export function DayTabs({ value, onChange }: DayTabsProps) {
  return (
    <div
      role="tablist"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                : "border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
