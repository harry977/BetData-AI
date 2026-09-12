"use client";

import { ConfidenceMeter } from "@/components/signals/confidence-meter";
import { whyMeters } from "@/lib/signals";
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

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70" onClick={onClose}>
      <div
        className="w-full rounded-t-[28px] border-t border-white/10 bg-[#121726] p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300">
          <Brain className="h-4 w-4" />
          Why did AI pick this?
        </p>
        <p className="mt-3 text-lg font-black uppercase leading-tight text-white">
          {match.home.name} · {match.away.name}
        </p>
        <p className="mt-1 text-sm font-bold text-emerald-300">{match.bestTip}</p>
        <div className="mt-5 space-y-3">
          {meters.map((meter) => (
            <MeterRow key={meter.key} label={meter.label} value={meter.value} />
          ))}
        </div>
        <div className="mt-6">
          <ConfidenceMeter confidence={match.confidence} compact />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 h-12 w-full rounded-2xl bg-white text-sm font-black uppercase tracking-[0.18em] text-[#0b0e17]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
