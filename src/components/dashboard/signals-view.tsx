"use client";

import { useEffect, useMemo, useState } from "react";
import { TeamCrest } from "@/components/brand/team-crest";
import { AiScan } from "@/components/signals/ai-scan";
import { MissionCard } from "@/components/signals/mission-card";
import { SignalCard } from "@/components/signals/signal-card";
import { SignalCopy } from "@/components/signals/signal-copy";
import { StreakBoard } from "@/components/signals/streak-board";
import { LivePulse } from "@/components/signals/live-pulse";
import { MatchSheet } from "@/components/signals/match-sheet";
import { ScanningLiveState } from "@/components/signals/scanning-live-state";
import { madridYmd } from "@/lib/dates";
import { recordMissionSignal, recordViewedSignal } from "@/lib/storage";
import { activeSignals, featuredSignal, scanCounts } from "@/lib/signals";
import { hapticTap } from "@/lib/telegram";
import { isBanker, matchesForDay } from "@/lib/utils";
import type { MatchInsight } from "@/lib/types";

type SignalsViewProps = {
  matches: MatchInsight[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onOpenLive: (id: number) => void;
};

const SCAN_KEY = "betdata_ai_scan_day";

export function SignalsView({
  matches,
  selectedId,
  onSelect,
  onOpenLive,
}: SignalsViewProps) {
  const featured = useMemo(
    () => featuredSignal(matches, selectedId),
    [matches, selectedId],
  );
  const liveNow = useMemo(() => activeSignals(matches), [matches]);
  const todayRest = useMemo(() => {
    return matchesForDay(matches, "today")
      .filter((match) => match.id !== featured?.id)
      .filter((match) => match.status === "NS" || match.status === "LIVE" || match.status === "HT")
      .filter((match) => !liveNow.some((live) => live.id === match.id))
      .sort((a, b) => a.kickoffIso.localeCompare(b.kickoffIso));
  }, [matches, featured, liveNow]);
  const tomorrow = useMemo(
    () =>
      matches
        .filter((match) => match.day === "tomorrow" && match.status === "NS")
        .sort((a, b) => a.kickoffIso.localeCompare(b.kickoffIso)),
    [matches],
  );
  const counts = useMemo(() => scanCounts(matches), [matches]);
  const [whyMatch, setWhyMatch] = useState<MatchInsight | null>(null);
  const [missionKey, setMissionKey] = useState(0);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const day = madridYmd();
    try {
      if (window.sessionStorage.getItem(SCAN_KEY) === day) return;
      window.sessionStorage.setItem(SCAN_KEY, day);
      setScanning(true);
    } catch {
      setScanning(true);
    }
  }, []);

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

  if (matches.length === 0) {
    return <ScanningLiveState />;
  }

  return (
    <div className="space-y-5">
      {scanning ? (
        <AiScan
          matches={counts.matches}
          signals={counts.signals}
          onDone={() => setScanning(false)}
        />
      ) : null}

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

      {liveNow.length > 0 ? (
        <section className="space-y-2">
          <button
            type="button"
            onClick={() => onOpenLive(liveNow[0].id)}
            className="flex w-full items-center justify-between rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-left lg:min-h-[5.25rem] lg:px-5 lg:py-5"
          >
            <span>
              <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-rose-300">
            {liveNow.length} EN DIRECTO
          </span>
              <span className="mt-1 block text-sm font-black uppercase text-white">
                {liveNow[0].home.name} {liveNow[0].score.home ?? "–"}–{liveNow[0].score.away ?? "–"} {liveNow[0].away.name}
              </span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-rose-300">
              Ver directo →
            </span>
          </button>
          {liveNow
            .filter((match) => match.id !== featured?.id)
            .slice(0, 8)
            .map((match) => (
            <SignalCard
              key={match.id}
              match={match}
              compact
              onSelect={() => openWhy(match)}
            />
          ))}
        </section>
      ) : null}

      {featured ? <SignalCard match={featured} onWhy={() => openWhy(featured)} /> : null}

      {todayRest.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-300">
            Pendientes de hoy
          </h2>
          {todayRest.map((match) => (
            <SignalCard
              key={match.id}
              match={match}
              compact
              onSelect={() => openWhy(match)}
            />
          ))}
        </section>
      ) : null}

      <StreakBoard matches={matches} />

      {tomorrow.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Próxima jornada
          </h2>
          {tomorrow.map((match) => (
            <button
              key={match.id}
              type="button"
              onClick={() => openWhy(match)}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-[#121726] px-3 py-3 text-left lg:min-h-[5.75rem] lg:gap-4 lg:px-4 lg:py-5"
            >
              <div className="flex -space-x-2">
                <TeamCrest team={match.home} size={24} />
                <TeamCrest team={match.away} size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-black uppercase text-white">
                  {match.home.code} · {match.away.code}
                </p>
                <SignalCopy match={match} size="sm" />
              </div>
            </button>
          ))}
        </section>
      ) : null}

      <MatchSheet match={whyMatch} onClose={() => setWhyMatch(null)} />
    </div>
  );
}
