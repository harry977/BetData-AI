"use client";

import { Button } from "@/components/ui/button";
import { BONUS_URL, SIGNAL_CTA } from "@/lib/constants";
import { hapticTap, openExternal } from "@/lib/telegram";
import { cn } from "@/lib/utils";

export function BetBonusCta({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      size="lg"
      className={cn(
        "h-12 w-full rounded-2xl text-[15px] font-black shadow-[0_0_24px_rgba(184,255,0,0.35)]",
        className,
      )}
      onClick={(event) => {
        event.stopPropagation();
        hapticTap();
        openExternal(BONUS_URL);
      }}
    >
      {SIGNAL_CTA.label}
    </Button>
  );
}
