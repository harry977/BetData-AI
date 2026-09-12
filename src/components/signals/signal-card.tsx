"use client";

import { ConfidenceMeter } from "@/components/signals/confidence-meter";
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
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black tabular-nums",
            rarity === "ELITE"
              ? "bg-violet-500/15 text-violet-300"
              : rarity === "STRONG"
                ? "bg-cyan-500/15 text-cyan-300"
                : "bg-white/8 text-slate-300",
          )}
        >
          {match.confidence.toFixed(1)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-black uppercase tracking-wide text-white">
            {match.home.code} · {match.away.code}
          </p>
          <p className="truncate text-[11px] font-semibold text-slate-400">
            {match.bestTip}
            {clock ? ` · ${clock}` : ""}
          </p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
          Why?
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
            ? "border-cyan-400/30"
            : "border-white/8",
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
          <Zap className="h-3.5 w-3.5" />
          AI Signal
        </p>
        {clock ? (
          <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-black tabular-nums text-rose-300">
            {clock}
          </span>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
            {match.status === "NS" ? "Pre-match" : match.status}
          </span>
        )}
      </div>
      <p className="text-[22px] font-black uppercase leading-none tracking-tight text-white">
        {match.home.name}
      </p>
      <p className="mt-2 text-[22px] font-black uppercase leading-none tracking-tight text-white">
        {match.away.name}
      </p>
      <p className="mt-4 text-lg font-black uppercase tracking-wide text-emerald-300">
        {match.bestTip}
      </p>
      <div className="mt-5">
        <ConfidenceMeter confidence={match.confidence} />
      </div>
      {onWhy ? (
        <button
          type="button"
          onClick={onWhy}
          className="mt-5 flex w-full items-center justify-end text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300"
        >
          Why? →
        </button>
      ) : null}
    </article>
  );
}
