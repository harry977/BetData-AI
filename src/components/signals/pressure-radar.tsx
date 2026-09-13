"use client";

import { pressureSplit } from "@/lib/stream-widgets";
import type { MatchInsight } from "@/lib/types";
import { cn } from "@/lib/utils";

type PressureRadarProps = {
  match: MatchInsight;
  className?: string;
};

export function PressureRadar({ match, className }: PressureRadarProps) {
  const split = pressureSplit(match);
  const homeHot = split.dominant === "home" && split.hot;
  const awayHot = split.dominant === "away" && split.hot;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 lg:text-xs lg:text-gray-300">
          {split.live ? "Radar de presión · 5 min" : "Radar de presión"}
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neon lg:text-xs">
          {split.dominant === "even"
            ? "Empate técnico"
            : `${split.dominant === "home" ? match.home.code : match.away.code} ${split.pressureIndex}%`}
        </p>
      </div>

      <div
        className="flex h-3 overflow-hidden rounded-full bg-black/70 ring-1 ring-white/10"
        role="img"
        aria-label={`Presión ${match.home.code} ${split.homePct}% contra ${match.away.code} ${split.awayPct}%`}
      >
        <div
          className={cn(
            "relative h-full transition-[width] duration-700 ease-out",
            split.dominant === "home" ? "bg-neon" : "bg-[#1a2200]",
            homeHot && "animate-pressure-ping",
          )}
          style={{ width: `${split.homePct}%` }}
        />
        <div
          className={cn(
            "relative h-full transition-[width] duration-700 ease-out",
            split.dominant === "away" ? "bg-neon" : "bg-slate-600/80",
            awayHot && "animate-pressure-ping",
          )}
          style={{ width: `${split.awayPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.12em] lg:text-xs">
        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            split.dominant === "home" ? "text-neon" : "text-slate-400",
          )}
        >
          {match.home.code} {split.homePct}%
          {homeHot ? (
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-neon" />
          ) : null}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            split.dominant === "away" ? "text-neon" : "text-slate-400",
          )}
        >
          {awayHot ? (
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-neon" />
          ) : null}
          {match.away.code} {split.awayPct}%
        </span>
      </div>
    </div>
  );
}
