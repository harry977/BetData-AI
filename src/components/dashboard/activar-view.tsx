"use client";

import { Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OFFICIAL_SERVER_URL } from "@/lib/constants";
import { hapticTap, openExternal } from "@/lib/telegram";

export function ActivarView() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Activar / Servidor</h1>
        <p className="mt-1 text-[13px] text-zinc-400">
          Abre el Servidor Deportivo Oficial para crear cuenta o cargar una cuota.
        </p>
      </div>
      <div className="rounded-xl border border-[#1e2538] bg-panel p-4">
        <p className="text-sm text-zinc-200">
          Bono de $20 de saldo inicial al crear la cuenta. Depósito mínimo de $20 para
          sincronizar la API de cuotas.
        </p>
      </div>
      <Button
        size="lg"
        className="w-full"
        onClick={() => {
          hapticTap();
          openExternal(OFFICIAL_SERVER_URL);
        }}
      >
        <Zap className="h-4 w-4" />
        Abrir Servidor Oficial
        <Shield className="h-4 w-4" />
      </Button>
    </div>
  );
}
