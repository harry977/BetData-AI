"use client";

import { explainTip } from "@/lib/tip-copy";
import type { MatchInsight } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SignalCopy({
  match,
  size = "md",
  hero = false,
}: {
  match: MatchInsight;
  size?: "sm" | "md" | "lg";
  hero?: boolean;
}) {
  const copy = explainTip(match.bestTip, match.home.name, match.away.name);
  return (
    <div className={cn("min-w-0", hero && "lg:text-center")}>
      <p
        className={cn(
          "font-black leading-snug text-white",
          size === "lg" && "text-[1.65rem] lg:text-2xl",
          size === "md" && "text-lg",
          size === "sm" && "text-[13px] lg:text-base",
          hero && "lg:text-xl lg:font-semibold lg:text-gray-300",
        )}
      >
        {copy.plain}
      </p>
      <p
        className={cn(
          "mt-1 font-semibold",
          size === "lg" && "text-sm lg:text-xl",
          size === "md" && "text-[12px] lg:text-base",
          size === "sm" && "text-[11px] lg:text-sm",
          hero ? "text-white lg:mt-2 lg:text-4xl lg:font-black lg:leading-tight lg:tracking-tight" : "text-emerald-300/90",
        )}
      >
        {copy.market}
      </p>
    </div>
  );
}
