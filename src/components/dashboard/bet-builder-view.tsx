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
        <h1 className="text-xl font-semibold text-zinc-50">Bet Builder</h1>
        <p className="mt-1 text-[13px] text-zinc-400">
          Combina Mejor Tips de hoy. Toca un partido para sumarlo al boleto.
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
        Cargar boleto en Servidor Oficial
      </Button>

      <section className="rounded-xl border border-[#1e2538] bg-panel p-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          BetData AI
        </h2>
        <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
          BetData AI es un servicio avanzado de pronósticos de fútbol impulsado por
          inteligencia artificial. Su modelo BD APEX AI analiza y valora partidos de
          más de 700 ligas a nivel global. Cada día se publican selecciones gratuitas
          y boletos automatizados sin necesidad de registros obligatorios. Cada
          pronóstico se verifica con el marcador final real y nuestro historial
          público transparente se remonta a 2021.
        </p>
      </section>
    </div>
  );
}
