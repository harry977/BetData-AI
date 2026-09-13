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
import { ScanningLiveState } from "@/components/signals/scanning-live-state";
import { Button } from "@/components/ui/button";
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
  const { data: liveData, error: liveError, loading: liveLoading } = useLiveMatches(true);
  const [tab, setTab] = useState<AppTab>("hoy");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    setAccountId(readUnlockState().accountId);
  }, []);

  const composed = useMemo(
    () => composeMatchFeed(data, liveData),
    [data, liveData],
  );
  const visibleMatches = composed.matches;
  const feedConnected = composed.connected || visibleMatches.length > 0;
  const liveCount = useMemo(() => liveMatches(visibleMatches).length, [visibleMatches]);
  const liveMode = tab === "live";
  const waiting =
    visibleMatches.length === 0 &&
    !data &&
    !liveData &&
    (loading || liveLoading);
  const feedError =
    visibleMatches.length === 0 ? error || liveError || data?.error || liveData?.error : null;

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
          <span className="max-w-[11rem] shrink-0 rounded-full border border-neon/30 bg-neon/10 px-2 py-1 text-center text-[8px] font-semibold uppercase leading-tight tracking-wide text-neon sm:max-w-none sm:text-[10px] lg:text-[11px]">
            {feedConnected
              ? liveCount > 0
                ? `EN VIVO · CONECTADO A SPORTAPI · ${liveCount}`
                : "EN VIVO · CONECTADO A SPORTAPI"
              : "Escaneando SportAPI"}
          </span>
        </div>
        <div className="mx-auto hidden max-w-lg justify-center px-4 pb-1 lg:flex">
          <HeaderNav value={tab} onChange={setTab} />
        </div>
        <div className="mx-auto max-w-md space-y-2 px-3 pb-2 lg:max-w-lg lg:px-4">
          <DailyHitsBadge matches={visibleMatches} />
        </div>
      </header>

      <main
        className={
          liveMode
            ? "mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col pb-nav lg:max-w-lg lg:pb-8"
            : "mx-auto max-w-md px-3 pb-nav pt-4 lg:max-w-lg lg:px-4 lg:pb-10 lg:pt-6"
        }
      >
        {feedError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-3">
                <p>{feedError}</p>
                <Button variant="outline" size="sm" onClick={() => void reload()}>
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {waiting ? <ScanningLiveState /> : null}

        {visibleMatches.length > 0 || (!waiting && !feedError) ? (
          <>
            {tab === "hoy" ? (
              <SignalsView
                matches={visibleMatches}
                selectedId={selectedId}
                onSelect={handleSelect}
                onOpenLive={openLive}
              />
            ) : null}
            {tab === "live" ? (
              <LiveModeView
                matches={visibleMatches}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            ) : null}
            {tab === "combo" ? <CombinadasView matches={visibleMatches} /> : null}
            {tab === "account" ? (
              <AccountView
                accountId={accountId}
                matches={visibleMatches}
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
