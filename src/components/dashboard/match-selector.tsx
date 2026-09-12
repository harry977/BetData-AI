"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConfidenceBar } from "@/components/confidence-bar";
import type { MatchInsight } from "@/lib/types";
import { cn, formatOdds } from "@/lib/utils";

type MatchSelectorProps = {
  matches: MatchInsight[];
  selectedId: number;
  onSelect: (id: number) => void;
  source?: "mock" | "rapidapi";
};

export function MatchSelector({
  matches,
  selectedId,
  onSelect,
  source,
}: MatchSelectorProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Selector de partidos · Jornada
        </h2>
        <Badge variant={source === "rapidapi" ? "signal" : "muted"}>
          {source === "rapidapi" ? "RapidAPI live" : "Mock API-Football"}
        </Badge>
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {matches.map((match) => {
          const active = match.id === selectedId;
          return (
            <button
              key={match.id}
              type="button"
              onClick={() => onSelect(match.id)}
              className={cn(
                "min-w-[210px] shrink-0 rounded-xl border p-3 text-left transition-colors",
                active
                  ? "border-emerald-500/50 bg-zinc-900 shadow-neon"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700",
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="truncate text-[10px] uppercase tracking-wide text-zinc-400">
                  {match.league.name}
                </span>
                <Badge variant={match.status === "LIVE" ? "live" : "muted"}>
                  {match.status === "LIVE" && match.elapsed
                    ? `${match.elapsed}'`
                    : match.status}
                </Badge>
              </div>
              <p className="text-sm font-semibold leading-snug text-zinc-50">
                {match.home.code} vs {match.away.code}
              </p>
              <p className="mt-1 font-mono text-xs text-emerald-400">
                Cuota valor {formatOdds(match.odds.valueMarket)}
              </p>
              <ConfidenceBar
                className="mt-2"
                value={match.hitRate}
                label="Acierto"
                tone="signal"
              />
            </button>
          );
        })}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {matches.map((match) => (
          <Card
            key={`compact-${match.id}`}
            className={cn(
              "cursor-pointer p-3",
              match.id === selectedId && "border-cyan-500/40",
            )}
            onClick={() => onSelect(match.id)}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-zinc-200">
                {match.home.name} vs {match.away.name}
              </p>
              <span className="font-mono text-[11px] text-emerald-400">
                {formatOdds(match.odds.valueMarket)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              {match.league.name} · {match.bestTip} · {match.hitRate.toFixed(1)}% acierto
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
