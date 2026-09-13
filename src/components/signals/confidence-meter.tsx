"use client";

import { bandLabel, rarityLabel } from "@/lib/copy";
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
    band === "HIGH" ? "bg-neon" : band === "MEDIUM" ? "bg-amber-400" : "bg-slate-400";
  const color =
    band === "HIGH" ? "text-neon" : band === "MEDIUM" ? "text-amber-300" : "text-slate-400";

  return (
    <div className={cn("space-y-1.5", compact && "space-y-1")}>
      <p
        className={cn(
          "font-black leading-none tabular-nums",
          compact ? "text-2xl text-white" : "text-3xl text-white lg:text-6xl lg:text-neon lg:drop-shadow-[0_0_22px_rgba(184,255,0,0.72)]",
        )}
      >
        {confidence.toFixed(1)}
        <span
          className={cn(
            "ml-0.5 font-bold",
            compact ? "text-sm text-slate-500" : "text-sm text-slate-500 lg:text-2xl lg:text-gray-300",
          )}
        >
          /10
        </span>
      </p>
      <div
        className={cn(
          "overflow-hidden rounded-full bg-white/10 lg:mx-auto",
          compact ? "h-2" : "h-2 lg:h-3.5 lg:max-w-sm",
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-700", fill)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={cn("text-[11px] font-black uppercase tracking-[0.16em] lg:text-sm", color)}>
        {bandLabel(band)}
      </p>
      {rarity !== "STANDARD" ? (
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
          {rarityLabel(rarity)}
        </p>
      ) : null}
    </div>
  );
}
