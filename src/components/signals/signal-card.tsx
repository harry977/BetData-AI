"use client";

import { TeamCrest } from "@/components/brand/team-crest";
import { Badge } from "@/components/ui/badge";
import { confidenceBand, scoreLine } from "@/lib/signals";
import type { MatchInsight } from "@/lib/types";
import { cn, formatConfidence, isBanker, statusLabel } from "@/lib/utils";

type SignalCardProps = {
  match: MatchInsight;
  active?: boolean;
  compact?: boolean;
  onSelect: (id: number) => void;
  onWhy?: (id: number) => void;
};

export function SignalCard({
  match,
  active = false,
  compact = false,
  onSelect,
  onWhy,
}: SignalCardProps) {
  const high = isBanker(match.confidence);
  const live = match.status === "LIVE" || match.status === "HT";

  return (
    <article
      className={cn(
        "w-full rounded-2xl border text-left",
        active
          ? "border-emerald-400/45 bg-[#121c2e] shadow-neon"
          : "border-[#1e2538] bg-panel",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(match.id)}
        className="w-full px-3.5 pb-3 pt-3.5 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <TeamRow team={match.home} large={!compact} />
            <TeamRow team={match.away} large={!compact} />
          </div>
          <div className="shrink-0 text-right">
            <p
              className={cn(
                "font-mono font-semibold tabular-nums",
                compact ? "text-lg" : "text-2xl",
                live ? "text-zinc-50" : "text-zinc-400",
              )}
            >
              {scoreLine(match)}
            </p>
            <p
              className={cn(
                "mt-1 font-mono text-sm font-semibold",
                live ? "text-red-400" : "text-zinc-500",
              )}
            >
              {statusLabel(match)}
            </p>
          </div>
        </div>

        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          AI Signal
        </p>
        <p
          className={cn(
            "mt-0.5 font-semibold tracking-tight text-emerald-400",
            compact ? "text-xl" : "text-[1.65rem] leading-tight",
          )}
        >
          {match.bestTip}
        </p>

        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-2xl font-semibold text-zinc-50">
              {formatConfidence(match.confidence)}
            </p>
            <p
              className={cn(
                "text-[10px] font-semibold uppercase tracking-[0.14em]",
                high ? "text-emerald-300" : "text-zinc-500",
              )}
            >
              {confidenceBand(match.confidence)}
            </p>
          </div>
          {match.result ? (
            <Badge variant={match.result.won ? "won" : "lost"}>
              {match.result.won ? "Acertado" : "Fallado"}
            </Badge>
          ) : high ? (
            <Badge variant="banker">Banker</Badge>
          ) : null}
        </div>
        <p className="mt-2 truncate text-[11px] text-zinc-500">{match.league.name}</p>
      </button>

      {onWhy ? (
        <div className="border-t border-[#1e2538] px-3.5 py-2">
          <button
            type="button"
            onClick={() => onWhy(match.id)}
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300"
          >
            Why?
          </button>
        </div>
      ) : null}
    </article>
  );
}

function TeamRow({
  team,
  large,
}: {
  team: MatchInsight["home"];
  large: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <TeamCrest team={team} size={large ? 22 : 18} />
      <span
        className={cn(
          "truncate font-semibold uppercase tracking-wide text-zinc-50",
          large ? "text-[15px]" : "text-[13px]",
        )}
      >
        {team.name}
      </span>
    </div>
  );
}
