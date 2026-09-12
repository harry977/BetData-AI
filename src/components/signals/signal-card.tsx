"use client";

import { TeamCrest } from "@/components/brand/team-crest";
import { BetBonusCta } from "@/components/signals/bet-bonus-cta";
import { ConfidenceMeter } from "@/components/signals/confidence-meter";
import { SignalCopy } from "@/components/signals/signal-copy";
import { signalRarity } from "@/lib/signals";
import type { MatchInsight } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

export function SignalCard({
  match,
  onWhy,
  onSelect,
  compact = false,
}: {
  match: MatchInsight;
  onWhy?: () => void;
  onSelect?: () => void;
  compact?: boolean;
}) {
  const live = match.status === "LIVE" || match.status === "HT";
  const rarity = signalRarity(match.confidence);
  const clock = live && match.elapsed != null ? `${match.elapsed}'` : null;

  if (compact) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-[#121726] px-3 py-3 text-left"
      >
        <div className="flex -space-x-2">
          <TeamCrest team={match.home} size={28} />
          <TeamCrest team={match.away} size={28} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-black uppercase tracking-wide text-slate-400">
            {match.home.code} · {match.away.code}
            {clock ? ` · ${clock}` : ""}
          </p>
          <div className="mt-0.5">
            <SignalCopy match={match} size="sm" />
          </div>
        </div>
        <span className="text-[11px] font-black tabular-nums text-cyan-300">
          {match.confidence.toFixed(1)}
        </span>
      </button>
    );
  }

  return (
    <article
      className={cn(
        "rounded-[28px] border bg-[#121726] p-5",
        rarity === "ELITE"
          ? "border-violet-400/35"
          : rarity === "STRONG"
            ? "border-emerald-400/35"
            : "border-white/8",
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
          <Zap className="h-3.5 w-3.5" />
          Mejor señal de hoy
        </p>
        {clock ? (
          <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-black tabular-nums text-rose-300">
            {clock}
          </span>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
            {match.status === "NS" ? "Antes del partido" : match.status}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <TeamCrest team={match.home} size={44} />
        <p className="min-w-0 truncate text-[22px] font-black uppercase leading-none tracking-tight text-white">
          {match.home.name}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <TeamCrest team={match.away} size={44} />
        <p className="min-w-0 truncate text-[22px] font-black uppercase leading-none tracking-tight text-white">
          {match.away.name}
        </p>
      </div>
      <div className="mt-4">
        <SignalCopy match={match} size="lg" />
      </div>
      <div className="mt-5">
        <ConfidenceMeter confidence={match.confidence} />
      </div>
      <BetBonusCta className="mt-5" />
      {onWhy ? (
        <button
          type="button"
          onClick={onWhy}
          className="mt-3 flex w-full items-center justify-end text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300"
        >
          ¿Por qué? →
        </button>
      ) : null}
    </article>
  );
}
