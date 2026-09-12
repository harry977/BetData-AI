"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2, LogIn, Send, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BetDataLogo } from "@/components/brand/betdata-logo";
import { OptinTipsTable } from "@/components/gatekeeper/optin-tips-table";
import { TelegramLogin } from "@/components/gatekeeper/telegram-login";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFixtures } from "@/hooks/use-fixtures";
import { ACTIVATION_STATUS, ACTIVATION_STEP_MS, BRAND } from "@/lib/constants";
import { calendarDayFromYmd, formatCalendarDay, utcDateOffset } from "@/lib/dates";
import { uniqueLeagues } from "@/lib/leagues";
import {
  hapticSuccess,
  hapticTap,
  readTelegramUser,
  type TelegramIdentity,
} from "@/lib/telegram";
import { matchesForDay } from "@/lib/utils";

type GatekeeperViewProps = {
  onUnlock: (accountId: string) => void;
};

export function GatekeeperView({ onUnlock }: GatekeeperViewProps) {
  const { data, loading } = useFixtures();
  const [activating, setActivating] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [telegramUser, setTelegramUser] = useState<TelegramIdentity | null>(null);

  useEffect(() => {
    const sync = () => setTelegramUser(readTelegramUser());
    sync();
    const tick = window.setInterval(sync, 300);
    const stop = window.setTimeout(() => window.clearInterval(tick), 5000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(stop);
    };
  }, []);

  const matches = useMemo(() => data?.response ?? [], [data]);
  const today = useMemo(() => {
    return matchesForDay(matches, "today")
      .slice()
      .sort((a, b) => {
        const rank = (match: typeof a) =>
          match.status === "LIVE" || match.status === "HT" ? 0 : 1;
        if (rank(a) !== rank(b)) return rank(a) - rank(b);
        return a.kickoffIso.localeCompare(b.kickoffIso);
      })
      .slice(0, 12);
  }, [matches]);
  const tomorrow = useMemo(() => matchesForDay(matches, "tomorrow").slice(0, 8), [matches]);
  const yesterday = useMemo(
    () => matchesForDay(matches, "yesterday").slice(0, 8),
    [matches],
  );
  const leagues = useMemo(() => uniqueLeagues(today), [today]);

  const todayLabel = today[0]
    ? formatCalendarDay(today[0].kickoffIso)
    : calendarDayFromYmd(utcDateOffset(0));
  const tomorrowLabel = tomorrow[0]
    ? formatCalendarDay(tomorrow[0].kickoffIso)
    : calendarDayFromYmd(utcDateOffset(1));
  const yesterdayLabel = yesterday[0]
    ? formatCalendarDay(yesterday[0].kickoffIso)
    : calendarDayFromYmd(utcDateOffset(-1));

  const resolvedHits = yesterday.filter((match) => match.result?.won).length;

  function scrollTo(id: string) {
    hapticTap();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleActivate(identity: TelegramIdentity) {
    if (activating) return;
    setActivating(true);
    setStatusIndex(0);
    hapticTap();
    for (let index = 0; index < ACTIVATION_STATUS.length; index += 1) {
      setStatusIndex(index);
      await new Promise((resolve) => setTimeout(resolve, ACTIVATION_STEP_MS));
    }
    hapticSuccess();
    onUnlock(identity.label);
  }

  const statusText = ACTIVATION_STATUS[statusIndex];

  return (
    <div className="relative min-h-dvh bg-navy pb-[4.75rem] lg:pb-10">
      <header className="sticky top-0 z-30 border-b border-[#1e2538] bg-[#0b0e17]/95 px-4 py-3 backdrop-blur-xl">
        <BetDataLogo version />
      </header>

      <section className="relative overflow-hidden px-4 pb-8 pt-10 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.22),transparent_42%)]" />
        <div className="relative">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">
            {BRAND.name}
          </p>
          <h1 className="mt-3 text-[2rem] font-black leading-[1.12] tracking-tight text-zinc-50">
            Deja de regalar tu dinero a los tipsters. Pásate a la IA.
          </h1>
          <p className="mx-auto mt-3 max-w-[24rem] text-[15px] leading-relaxed text-zinc-400">
            Obtén predicciones precisas en tiempo real basadas en datos, no en opiniones.
          </p>

          <div className="mx-auto mt-6 flex max-w-sm flex-col gap-2.5">
            <TelegramLogin
              onSuccess={handleActivate}
              busy={activating}
              hint={false}
              showBrowserButton={false}
              ctaLabel="Probar gratis en Telegram"
            />
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full"
              onClick={() => scrollTo("pronosticos-gratis")}
            >
              Ver un adelanto
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <div id="pronosticos-gratis" className="space-y-8 pb-8">
        {loading ? (
          <div className="space-y-2 px-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            <OptinTipsTable
              title="Adelanto de hoy"
              dateLabel={todayLabel}
              matches={today}
              onEnter={() => scrollTo("entrar")}
            />
            <OptinTipsTable
              title="Adelanto de mañana"
              dateLabel={tomorrowLabel}
              matches={tomorrow}
              onEnter={() => scrollTo("entrar")}
            />
            <OptinTipsTable
              title="Ayer, ya resuelto"
              dateLabel={yesterdayLabel}
              matches={yesterday}
              resolved
              onEnter={() => scrollTo("entrar")}
            />
          </>
        )}

        {yesterday.length > 0 ? (
          <p className="px-4 text-[13px] leading-relaxed text-zinc-500">
            De los {yesterday.length} pronósticos de ayer, la IA acertó {resolvedHits}.
            Entra con Telegram para ver el porqué de cada señal.
          </p>
        ) : null}
      </div>

      {leagues.length > 0 ? (
        <section className="px-4 pb-8">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Ligas de hoy
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {leagues.map((league) => (
              <div
                key={`${league.country}-${league.name}`}
                className="rounded-2xl border border-[#232a42] bg-[#121629] px-3 py-3 text-[13px] font-semibold text-zinc-100"
              >
                {league.name}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section id="entrar" className="px-4 pb-10">
        <div className="rounded-[24px] border border-[#2AABEE]/35 bg-[#121726] p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7dd3fc]">
            Registro
          </p>
          <h2 className="mt-2 text-xl font-black text-white">Entra con Telegram</h2>
          <p className="mt-1 text-[13px] text-slate-400">
            {telegramUser
              ? `Te reconocemos como ${telegramUser.label}. Un toque y estás dentro.`
              : "En Telegram, un toque con tu cuenta. En el navegador, entra igual y mira los pronósticos."}
          </p>
          <TelegramLogin className="mt-4" onSuccess={handleActivate} busy={activating} />
        </div>
        <p className="mt-3 text-center text-[10px] text-zinc-600">
          +18. Análisis, no consejo de apuesta. Juega con responsabilidad.
        </p>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1e2538] bg-[#0b0e17]/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 px-1 pb-[env(safe-area-inset-bottom)] pt-1">
          <NavItem icon={Trophy} label="Adelanto" onClick={() => scrollTo("pronosticos-gratis")} />
          <NavItem icon={LogIn} label="Entrar" accent onClick={() => scrollTo("entrar")} />
          <NavItem icon={Send} label="Telegram" accent={false} onClick={() => scrollTo("entrar")} />
        </div>
      </nav>

      <AnimatePresence>
        {activating ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#0b0e17]/92 px-6 text-center backdrop-blur-md"
          >
            <Loader2 className="h-9 w-9 animate-spin text-emerald-400" />
            <p className="text-base font-medium text-zinc-100">{statusText}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  onClick,
  accent = false,
}: {
  icon: typeof LogIn;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
        accent ? "text-emerald-400" : "text-zinc-500"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
