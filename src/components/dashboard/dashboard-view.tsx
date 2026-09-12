"use client";

import { Activity, AlertTriangle, RefreshCcw, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { AiAlertCard } from "@/components/dashboard/ai-alert";
import { MatchSelector } from "@/components/dashboard/match-selector";
import { MetricsPanel } from "@/components/dashboard/metrics-panel";
import { PressureChart } from "@/components/dashboard/pressure-chart";
import { ValueBetBanner } from "@/components/dashboard/value-bet-banner";
import { XgChart } from "@/components/dashboard/xg-chart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFixtures } from "@/hooks/use-fixtures";
import { OFFICIAL_SERVER_URL } from "@/lib/constants";
import { hapticTap, openExternal } from "@/lib/telegram";

type DashboardViewProps = {
  onLock?: () => void;
};

export function DashboardView({ onLock }: DashboardViewProps) {
  const { data, error, loading, reload } = useFixtures();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const matches = useMemo(() => data?.response ?? [], [data]);
  const selected = useMemo(() => {
    if (matches.length === 0) return null;
    return matches.find((match) => match.id === selectedId) ?? matches[0];
  }, [matches, selectedId]);

  return (
    <div className="min-h-dvh pb-8">
      <AppHeader connected />
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 sm:py-6">
        {loading ? <DashboardSkeleton /> : null}

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-3">
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={() => void reload()}>
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Reintentar sincronización
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {!loading && !error && matches.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-8 text-center">
            <Activity className="mx-auto mb-3 h-6 w-6 text-zinc-500" />
            <p className="text-sm text-zinc-300">
              No hay partidos en el feed de esta jornada.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => void reload()}>
              Actualizar jornada
            </Button>
          </div>
        ) : null}

        {selected ? (
          <>
            <ValueBetBanner matches={matches} onSelect={setSelectedId} />
            <MatchSelector
              matches={matches}
              selectedId={selected.id}
              onSelect={setSelectedId}
              source={data?.source}
            />
            <MetricsPanel match={selected} />
            <div className="grid gap-4 sm:grid-cols-2">
              <PressureChart match={selected} />
              <XgChart match={selected} />
            </div>
            <AiAlertCard match={selected} />
            <Button
              size="lg"
              className="w-full text-[13px] tracking-wide sm:text-sm"
              onClick={() => {
                hapticTap();
                openExternal(OFFICIAL_SERVER_URL);
              }}
            >
              <Zap className="h-4 w-4 fill-current" />
              EJECUTAR ENTRADA CON BONO ACTIVADO
            </Button>
          </>
        ) : null}

        {onLock ? (
          <button
            type="button"
            onClick={onLock}
            className="mx-auto text-[11px] text-zinc-600 underline-offset-4 hover:text-zinc-400 hover:underline"
          >
            Cerrar sesión del motor
          </button>
        ) : null}
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="flex gap-2 overflow-hidden">
        <Skeleton className="h-24 w-40 shrink-0 rounded-xl" />
        <Skeleton className="h-24 w-40 shrink-0 rounded-xl" />
        <Skeleton className="h-24 w-40 shrink-0 rounded-xl" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
