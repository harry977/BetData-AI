"use client";

import { useEffect, useMemo, useState } from "react";
import { TeamCrest } from "@/components/brand/team-crest";
import { WhyPanel } from "@/components/signals/why-panel";
import { BRAND } from "@/lib/constants";
import { livePlaylist, scoreLine, supportStats } from "@/lib/signals";
import { recordViewedSignal } from "@/lib/storage";
import { hapticTap } from "@/lib/telegram";
import type { MatchInsight } from "@/lib/types";
import { cn, formatConfidence, statusLabel } from "@/lib/utils";

type LiveModeViewProps = {
  matches: MatchInsight[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

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
  const [whyOpen, setWhyOpen] = useState(true);

  useEffect(() => {
    if (selected) recordViewedSignal(selected.id);
  }, [selected]);

  if (!selected) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <p className="text-sm text-zinc-500">
          El motor no tiene partidos en monitorización ahora mismo.
        </p>
      </div>
    );
  }

  const live = selected.status === "LIVE" || selected.status === "HT";
  const stats = supportStats(selected);

  function pick(id: number) {
    hapticTap();
    onSelect(id);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="px-4 pb-2 pt-4 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-400">
          {BRAND.name}
        </p>
        <h1 className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Football Intelligence
        </h1>
        <p
          className={cn(
            "mt-3 inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
            live
              ? "border-red-500/40 bg-red-500/10 text-red-300"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
          )}
        >
          {live ? "● Live Mode" : "Monitor"}
        </p>
      </header>

      <div className="-mx-0 flex gap-2 overflow-x-auto px-4 pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {playlist.map((match) => {
          const active = match.id === selected.id;
          return (
            <button
              key={match.id}
              type="button"
              onClick={() => pick(match.id)}
              className={cn(
                "min-w-[7.5rem] shrink-0 rounded-xl border px-3 py-2.5 text-left",
                active
                  ? "border-emerald-400/50 bg-emerald-500/10"
                  : "border-[#1e2538] bg-[#0d121f]",
              )}
            >
              <p className="truncate text-[11px] font-semibold uppercase text-zinc-200">
                {match.home.code}–{match.away.code}
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-400">{match.bestTip}</p>
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            {selected.league.name}
          </p>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <TeamBlock team={selected.home} align="right" />
            <div className="px-1">
              <p className="font-mono text-5xl font-semibold tabular-nums leading-none text-zinc-50">
                {scoreLine(selected)}
              </p>
              <p
                className={cn(
                  "mt-2 font-mono text-xl font-semibold",
                  live ? "text-red-400" : "text-zinc-500",
                )}
              >
                {statusLabel(selected)}
              </p>
            </div>
            <TeamBlock team={selected.away} align="left" />
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            AI Signal
          </p>
          <p className="mt-1 text-4xl font-semibold leading-tight tracking-tight text-emerald-400">
            {selected.bestTip}
          </p>
          <p className="mt-3 font-mono text-4xl font-semibold text-zinc-50">
            {formatConfidence(selected.confidence)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setWhyOpen((open) => !open)}
          className="mx-auto mt-4 block text-[12px] font-semibold uppercase tracking-[0.18em] text-cyan-300"
        >
          Why?
        </button>

        {whyOpen ? (
          <div className="mt-3">
            <WhyPanel match={selected} />
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#1e2538] bg-[#0d121f] px-3 py-3"
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                {stat.label}
              </p>
              <p className="mt-1 font-mono text-xl text-cyan-300">{stat.value}</p>
            </div>
          ))}
        </div>

        {next ? (
          <button
            type="button"
            onClick={() => pick(next.id)}
            className="mt-4 w-full rounded-2xl border border-[#1e2538] bg-[#0d121f] px-4 py-3 text-left"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Next signal
            </p>
            <p className="mt-1 text-sm font-semibold uppercase text-zinc-100">
              {next.home.code} — {next.away.code}
            </p>
            <p className="text-emerald-400">
              {next.bestTip} · {formatConfidence(next.confidence)}
            </p>
          </button>
        ) : null}
      </div>
    </div>
  );
}

function TeamBlock({
  team,
  align,
}: {
  team: MatchInsight["home"];
  align: "left" | "right";
}) {
  return (
    <div className={cn("flex min-w-0 flex-col items-center gap-2", align === "right" ? "pr-1" : "pl-1")}>
      <TeamCrest team={team} size={42} />
      <p className="w-full truncate text-center text-[12px] font-semibold uppercase leading-tight text-zinc-100">
        {team.name}
      </p>
    </div>
  );
}
