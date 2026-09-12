"use client";

import { useEffect, useState } from "react";
import { GatekeeperView } from "@/components/gatekeeper/gatekeeper-view";
import { AppShell } from "@/components/layout/app-shell";
import { BetDataLogo } from "@/components/brand/betdata-logo";
import { clearUnlock, persistUnlock, readUnlockState } from "@/lib/storage";

type ViewState = "boot" | "gatekeeper" | "dashboard";

export default function HomePage() {
  const [view, setView] = useState<ViewState>("boot");

  useEffect(() => {
    const snapshot = readUnlockState();
    setView(snapshot.unlocked ? "dashboard" : "gatekeeper");
  }, []);

  function handleUnlock(accountId: string) {
    persistUnlock(accountId);
    setView("dashboard");
  }

  function handleLock() {
    clearUnlock();
    setView("gatekeeper");
  }

  if (view === "boot") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-navy">
        <div className="flex flex-col items-center gap-3">
          <BetDataLogo version />
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            Cargando BetData Engine...
          </p>
        </div>
      </div>
    );
  }

  if (view === "gatekeeper") {
    return <GatekeeperView onUnlock={handleUnlock} />;
  }

  return <AppShell onLock={handleLock} />;
}
