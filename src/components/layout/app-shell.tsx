"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BetDataLogo } from "@/components/brand/betdata-logo";
import { AccountView } from "@/components/dashboard/account-view";
import { ActivarView } from "@/components/dashboard/activar-view";
import { BankersView } from "@/components/dashboard/bankers-view";
import { BetBuilderView } from "@/components/dashboard/bet-builder-view";
import { PartidosView } from "@/components/dashboard/partidos-view";
import { BottomNav, type AppTab } from "@/components/layout/bottom-nav";
import { HitsTicker } from "@/components/layout/hits-ticker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFixtures } from "@/hooks/use-fixtures";
import { PLATFORM_STATS } from "@/lib/constants";
import { readUnlockState } from "@/lib/storage";
import type { DayBucket } from "@/lib/types";
import { matchesForDay, recentHits } from "@/lib/utils";

type AppShellProps = {
  onLock: () => void;
};

export function AppShell({ onLock }: AppShellProps) {
  const { data, error, loading, reload } = useFixtures();
  const [tab, setTab] = useState<AppTab>("bankers");
  const [day, setDay] = useState<DayBucket>("today");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState("");
  useEffect(() => {
    setAccountId(readUnlockState().accountId);
  }, []);

  const matches = useMemo(() => data?.response ?? [], [data]);
  const stats = data?.stats ?? PLATFORM_STATS;
  const hits = useMemo(() => recentHits(matches), [matches]);

  function handleSelect(id: number) {
    const picked = matches.find((match) => match.id === id);
    if (picked) setDay(picked.day);
    setSelectedId(id);
  }

  function handleDay(next: DayBucket) {
    setDay(next);
    const first = matchesForDay(matches, next)[0];
    if (first) setSelectedId(first.id);
  }

  return (
    <div className="min-h-dvh bg-navy">
      <header className="sticky top-0 z-30 border-b border-[#1e2538] bg-[#0b0e17]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2.5">
          <BetDataLogo />
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
            En vivo
          </span>
        </div>
        <HitsTicker hits={hits} />
      </header>

      <main className="mx-auto max-w-md px-3 pb-nav pt-4">
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
            {tab === "bankers" ? (
              <BankersView
                matches={matches}
                stats={stats}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            ) : null}
            {tab === "partidos" ? (
              <PartidosView
                matches={matches}
                day={day}
                selectedId={selectedId}
                onDayChange={handleDay}
                onSelect={handleSelect}
              />
            ) : null}
            {tab === "builder" ? <BetBuilderView matches={matches} /> : null}
            {tab === "account" ? (
              <AccountView accountId={accountId} onLock={onLock} />
            ) : null}
            {tab === "activar" ? <ActivarView /> : null}
          </>
        ) : null}
      </main>

      <BottomNav value={tab} onChange={setTab} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="grid grid-cols-3 gap-1.5">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}
