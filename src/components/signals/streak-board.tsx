"use client";

import { resultBoard } from "@/lib/signals";
import type { MatchInsight } from "@/lib/types";
import { Brain, Flame } from "lucide-react";

export function StreakBoard({ matches }: { matches: MatchInsight[] }) {
  const board = resultBoard(matches);
  const dots = 7;
  const filled = Math.min(dots, board.streak);
  const showMiss = board.lastFailed;

  return (
    <section className="grid grid-cols-2 gap-2">
      <article className="rounded-2xl border border-white/8 bg-[#121726] p-4">
        <p className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
          <Flame className="h-3.5 w-3.5" />
          AI Streak
        </p>
        <p className="mt-2 text-3xl font-black tabular-nums text-white">{board.streak}</p>
        <p className="mt-1 text-[11px] font-semibold text-slate-400">señales acertadas</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Array.from({ length: dots }).map((_, i) => {
            const on = i < filled;
            const miss = showMiss && i === filled;
            return (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${
                  on ? "bg-emerald-400" : miss ? "bg-transparent ring-1 ring-white/30" : "bg-white/15"
                }`}
              />
            );
          })}
        </div>
      </article>
      <article className="rounded-2xl border border-white/8 bg-[#121726] p-4">
        <p className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
          <Brain className="h-3.5 w-3.5" />
          AI Today
        </p>
        <p className="mt-2 text-3xl font-black tabular-nums text-white">
          {board.hits}/{board.total || "–"}
        </p>
        <p className="mt-1 text-[11px] font-semibold text-slate-400">
          {board.total ? `${board.pct}% · ${board.label}` : "Sin resultados aún"}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {board.ticks.slice(0, 10).map((tick, i) => (
            <span
              key={i}
              className={`text-[11px] font-black ${tick === "win" ? "text-emerald-400" : "text-rose-400"}`}
            >
              {tick === "win" ? "✓" : "✕"}
            </span>
          ))}
        </div>
      </article>
    </section>
  );
}
