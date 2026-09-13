"use client";

import { LivePulse } from "@/components/signals/live-pulse";

export function ScanningLiveState({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "rounded-2xl border border-white/8 bg-[#121726] px-5 py-8 text-center"
          : "flex h-full flex-col items-center justify-center px-8 py-16 text-center"
      }
    >
      <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-rose-400">
        <LivePulse />
        SportAPI
      </p>
      <h2 className="mt-3 text-2xl font-black uppercase leading-tight text-white">
        Escaneando partidos en directo...
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
        No cargamos una jornada de demostración. En cuanto SportAPI publique un partido, aquí verás escudos, marcador y minuto reales.
      </p>
    </div>
  );
}
