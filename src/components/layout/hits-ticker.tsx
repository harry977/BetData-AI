"use client";

import { Badge } from "@/components/ui/badge";
import type { MatchInsight } from "@/lib/types";

type HitsTickerProps = {
  hits: MatchInsight[];
};

export function HitsTicker({ hits }: HitsTickerProps) {
  if (hits.length === 0) return null;

  const loop = [...hits, ...hits];

  return (
    <div className="overflow-hidden border-b border-[#1e2538] bg-[#080b12]">
      <div className="flex w-max animate-ticker">
        {loop.map((match, index) => (
          <div
            key={`${match.id}-${index}`}
            className="flex items-center gap-2 px-3 py-2"
          >
            <Badge variant="won">Acertado</Badge>
            <span className="whitespace-nowrap text-[11px] text-zinc-300">
              {match.home.code} vs {match.away.code}
            </span>
            <span className="whitespace-nowrap text-[11px] font-semibold text-emerald-400">
              {match.bestTip}
            </span>
            <span className="text-[#1e2538]">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
