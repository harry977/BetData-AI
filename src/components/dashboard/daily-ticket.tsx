"use client";

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBar } from "@/components/confidence-bar";
import type { MatchInsight } from "@/lib/types";
import { formatOdds } from "@/lib/utils";

type DailyTicketProps = {
  matches: MatchInsight[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export function DailyTicket({ matches, selectedId, onSelect }: DailyTicketProps) {
  if (matches.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          Boleto / Selección del Día
        </h2>
        <Badge variant="default">Bankers (+70% acierto)</Badge>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {matches.map((match, index) => {
          const active = match.id === selectedId;
          return (
            <button
              key={match.id}
              type="button"
              onClick={() => onSelect(match.id)}
              className={
                active
                  ? "rounded-xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-zinc-950 p-3 text-left shadow-neon"
                  : "rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 text-left hover:border-zinc-700"
              }
            >
              <p className="mb-1 text-[10px] uppercase tracking-wide text-emerald-300">
                Banker {index + 1}
              </p>
              <p className="text-sm font-semibold leading-snug text-zinc-50">
                {match.home.name} vs {match.away.name}
              </p>
              <p className="mt-1 text-[11px] text-zinc-400">{match.league.name}</p>
              <p className="mt-2 font-semibold text-emerald-400">
                Mejor Tip: {match.bestTip}{" "}
                <span className="font-mono text-xs text-emerald-300/80">
                  {formatOdds(match.odds.valueMarket)}
                </span>
              </p>
              <ConfidenceBar className="mt-2" value={match.confidence} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
