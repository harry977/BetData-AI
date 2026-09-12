"use client";

import { useEffect, useMemo, useState } from "react";
import { LogOut } from "lucide-react";
import { BetBuilderView } from "@/components/dashboard/bet-builder-view";
import { Button } from "@/components/ui/button";
import { resolvedSignals } from "@/lib/signals";
import { readViewedSignals } from "@/lib/storage";
import type { MatchInsight } from "@/lib/types";

type AccountViewProps = {
  accountId: string;
  matches: MatchInsight[];
  onLock: () => void;
  onOpenSignal: (id: number) => void;
};

export function AccountView({
  accountId,
  matches,
  onLock,
  onOpenSignal,
}: AccountViewProps) {
  const history = useMemo(() => resolvedSignals(matches).slice(0, 6), [matches]);
  const [viewed, setViewed] = useState<MatchInsight[]>([]);
  useEffect(() => {
    const ids = readViewedSignals();
    setViewed(
      ids
        .map((id) => matches.find((match) => match.id === id))
        .filter((match): match is MatchInsight => Boolean(match))
        .slice(0, 6),
    );
  }, [matches]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Mi BetData
        </p>
        <h1 className="mt-1 text-[1.65rem] font-semibold tracking-tight text-zinc-50">
          Cuenta
        </h1>
      </header>

      <section className="rounded-2xl border border-[#1e2538] bg-panel p-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          Cuenta vinculada
        </p>
        <p className="mt-1 text-base font-semibold text-zinc-50">
          {accountId || "Sesión activa en este dispositivo"}
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Armar boleto
        </h2>
        <BetBuilderView matches={matches} />
      </section>

      <HistoryList
        title="Historial"
        empty="Aún no hay pronósticos resueltos."
        matches={history}
        onOpen={onOpenSignal}
      />

      <HistoryList
        title="Señales consultadas"
        empty="Abre un análisis para guardarlo aquí."
        matches={viewed}
        onOpen={onOpenSignal}
      />

      <Button variant="outline" className="w-full" onClick={onLock}>
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </Button>
    </div>
  );
}

function HistoryList({
  title,
  empty,
  matches,
  onOpen,
}: {
  title: string;
  empty: string;
  matches: MatchInsight[];
  onOpen: (id: number) => void;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {title}
      </h2>
      {matches.length === 0 ? (
        <p className="text-[13px] text-zinc-600">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {matches.map((match) => (
            <li key={`${title}-${match.id}`}>
              <button
                type="button"
                onClick={() => onOpen(match.id)}
                className="flex w-full items-center justify-between rounded-xl border border-[#1e2538] bg-panel px-3 py-2.5 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold uppercase text-zinc-100">
                    {match.home.code} — {match.away.code}
                  </span>
                  <span className="text-[12px] text-emerald-400">{match.bestTip}</span>
                </span>
                {match.result ? (
                  <span
                    className={`text-[11px] font-semibold uppercase ${
                      match.result.won ? "text-emerald-300" : "text-red-300"
                    }`}
                  >
                    {match.result.won ? "Acertado" : "Fallado"}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
