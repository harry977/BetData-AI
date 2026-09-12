"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConfidenceMeter } from "@/components/signals/confidence-meter";
import { WhyPanel } from "@/components/signals/why-panel";
import { BRAND } from "@/lib/constants";
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

const BEATS = ["LIVE", "MATCH UPDATE", "AI ALERT", "NEW SIGNAL"] as const;

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
  const [beat, setBeat] = useState<(typeof BEATS)[number] | "NEXT MATCH">("LIVE");
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
      setBeat("NEXT MATCH");
      onSelectRef.current(upcoming.id);
    }, 16000);
    return () => window.clearInterval(advance);
  }, [paused, playlist, selectedId]);

  if (!selected) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <p className="text-sm text-slate-400">
          El motor no tiene partidos en monitorización ahora mismo.
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
    <div className="flex h-full min-h-0 flex-col px-4 pb-3 pt-5">
      <header className="text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.32em] text-cyan-300">
          {BRAND.name}
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={beat}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={cn(
              "mt-3 text-sm font-black uppercase tracking-[0.22em]",
              live ? "text-rose-400" : "text-emerald-300",
            )}
          >
            {live ? "● " : ""}
            {beat}
          </motion.p>
        </AnimatePresence>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pt-6">
        <div className="space-y-2">
          <ScoreRow team={selected.home.name} score={selected.score.home} />
          <ScoreRow team={selected.away.name} score={selected.score.away} />
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
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">
            AI Signal
          </p>
          <p className="mt-2 text-4xl font-black uppercase leading-none text-white">
            {selected.bestTip}
          </p>
          <div className="mt-5">
            <ConfidenceMeter confidence={selected.confidence} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setPaused(true);
            setWhyOpen(true);
          }}
          className="mt-6 w-full text-left"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">
            Why?
          </p>
          <p className="mt-3 text-2xl font-black tabular-nums text-white">{shots} shots</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-white">
            {xg.toFixed(2)} xG
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-emerald-300">
            {selected.metrics.offensivePressure}% momentum
          </p>
        </button>

        {next ? (
          <button
            type="button"
            onClick={() => pick(next.id)}
            className="mt-8 w-full border-t border-white/10 pt-5 text-left"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Next signal
            </p>
            <p className="mt-1 text-xl font-black uppercase text-white">
              {next.home.code} — {next.away.code}
            </p>
          </button>
        ) : null}

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {playlist.map((match) => {
            const active = match.id === selected.id;
            return (
              <button
                key={match.id}
                type="button"
                onClick={() => pick(match.id)}
                className={cn(
                  "min-w-[5.5rem] shrink-0 rounded-xl border px-3 py-2 text-left",
                  active
                    ? "border-cyan-400/50 bg-cyan-500/10"
                    : "border-white/10 bg-white/5",
                )}
              >
                <p className="truncate text-[11px] font-black uppercase text-white">
                  {match.home.code}–{match.away.code}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {whyOpen ? (
        <WhyPanel match={selected} onClose={() => setWhyOpen(false)} />
      ) : null}
    </div>
  );
}

function ScoreRow({ team, score }: { team: string; score: number | null }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <p className="min-w-0 truncate text-[28px] font-black uppercase leading-none tracking-tight text-white">
        {team}
      </p>
      <p className="text-5xl font-black tabular-nums leading-none text-white">
        {score ?? "–"}
      </p>
    </div>
  );
}
