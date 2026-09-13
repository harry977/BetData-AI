"use client";

import { Check, Crosshair } from "lucide-react";
import { todayHitStats } from "@/lib/stream-widgets";
import type { MatchInsight } from "@/lib/types";
import { cn } from "@/lib/utils";

type DailyHitsBadgeProps = {
  matches: MatchInsight[];
  compact?: boolean;
  className?: string;
};

export function DailyHitsBadge({
  matches,
  compact = false,
  className,
}: DailyHitsBadgeProps) {
  const stats = todayHitStats(matches);
  const hot = stats.settled && stats.pct >= 70;

  if (compact) {
    return (
      <div
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-full border border-neon bg-[#121800] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-neon",
          hot && "shadow-[0_0_14px_-2px_rgba(184,255,0,0.55)]",
          className,
        )}
        title={
          stats.settled
            ? `Resultados hoy: ${stats.hits}/${stats.total} aciertos (${stats.pct}% Win Rate)`
            : "Resultados hoy: sin partidos cerrados"
        }
      >
        <Crosshair className={cn("h-3.5 w-3.5", hot && "animate-pulse")} />
        <span className="tabular-nums">
          {stats.settled ? `${stats.hits}/${stats.total} · ${stats.pct}%` : "0/0"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-2xl border border-neon bg-[#121800] px-3 py-2.5 shadow-[0_0_18px_-8px_rgba(184,255,0,0.5)]",
        hot && "animate-[pulseGlow_2.4s_ease-in-out_infinite]",
        className,
      )}
    >
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/70">
        {hot ? (
          <Check className="h-4 w-4 text-neon" strokeWidth={3} />
        ) : (
          <Crosshair className="h-4 w-4 text-neon" />
        )}
        {hot ? (
          <span className="absolute inset-0 animate-ping rounded-full border border-neon/40" />
        ) : null}
      </span>
      <p className="min-w-0 text-[11px] font-black uppercase leading-snug tracking-[0.08em] text-neon lg:text-[13px]">
        {stats.settled
          ? `Resultados hoy: ${stats.hits}/${stats.total} aciertos (${stats.pct}% Win Rate)`
          : "Resultados hoy: 0/0 aciertos · Sin cerrar aún"}
      </p>
    </div>
  );
}
