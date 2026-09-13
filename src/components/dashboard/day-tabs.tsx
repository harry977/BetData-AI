"use client";

import { cn } from "@/lib/utils";
import type { DayBucket } from "@/lib/types";

const TABS: { id: DayBucket; label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "tomorrow", label: "Mañana" },
  { id: "yesterday", label: "Ayer (Resueltos)" },
];

type DayTabsProps = {
  value: DayBucket;
  onChange: (day: DayBucket) => void;
};

export function DayTabs({ value, onChange }: DayTabsProps) {
  return (
    <div role="tablist" className="grid grid-cols-3 gap-1 rounded-xl bg-[#080b12] p-1">
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
              "rounded-lg px-2 py-2 text-[11px] font-semibold",
              active ? "bg-neon/15 text-neon" : "text-zinc-500",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
