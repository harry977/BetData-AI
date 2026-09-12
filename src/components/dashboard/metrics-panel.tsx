"use client";

import { Gauge, Swords, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceBar } from "@/components/confidence-bar";
import type { MatchInsight } from "@/lib/types";

type MetricsPanelProps = {
  match: MatchInsight;
};

export function MetricsPanel({ match }: MetricsPanelProps) {
  const { metrics, home, away, score, elapsed, status } = match;
  const scoreLabel =
    score.home === null || score.away === null
      ? "VS"
      : `${score.home} — ${score.away}`;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Panel de métricas en tiempo real
          </p>
          <h2 className="text-lg font-semibold text-zinc-50">
            {home.name} vs {away.name}
          </h2>
        </div>
        <p className="font-mono text-xl text-cyan-300">
          {scoreLabel}
          {status === "LIVE" && elapsed ? (
            <span className="ml-2 text-xs text-red-400">{elapsed}&apos;</span>
          ) : null}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-zinc-300">
              <Gauge className="h-3.5 w-3.5 text-emerald-400" />
              Presión ofensiva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 font-mono text-3xl text-emerald-400">
              {metrics.offensivePressure}
              <span className="text-base text-zinc-500">%</span>
            </p>
            <ConfidenceBar
              value={metrics.offensivePressure}
              label="Dominio territorial"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-zinc-300">
              <Target className="h-3.5 w-3.5 text-cyan-400" />
              Goles esperados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl text-cyan-300">
              {metrics.xG.home.toFixed(2)}
              <span className="mx-1 text-base text-zinc-500">vs</span>
              {metrics.xG.away.toFixed(2)}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-wide text-zinc-500">
              xG acumulado · {home.code} / {away.code}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-zinc-300">
              <Swords className="h-3.5 w-3.5 text-emerald-300" />
              Ataques peligrosos / min
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl text-zinc-50">
              {metrics.dangerousAttacksPerMinute.home.toFixed(1)}
              <span className="mx-1 text-base text-zinc-500">:</span>
              {metrics.dangerousAttacksPerMinute.away.toFixed(1)}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-wide text-zinc-500">
              Tiros a puerta {metrics.shotsOnTarget.home}-{metrics.shotsOnTarget.away}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
