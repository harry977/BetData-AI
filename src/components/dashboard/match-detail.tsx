"use client";

import { ExternalLink } from "lucide-react";
import { PressureChart } from "@/components/dashboard/pressure-chart";
import { XgChart } from "@/components/dashboard/xg-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfidenceBar } from "@/components/confidence-bar";
import { OFFICIAL_SERVER_URL } from "@/lib/constants";
import { hapticTap, openExternal } from "@/lib/telegram";
import type { MatchInsight } from "@/lib/types";
import { formatOdds } from "@/lib/utils";

type MatchDetailProps = {
  match: MatchInsight;
};

export function MatchDetail({ match }: MatchDetailProps) {
  return (
    <section className="space-y-3">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              Modelo BetData Engine
            </p>
            {match.isBanker ? <Badge variant="banker">Banker</Badge> : null}
            {match.result ? (
              <Badge variant={match.result.won ? "won" : "lost"}>
                {match.result.won ? "Acertado" : "Fallado"}
              </Badge>
            ) : null}
          </div>
          <h3 className="text-lg font-semibold text-zinc-50">
            Mejor Tip: <span className="text-emerald-400">{match.bestTip}</span>{" "}
            <span className="font-mono text-base text-emerald-300/80">
              {formatOdds(match.odds.valueMarket)}
            </span>
          </h3>
          <p className="text-sm leading-relaxed text-zinc-400">{match.formNote}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <Stat label="Goles esperados (xG)" value={`${match.metrics.xG.home.toFixed(2)} vs ${match.metrics.xG.away.toFixed(2)}`} />
            <Stat
              label="Presión ofensiva"
              value={`${match.metrics.offensivePressure}%`}
            />
            <Stat
              label="Acierto histórico"
              value={`${match.hitRate.toFixed(1)}%`}
            />
          </div>
          <ConfidenceBar value={match.confidence} />
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <PressureChart match={match} />
        <XgChart match={match} />
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
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="font-mono text-sm text-cyan-300">{value}</p>
    </div>
  );
}
