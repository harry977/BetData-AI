"use client";

import { Badge } from "@/components/ui/badge";
import type { DayBucket, MatchInsight } from "@/lib/types";
import { cn, formatConfidence, formatOdds, statusLabel } from "@/lib/utils";

type PredictionsTableProps = {
  matches: MatchInsight[];
  day: DayBucket;
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export function PredictionsTable({
  matches,
  day,
  selectedId,
  onSelect,
}: PredictionsTableProps) {
  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-8 text-center text-sm text-zinc-400">
        No hay pronósticos para esta fecha.
      </div>
    );
  }

  return (
    <section className="space-y-2">
      <div className="hidden items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 md:grid md:grid-cols-[84px_minmax(0,1.5fr)_48px_56px_48px_minmax(0,1fr)_80px_88px]">
        <span>Hora / Estado</span>
        <span>Partido</span>
        <span>1X2</span>
        <span>O/U</span>
        <span>BTTS</span>
        <span>Mejor Tip</span>
        <span>Confianza</span>
        <span className="text-right">Resultado</span>
      </div>
      <div className="space-y-2">
        {matches.map((match) => (
          <MatchRow
            key={match.id}
            match={match}
            day={day}
            active={match.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

function MatchRow({
  match,
  day,
  active,
  onSelect,
}: {
  match: MatchInsight;
  day: DayBucket;
  active: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(match.id)}
      className={cn(
        "w-full rounded-xl border p-3 text-left transition-colors",
        active
          ? "border-emerald-500/40 bg-zinc-900"
          : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700",
      )}
    >
      <div className="grid gap-3 md:grid-cols-[84px_minmax(0,1.5fr)_48px_56px_48px_minmax(0,1fr)_80px_88px] md:items-center">
        <div>
          <Badge variant={match.status === "LIVE" ? "live" : "muted"}>
            {statusLabel(match)}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div>
            <p className="text-sm font-semibold text-zinc-50">
              {match.home.name} vs {match.away.name}
            </p>
            <p className="text-[11px] text-zinc-500">{match.league.name}</p>
          </div>
          {match.isBanker ? <Badge variant="banker">Banker</Badge> : null}
        </div>

        <div className="grid grid-cols-3 gap-2 md:contents">
          <MarketCell label="1X2" value={match.markets.oneXTwo.pick} />
          <MarketCell
            label="O/U"
            value={match.markets.overUnder.pick.replace(/^([OU])(\d)/, "$1 $2")}
          />
          <MarketCell label="BTTS" value={match.markets.btts.pick} />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500 md:hidden">
            Mejor Tip
          </p>
          <p className="text-sm font-semibold text-emerald-400">
            {match.bestTip}
            <span className="ml-1 font-mono text-[11px] text-emerald-300/80">
              {formatOdds(match.odds.valueMarket)}
            </span>
          </p>
        </div>

        <div>
          <p className="font-mono text-sm text-cyan-300">{formatConfidence(match.confidence)}</p>
        </div>

        <div className={day === "yesterday" ? "md:text-right" : "hidden md:block md:text-right"}>
          {day === "yesterday" && match.result ? (
            <Badge variant={match.result.won ? "won" : "lost"}>
              {match.result.won ? "Acertado" : "Fallado"}
            </Badge>
          ) : (
            <span className="text-[11px] text-zinc-600">—</span>
          )}
        </div>
      </div>
    </button>
  );
}

function MarketCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-zinc-500 md:hidden">{label}</p>
      <p className="text-sm font-semibold text-zinc-200">{value}</p>
    </div>
  );
}
