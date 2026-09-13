"use client";

import { useState } from "react";
import { MissionCard } from "@/components/signals/mission-card";
import { SignalCard } from "@/components/signals/signal-card";
import { LivePulse } from "@/components/signals/live-pulse";
import { MatchSheet } from "@/components/signals/match-sheet";
import { madridYmd } from "@/lib/dates";
import { recordMissionSignal, recordViewedSignal } from "@/lib/storage";
import { hapticTap } from "@/lib/telegram";
import { isBanker } from "@/lib/utils";
import type { MatchInsight } from "@/lib/types";

type SignalsViewProps = {
  matches: MatchInsight[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onOpenLive: (id: number) => void;
};

export function SignalsView({
  matches,
  selectedId,
  onSelect,
  onOpenLive,
}: SignalsViewProps) {
  const rawMatches = matches;
  const [whyMatch, setWhyMatch] = useState<MatchInsight | null>(null);
  const [missionKey, setMissionKey] = useState(0);

  function openWhy(match: MatchInsight) {
    hapticTap();
    recordViewedSignal(match.id);
    onSelect(match.id);
    if (isBanker(match.confidence)) {
      recordMissionSignal(madridYmd(), match.id);
      setMissionKey((key) => key + 1);
    }
    setWhyMatch(match);
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-neon">
          <LivePulse />
          Datos en vivo
        </p>
        <h1 className="mt-1 text-[1.55rem] font-black uppercase leading-none tracking-tight text-white">
          En curso y próxima jornada
        </h1>
      </header>

      <MissionCard refreshKey={missionKey} />

      {rawMatches.length > 0 ? (
        <button
          type="button"
          onClick={() => onOpenLive(rawMatches[0].id)}
          className="flex w-full items-center justify-between rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-left lg:min-h-[5.25rem] lg:px-5 lg:py-5"
        >
          <span>
            <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-rose-300">
              {rawMatches.length} PARTIDOS EN EL FEED
            </span>
            <span className="mt-1 block text-sm font-black uppercase text-white">
              {rawMatches[0].home.name} {rawMatches[0].score.home ?? "–"}–{rawMatches[0].score.away ?? "–"}{" "}
              {rawMatches[0].away.name}
            </span>
          </span>
          <span className="text-[11px] font-black uppercase tracking-[0.14em] text-rose-300">
            Ver directo →
          </span>
        </button>
      ) : null}

      {rawMatches.length > 0 ? (
        <section className="space-y-2">
          {rawMatches.map((match, index) => (
            <SignalCard
              key={`${match.id}-${index}`}
              match={match}
              compact={match.id !== selectedId}
              onSelect={() => openWhy(match)}
              onWhy={match.id === selectedId ? () => openWhy(match) : undefined}
            />
          ))}
        </section>
      ) : (
        <p className="text-sm text-slate-500">No hay partidos en el feed ahora.</p>
      )}

      <MatchSheet match={whyMatch} onClose={() => setWhyMatch(null)} />
    </div>
  );
}
