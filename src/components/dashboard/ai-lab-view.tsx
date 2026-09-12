"use client";

import { BetBuilderView } from "@/components/dashboard/bet-builder-view";
import type { MatchInsight } from "@/lib/types";

type AiLabViewProps = {
  matches: MatchInsight[];
};

export function AiLabView({ matches }: AiLabViewProps) {
  return (
    <div className="space-y-5">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
          BD APEX AI
        </p>
        <h1 className="mt-1 text-[1.65rem] font-semibold tracking-tight text-zinc-50">
          Motor IA
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
          Combina señales del día. El modelo ya eligió el Mejor Pronóstico de cada
          partido; aquí armas el boleto.
        </p>
      </header>
      <BetBuilderView matches={matches} />
    </div>
  );
}
