"use client";

import { PressureRadar } from "@/components/signals/pressure-radar";
import type { MatchInsight } from "@/lib/types";
import { cn } from "@/lib/utils";

type HeroLiveStripProps = {
  match: MatchInsight;
  className?: string;
};

export function HeroLiveStrip({ match, className }: HeroLiveStripProps) {
  const { xG, shotsOnTarget } = match.metrics;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-2 gap-2">
        <MiniStat
          label="xG"
          value={`${xG.home.toFixed(2)} – ${xG.away.toFixed(2)}`}
        />
        <MiniStat
          label="Tiros a puerta"
          value={`${shotsOnTarget.home} – ${shotsOnTarget.away}`}
        />
      </div>
      <PressureRadar match={match} />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/25 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 lg:text-xs lg:text-gray-300">
        {label}
      </p>
      <p className="mt-1 text-sm font-black tabular-nums text-white lg:text-lg">
        {value}
      </p>
    </div>
  );
}
