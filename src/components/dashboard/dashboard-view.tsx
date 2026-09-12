"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { DailyTicket } from "@/components/dashboard/daily-ticket";
import { DayTabs } from "@/components/dashboard/day-tabs";
import { MatchDetail } from "@/components/dashboard/match-detail";
import { PredictionsTable } from "@/components/dashboard/predictions-table";
import { StatsBanner } from "@/components/dashboard/stats-banner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFixtures } from "@/hooks/use-fixtures";
import { PLATFORM_STATS } from "@/lib/constants";
import type { DayBucket } from "@/lib/types";
import { bankersOfTheDay, matchesForDay } from "@/lib/utils";

type DashboardViewProps = {
  onLock?: () => void;
};

export function DashboardView({ onLock }: DashboardViewProps) {
  const { data, error, loading, reload } = useFixtures();
  const [day, setDay] = useState<DayBucket>("today");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const matches = useMemo(() => data?.response ?? [], [data]);
  const stats = data?.stats ?? PLATFORM_STATS;
  const ticket = useMemo(() => bankersOfTheDay(matches), [matches]);
  const visible = useMemo(() => matchesForDay(matches, day), [matches, day]);
  const selected = useMemo(() => {
    const pool = visible.length ? visible : matches;
    if (pool.length === 0) return null;
    return pool.find((match) => match.id === selectedId) ?? pool[0];
  }, [matches, visible, selectedId]);

  function handleSelect(id: number) {
    const picked = matches.find((match) => match.id === id);
    if (picked) setDay(picked.day);
    setSelectedId(id);
  }

  return (
    <div className="min-h-dvh pb-8">
      <AppHeader connected />
      <main className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-4 sm:py-6">
        {loading ? <DashboardSkeleton /> : null}

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-3">
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={() => void reload()}>
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {!loading && !error ? (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Inteligencia Predictiva con IA
              </p>
              <h1 className="text-xl font-semibold text-zinc-50 sm:text-2xl">
                Pronósticos Gratis de Hoy
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                Confianza de 1 a 10, Bankers por encima de 8 y registro público de aciertos.
              </p>
            </div>

            <StatsBanner stats={stats} />
            <DailyTicket
              matches={ticket}
              selectedId={selected?.id ?? null}
              onSelect={handleSelect}
            />
            <DayTabs
              value={day}
              onChange={(next) => {
                setDay(next);
                const first = matchesForDay(matches, next)[0];
                if (first) setSelectedId(first.id);
              }}
            />
            <PredictionsTable
              matches={visible}
              day={day}
              selectedId={selected?.id ?? null}
              onSelect={handleSelect}
            />
            {selected ? <MatchDetail match={selected} /> : null}
          </>
        ) : null}

        {onLock ? (
          <button
            type="button"
            onClick={onLock}
            className="mx-auto text-[11px] text-zinc-600 underline-offset-4 hover:text-zinc-400 hover:underline"
          >
            Cerrar sesión
          </button>
        ) : null}
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid gap-2 sm:grid-cols-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
