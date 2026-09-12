"use client";

import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import { ConfidenceBar } from "@/components/confidence-bar";
import type { MatchInsight } from "@/lib/types";
import { formatOdds } from "@/lib/utils";

type AiAlertCardProps = {
  match: MatchInsight;
};

export function AiAlertCard({ match }: AiAlertCardProps) {
  const { alert } = match;

  return (
    <motion.section
      key={match.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/15 via-zinc-900 to-emerald-500/10 p-4 sm:p-5"
    >
      <div className="pointer-events-none absolute -left-10 top-0 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl" />
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
        <BrainCircuit className="h-3.5 w-3.5" />
        Módulo de alerta · {match.league.name}
      </p>
      <h3 className="text-base font-semibold leading-snug text-zinc-50 sm:text-lg">
        {alert.headline}
      </h3>
      <p className="mt-2 text-sm text-zinc-400">{alert.rationale}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">
            Probabilidad calculada
          </p>
          <p className="font-mono text-2xl text-cyan-300">
            {alert.probability.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">
            Cuota de valor sugerida
          </p>
          <p className="font-mono text-2xl text-emerald-400">
            {formatOdds(alert.valueOdds)}+
          </p>
        </div>
      </div>
      <ConfidenceBar
        className="mt-4"
        value={alert.probability}
        label="Confianza BetData AI"
        tone="signal"
      />
    </motion.section>
  );
}
