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
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
          Con tecnología de BD APEX AI
        </p>
        <h1 className="mt-1 text-xl font-semibold text-zinc-50">
          Pronóstico del Día y Boleto del Día
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
          El Pronóstico del Día y el Boleto del Día de BetData AI: picks banker de
          fútbol elegidos por la IA con una confianza superior a 8/10, más un boleto
          listo para jugar.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <MetricBadge label="23 Bankers" />
        <MetricBadge label="19 Próximos" />
        <MetricBadge label="100% acierto en bankers resueltos" />
      </div>
      <StatsBanner stats={stats} />
      <DailyTicket matches={ticket} selectedId={selectedId} onSelect={onSelect} />
      {selected ? <MatchDetail match={selected} /> : null}
      <section className="rounded-xl border border-[#1e2538] bg-panel p-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Acerca de los Bankers
        </h2>
        <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
          El pronóstico del día es nuestra selección de fútbol más sólida generada
          por IA para los partidos de hoy, y el boleto del día reúne los picks con
          mayor confianza en un combinado listo. Cada pick sale de encuentros a los
          que el modelo otorga alto nivel de confianza —construido a partir de la
          forma de los equipos, alineaciones probables, lesiones, xG y cuotas en vivo.
        </p>
      </section>
    </div>
  );
}

function MetricBadge({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-2 py-2">
      <p className="text-center text-[9px] font-semibold uppercase leading-tight tracking-wide text-emerald-300">
        {label}
      </p>
    </div>
  );
}
