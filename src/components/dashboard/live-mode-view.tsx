"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { TeamCrest } from "@/components/brand/team-crest";
import { BetBonusCta } from "@/components/signals/bet-bonus-cta";
import { ConfidenceMeter } from "@/components/signals/confidence-meter";
import { SignalCopy } from "@/components/signals/signal-copy";
import { WhyPanel } from "@/components/signals/why-panel";
import { livePlaylist } from "@/lib/signals";
import { recordViewedSignal } from "@/lib/storage";
import { hapticTap } from "@/lib/telegram";
import type { MatchInsight } from "@/lib/types";
import { cn, statusLabel } from "@/lib/utils";

type LiveModeViewProps = {
  matches: MatchInsight[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

const BEATS = ["EN DIRECTO", "DATOS EN VIVO", "NUEVA LECTURA", "SEÑAL ACTIVA"] as const;

export function LiveModeView({ matches, selectedId, onSelect }: LiveModeViewProps) {
  const playlist = useMemo(() => livePlaylist(matches), [matches]);
  const selected =
    playlist.find((match) => match.id === selectedId) ?? playlist[0] ?? null;
  const selectedIndex = selected
    ? playlist.findIndex((match) => match.id === selected.id)
    : -1;
  const next =
    playlist.length > 1
      ? playlist[(selectedIndex + 1) % playlist.length]
      : null;
  const [whyOpen, setWhyOpen] = useState(false);
  const [beat, setBeat] = useState<(typeof BEATS)[number] | "SIGUIENTE">("EN DIRECTO");
  const [paused, setPaused] = useState(false);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (selected) recordViewedSignal(selected.id);
  }, [selected]);

  useEffect(() => {
    if (paused || playlist.length === 0) return;
    const rotate = window.setInterval(() => {
      setBeat((current) => {
        const index = BEATS.indexOf(current as (typeof BEATS)[number]);
        return BEATS[(index + 1) % BEATS.length];
      });
    }, 4500);
    return () => window.clearInterval(rotate);
  }, [paused, playlist.length]);

  useEffect(() => {
    if (paused || playlist.length < 2) return;
    const advance = window.setInterval(() => {
      const current =
        playlist.find((match) => match.id === selectedId) ?? playlist[0];
      const index = playlist.findIndex((match) => match.id === current.id);
      const upcoming = playlist[(index + 1) % playlist.length];
      setBeat("SIGUIENTE");
      onSelectRef.current(upcoming.id);
    }, 18000);
    return () => window.clearInterval(advance);
  }, [paused, playlist, selectedId]);

  if (!selected) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-rose-400">
          En directo
        </p>
        <h2 className="mt-3 text-2xl font-black uppercase leading-tight text-white">
          No hay partidos en curso
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Cuando arranque uno, aquí verás marcador, minuto y la señal con datos. Mientras, revisa la próxima jornada en Hoy.
        </p>
      </div>
    );
  }

  const live = selected.status === "LIVE" || selected.status === "HT";
  const shots =
    selected.metrics.shotsOnTarget.home + selected.metrics.shotsOnTarget.away;
  const xg = selected.metrics.xG.home + selected.metrics.xG.away;

  function pick(id: number) {
    hapticTap();
    setPaused(true);
    onSelect(id);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),transparent_42%)] px-4 pb-3 pt-5 lg:min-h-[calc(100dvh-4.5rem)] lg:px-6 lg:pt-8">
      <header className="text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-300">
          BetData IA
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={live ? beat : "upcoming"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={cn(
              "mt-3 text-sm font-black uppercase tracking-[0.2em]",
              live ? "text-rose-400" : "text-emerald-300",
            )}
          >
            {live ? `● ${beat}` : "PRÓXIMA JORNADA"}
          </motion.p>
        </AnimatePresence>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pt-6">
        <div className="space-y-3">
          <ScoreRow team={selected.home} score={selected.score.home} />
          <ScoreRow team={selected.away} score={selected.score.away} />
        </div>
        <p
          className={cn(
            "mt-4 text-center font-black tabular-nums",
            live ? "text-4xl text-rose-400" : "text-2xl text-slate-400",
          )}
        >
          {statusLabel(selected)}
        </p>

        <div className="mt-8 border-y border-white/10 py-6">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">
            Señal de la IA
          </p>
          <div className="mt-3">
            <SignalCopy match={selected} size="lg" />
          </div>
          <div className="mt-5">
            <ConfidenceMeter confidence={selected.confidence} />
          </div>
          <BetBonusCta className="mt-5" />
        </div>

        <button
          type="button"
          onClick={() => {
            setPaused(true);
            setWhyOpen(true);
          }}
          className="mt-6 w-full text-left"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">
            ¿Cómo lo sabe?
          </p>
          <p className="mt-3 text-2xl font-black tabular-nums text-white">{shots} tiros</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-white">
            {xg.toFixed(2)} xG
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-emerald-300">
            {selected.metrics.offensivePressure}% ritmo
          </p>
        </button>

        {next ? (
          <button
            type="button"
            onClick={() => pick(next.id)}
            className="mt-8 w-full border-t border-white/10 pt-5 text-left"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Siguiente
            </p>
            <p className="mt-1 text-xl font-black uppercase text-white">
              {next.home.code} — {next.away.code}
            </p>
          </button>
        ) : null}

        {playlist.length > 1 ? (
          <div className="mt-6 space-y-3 pb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Más partidos en directo
            </p>
            {playlist
              .filter((match) => match.id !== selected.id)
              .map((match) => (
                <div
                  key={match.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:min-h-[5.75rem] lg:p-5"
                >
                  <button
                    type="button"
                    onClick={() => pick(match.id)}
                    className="w-full text-left"
                  >
                    <p className="truncate text-[13px] font-black uppercase text-white">
                      {match.home.name} — {match.away.name}
                    </p>
                    <div className="mt-2">
                      <SignalCopy match={match} size="sm" />
                    </div>
                  </button>
                  <BetBonusCta className="mt-3" />
                </div>
              ))}
          </div>
        ) : null}
      </div>

      {whyOpen ? (
        <WhyPanel match={selected} onClose={() => setWhyOpen(false)} />
      ) : null}
    </div>
  );
}

function ScoreRow({
  team,
  score,
}: {
  team: MatchInsight["home"];
  score: number | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <TeamCrest team={team} size={40} className="lg:h-16 lg:w-16" />
        <p className="min-w-0 truncate text-[22px] font-black uppercase leading-none tracking-tight text-white lg:text-3xl">
          {team.name}
        </p>
      </div>
      <p className="shrink-0 text-5xl font-black tabular-nums leading-none text-white">
        {score ?? "–"}
      </p>
    </div>
  );
}
