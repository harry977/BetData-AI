"use client";

import { TeamCrest } from "@/components/brand/team-crest";
import { BetBonusCta } from "@/components/signals/bet-bonus-cta";
import { ConfidenceMeter } from "@/components/signals/confidence-meter";
import { GoalAlert } from "@/components/signals/goal-alert";
import { HeroLiveStrip } from "@/components/signals/hero-live-strip";
import { SignalCopy } from "@/components/signals/signal-copy";
import { signalRarity } from "@/lib/signals";
import { goalAlert } from "@/lib/stream-widgets";
import type { MatchInsight } from "@/lib/types";
import { cn, statusLabel } from "@/lib/utils";
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
  const clock = live ? statusLabel(match) : null;
  const score =
    live && match.score.home != null && match.score.away != null
      ? `${match.score.home}–${match.score.away}`
      : null;

  if (compact) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-[#121726] px-3 py-3 text-left lg:min-h-[5.75rem] lg:gap-4 lg:px-4 lg:py-5"
      >
        <div className="flex -space-x-2">
          <TeamCrest team={match.home} size={28} className="lg:h-11 lg:w-11" />
          <TeamCrest team={match.away} size={28} className="lg:h-11 lg:w-11" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-black uppercase tracking-wide text-slate-400 lg:text-base lg:text-gray-300">
            {match.home.code} · {match.away.code}
            {score ? ` · ${score}` : ""}
            {clock ? ` · ${clock}` : ""}
          </p>
          <div className="mt-0.5 lg:mt-1">
            <SignalCopy match={match} size="sm" />
          </div>
        </div>
        <span className="text-[11px] font-black tabular-nums text-cyan-300 lg:text-xl lg:text-neon">
          {match.confidence.toFixed(1)}
        </span>
      </button>
    );
  }

  const alert = goalAlert(match);

  return (
    <article
      className={cn(
        "rounded-[28px] border bg-[#121726] p-5 transition-shadow duration-500 lg:p-8",
        rarity === "ELITE"
          ? "border-violet-400/35"
          : rarity === "STRONG"
            ? "border-neon/35"
            : "border-white/8",
        alert.show &&
          "border-orange-400/80 shadow-[0_0_32px_rgba(255,87,34,0.28)]",
      )}
    >
      <GoalAlert match={match} className="mb-4 lg:mb-5" />
      <div className="mb-4 flex items-center justify-between lg:mb-8">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-neon lg:text-sm">
          <Zap className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
          Mejor señal de hoy
        </p>
        {clock ? (
          <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-black tabular-nums text-rose-300 lg:px-3 lg:py-1 lg:text-sm">
            {clock}
          </span>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 lg:text-sm lg:text-gray-300">
            {match.status === "NS" ? "Antes del partido" : statusLabel(match)}
          </span>
        )}
      </div>

      <div className="space-y-3 lg:hidden">
        <div className="flex items-center gap-3">
          <TeamCrest team={match.home} size={44} />
          <p className="min-w-0 truncate text-[22px] font-black uppercase leading-none tracking-tight text-white">
            {match.home.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TeamCrest team={match.away} size={44} />
          <p className="min-w-0 truncate text-[22px] font-black uppercase leading-none tracking-tight text-white">
            {match.away.name}
          </p>
        </div>
      </div>

      <div className="hidden items-center justify-center gap-6 lg:flex">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-3 text-center">
          <TeamCrest team={match.home} size={84} className="h-[84px] w-[84px]" />
          <p className="text-2xl font-black uppercase leading-tight tracking-tight text-white">
            {match.home.name}
          </p>
        </div>
        <p className="shrink-0 text-xl font-black text-gray-300">frente a</p>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-3 text-center">
          <TeamCrest team={match.away} size={84} className="h-[84px] w-[84px]" />
          <p className="text-2xl font-black uppercase leading-tight tracking-tight text-white">
            {match.away.name}
          </p>
        </div>
      </div>

      <div className="mt-4 lg:mt-8">
        <SignalCopy match={match} size="lg" hero />
      </div>
      <div className="mt-5 lg:mt-8 lg:text-center">
        <ConfidenceMeter confidence={match.confidence} />
      </div>
      <HeroLiveStrip match={match} className="mt-5 lg:mt-7" />
      <BetBonusCta className="mt-5 lg:mt-8" />
      {onWhy ? (
        <button
          type="button"
          onClick={onWhy}
          className="mt-3 flex w-full items-center justify-end text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300 lg:mt-4 lg:justify-center lg:text-sm"
        >
          Ver ficha →
        </button>
      ) : null}
    </article>
  );
}
