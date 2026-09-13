"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { ChevronDown, Send, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { TeamCrest } from "@/components/brand/team-crest";
import { BetBonusCta } from "@/components/signals/bet-bonus-cta";
import { SignalCopy } from "@/components/signals/signal-copy";
import { Button } from "@/components/ui/button";
import { useEventIncidents } from "@/hooks/use-event-incidents";
import { useEventStatistics } from "@/hooks/use-event-statistics";
import {
  contextAlert,
  contextBody,
  formatStatValue,
  headerClock,
  marketCells,
  matchShareText,
  pairShare,
  predictedStatRows,
  type StatRow,
} from "@/lib/match-sheet";
import { hapticTap, shareToTelegram } from "@/lib/telegram";
import type { MatchIncident, MatchInsight } from "@/lib/types";
import { cn, isInPlayStatus } from "@/lib/utils";

type MatchSheetProps = {
  match: MatchInsight | null;
  onClose: () => void;
};

export function MatchSheet({ match, onClose }: MatchSheetProps) {
  return (
    <AnimatePresence>
      {match ? <SheetFrame match={match} onClose={onClose} /> : null}
    </AnimatePresence>
  );
}

function SheetFrame({ match, onClose }: { match: MatchInsight; onClose: () => void }) {
  const { metrics } = useEventStatistics(match.id);
  const { incidents, loading: incidentsLoading } = useEventIncidents(
    match.id,
    isInPlayStatus(match.status),
  );
  const view: MatchInsight = metrics ? { ...match, metrics: { ...match.metrics, ...metrics } } : match;
  const dragControls = useDragControls();

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70]">
      <motion.button
        type="button"
        aria-label="Cerrar ficha"
        className="absolute inset-0 bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[28px] border-t border-white/10 bg-[#121726] lg:hidden"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.04, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 90 || info.velocity.y > 700) onClose();
        }}
      >
        <SheetBody
          match={view}
          incidents={incidents}
          incidentsLoading={incidentsLoading}
          onClose={onClose}
          handle
          onHandlePointerDown={(event) => dragControls.start(event)}
        />
      </motion.div>

      <motion.aside
        className="absolute inset-y-0 right-0 hidden w-full max-w-md flex-col overflow-hidden border-l border-white/10 bg-[#121726] shadow-[-24px_0_60px_rgba(0,0,0,0.45)] lg:flex"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
      >
        <SheetBody
          match={view}
          incidents={incidents}
          incidentsLoading={incidentsLoading}
          onClose={onClose}
        />
      </motion.aside>
    </div>
  );
}

function SheetBody({
  match,
  incidents,
  incidentsLoading,
  onClose,
  handle = false,
  onHandlePointerDown,
}: {
  match: MatchInsight;
  incidents: MatchIncident[];
  incidentsLoading: boolean;
  onClose: () => void;
  handle?: boolean;
  onHandlePointerDown?: (event: PointerEvent) => void;
}) {
  const clock = headerClock(match);
  const [open, setOpen] = useState({ markets: true, stats: true, incidents: true, context: true });
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ up: false, down: false });

  const updateOverflow = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const up = el.scrollTop > 12;
    const down = el.scrollTop + el.clientHeight < el.scrollHeight - 12;
    setOverflow({ up, down });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateOverflow();
    el.addEventListener("scroll", updateOverflow, { passive: true });
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateOverflow);
      observer.disconnect();
    };
  }, [match.id, open, updateOverflow]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 overflow-hidden border-b border-white/10 bg-[#161b2c] px-4 pb-3 pt-2">
        {handle ? (
          <div
            className="mb-3 flex cursor-grab justify-center touch-none active:cursor-grabbing"
            onPointerDown={onHandlePointerDown}
          >
            <span className="h-1.5 w-12 rounded-full bg-white/45" />
          </div>
        ) : (
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-zinc-300 hover:bg-white/5 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <p className="text-center text-[10px] font-black uppercase tracking-[0.18em] text-zinc-300">
          {match.league.name}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
            <TeamCrest team={match.home} size={52} />
            <p className="w-full truncate text-[12px] font-black uppercase text-white">
              {match.home.name}
            </p>
          </div>
          <div className="shrink-0 text-center">
            <p className="text-3xl font-black tabular-nums leading-none text-white">{clock.score}</p>
            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.14em] text-neon">
              {clock.meta}
            </p>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
            <TeamCrest team={match.away} size={52} />
            <p className="w-full truncate text-[12px] font-black uppercase text-white">
              {match.away.name}
            </p>
          </div>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollerRef}
          className="sheet-scroll h-full space-y-3 overflow-y-auto overscroll-contain px-4 py-3"
        >
          <div className="rounded-[22px] border border-neon/40 bg-black/50 p-4 shadow-[0_0_24px_rgba(184,255,0,0.18)]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neon">
              Mejor consejo IA
            </p>
            <div className="mt-2">
              <SignalCopy match={match} size="md" />
            </div>
            <p className="mt-3 font-black leading-none tabular-nums text-neon">
              <span className="text-5xl">{match.confidence.toFixed(1)}</span>
              <span className="ml-1 text-lg text-zinc-300">/10</span>
            </p>
          </div>

          <Accordion
            title="1. Pronósticos por mercado"
            open={open.markets}
            onToggle={() => {
              hapticTap();
              setOpen((state) => ({ ...state, markets: !state.markets }));
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              {marketCells(match).map((cell) => (
                <div
                  key={cell.key}
                  className={cn(
                    "min-h-[6.5rem] rounded-2xl border bg-[#0d111c] px-3 py-3",
                    cell.highlight ? "border-neon/60" : "border-white/15",
                  )}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-300">
                    {cell.label}
                  </p>
                  <p className="mt-1.5 text-sm font-black uppercase leading-snug text-white">
                    {cell.pick}
                  </p>
                  {cell.odds ? (
                    <p className="mt-2 font-mono text-sm font-semibold text-neon">{cell.odds}</p>
                  ) : (
                    <p className="mt-2 text-[11px] font-semibold text-zinc-400">Sin cuota</p>
                  )}
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion
            title="2. Predicción de estadísticas"
            open={open.stats}
            onToggle={() => {
              hapticTap();
              setOpen((state) => ({ ...state, stats: !state.stats }));
            }}
          >
            <div className="space-y-3">
              {predictedStatRows(match).map((row) => (
                <CompareBar
                  key={row.key}
                  row={row}
                  homeCode={match.home.code}
                  awayCode={match.away.code}
                />
              ))}
            </div>
          </Accordion>

          {isInPlayStatus(match.status) ? (
            <Accordion
              title="3. Incidentes en directo"
              open={open.incidents}
              onToggle={() => {
                hapticTap();
                setOpen((state) => ({ ...state, incidents: !state.incidents }));
              }}
            >
              <IncidentsList incidents={incidents} loading={incidentsLoading} />
            </Accordion>
          ) : null}

          <Accordion
            title={isInPlayStatus(match.status) ? "4. Cara a cara y contexto" : "3. Cara a cara y contexto"}
            open={open.context}
            onToggle={() => {
              hapticTap();
              setOpen((state) => ({ ...state, context: !state.context }));
            }}
          >
            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-3 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-amber-200">
                Alerta de contexto
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug text-white">
                {contextAlert(match)}
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-200">{contextBody(match)}</p>
            <p className="mt-2 text-[11px] font-semibold text-zinc-400">
              Sin historial cara a cara en el feed. No inventamos enfrentamientos.
            </p>
          </Accordion>
        </div>

        {overflow.up ? (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#121726] to-transparent"
            aria-hidden
          />
        ) : null}
        {overflow.down ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-14 items-end justify-center bg-gradient-to-t from-[#121726] via-[#121726]/90 to-transparent pb-1">
            <p className="inline-flex items-center gap-1 rounded-full border border-neon/40 bg-black/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-neon">
              Desliza para ver más
              <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
            </p>
          </div>
        ) : null}
      </div>

      <footer className="shrink-0 space-y-2 border-t border-white/10 bg-[#161b2c] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <Button
          type="button"
          variant="telegram"
          size="lg"
          className="h-12 w-full rounded-2xl text-[15px] font-black"
          onClick={() => {
            void shareToTelegram(matchShareText(match));
          }}
        >
          <Send className="h-4 w-4" />
          Enviar a Telegram
        </Button>
        <BetBonusCta />
        {handle ? (
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-2xl text-sm font-black uppercase tracking-[0.16em] text-zinc-300"
          >
            Cerrar
          </button>
        ) : null}
      </footer>
    </div>
  );
}

function IncidentsList({
  incidents,
  loading,
}: {
  incidents: MatchIncident[];
  loading: boolean;
}) {
  if (loading && incidents.length === 0) {
    return <p className="text-[12px] font-semibold text-zinc-400">Sincronizando goles y tarjetas…</p>;
  }
  if (incidents.length === 0) {
    return (
      <p className="text-[12px] font-semibold text-zinc-400">
        Aún no hay goles, tarjetas ni córners registrados en este partido.
      </p>
    );
  }

  const visible = incidents.filter((row) =>
    ["goal", "card", "corner"].includes(row.type),
  );
  const rows = visible.length ? visible : incidents.slice(-12);

  return (
    <ol className="space-y-2">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex items-start gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2"
        >
          <span
            className={
              row.type === "goal"
                ? "mt-0.5 text-[11px] font-black uppercase tracking-[0.12em] text-neon"
                : row.type === "card"
                  ? "mt-0.5 text-[11px] font-black uppercase tracking-[0.12em] text-amber-300"
                  : "mt-0.5 text-[11px] font-black uppercase tracking-[0.12em] text-cyan-300"
            }
          >
            {row.type === "goal" ? "Gol" : row.type === "card" ? "Tarjeta" : row.type === "corner" ? "Córner" : "Juego"}
          </span>
          <p className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-white">
            {row.label}
          </p>
        </li>
      ))}
    </ol>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/15 bg-[#0d111c]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-cyan-200">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-zinc-300 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function CompareBar({
  row,
  homeCode,
  awayCode,
}: {
  row: StatRow;
  homeCode: string;
  awayCode: string;
}) {
  if (row.home == null || row.away == null) {
    return (
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300">
          {row.label}
        </p>
        <p className="mt-1 text-[12px] font-semibold text-zinc-400">Pendiente de sincronizar</p>
      </div>
    );
  }

  const share = pairShare(row.home, row.away);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-200">
          {row.label}
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.08em] text-zinc-300">
          {homeCode} {formatStatValue(row.home, row.format)} · {awayCode}{" "}
          {formatStatValue(row.away, row.format)}
        </p>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-black/70 ring-1 ring-white/15">
        <div
          className="h-full bg-neon transition-[width] duration-700"
          style={{ width: `${share.homePct}%` }}
        />
        <div
          className="h-full bg-cyan-400/80 transition-[width] duration-700"
          style={{ width: `${share.awayPct}%` }}
        />
      </div>
    </div>
  );
}
