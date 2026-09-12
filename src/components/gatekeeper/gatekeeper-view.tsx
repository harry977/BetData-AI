"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ExternalLink, Loader2, Lock, ShieldCheck, Wallet } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { BetDataLogo } from "@/components/brand/betdata-logo";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND, PARTNER_AFFILIATE_URL, VERIFY_DELAY_MS } from "@/lib/constants";
import { persistRegistered } from "@/lib/storage";
import { hapticSuccess, hapticTap, openExternal } from "@/lib/telegram";
import { isEmailOrUserId } from "@/lib/utils";

type GatekeeperViewProps = {
  onUnlock: (partnerId: string) => void;
  initialRegistered?: boolean;
};

export function GatekeeperView({
  onUnlock,
  initialRegistered = false,
}: GatekeeperViewProps) {
  const [registered, setRegistered] = useState(initialRegistered);
  const [partnerId, setPartnerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const canVerify = useMemo(
    () => isEmailOrUserId(partnerId) && !verifying,
    [partnerId, verifying],
  );

  function handleRegister() {
    hapticTap();
    persistRegistered();
    setRegistered(true);
    openExternal(PARTNER_AFFILIATE_URL);
  }

  async function handleVerify() {
    if (!isEmailOrUserId(partnerId)) {
      setError("Introduce un ID de usuario o un correo válido.");
      return;
    }
    if (!registered) {
      setError("Completa primero el registro en el partner para vincular el FTD.");
      return;
    }

    setError(null);
    setVerifying(true);
    hapticTap();

    await new Promise((resolve) => setTimeout(resolve, VERIFY_DELAY_MS));
    hapticSuccess();
    onUnlock(partnerId.trim());
  }

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

          <CardContent className="relative space-y-6 p-5 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <BetDataLogo withWordmark={false} size={40} />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Gatekeeper / Opt-in
              </p>
            </div>

            <div className="space-y-2">
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                Activa el Motor de Análisis {BRAND.name} en Tiempo Real
              </h1>
              <p className="text-sm leading-relaxed text-zinc-400">
                Para vincular la API de cuotas en vivo y métricas avanzadas, completa
                la activación de tu cuenta de partner.
              </p>
            </div>

            <ol className="space-y-3">
              <StepCard
                index={1}
                done={registered}
                icon={<Wallet className="h-4 w-4" />}
                title="Registrarse en Partner (Bono $20)"
              >
                <Button className="w-full" size="lg" onClick={handleRegister}>
                  1. Registrarse en Partner (Bono $20)
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </StepCard>

              <StepCard
                index={2}
                done={registered}
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Depósito de activación"
              >
                <p className="text-sm text-zinc-300">
                  2. Realiza tu primer depósito de $20 para activar las cuotas en vivo.
                </p>
                <p className="text-xs text-zinc-500">
                  El FTD se valida contra los servidores de {BRAND.name} al verificar tu ID.
                </p>
              </StepCard>

              <StepCard
                index={3}
                done={false}
                icon={<Lock className="h-4 w-4" />}
                title="Verificación de cuenta"
              >
                <div className="space-y-2">
                  <Label htmlFor="partner-id">
                    3. Introduce tu ID de usuario o Correo registrado
                  </Label>
                  <Input
                    id="partner-id"
                    autoComplete="email"
                    placeholder="id_usuario o correo@partner.com"
                    value={partnerId}
                    onChange={(event) => {
                      setPartnerId(event.target.value);
                      if (error) setError(null);
                    }}
                    disabled={verifying}
                  />
                </div>
                {error ? (
                  <p className="text-xs text-red-400" role="alert">
                    {error}
                  </p>
                ) : null}
                <Button
                  className="w-full whitespace-normal py-3"
                  size="lg"
                  disabled={!canVerify}
                  onClick={() => void handleVerify()}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verificando API y FTD con Servidores de BetData AI...
                    </>
                  ) : (
                    "VERIFICAR Y DESBLOQUEAR"
                  )}
                </Button>
              </StepCard>
            </ol>

            <AnimatePresence>
              {verifying ? (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-[11px] text-cyan-300"
                >
                  Handshake TLS · RapidAPI odds bridge · FTD checksum...
                </motion.p>
              ) : null}
            </AnimatePresence>

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
