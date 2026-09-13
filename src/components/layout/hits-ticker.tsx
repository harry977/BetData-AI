"use client";

import { Badge } from "@/components/ui/badge";
import { explainTip } from "@/lib/tip-copy";
import type { MatchInsight } from "@/lib/types";

type HitsTickerProps = {
  hits: MatchInsight[];
};

function tickerBadge(match: MatchInsight) {
  if (match.status === "LIVE" || match.status === "HT") {
    const score = `${match.score.home ?? 0}-${match.score.away ?? 0}`;
    if (match.status === "HT") return `${score} HT`;
    return match.elapsed ? `${score} ${match.elapsed}'` : score;
  }
  if (match.result?.won) return "Acertado";
  return "En vivo";
}

export function HitsTicker({ hits }: HitsTickerProps) {
  if (hits.length === 0) return null;

  const loop = [...hits, ...hits];

  return (
    <div className="overflow-hidden border-b border-[#1e2538] bg-[#080b12]">
      <div className="flex w-max animate-ticker">
        {loop.map((match, index) => {
          const live = match.status === "LIVE" || match.status === "HT";
          return (
            <div
              key={`${match.id}-${index}`}
              className="flex items-center gap-2 px-3 py-2"
            >
              <Badge variant={live ? "live" : "won"}>{tickerBadge(match)}</Badge>
              <span className="whitespace-nowrap text-[11px] text-zinc-300">
                {match.home.code} vs {match.away.code}
              </span>
              <span className="whitespace-nowrap text-[11px] font-semibold text-neon">
                {explainTip(match.bestTip, match.home.name, match.away.name).plain}
              </span>
              <span className="text-[#1e2538]">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
