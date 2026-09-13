"use client";

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "@/components/dashboard/match-card";
import type { MatchInsight } from "@/lib/types";

type DailyTicketProps = {
  matches: MatchInsight[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export function DailyTicket({ matches, selectedId, onSelect }: DailyTicketProps) {
  if (matches.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-neon" />
          Boleto del Día
        </h2>
        <Badge variant="default">Bankers +70%</Badge>
      </div>
      <div className="space-y-2">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            day="today"
            active={match.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
