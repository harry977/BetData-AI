"use client";

import { useEffect, useState } from "react";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { GatekeeperView } from "@/components/gatekeeper/gatekeeper-view";
import { BetDataLogo } from "@/components/brand/betdata-logo";
import { clearUnlock, persistUnlock, readUnlockState } from "@/lib/storage";

type ViewState = "boot" | "gatekeeper" | "dashboard";

export default function HomePage() {
  const [view, setView] = useState<ViewState>("boot");
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const snapshot = readUnlockState();
    setRegistered(snapshot.registered);
    setView(snapshot.unlocked ? "dashboard" : "gatekeeper");
  }, []);

  function handleUnlock(partnerId: string) {
    persistUnlock(partnerId);
    setView("dashboard");
  }

  function handleLock() {
    clearUnlock();
    setView("gatekeeper");
  }

  if (view === "boot") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <BetDataLogo version />
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            Inicializando motor...
          </p>
        </div>
      </div>
    );
  }

  if (view === "gatekeeper") {
    return (
      <GatekeeperView onUnlock={handleUnlock} initialRegistered={registered} />
    );
  }

  return <DashboardView onLock={handleLock} />;
}
