"use client";

import { useMemo, useState } from "react";
import { DayTabs } from "@/components/dashboard/day-tabs";
import { MatchCard } from "@/components/dashboard/match-card";
import { MatchDetail } from "@/components/dashboard/match-detail";
import { cn, groupMatchesByLeague, matchesForDay } from "@/lib/utils";
import type { DayBucket, MatchInsight } from "@/lib/types";

type Scope = "all" | "live";

type PartidosViewProps = {
  matches: MatchInsight[];
  day: DayBucket;
  selectedId: number | null;
  onDayChange: (day: DayBucket) => void;
  onSelect: (id: number) => void;
};

export function PartidosView({
  matches,
  day,
  selectedId,
  onDayChange,
  onSelect,
}: PartidosViewProps) {
  const [scope, setScope] = useState<Scope>("all");
  const byDay = matchesForDay(matches, day);
  const visible = useMemo(() => {
    if (scope === "live") {
      return matches.filter((match) => match.status === "LIVE" || match.status === "HT");
    }
    return byDay;
  }, [byDay, matches, scope]);
  const selected = visible.find((match) => match.id === selectedId) ?? visible[0] ?? null;
  const grouped = useMemo(() => groupMatchesByLeague(visible), [visible]);

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-[1.35rem] font-semibold tracking-tight text-zinc-50">
          Partidos
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
          Calendario del día, agrupado por liga. Cada evento lleva su Mejor Pronóstico.
        </p>
      </div>
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-[#080b12] p-1">
        <ScopeTab
          active={scope === "all"}
          label="Todos los Partidos"
          onClick={() => setScope("all")}
        />
        <ScopeTab
          active={scope === "live"}
          label="En directo"
          onClick={() => setScope("live")}
        />
      </div>
      {scope === "all" ? <DayTabs value={day} onChange={onDayChange} /> : null}
      {visible.length === 0 ? (
        <p className="rounded-xl border border-[#1e2538] bg-panel p-6 text-center text-sm text-zinc-400">
          {scope === "live"
            ? "No hay partidos en directo ahora mismo."
            : "No hay pronósticos para esta fecha."}
        </p>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <section key={group.key} className="space-y-2">
              <h2 className="px-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                {group.country} · {group.league}
              </h2>
              {group.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  day={scope === "live" ? match.day : day}
                  active={match.id === selected?.id}
                  onSelect={onSelect}
                />
              ))}
            </section>
          ))}
        </div>
      )}
      {selected ? <MatchDetail match={selected} /> : null}
      <section className="rounded-xl border border-[#1e2538] bg-panel p-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Sobre los Pronósticos de Fútbol
        </h2>
        <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
          En esta página, RadarBet IA ofrece predicciones de fútbol completas para todos
          los partidos de hoy en todas las ligas. Para cada evento, nuestros algoritmos
          de IA eligen un “Mejor Pronóstico” junto con un valor de confianza preciso y
          mercados que incluyen Resultado Final, Más/Menos y Ambos Equipos Marcan. Las
          predicciones avanzadas requieren sincronización de servidor, pero mantenemos
          plena transparencia.
        </p>
      </section>
    </div>
  );
}

function ScopeTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-lg px-2 py-2 text-[11px] font-semibold",
        active ? "bg-neon/15 text-neon" : "text-zinc-500",
      )}
    >
      {label}
    </button>
  );
}
