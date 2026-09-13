"use client";

import { DailyTicket } from "@/components/dashboard/daily-ticket";
import { MatchCard } from "@/components/dashboard/match-card";
import { MatchDetail } from "@/components/dashboard/match-detail";
import { StatsBanner } from "@/components/dashboard/stats-banner";
import type { MatchInsight, PlatformStats } from "@/lib/types";
import { bankersOfTheDay, starBankers } from "@/lib/utils";

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
  const stars = starBankers(matches);
  const ticket = bankersOfTheDay(matches);
  const extra = stars.filter((match) => !ticket.some((item) => item.id === match.id));
  const selected =
    stars.find((match) => match.id === selectedId) ?? ticket[0] ?? stars[0] ?? null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neon">
          Con tecnología de BD APEX AI
        </p>
        <h1 className="mt-1 text-xl font-semibold text-zinc-50">
          Pronóstico del Día y Boleto del Día
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
          El Pronóstico del Día y el Boleto del Día de RadarBet IA: picks banker de
          fútbol elegidos por la IA con una confianza superior a 8/10, más un boleto
          listo para jugar.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <MetricBadge label="23 BANKERS" />
        <MetricBadge label="19 PRÓXIMOS" />
        <MetricBadge label="100% ACIERTO EN BANKERS RESUELTOS" />
      </div>
      <StatsBanner stats={stats} />
      <DailyTicket matches={ticket} selectedId={selectedId} onSelect={onSelect} />
      {stars.length === 0 ? (
        <p className="rounded-xl border border-[#1e2538] bg-panel p-6 text-center text-sm text-zinc-400">
          No hay bankers con confianza ≥ 8.0 para hoy. Revisa Partidos para el resto de
          pronósticos.
        </p>
      ) : null}
      {extra.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Bankers del día
          </h2>
          {extra.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              day="today"
              active={match.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </section>
      ) : null}
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
    <div className="rounded-xl border border-neon/25 bg-neon/10 px-2 py-2">
      <p className="text-center text-[9px] font-semibold uppercase leading-tight tracking-wide text-neon">
        {label}
      </p>
    </div>
  );
}
