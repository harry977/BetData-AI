"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BetDataLogo } from "@/components/brand/betdata-logo";
import { AccountView } from "@/components/dashboard/account-view";
import { LiveModeView } from "@/components/dashboard/live-mode-view";
import { PartidosView } from "@/components/dashboard/partidos-view";
import { SignalsView } from "@/components/dashboard/signals-view";
import { BottomNav, type AppTab } from "@/components/layout/bottom-nav";
import { HitsTicker } from "@/components/layout/hits-ticker";
import { SyncBanner } from "@/components/layout/sync-banner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFixtures } from "@/hooks/use-fixtures";
import { recordViewedSignal, readUnlockState } from "@/lib/storage";
import type { DayBucket } from "@/lib/types";
import { liveMatches, matchesForDay, recentHits } from "@/lib/utils";

type AppShellProps = {
  onLock: () => void;
};

export function AppShell({ onLock }: AppShellProps) {
  const { data, error, loading, reload } = useFixtures();
  const [tab, setTab] = useState<AppTab>("ai");
  const [day, setDay] = useState<DayBucket>("today");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState("");
  useEffect(() => {
    setAccountId(readUnlockState().accountId);
  }, []);

  const matches = useMemo(() => data?.response ?? [], [data]);
  const hits = useMemo(() => recentHits(matches), [matches]);
  const live = useMemo(() => liveMatches(matches), [matches]);
  const tickerItems = live.length > 0 ? live.slice(0, 12) : hits;
  const liveMode = tab === "live";
  const feedMode = tab === "ai";

  function handleSelect(id: number) {
    const picked = matches.find((match) => match.id === id);
    if (picked) setDay(picked.day);
    recordViewedSignal(id);
    setSelectedId(id);
  }

  function handleDay(next: DayBucket) {
    setDay(next);
    const first = matchesForDay(matches, next)[0];
    if (first) setSelectedId(first.id);
  }

  function openFromAccount(id: number) {
    handleSelect(id);
    setTab("ai");
  }

  return (
    <div className={liveMode ? "flex h-dvh flex-col overflow-hidden bg-navy" : "min-h-dvh bg-navy"}>
      {liveMode ? null : (
        <header className="sticky top-0 z-30 border-b border-[#1e2538] bg-[#0b0e17]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2.5">
            <BetDataLogo />
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
              AI live
            </span>
          </div>
          {feedMode ? null : <HitsTicker hits={tickerItems} />}
          {feedMode ? null : <SyncBanner />}
        </header>
      )}

      <main
        className={
          liveMode
            ? "mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col pb-nav"
            : "mx-auto max-w-md px-3 pb-nav pt-4"
        }
      >
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
            {tab === "ai" ? (
              <SignalsView
                matches={matches}
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
            {tab === "live" ? (
              <LiveModeView
                matches={matches}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            ) : null}
            {tab === "account" ? (
              <AccountView
                accountId={accountId}
                matches={matches}
                onLock={onLock}
                onOpenSignal={openFromAccount}
              />
            ) : null}
          </>
        ) : null}
      </main>

      <BottomNav value={tab} onChange={setTab} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3 px-3 pt-4">
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-36 w-full rounded-2xl" />
    </div>
  );
}
