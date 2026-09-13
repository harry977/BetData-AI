"use client";

import { battlePair, choosePool } from "@/lib/signals";
import type { MatchInsight } from "@/lib/types";
import { Swords } from "lucide-react";
import { useMemo, useState } from "react";

export function AiBattle({
  matches,
  onChoose,
}: {
  matches: MatchInsight[];
  onChoose: (match: MatchInsight) => void;
}) {
  const pair = useMemo(() => battlePair(matches), [matches]);
  const pool = useMemo(() => choosePool(matches, 3), [matches]);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);

  if (!pair && pool.length === 0) return null;

  function analyze(match: MatchInsight) {
    setAnalyzingId(match.id);
    window.setTimeout(() => {
      setAnalyzingId(null);
      onChoose(match);
    }, 1400);
  }

  return (
    <section className="space-y-3">
      {pair ? (
        <article className="rounded-[24px] border border-white/8 bg-[#121726] p-4">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
            <Swords className="h-3.5 w-3.5" />
            AI Battle
          </p>
          <p className="mt-2 text-sm font-bold text-slate-300">Which signal is stronger?</p>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            {[pair.left, pair.right].map((match, i) => (
              <div key={match.id} className="contents">
                <button
                  type="button"
                  onClick={() => analyze(match)}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left"
                >
                  <p className="text-[11px] font-black uppercase leading-tight text-white">
                    {match.home.code} — {match.away.code}
                  </p>
                  <p className="mt-2 text-2xl font-black tabular-nums text-cyan-300">
                    {match.confidence.toFixed(1)}
                  </p>
                </button>
                {i === 0 ? <p className="text-[10px] font-black text-slate-500">frente a</p> : null}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] font-black uppercase tracking-[0.16em] text-neon">
            Ganador · {pair.winner.home.code} — {pair.winner.away.code}
          </p>
        </article>
      ) : null}

      {pool.length > 0 ? (
        <article className="rounded-[24px] border border-white/8 bg-[#121726] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
            ¿Qué analizamos?
          </p>
          <div className="mt-3 space-y-2">
            {pool.map((match) => (
              <button
                key={match.id}
                type="button"
                onClick={() => analyze(match)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-left"
              >
                <span className="text-[12px] font-black uppercase text-white">
                  {match.home.code} — {match.away.code}
                </span>
                {analyzingId === match.id ? (
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
                    Analyzing…
                  </span>
                ) : (
                  <span className="text-[11px] font-black tabular-nums text-slate-400">
                    {match.confidence.toFixed(1)}
                  </span>
                )}
              </button>
            ))}
          </div>
          {analyzingId ? (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-cyan-400" />
            </div>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
