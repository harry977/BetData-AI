"use client";

import { explainTip } from "@/lib/tip-copy";
import type { MatchInsight } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SignalCopy({
  match,
  size = "md",
}: {
  match: MatchInsight;
  size?: "sm" | "md" | "lg";
}) {
  const copy = explainTip(match.bestTip, match.home.name, match.away.name);
  return (
    <div className="min-w-0">
      <p
        className={cn(
          "font-black leading-snug text-white",
          size === "lg" && "text-[1.65rem]",
          size === "md" && "text-lg",
          size === "sm" && "text-[13px]",
        )}
      >
        {copy.plain}
      </p>
      <p
        className={cn(
          "mt-1 font-semibold text-emerald-300/90",
          size === "lg" && "text-sm",
          size === "md" && "text-[12px]",
          size === "sm" && "text-[11px]",
        )}
      >
        {copy.market}
      </p>
    </div>
  );
}
