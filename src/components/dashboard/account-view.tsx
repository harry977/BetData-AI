"use client";

import { Shield } from "lucide-react";
import { BetDataLogo } from "@/components/brand/betdata-logo";
import { Button } from "@/components/ui/button";
import { PLATFORM_STATS } from "@/lib/constants";
import { formatPercent } from "@/lib/utils";

type AccountViewProps = {
  accountId: string;
  onLock: () => void;
};

export function AccountView({ accountId, onLock }: AccountViewProps) {
  return (
    <div className="space-y-4">
      <BetDataLogo version />
      <div className="rounded-xl border border-[#1e2538] bg-panel p-4">
        <p className="text-[11px] uppercase tracking-wide text-zinc-500">Cuenta vinculada</p>
        <p className="mt-1 text-sm font-semibold text-zinc-50">
          {accountId || "Sesión activa en este dispositivo"}
        </p>
        <p className="mt-2 text-[13px] text-zinc-400">
          Motor desbloqueado. Los pronósticos usan el Modelo BetData Engine.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[#1e2538] bg-panel p-3">
          <p className="text-[10px] uppercase text-zinc-500">Acierto Banker</p>
          <p className="font-mono text-lg text-emerald-300">
            {formatPercent(PLATFORM_STATS.bankerHitRate, 1)}
          </p>
        </div>
        <div className="rounded-xl border border-[#1e2538] bg-panel p-3">
          <p className="text-[10px] uppercase text-zinc-500">Ligas</p>
          <p className="font-mono text-lg text-emerald-300">
            +{PLATFORM_STATS.leaguesMonitored}
          </p>
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={onLock}>
        <Shield className="h-4 w-4" />
        Cerrar sesión
      </Button>
    </div>
  );
}
