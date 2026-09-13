"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BetDataLogo } from "@/components/brand/betdata-logo";
import { AccountView } from "@/components/dashboard/account-view";
import { CombinadasView } from "@/components/dashboard/combinadas-view";
import { LiveModeView } from "@/components/dashboard/live-mode-view";
import { SignalsView } from "@/components/dashboard/signals-view";
import { BottomNav, HeaderNav, type AppTab } from "@/components/layout/bottom-nav";
import { DailyHitsBadge } from "@/components/signals/daily-hits-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFixtures } from "@/hooks/use-fixtures";
import { useLiveMatches } from "@/hooks/use-live-matches";
import { composeMatchFeed } from "@/lib/sport-mapper";
import { recordViewedSignal, readUnlockState } from "@/lib/storage";
import { cn, liveMatches } from "@/lib/utils";

type AppShellProps = {
  onLock: () => void;
};

export function AppShell({ onLock }: AppShellProps) {
  const { data, error, loading, reload } = useFixtures();
  const { data: liveData } = useLiveMatches(true);
  const [tab, setTab] = useState<AppTab>("hoy");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState("");
  useEffect(() => {
    setAccountId(readUnlockState().accountId);
  }, []);

  const { matches, simulated } = useMemo(
    () => composeMatchFeed(data, liveData),
    [data, liveData],
  );
  const liveCount = useMemo(() => liveMatches(matches).length, [matches]);
  const liveMode = tab === "live";

  function handleSelect(id: number) {
    recordViewedSignal(id);
    setSelectedId(id);
  }

  function openLive(id: number) {
    handleSelect(id);
    setTab("live");
  }

  function openFromAccount(id: number) {
    handleSelect(id);
    setTab("hoy");
  }

  return (
    <div
      className={cn(
        "stream-stage bg-navy",
        liveMode
          ? "flex h-dvh flex-col overflow-hidden lg:h-auto lg:min-h-dvh lg:overflow-visible"
          : "min-h-dvh",
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-30 border-b border-[#1e2538] bg-[#0b0e17]/95 backdrop-blur-xl",
          liveMode && "hidden lg:block",
        )}
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-3 py-3 lg:max-w-lg lg:px-4 lg:py-3.5">
          <BetDataLogo className="min-w-0" />
          <span className="shrink-0 rounded-full border border-neon/30 bg-neon/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-neon sm:text-[10px] lg:text-[11px]">
            {liveCount > 0 ? `${liveCount} en juego` : "IA activa"}
          </span>
        </div>
        <div className="mx-auto hidden max-w-lg justify-center px-4 pb-1 lg:flex">
          <HeaderNav value={tab} onChange={setTab} />
        </div>
        <div className="mx-auto max-w-md space-y-2 px-3 pb-2 lg:max-w-lg lg:px-4">
          <DailyHitsBadge matches={matches} />
          {simulated ? (
            <p className="rounded-xl border border-neon/25 bg-neon/10 px-3 py-1.5 text-center text-[10px] font-black uppercase tracking-[0.14em] text-neon">
              Simulación · jornada de demostración
            </p>
          ) : null}
        </div>
      </header>

      <main
        className={
          liveMode
            ? "mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col pb-nav lg:max-w-lg lg:pb-8"
            : "mx-auto max-w-md px-3 pb-nav pt-4 lg:max-w-lg lg:px-4 lg:pb-10 lg:pt-6"
        }
      >
        {loading && matches.length === 0 ? <DashboardSkeleton /> : null}

        {error && matches.length === 0 ? (
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

        {matches.length > 0 || (!loading && !error) ? (
          <>
            {tab === "hoy" ? (
              <SignalsView
                matches={matches}
                selectedId={selectedId}
                onSelect={handleSelect}
                onOpenLive={openLive}
              />
            ) : null}
            {tab === "live" ? (
              <LiveModeView
                matches={matches}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            ) : null}
            {tab === "combo" ? <CombinadasView matches={matches} /> : null}
            {tab === "account" ? (
              <AccountView
                accountId={accountId}
                matches={matches}
                onLock={onLock}
                onOpenSignal={openFromAccount}
                onOpenCombo={() => setTab("combo")}
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
