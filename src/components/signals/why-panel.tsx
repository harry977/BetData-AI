"use client";

import { BetBonusCta } from "@/components/signals/bet-bonus-cta";
import { ConfidenceMeter } from "@/components/signals/confidence-meter";
import { whyMeters } from "@/lib/signals";
import { explainTip } from "@/lib/tip-copy";
import type { MatchInsight } from "@/lib/types";
import { Brain } from "lucide-react";

function MeterRow({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, value * 10));
  return (
    <div>
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function WhyPanel({
  match,
  onClose,
}: {
  match: MatchInsight;
  onClose: () => void;
}) {
  const meters = whyMeters(match);
  const copy = explainTip(match.bestTip, match.home.name, match.away.name);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-black/70 lg:items-center lg:justify-center lg:p-6"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-[28px] border-t border-white/10 bg-[#121726] p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:max-w-lg lg:rounded-[28px] lg:border lg:border-white/10 lg:p-8 lg:pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300">
          <Brain className="h-4 w-4" />
          ¿Por qué lo ha visto la IA?
        </p>
        <p className="mt-3 text-lg font-black uppercase leading-tight text-white">
          {match.home.name} · {match.away.name}
        </p>
        <p className="mt-3 text-lg font-black leading-snug text-white">{copy.plain}</p>
        <p className="mt-1 text-sm font-semibold text-emerald-300">{copy.market}</p>
        <div className="mt-5 space-y-3">
          {meters.map((meter) => (
            <MeterRow key={meter.key} label={meter.label} value={meter.value} />
          ))}
        </div>
        <div className="mt-6">
          <ConfidenceMeter confidence={match.confidence} compact />
        </div>
        <BetBonusCta className="mt-5" />
        <button
          type="button"
          onClick={onClose}
          className="mt-3 h-12 w-full rounded-2xl bg-white text-sm font-black uppercase tracking-[0.16em] text-[#0b0e17]"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
