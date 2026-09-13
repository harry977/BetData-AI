"use client";

import { goalAlert } from "@/lib/stream-widgets";
import type { MatchInsight } from "@/lib/types";
import { cn } from "@/lib/utils";

type GoalAlertProps = {
  match: MatchInsight;
  className?: string;
};

export function GoalAlert({ match, className }: GoalAlertProps) {
  const alert = goalAlert(match);
  if (!alert.show) return null;

  return (
    <div
      role="status"
      className={cn(
        "animate-pulse rounded-2xl border-2 border-orange-300 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 px-3 py-2.5 text-center shadow-[0_0_28px_rgba(255,87,34,0.6)]",
        className,
      )}
    >
      <p className="text-[11px] font-black uppercase leading-snug tracking-[0.06em] text-white drop-shadow lg:text-sm">
        <span className="inline-block animate-bounce">🚨</span> Alerta:
        probabilidad de gol inminente (&gt;85%)
      </p>
    </div>
  );
}
