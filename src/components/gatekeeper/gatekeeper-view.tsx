"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronDown,
  Gift,
  Loader2,
  LogIn,
  Trophy,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BetDataLogo } from "@/components/brand/betdata-logo";
import { OptinTipsTable } from "@/components/gatekeeper/optin-tips-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFixtures } from "@/hooks/use-fixtures";
import {
  ACTIVATION_STATUS,
  ACTIVATION_STEP_MS,
  BONUS_URL,
  BRAND,
  PLATFORM_STATS,
  WELCOME_BONUS,
} from "@/lib/constants";
import { calendarDayFromYmd, formatCalendarDay, utcDateOffset } from "@/lib/dates";
import { isLigaBbva, uniqueLeagues } from "@/lib/leagues";
import { hapticSuccess, hapticTap, openExternal } from "@/lib/telegram";
import { matchesForDay } from "@/lib/utils";

type GatekeeperViewProps = {
  onUnlock: (accountId: string) => void;
};

export function GatekeeperView({ onUnlock }: GatekeeperViewProps) {
  const { data, loading } = useFixtures();
  const [accountId, setAccountId] = useState("");
  const [activating, setActivating] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [accessOpen, setAccessOpen] = useState(false);

  const matches = data?.response ?? [];
  const today = useMemo(() => {
    return matchesForDay(matches, "today")
      .slice()
      .sort((a, b) => {
        const rank = (match: (typeof a)) =>
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
  const ligaBbva = useMemo(() => today.filter(isLigaBbva).slice(0, 6), [today]);
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

  function openBonus() {
    hapticTap();
    openExternal(BONUS_URL);
  }

  function scrollTo(id: string) {
    hapticTap();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    <div className="relative min-h-dvh bg-navy pb-[4.75rem]">
      <header className="sticky top-0 z-30 border-b border-[#1e2538] bg-[#0b0e17]/95 px-4 py-3 backdrop-blur-xl">
        <BetDataLogo version />
      </header>

      <section className="relative overflow-hidden px-4 pb-8 pt-10 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.22),transparent_42%)]" />
        <div className="relative">
          <h1 className="text-[2.05rem] font-semibold leading-[1.12] tracking-tight text-zinc-50">
            Pronósticos de Fútbol con IA
          </h1>
          <p className="mx-auto mt-3 max-w-[22rem] text-[15px] leading-relaxed text-zinc-400">
            {BRAND.name} analiza el día con BD APEX AI: más de {PLATFORM_STATS.leaguesMonitored}{" "}
            ligas y picks actualizados con SportAPI. Cada jornada, pronósticos gratis.
          </p>

          <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-emerald-400/35 bg-emerald-500/15 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Liga BBVA
            </p>
            <p className="mt-1 text-lg font-semibold leading-tight text-zinc-50">
              {WELCOME_BONUS.headline}
            </p>
            <p className="mt-1 text-[13px] leading-snug text-emerald-100/80">
              {WELCOME_BONUS.detail}
            </p>
          </div>

          <div className="mx-auto mt-5 flex max-w-sm flex-col gap-2.5">
            <Button size="lg" className="h-12 rounded-full text-base" onClick={openBonus}>
              Reclamar bono de {WELCOME_BONUS.amount}
              <Gift className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full"
              onClick={() => scrollTo("pronosticos-gratis")}
            >
              Ver pronósticos gratis
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {ligaBbva.length > 0 ? (
        <section className="px-4 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
            Liga BBVA · Hoy {todayLabel}
          </p>
          <div className="mt-2 space-y-2">
            {ligaBbva.map((match) => (
              <button
                key={match.id}
                type="button"
                onClick={openBonus}
                className="flex w-full items-center justify-between rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2.5 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-zinc-50">
                    {match.home.name} — {match.away.name}
                  </span>
                  <span className="text-[12px] text-emerald-300">{match.bestTip}</span>
                </span>
                <span className="font-mono text-sm text-emerald-200">
                  {match.confidence.toFixed(1)}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div id="pronosticos-gratis" className="space-y-8 pb-8">
        {loading ? (
          <div className="space-y-2 px-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            <OptinTipsTable
              title="Pronósticos gratis de hoy"
              dateLabel={todayLabel}
              matches={today}
              onOpenBonus={openBonus}
            />
            <OptinTipsTable
              title="Pronósticos gratis de mañana"
              dateLabel={tomorrowLabel}
              matches={tomorrow}
              onOpenBonus={openBonus}
            />
            <OptinTipsTable
              title="Pronósticos gratis de ayer, resueltos"
              dateLabel={yesterdayLabel}
              matches={yesterday}
              resolved
              onOpenBonus={openBonus}
            />
          </>
        )}

        {yesterday.length > 0 ? (
          <p className="px-4 text-[13px] leading-relaxed text-zinc-500">
            De los {yesterday.length} pronósticos gratis resueltos ayer, acertamos{" "}
            {resolvedHits}. Cada pick se cruza con el marcador final real.
          </p>
        ) : null}
      </div>

      {leagues.length > 0 ? (
        <section className="px-4 pb-10">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Ligas principales
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

      <section className="px-4 pb-8">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
          Historial desde 2021
        </p>
        <h2 className="mt-2 text-center text-[1.65rem] font-semibold leading-tight text-zinc-50">
          Un modelo propio de inteligencia futbolística
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">
          BD APEX AI valora partidos con forma reciente, cuotas implícitas y xG cuando
          SportAPI lo publica. Cada día se actualizan los pronósticos de hoy, mañana y
          los resueltos de ayer.
        </p>
      </section>

      <section id="acceder" className="px-4 pb-10">
        <button
          type="button"
          onClick={() => {
            hapticTap();
            setAccessOpen((open) => !open);
          }}
          className="flex w-full items-center justify-between rounded-2xl border border-[#1e2538] bg-panel px-4 py-3 text-left"
        >
          <span>
            <span className="block text-[11px] uppercase tracking-[0.14em] text-zinc-500">
              Ya tienes cuenta
            </span>
            <span className="text-sm font-semibold text-zinc-100">Acceder a BetData AI</span>
          </span>
          <ChevronDown className={`h-4 w-4 text-zinc-500 ${accessOpen ? "rotate-180" : ""}`} />
        </button>
        {accessOpen ? (
          <div className="mt-2 rounded-2xl border border-[#1e2538] bg-panel p-3">
            <Input
              autoComplete="email"
              placeholder="ID de usuario o correo"
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              disabled={activating}
            />
            <Button
              className="mt-2 w-full"
              size="lg"
              disabled={activating}
              onClick={() => void handleActivate()}
            >
              Activar motor
            </Button>
          </div>
        ) : null}
        <p className="mt-3 text-center text-[10px] text-zinc-600">
          +18. Análisis, no consejo de apuesta. Juega con responsabilidad.
        </p>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1e2538] bg-[#0b0e17]/95 backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)] pt-1">
          <NavItem
            icon={Trophy}
            label="Hoy"
            onClick={() => scrollTo("pronosticos-gratis")}
          />
          <NavItem
            icon={CalendarDays}
            label="Partidos"
            onClick={() => scrollTo("pronosticos-gratis")}
          />
          <NavItem icon={Gift} label="Bono" accent onClick={openBonus} />
          <NavItem icon={LogIn} label="Acceder" onClick={() => scrollTo("acceder")} />
          <NavItem icon={UserPlus} label="Registro" onClick={openBonus} />
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
  icon: typeof Gift;
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
