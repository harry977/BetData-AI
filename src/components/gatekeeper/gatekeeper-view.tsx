"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { BetDataLogo } from "@/components/brand/betdata-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ACTIVATION_STATUS,
  ACTIVATION_STEP_MS,
  OFFICIAL_SERVER_URL,
} from "@/lib/constants";
import { hapticSuccess, hapticTap, openExternal } from "@/lib/telegram";

type GatekeeperViewProps = {
  onUnlock: (accountId: string) => void;
};

export function GatekeeperView({ onUnlock }: GatekeeperViewProps) {
  const [accountId, setAccountId] = useState("");
  const [activating, setActivating] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);

  function handleCreateAccount() {
    hapticTap();
    openExternal(OFFICIAL_SERVER_URL);
  }

  async function handleActivate() {
    if (activating) return;
    setActivating(true);
    setStatusIndex(0);
    hapticTap();

    for (let index = 0; index < ACTIVATION_STATUS.length; index += 1) {
      setStatusIndex(index);
      await new Promise((resolve) => setTimeout(resolve, ACTIVATION_STEP_MS));
    }

    hapticSuccess();
    onUnlock(accountId.trim());
  }

  const statusText = ACTIVATION_STATUS[statusIndex];

  return (
    <div className="relative flex min-h-dvh flex-col bg-navy px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <header className="flex items-center justify-between py-3">
        <BetDataLogo version />
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
          Sistema desconectado
        </span>
      </header>

      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-3 py-2">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-zinc-50">
            Activa el Motor de Predicciones
          </h1>
          <p className="mt-1 text-[13px] leading-snug text-zinc-400">
            Tres toques para vincular cuotas en vivo y desbloquear BetData AI.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateAccount}
          className="w-full rounded-xl bg-emerald-500 px-3 py-3.5 text-center text-sm font-semibold leading-snug text-slate-950 shadow-neon"
        >
          1. Crear cuenta en Servidor Oficial ($20 Bono)
          <ExternalLink className="ml-1 inline h-3.5 w-3.5" />
        </button>

        <div className="rounded-xl border border-[#1e2538] bg-panel px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Paso 2
          </p>
          <p className="mt-1 text-sm leading-snug text-zinc-200">
            Depósito mínimo de $20 para sincronizar API de cuotas
          </p>
        </div>

        <div className="rounded-xl border border-[#1e2538] bg-panel px-3 py-3">
          <label htmlFor="account-id" className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Paso 3 · ID o correo
          </label>
          <Input
            id="account-id"
            className="mt-2"
            autoComplete="email"
            placeholder="ID de usuario o correo"
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            disabled={activating}
          />
          <Button
            className="mt-2 w-full whitespace-normal py-3 text-[13px]"
            size="lg"
            disabled={activating}
            onClick={() => void handleActivate()}
          >
            ACTIVAR Y DESBLOQUEAR BETDATA AI
          </Button>
        </div>

        <p className="text-center text-[10px] text-zinc-600">
          +18. Análisis, no consejo de apuesta.
        </p>
      </main>

      <AnimatePresence>
        {activating ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#0b0e17]/92 px-6 text-center backdrop-blur-md"
          >
            <Loader2 className="h-9 w-9 animate-spin text-emerald-400" />
            <AnimatePresence mode="wait">
              <motion.p
                key={statusText}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-base font-medium text-zinc-100"
              >
                {statusText}
              </motion.p>
            </AnimatePresence>
            <div className="flex gap-1.5">
              {ACTIVATION_STATUS.map((label, index) => (
                <span
                  key={label}
                  className={
                    index <= statusIndex
                      ? "h-1.5 w-8 rounded-full bg-emerald-400"
                      : "h-1.5 w-8 rounded-full bg-zinc-700"
                  }
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
