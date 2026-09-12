"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { MatchDetail } from "@/components/dashboard/match-detail";
import { AiAlert } from "@/components/signals/ai-alert";
import { SignalCard } from "@/components/signals/signal-card";
import { TopSignals } from "@/components/signals/top-signals";
import { WhyPanel } from "@/components/signals/why-panel";
import { Button } from "@/components/ui/button";
import { OFFICIAL_SERVER_URL } from "@/lib/constants";
import { recordViewedSignal } from "@/lib/storage";
import {
  activeSignals,
  alertPool,
  resolvedSignals,
  supportStats,
  topAiSignals,
  upcomingSignals,
} from "@/lib/signals";
import { hapticTap, openExternal } from "@/lib/telegram";
import type { MatchInsight } from "@/lib/types";

type SignalsViewProps = {
  matches: MatchInsight[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export function SignalsView({ matches, selectedId, onSelect }: SignalsViewProps) {
  const top = useMemo(() => topAiSignals(matches, 3), [matches]);
  const live = useMemo(() => activeSignals(matches).slice(0, 4), [matches]);
  const upcoming = useMemo(() => upcomingSignals(matches).slice(0, 4), [matches]);
  const resolved = useMemo(() => resolvedSignals(matches).slice(0, 4), [matches]);
  const alerts = useMemo(() => alertPool(matches), [matches]);
  const [alertIndex, setAlertIndex] = useState(0);
  const [whyOpen, setWhyOpen] = useState(true);
  const [chartsOpen, setChartsOpen] = useState(false);

  useEffect(() => {
    if (alerts.length < 2) return;
    const timer = window.setInterval(() => {
      setAlertIndex((current) => (current + 1) % alerts.length);
    }, 9000);
    return () => window.clearInterval(timer);
  }, [alerts.length]);

  const selected =
    matches.find((match) => match.id === selectedId) ?? top[0] ?? matches[0] ?? null;

  function openSignal(id: number) {
    hapticTap();
    recordViewedSignal(id);
    onSelect(id);
    setWhyOpen(true);
    setChartsOpen(true);
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Football Intelligence
        </p>
        <h1 className="mt-1 text-[1.65rem] font-semibold tracking-tight text-zinc-50">
          Señales IA
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
          BD APEX AI monitoriza el día y destaca las señales con más confianza.
        </p>
      </header>

      <AiAlert match={alerts[alertIndex] ?? null} onOpen={openSignal} />

      <TopSignals matches={top} selectedId={selected?.id ?? null} onSelect={openSignal} />

      {selected ? (
        <div className="space-y-3">
          <SignalCard
            match={selected}
            active
            onSelect={openSignal}
            onWhy={() => {
              recordViewedSignal(selected.id);
              setWhyOpen((open) => !open);
            }}
          />
          {whyOpen ? <WhyPanel match={selected} /> : null}
          <div className="grid grid-cols-2 gap-2">
            {supportStats(selected).map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[#1e2538] bg-[#0d121f] px-3 py-2.5"
              >
                <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                  {stat.label}
                </p>
                <p className="mt-0.5 font-mono text-lg text-cyan-300">{stat.value}</p>
              </div>
            ))}
          </div>
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
          <button
            type="button"
            onClick={() => setChartsOpen((open) => !open)}
            className="w-full text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500"
          >
            {chartsOpen ? "Ocultar gráficas" : "Análisis visual"}
          </button>
          {chartsOpen ? <MatchDetail match={selected} /> : null}
        </div>
      ) : (
        <p className="rounded-2xl border border-[#1e2538] bg-panel p-6 text-center text-sm text-zinc-500">
          No hay señales disponibles ahora mismo.
        </p>
      )}

      {live.length > 0 ? (
        <SignalRail
          title="Señales activas"
          matches={live}
          selectedId={selected?.id ?? null}
          onSelect={openSignal}
        />
      ) : null}

      {upcoming.length > 0 ? (
        <SignalRail
          title="Próximos"
          matches={upcoming}
          selectedId={selected?.id ?? null}
          onSelect={openSignal}
        />
      ) : null}

      {resolved.length > 0 ? (
        <SignalRail
          title="Resultados anteriores"
          matches={resolved}
          selectedId={selected?.id ?? null}
          onSelect={openSignal}
        />
      ) : null}
    </div>
  );
}

function SignalRail({
  title,
  matches,
  selectedId,
  onSelect,
}: {
  title: string;
  matches: MatchInsight[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {title}
      </h2>
      <div className="space-y-2">
        {matches.map((match) => (
          <SignalCard
            key={match.id}
            match={match}
            compact
            active={match.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
