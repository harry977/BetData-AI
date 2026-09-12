"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { AiAlert } from "@/components/signals/ai-alert";
import { AiBattle } from "@/components/signals/ai-battle";
import { AiScan } from "@/components/signals/ai-scan";
import { MissionCard } from "@/components/signals/mission-card";
import { SignalCard } from "@/components/signals/signal-card";
import { StreakBoard } from "@/components/signals/streak-board";
import { WhyPanel } from "@/components/signals/why-panel";
import { Button } from "@/components/ui/button";
import { OFFICIAL_SERVER_URL } from "@/lib/constants";
import { madridYmd } from "@/lib/dates";
import { recordMissionSignal, recordViewedSignal } from "@/lib/storage";
import {
  activeSignals,
  alertPool,
  featuredSignal,
  scanCounts,
  topAiSignals,
} from "@/lib/signals";
import { hapticTap, openExternal } from "@/lib/telegram";
import { isBanker } from "@/lib/utils";
import type { MatchInsight } from "@/lib/types";

type SignalsViewProps = {
  matches: MatchInsight[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

const SCAN_KEY = "betdata_ai_scan_day";

export function SignalsView({ matches, selectedId, onSelect }: SignalsViewProps) {
  const featured = useMemo(
    () => featuredSignal(matches, selectedId),
    [matches, selectedId],
  );
  const others = useMemo(() => {
    const pool = [
      ...activeSignals(matches),
      ...topAiSignals(matches, 6),
    ].filter((match, index, list) => list.findIndex((item) => item.id === match.id) === index);
    return pool.filter((match) => match.id !== featured?.id).slice(0, 5);
  }, [matches, featured]);
  const alerts = useMemo(() => alertPool(matches), [matches]);
  const counts = useMemo(() => scanCounts(matches), [matches]);
  const liveNow = useMemo(() => activeSignals(matches).length > 0, [matches]);
  const [alertIndex, setAlertIndex] = useState(0);
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

  useEffect(() => {
    if (alerts.length < 2) return;
    const timer = window.setInterval(() => {
      setAlertIndex((current) => (current + 1) % alerts.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [alerts.length]);

  function openSignal(id: number) {
    hapticTap();
    recordViewedSignal(id);
    onSelect(id);
  }

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
        <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-rose-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </span>
          Live AI
        </p>
        <h1 className="mt-2 text-[1.7rem] font-black uppercase leading-none tracking-tight text-white">
          {liveNow ? "La IA está analizando ahora" : "La IA está escaneando el día"}
        </h1>
      </header>

      <AiAlert match={alerts[alertIndex] ?? null} onOpen={openSignal} />

      {featured ? (
        <SignalCard match={featured} onWhy={() => openWhy(featured)} />
      ) : (
        <p className="rounded-2xl border border-white/8 bg-[#121726] p-6 text-center text-sm text-slate-400">
          No hay señales disponibles ahora mismo.
        </p>
      )}

      {others.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">
            Otras señales
          </h2>
          {others.map((match) => (
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
      <MissionCard refreshKey={missionKey} />
      <AiBattle matches={matches} onChoose={openWhy} />

      <Button
        size="lg"
        className="w-full"
        onClick={() => {
          hapticTap();
          openExternal(OFFICIAL_SERVER_URL);
        }}
      >
        Ver cuota en el Servidor Oficial
        <ExternalLink className="h-4 w-4" />
      </Button>

      {whyMatch ? (
        <WhyPanel match={whyMatch} onClose={() => setWhyMatch(null)} />
      ) : null}
    </div>
  );
}
