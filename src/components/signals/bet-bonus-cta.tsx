"use client";

import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BONUS_URL, WELCOME_BONUS } from "@/lib/constants";
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
        <p className="text-center text-[12px] font-semibold leading-snug text-emerald-100/85">
          Apuesta esta señal y activa el bono de bienvenida de hasta{" "}
          {WELCOME_BONUS.amount}
        </p>
      ) : null}
      <Button
        size="lg"
        className="h-12 w-full rounded-2xl text-[15px] font-black shadow-[0_0_24px_rgba(16,185,129,0.35)]"
        onClick={(event) => {
          event.stopPropagation();
          hapticTap();
          openExternal(BONUS_URL);
        }}
      >
        <Gift className="h-4 w-4" />
        Apostar y activar bono {WELCOME_BONUS.amount}
      </Button>
    </div>
  );
}
