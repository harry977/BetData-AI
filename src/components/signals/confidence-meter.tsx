"use client";

import { confidenceBand, signalRarity } from "@/lib/signals";
import { cn } from "@/lib/utils";

export function ConfidenceMeter({
  confidence,
  compact = false,
}: {
  confidence: number;
  compact?: boolean;
}) {
  const band = confidenceBand(confidence);
  const rarity = signalRarity(confidence);
  const pct = Math.min(100, Math.max(0, (confidence / 10) * 100));

  const fill =
    band === "HIGH"
      ? "bg-emerald-400"
      : band === "MEDIUM"
        ? "bg-amber-400"
        : "bg-slate-400";
  const label =
    band === "HIGH"
      ? "HIGH CONFIDENCE"
      : band === "MEDIUM"
        ? "MEDIUM CONFIDENCE"
        : "LOW CONFIDENCE";
  const color =
    band === "HIGH"
      ? "text-emerald-300"
      : band === "MEDIUM"
        ? "text-amber-300"
        : "text-slate-400";

  return (
    <div className={cn("space-y-1.5", compact && "space-y-1")}>
      <div className="flex items-end justify-between gap-3">
        <p className={cn("font-black leading-none tabular-nums text-white", compact ? "text-2xl" : "text-3xl")}>
          {confidence.toFixed(1)}
          <span className="ml-0.5 text-sm font-bold text-slate-500">/10</span>
        </p>
        <p className={cn("text-[10px] font-black uppercase tracking-[0.18em]", color)}>
          {label}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all duration-700", fill)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {rarity === "ELITE" ? (
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">
          Elite signal
        </p>
      ) : rarity === "STRONG" ? (
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
          Strong signal
        </p>
      ) : null}
    </div>
  );
}
