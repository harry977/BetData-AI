"use client";

import { TeamCrest } from "@/components/brand/team-crest";
import { explainTip } from "@/lib/tip-copy";
import type { MatchInsight } from "@/lib/types";
import { formatKickoffLocal } from "@/lib/dates";
import { cn, isBanker } from "@/lib/utils";

type OptinTipsTableProps = {
  title: string;
  dateLabel: string;
  matches: MatchInsight[];
  resolved?: boolean;
  onEnter: () => void;
};

export function OptinTipsTable({
  title,
  dateLabel,
  matches,
  resolved = false,
  onEnter,
}: OptinTipsTableProps) {
  if (matches.length === 0) return null;

  return (
    <section className="px-4">
      <h2 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-zinc-50">
        {title}
      </h2>
      <p className="mt-1 text-sm text-zinc-500">{dateLabel}</p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#232a42] bg-[#121629]/90">
        <div className="grid grid-cols-[3rem_1fr_minmax(7.5rem,38%)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          <span>Hora</span>
          <span>Partidos</span>
          <span className="text-right">Mejor tip</span>
        </div>
        <ul>
          {matches.map((match) => (
            <li key={match.id} className="border-t border-[#1e2538]">
              <button
                type="button"
                onClick={onEnter}
                className="grid w-full grid-cols-[3rem_1fr_minmax(7.5rem,38%)] items-center px-3 py-2.5 text-left"
              >
                <TimeCell match={match} />
                <TeamsCell match={match} />
                <TipCell match={match} resolved={resolved} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TimeCell({ match }: { match: MatchInsight }) {
  const live = match.status === "LIVE" || match.status === "HT";
  const finished = match.status === "FT" || Boolean(match.result);
  const label = live
    ? match.status === "HT"
      ? "HT"
      : `${match.elapsed ?? ""}'`
    : finished
      ? "FT"
      : formatKickoffLocal(match.kickoffIso);

  return (
    <span
      className={cn(
        "font-mono text-[12px] font-semibold",
        live ? "text-red-400" : "text-zinc-400",
      )}
    >
      {label}
    </span>
  );
}

function TeamsCell({ match }: { match: MatchInsight }) {
  const live = match.status === "LIVE" || match.status === "HT" || match.status === "FT";
  const homeScore = match.result?.finalScore.home ?? match.score.home;
  const awayScore = match.result?.finalScore.away ?? match.score.away;

  return (
    <div className="min-w-0 space-y-1">
      <TeamLine
        team={match.home}
        score={live || match.result ? homeScore : null}
      />
      <TeamLine
        team={match.away}
        score={live || match.result ? awayScore : null}
      />
    </div>
  );
}

function TeamLine({
  team,
  score,
}: {
  team: MatchInsight["home"];
  score: number | null;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <TeamCrest team={team} size={16} />
      <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-100">{team.name}</span>
      {score !== null ? (
        <span className="w-4 text-right font-mono text-[13px] font-semibold text-red-400">
          {score}
        </span>
      ) : null}
    </div>
  );
}

function TipCell({
  match,
  resolved,
}: {
  match: MatchInsight;
  resolved: boolean;
}) {
  const won = match.result?.won;
  const copy = explainTip(match.bestTip, match.home.name, match.away.name);
  return (
    <div className="text-right">
      <p
        className={cn(
          "text-[11px] font-semibold leading-snug",
          resolved && won
            ? "text-neon"
            : resolved && won === false
              ? "text-red-300"
              : "text-zinc-100",
        )}
      >
        {resolved && won ? "✓ " : null}
        {copy.plain}
      </p>
      <p className="mt-0.5 text-[10px] text-neon/90">{copy.market}</p>
      <p className="mt-1 text-[11px]">
        <span className="text-neon/90">{match.odds.valueMarket.toFixed(2)}</span>
        <span
          className={cn(
            "ml-1 font-semibold",
            isBanker(match.confidence) ? "text-neon" : "text-zinc-400",
          )}
        >
          {match.confidence.toFixed(1)}
        </span>
      </p>
    </div>
  );
}
