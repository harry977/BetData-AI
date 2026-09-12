"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, LogOut } from "lucide-react";
import { BetBuilderView } from "@/components/dashboard/bet-builder-view";
import { StreakBoard } from "@/components/signals/streak-board";
import { MissionCard } from "@/components/signals/mission-card";
import { Button } from "@/components/ui/button";
import { BONUS_URL, WELCOME_BONUS } from "@/lib/constants";
import { madridYmd } from "@/lib/dates";
import { resolvedSignals } from "@/lib/signals";
import { readDailyMission, readUserStreak, readViewedSignals } from "@/lib/storage";
import { hapticTap, openExternal } from "@/lib/telegram";
import { explainTip } from "@/lib/tip-copy";
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
  const [missionDone, setMissionDone] = useState(0);
  const [userStreak, setUserStreak] = useState(0);

  useEffect(() => {
    const ids = readViewedSignals();
    setViewed(
      ids
        .map((id) => matches.find((match) => match.id === id))
        .filter((match): match is MatchInsight => Boolean(match))
        .slice(0, 6),
    );
    setMissionDone(readDailyMission(madridYmd()).ids.length);
    setUserStreak(readUserStreak().count);
  }, [matches]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Tu vestuario
        </p>
        <h1 className="mt-1 text-[1.65rem] font-semibold tracking-tight text-zinc-50">
          Mi cuenta
        </h1>
      </header>

      <section className="rounded-2xl border border-[#1e2538] bg-panel p-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          {accountId.startsWith("@") ? "Perfil de Telegram" : "Sesión en este navegador"}
        </p>
        <p className="mt-1 truncate text-base font-semibold text-zinc-50">
          {accountId || "Cuenta de Telegram"}
        </p>
        <p className="mt-2 text-[13px] text-slate-400">
          Tu racha: {userStreak} día{userStreak === 1 ? "" : "s"} · misión {missionDone}/3
        </p>
      </section>

      <StreakBoard matches={matches} />
      <MissionCard refreshKey={missionDone} />

      <section className="rounded-[24px] border border-emerald-400/30 bg-emerald-500/10 p-4">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
          <Gift className="h-3.5 w-3.5" />
          Desbloqueado
        </p>
        <p className="mt-2 text-lg font-black text-white">{WELCOME_BONUS.headline}</p>
        <p className="mt-1 text-[13px] leading-snug text-emerald-100/80">
          {WELCOME_BONUS.detail}
        </p>
        <Button
          className="mt-4 w-full"
          onClick={() => {
            hapticTap();
            openExternal(BONUS_URL);
          }}
        >
          Activar bono de {WELCOME_BONUS.amount}
        </Button>
      </section>

      <section>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Boleto combinado
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
        title="Señales que has abierto"
        empty="Abre una señal en Hoy para guardarla aquí."
        matches={viewed}
        onOpen={onOpenSignal}
      />

      <section className="rounded-2xl border border-[#1e2538] bg-panel p-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Ajustes</p>
        <Button variant="outline" className="mt-3 w-full" onClick={onLock}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </section>
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
        <p className="text-[13px] text-zinc-500">{empty}</p>
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
                  <span className="text-[12px] leading-snug text-emerald-400">
                    {explainTip(match.bestTip, match.home.name, match.away.name).plain}
                  </span>
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
