"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { MatchInsight } from "@/lib/types";
import { formatOdds, formatPercent } from "@/lib/utils";

type ValueBetBannerProps = {
  matches: MatchInsight[];
  onSelect: (id: number) => void;
};

export function ValueBetBanner({ matches, onSelect }: ValueBetBannerProps) {
  const pick = matches.find((match) => match.isValueBetOfTheDay) ?? matches[0];
  if (!pick) return null;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(pick.id)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-cyan-500/20 p-4 text-left shadow-neon"
    >
      <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-emerald-400/20 blur-2xl" />
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
        <Sparkles className="h-3.5 w-3.5" />
        BetData Value Bet of the Day
      </p>
      <p className="text-base font-semibold text-zinc-50">
        {pick.home.name} vs {pick.away.name}
      </p>
      <p className="mt-1 text-sm text-zinc-300">
        {pick.bestTip} · {formatOdds(pick.odds.valueMarket)} · acierto{" "}
        {formatPercent(pick.hitRate, 1)}
      </p>
    </motion.button>
  );
}
