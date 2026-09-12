"use client";

import { useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { MatchCard } from "@/components/dashboard/match-card";
import { Button } from "@/components/ui/button";
import { OFFICIAL_SERVER_URL } from "@/lib/constants";
import { hapticTap, openExternal } from "@/lib/telegram";
import type { MatchInsight } from "@/lib/types";
import { formatOdds, matchesForDay } from "@/lib/utils";

type BetBuilderViewProps = {
  matches: MatchInsight[];
};

export function BetBuilderView({ matches }: BetBuilderViewProps) {
  const pool = matchesForDay(matches, "today");
  const [picked, setPicked] = useState<number[]>(() =>
    pool.filter((match) => match.isBanker).slice(0, 2).map((match) => match.id),
  );

  const selected = useMemo(
    () => pool.filter((match) => picked.includes(match.id)),
    [pool, picked],
  );

  const combinedOdds = selected.reduce(
    (total, match) => total * match.odds.valueMarket,
    1,
  );

  function toggle(id: number) {
    hapticTap();
    setPicked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Combina las señales de hoy
        </h2>
        <p className="mt-1 text-[13px] text-zinc-500">
          Toca un partido para meterlo en el boleto. La IA ya eligió el pick.
        </p>
      </div>

      <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3">
        <p className="text-[11px] uppercase tracking-wide text-emerald-300">
          Boleto combinado · {selected.length} selecciones
        </p>
        <p className="mt-1 font-mono text-2xl text-emerald-400">
          {selected.length ? formatOdds(combinedOdds) : "—"}
        </p>
        <div className="mt-2 space-y-1">
          {selected.map((match) => (
            <p key={match.id} className="text-[12px] text-zinc-200">
              {match.home.code} vs {match.away.code} · {match.bestTip}
            </p>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {pool.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            day="today"
            active={picked.includes(match.id)}
            onSelect={toggle}
          />
        ))}
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={selected.length === 0}
        onClick={() => {
          hapticTap();
          openExternal(OFFICIAL_SERVER_URL);
        }}
      >
        <Zap className="h-4 w-4" />
        Ver cuota en el Servidor Oficial
      </Button>
    </div>
  );
}
