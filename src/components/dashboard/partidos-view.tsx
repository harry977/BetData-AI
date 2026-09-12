"use client";

import { DayTabs } from "@/components/dashboard/day-tabs";
import { MatchCard } from "@/components/dashboard/match-card";
import { MatchDetail } from "@/components/dashboard/match-detail";
import type { DayBucket, MatchInsight } from "@/lib/types";
import { matchesForDay } from "@/lib/utils";

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
  const visible = matchesForDay(matches, day);
  const selected = visible.find((match) => match.id === selectedId) ?? visible[0] ?? null;

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Partidos</h1>
        <p className="mt-1 text-[13px] text-zinc-400">
          Hoy, mañana y el registro de ayer con Acertado / Fallado.
        </p>
      </div>
      <DayTabs value={day} onChange={onDayChange} />
      {visible.length === 0 ? (
        <p className="rounded-xl border border-[#1e2538] bg-panel p-6 text-center text-sm text-zinc-400">
          No hay pronósticos para esta fecha.
        </p>
      ) : (
        <div className="space-y-2">
          {visible.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              day={day}
              active={match.id === selected?.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
      {selected ? <MatchDetail match={selected} /> : null}
    </div>
  );
}
