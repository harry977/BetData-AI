"use client";

import { useEffect, useMemo, useState } from "react";
import { TeamCrest } from "@/components/brand/team-crest";
import { AiScan } from "@/components/signals/ai-scan";
import { MissionCard } from "@/components/signals/mission-card";
import { SignalCard } from "@/components/signals/signal-card";
import { SignalCopy } from "@/components/signals/signal-copy";
import { StreakBoard } from "@/components/signals/streak-board";
import { WhyPanel } from "@/components/signals/why-panel";
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
  const todayRest = useMemo(() => {
    return matchesForDay(matches, "today")
      .filter((match) => match.id !== featured?.id)
      .sort((a, b) => b.confidence - a.confidence);
  }, [matches, featured]);
  const liveNow = useMemo(() => activeSignals(matches), [matches]);
  const tomorrow = useMemo(
    () => matches.filter((match) => match.day === "tomorrow").slice(0, 4),
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
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">
          Jornada de hoy
        </p>
        <h1 className="mt-1 text-[1.7rem] font-black uppercase leading-none tracking-tight text-white">
          La IA ya tiene el partido
        </h1>
      </header>

      <MissionCard refreshKey={missionKey} />

      {liveNow.length > 0 ? (
        <button
          type="button"
          onClick={() => onOpenLive(liveNow[0].id)}
          className="flex w-full items-center justify-between rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-left"
        >
          <span>
            <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-rose-300">
              En juego ahora
            </span>
            <span className="mt-1 block text-sm font-black uppercase text-white">
              {liveNow[0].home.code} — {liveNow[0].away.code}
            </span>
          </span>
          <span className="text-[11px] font-black uppercase tracking-[0.14em] text-rose-300">
            Ver directo →
          </span>
        </button>
      ) : null}

      {featured ? (
        <SignalCard match={featured} onWhy={() => openWhy(featured)} />
      ) : (
        <p className="rounded-2xl border border-white/8 bg-[#121726] p-6 text-center text-sm text-slate-400">
          Hoy todavía no hay señales. La IA sigue escaneando.
        </p>
      )}

      {todayRest.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-300">
            Resto de pronósticos
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
            Mañana
          </h2>
          {tomorrow.map((match) => (
            <div
              key={match.id}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#121726] px-3 py-3"
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
            </div>
          ))}
        </section>
      ) : null}

      {whyMatch ? (
        <WhyPanel match={whyMatch} onClose={() => setWhyMatch(null)} />
      ) : null}
    </div>
  );
}
