"use client";

import { TeamCrest } from "@/components/brand/team-crest";
import { Badge } from "@/components/ui/badge";
import type { DayBucket, MatchInsight } from "@/lib/types";
import { cn, formatConfidence, formatOdds, isBanker, statusLabel } from "@/lib/utils";

type MatchCardProps = {
  match: MatchInsight;
  day: DayBucket;
  active?: boolean;
  onSelect: (id: number) => void;
};

export function MatchCard({ match, day, active = false, onSelect }: MatchCardProps) {
  const banker = isBanker(match.confidence);

  return (
    <button
      type="button"
      onClick={() => onSelect(match.id)}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-left",
        active
          ? "border-emerald-400/40 bg-[#152033] shadow-neon"
          : "border-[#1e2538] bg-panel",
      )}
    >
      <div className="w-12 shrink-0">
        <Badge variant={match.status === "LIVE" ? "live" : "muted"} className="px-1.5">
          {statusLabel(match)}
        </Badge>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <TeamLine team={match.home} />
        <TeamLine team={match.away} />
        <p className="truncate text-[10px] text-zinc-500">{match.league.name}</p>
      </div>

      <div className="w-[108px] shrink-0 text-right">
        {day === "yesterday" && match.result ? (
          <>
            <Badge variant={match.result.won ? "won" : "lost"}>
              {match.result.won ? "Acertado" : "Fallado"}
            </Badge>
            <p className="mt-1 font-mono text-[11px] text-zinc-300">
              {match.result.finalScore.home}-{match.result.finalScore.away}
            </p>
            <p className="text-[10px] text-zinc-500">{match.bestTip}</p>
          </>
        ) : (
          <>
            <p className="text-[15px] font-semibold leading-tight text-emerald-400">
              {match.bestTip}
            </p>
            <p className="text-[10px] text-zinc-500">{formatOdds(match.odds.valueMarket)}</p>
            <p className="mt-1 font-mono text-sm text-zinc-50">
              {formatConfidence(match.confidence)}
            </p>
            {banker ? (
              <Badge variant="banker" className="mt-1">
                Señal fuerte
              </Badge>
            ) : null}
          </>
        )}
      </div>
    </button>
  );
}

function TeamLine({ team }: { team: MatchInsight["home"] }) {
  return (
    <div className="flex items-center gap-1.5">
      <TeamCrest team={team} size={18} />
      <span className="truncate text-[13px] font-semibold text-zinc-50">{team.name}</span>
    </div>
  );
}
