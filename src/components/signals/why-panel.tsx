"use client";

import { Activity, BarChart3, Brain, Shield } from "lucide-react";
import { whyItems } from "@/lib/signals";
import type { MatchInsight } from "@/lib/types";

const ICONS = {
  form: Shield,
  stats: BarChart3,
  momentum: Activity,
  confidence: Brain,
  lineups: Shield,
} as const;

type WhyPanelProps = {
  match: MatchInsight;
};

export function WhyPanel({ match }: WhyPanelProps) {
  const items = whyItems(match);

  return (
    <section className="rounded-2xl border border-[#1e2538] bg-panel p-3.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
        Why this signal?
      </h3>
      <ul className="mt-3 space-y-3">
        {items.map((item) => {
          const Icon = ICONS[item.key as keyof typeof ICONS] ?? Brain;
          return (
            <li key={item.key} className="flex gap-3">
              <span className="mt-0.5 text-emerald-400">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                  {item.title}
                </p>
                <p
                  className={`mt-0.5 text-[13px] leading-relaxed ${
                    item.pending ? "text-zinc-600" : "text-zinc-300"
                  }`}
                >
                  {item.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
