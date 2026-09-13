"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { bandLabel } from "@/lib/copy";
import { confidenceBand } from "@/lib/signals";
import { SignalCopy } from "@/components/signals/signal-copy";
import type { MatchInsight } from "@/lib/types";

type AiAlertProps = {
  match: MatchInsight | null;
  onOpen: (id: number) => void;
};

export function AiAlert({ match, onOpen }: AiAlertProps) {
  return (
    <AnimatePresence mode="wait">
      {match ? (
        <motion.button
          key={match.id}
          type="button"
          onClick={() => onOpen(match.id)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full rounded-[24px] border border-neon/25 bg-neon/10 px-4 py-3.5 text-left"
        >
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-neon">
            <Zap className="h-3.5 w-3.5" />
            Señal caliente
          </p>
          <p className="mt-2 text-base font-black uppercase leading-tight text-white">
            {match.home.name}
            <span className="mx-1.5 text-slate-500">vs</span>
            {match.away.name}
          </p>
          <div className="mt-2">
            <SignalCopy match={match} size="sm" />
          </div>
          <p className="mt-1 text-sm font-bold">
            <span className="font-black tabular-nums text-white">
              {match.confidence.toFixed(1)}
            </span>
            <span className="ml-1 text-[10px] font-black uppercase tracking-[0.14em] text-neon">
              {bandLabel(confidenceBand(match.confidence))}
            </span>
          </p>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
