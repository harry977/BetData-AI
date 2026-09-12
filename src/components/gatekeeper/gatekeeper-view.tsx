"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ExternalLink, Loader2, Lock, ShieldCheck, Wallet } from "lucide-react";
import { type ReactNode, useState } from "react";
import { BetDataLogo } from "@/components/brand/betdata-logo";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ACTIVATION_STATUS,
  ACTIVATION_STEP_MS,
  BRAND,
  OFFICIAL_SERVER_URL,
} from "@/lib/constants";
import { hapticSuccess, hapticTap, openExternal } from "@/lib/telegram";

type GatekeeperViewProps = {
  onUnlock: (accountId: string) => void;
};

export function GatekeeperView({ onUnlock }: GatekeeperViewProps) {
  const [accountCreated, setAccountCreated] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [activating, setActivating] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);

  function handleCreateAccount() {
    hapticTap();
    setAccountCreated(true);
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
    <div className="relative min-h-dvh">
      <AppHeader connected={false} version />
      <main className="relative mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-40 max-w-sm bg-emerald-500/10 blur-3xl" />

        <Card className="relative overflow-hidden border-zinc-800/90 bg-zinc-900/70">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(39,39,42,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(39,39,42,0.35)_1px,transparent_1px)] bg-[size:22px_22px]" />
            <div className="absolute left-0 right-0 h-16 bg-gradient-to-b from-emerald-500/10 to-transparent animate-scan" />
          </div>

          <AnimatePresence>
            {activating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-950/88 px-6 text-center backdrop-blur-md"
              >
                <Loader2 className="h-9 w-9 animate-spin text-emerald-400" />
                <AnimatePresence mode="wait">
                  <motion.p
                    key={statusText}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="max-w-sm text-sm font-medium text-zinc-100 sm:text-base"
                  >
                    {statusText}
                  </motion.p>
                </AnimatePresence>
                <div className="flex gap-1.5">
                  {ACTIVATION_STATUS.map((_, index) => (
                    <span
                      key={ACTIVATION_STATUS[index]}
                      className={
                        index <= statusIndex
                          ? "h-1.5 w-6 rounded-full bg-emerald-400"
                          : "h-1.5 w-6 rounded-full bg-zinc-700"
                      }
                    />
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <CardContent className="relative space-y-6 p-5 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <BetDataLogo withWordmark={false} size={40} />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Activación del motor
              </p>
            </div>

            <div className="space-y-2">
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                Activa el Motor de Análisis {BRAND.name} en Tiempo Real
              </h1>
              <p className="text-sm leading-relaxed text-zinc-400">
                Para vincular la API de cuotas en vivo y métricas avanzadas, completa
                la activación en el Servidor Deportivo Oficial.
              </p>
            </div>

            <ol className="space-y-3">
              <StepCard
                index={1}
                done={accountCreated}
                icon={<Wallet className="h-4 w-4" />}
                title="Servidor Oficial Integrado"
              >
                <Button className="w-full whitespace-normal py-3" size="lg" onClick={handleCreateAccount}>
                  1. Crear cuenta en el Servidor Oficial Integrado (Consigue $20 de saldo inicial)
                  <ExternalLink className="h-4 w-4 shrink-0" />
                </Button>
              </StepCard>

              <StepCard
                index={2}
                done={accountCreated}
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Estado de Licencia Active"
              >
                <p className="text-sm text-zinc-300">
                  2. Realiza un depósito mínimo de $20 para sincronizar las cuotas de la API en vivo.
                </p>
                <p className="text-xs text-zinc-500">
                  Verificación de Depósito de Activación con los servidores de {BRAND.name}.
                </p>
              </StepCard>

              <StepCard
                index={3}
                done={false}
                icon={<Lock className="h-4 w-4" />}
                title="Vincular la herramienta"
              >
                <div className="space-y-2">
                  <Label htmlFor="account-id">
                    3. Introduce tu ID de Usuario o Correo para vincular la herramienta
                  </Label>
                  <Input
                    id="account-id"
                    autoComplete="email"
                    placeholder="ID de usuario o correo"
                    value={accountId}
                    onChange={(event) => setAccountId(event.target.value)}
                    disabled={activating}
                  />
                </div>
                <Button
                  className="w-full whitespace-normal py-3"
                  size="lg"
                  disabled={activating}
                  onClick={() => void handleActivate()}
                >
                  ACTIVAR Y DESBLOQUEAR BETDATA AI
                </Button>
              </StepCard>
            </ol>

            <p className="text-[11px] leading-relaxed text-zinc-500">
              Herramienta de análisis predictivo para mayores de 18 años. Las métricas
              no constituyen consejo de apuesta. Juega con responsabilidad.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StepCard({
  index,
  done,
  icon,
  title,
  children,
}: {
  index: number;
  done: boolean;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={
            done
              ? "flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-slate-950"
              : "flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 text-[11px] font-mono text-zinc-300"
          }
        >
          {done ? <Check className="h-3.5 w-3.5" /> : index}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {icon}
          {title}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </li>
  );
}
