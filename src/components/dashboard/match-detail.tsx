"use client";

import { ExternalLink } from "lucide-react";
import { PressureChart } from "@/components/dashboard/pressure-chart";
import { XgChart } from "@/components/dashboard/xg-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfidenceBar } from "@/components/confidence-bar";
import { useEventStatistics } from "@/hooks/use-event-statistics";
import { OFFICIAL_SERVER_URL } from "@/lib/constants";
import { hapticTap, openExternal } from "@/lib/telegram";
import type { MatchInsight } from "@/lib/types";
import { formatOdds } from "@/lib/utils";

type MatchDetailProps = {
  match: MatchInsight;
};

export function MatchDetail({ match }: MatchDetailProps) {
  const { metrics } = useEventStatistics(match.id);
  const view: MatchInsight = metrics ? { ...match, metrics } : match;
  const xgNote =
    metrics && (metrics.xG.home > 0 || metrics.xG.away > 0)
      ? ` xG en vivo: ${metrics.xG.home.toFixed(2)} vs ${metrics.xG.away.toFixed(2)}. Tiros a puerta ${metrics.shotsOnTarget.home}-${metrics.shotsOnTarget.away}.`
      : "";

  return (
    <section className="space-y-3">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Modelo BetData Engine
            </p>
            {view.isBanker ? <Badge variant="banker">Banker</Badge> : null}
            {view.result ? (
              <Badge variant={view.result.won ? "won" : "lost"}>
                {view.result.won ? "Acertado" : "Fallado"}
              </Badge>
            ) : null}
          </div>
          <h3 className="text-base font-semibold text-zinc-50">
            Mejor Tip: <span className="text-emerald-400">{view.bestTip}</span>{" "}
            <span className="font-mono text-sm text-emerald-300/80">
              {formatOdds(view.odds.valueMarket)}
            </span>
          </h3>
          <p className="text-[13px] leading-relaxed text-zinc-400">
            {view.formNote}
            {xgNote}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Stat
              label="xG"
              value={`${view.metrics.xG.home.toFixed(2)}/${view.metrics.xG.away.toFixed(2)}`}
            />
            <Stat label="Presión" value={`${view.metrics.offensivePressure}%`} />
            <Stat label="Acierto" value={`${view.hitRate.toFixed(1)}%`} />
          </div>
          <ConfidenceBar value={view.confidence} />
        </CardContent>
      </Card>
      <div className="grid gap-3">
        <PressureChart match={view} />
        <XgChart match={view} />
      </div>
      <Button
        size="lg"
        className="w-full"
        onClick={() => {
          hapticTap();
          openExternal(OFFICIAL_SERVER_URL);
        }}
      >
        Ver cuota en el Servidor Oficial
        <ExternalLink className="h-4 w-4" />
      </Button>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#1e2538] bg-[#080b12] p-2">
      <p className="text-[9px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="font-mono text-[11px] text-cyan-300">{value}</p>
    </div>
  );
}
