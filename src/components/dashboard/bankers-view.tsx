"use client";

import { DailyTicket } from "@/components/dashboard/daily-ticket";
import { MatchDetail } from "@/components/dashboard/match-detail";
import { StatsBanner } from "@/components/dashboard/stats-banner";
import type { MatchInsight, PlatformStats } from "@/lib/types";
import { bankersOfTheDay } from "@/lib/utils";

type BankersViewProps = {
  matches: MatchInsight[];
  stats: PlatformStats;
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export function BankersView({
  matches,
  stats,
  selectedId,
  onSelect,
}: BankersViewProps) {
  const ticket = bankersOfTheDay(matches);
  const selected = ticket.find((match) => match.id === selectedId) ?? ticket[0] ?? null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Bankers del Día</h1>
        <p className="mt-1 text-[13px] text-zinc-400">
          Los 3 pronósticos con más confianza. Banker = más de 8/10.
        </p>
      </div>
      <StatsBanner stats={stats} />
      <DailyTicket matches={ticket} selectedId={selectedId} onSelect={onSelect} />
      {selected ? <MatchDetail match={selected} /> : null}
    </div>
  );
}
