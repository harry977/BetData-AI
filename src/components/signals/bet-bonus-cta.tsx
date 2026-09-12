"use client";

import { ExternalLink, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BONUS_URL, SIGNAL_CTA } from "@/lib/constants";
import { hapticTap, openExternal } from "@/lib/telegram";
import { cn } from "@/lib/utils";

export function BetBonusCta({
  className,
  hint = true,
}: {
  className?: string;
  hint?: boolean;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {hint ? (
        <p className="px-1 text-center text-[11px] font-semibold leading-snug text-emerald-100/85">
          {SIGNAL_CTA.hint}
        </p>
      ) : null}
      <Button
        size="lg"
        className="h-auto min-h-12 w-full whitespace-normal rounded-2xl px-3 py-2.5 text-[13px] font-black leading-tight shadow-[0_0_24px_rgba(16,185,129,0.35)]"
        onClick={(event) => {
          event.stopPropagation();
          hapticTap();
          openExternal(BONUS_URL);
        }}
      >
        <Rocket className="h-4 w-4 shrink-0" />
        <span className="max-w-[14rem] text-center">{SIGNAL_CTA.label}</span>
        <ExternalLink className="h-4 w-4 shrink-0" />
      </Button>
    </div>
  );
}
