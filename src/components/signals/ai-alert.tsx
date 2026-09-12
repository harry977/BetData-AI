"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confidenceBand } from "@/lib/signals";
import type { MatchInsight } from "@/lib/types";
import { formatConfidence } from "@/lib/utils";

type AiAlertProps = {
  match: MatchInsight | null;
  onOpen: (id: number) => void;
};

export function AiAlert({ match, onOpen }: AiAlertProps) {
  return (
    <AnimatePresence mode="wait">
      {match ? (
        <motion.section
          key={match.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-3"
        >
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <Zap className="h-3.5 w-3.5" />
            AI Alert
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-zinc-400">
            Nueva señal detectada
          </p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-zinc-50">
            {match.home.code} — {match.away.code}
          </p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <div>
              <p className="text-xl font-semibold text-emerald-400">{match.bestTip}</p>
              <p className="font-mono text-sm text-zinc-200">
                {formatConfidence(match.confidence)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-emerald-300/80">
                {confidenceBand(match.confidence)}
              </p>
            </div>
            <Button size="sm" onClick={() => onOpen(match.id)}>
              Ver análisis
            </Button>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
