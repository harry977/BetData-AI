"use client";

import type { MatchInsight } from "@/lib/types";
import { formatConfidence } from "@/lib/utils";

type TopSignalsProps = {
  matches: MatchInsight[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export function TopSignals({ matches, selectedId, onSelect }: TopSignalsProps) {
  if (matches.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
        🔥 Top AI Signals
      </h2>
      <ol className="space-y-1.5">
        {matches.map((match, index) => {
          const active = match.id === selectedId;
          return (
            <li key={match.id}>
              <button
                type="button"
                onClick={() => onSelect(match.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left ${
                  active
                    ? "border-emerald-400/40 bg-[#152033]"
                    : "border-[#1e2538] bg-panel"
                }`}
              >
                <span className="w-7 font-mono text-sm text-zinc-500">#{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold uppercase text-zinc-50">
                    {match.home.code} — {match.away.code}
                  </span>
                  <span className="text-[12px] font-semibold text-emerald-400">
                    {match.bestTip}
                  </span>
                </span>
                <span className="font-mono text-sm text-emerald-300">
                  {formatConfidence(match.confidence)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
