"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { ChevronDown, Send, X } from "lucide-react";
import { useEffect, useState, type PointerEvent, type ReactNode } from "react";
import { TeamCrest } from "@/components/brand/team-crest";
import { BetBonusCta } from "@/components/signals/bet-bonus-cta";
import { SignalCopy } from "@/components/signals/signal-copy";
import { Button } from "@/components/ui/button";
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
import type { MatchInsight } from "@/lib/types";
import { cn } from "@/lib/utils";

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
        className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-[28px] border-t border-white/10 bg-[#121726] lg:hidden"
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
          onClose={onClose}
          handle
          onHandlePointerDown={(event) => dragControls.start(event)}
        />
      </motion.div>

      <motion.aside
        className="absolute inset-y-0 right-0 hidden w-full max-w-md flex-col border-l border-white/10 bg-[#121726] shadow-[-24px_0_60px_rgba(0,0,0,0.45)] lg:flex"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
      >
        <SheetBody match={view} onClose={onClose} />
      </motion.aside>
    </div>
  );
}

function SheetBody({
  match,
  onClose,
  handle = false,
  onHandlePointerDown,
}: {
  match: MatchInsight;
  onClose: () => void;
  handle?: boolean;
  onHandlePointerDown?: (event: PointerEvent) => void;
}) {
  const clock = headerClock(match);
  const [open, setOpen] = useState({ markets: true, stats: true, context: false });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="sticky top-0 z-10 shrink-0 border-b border-white/8 bg-[#121726]/95 px-4 pb-4 pt-2 backdrop-blur-xl">
        {handle ? (
          <div
            className="mb-3 flex cursor-grab justify-center touch-none active:cursor-grabbing"
            onPointerDown={onHandlePointerDown}
          >
            <span className="h-1.5 w-12 rounded-full bg-white/25" />
          </div>
        ) : (
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <p className="text-center text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
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
            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-300">
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

        <div className="mt-4 rounded-[22px] border border-[#00E676]/40 bg-black/40 p-4 shadow-[0_0_24px_rgba(0,230,118,0.18)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00E676]">
            Mejor consejo IA
          </p>
          <div className="mt-2">
            <SignalCopy match={match} size="md" />
          </div>
          <p className="mt-3 font-black leading-none tabular-nums text-[#00E676]">
            <span className="text-5xl">{match.confidence.toFixed(1)}</span>
            <span className="ml-1 text-lg text-gray-300">/10</span>
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
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
                  "rounded-2xl border bg-black/30 px-3 py-3",
                  cell.highlight ? "border-[#00E676]/50" : "border-white/8",
                )}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  {cell.label}
                </p>
                <p className="mt-1 text-sm font-black uppercase leading-tight text-white">
                  {cell.pick}
                </p>
                {cell.odds ? (
                  <p className="mt-1 font-mono text-xs text-emerald-300">{cell.odds}</p>
                ) : null}
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

        <Accordion
          title="3. H2H y contexto"
          open={open.context}
          onToggle={() => {
            hapticTap();
            setOpen((state) => ({ ...state, context: !state.context }));
          }}
        >
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-3 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-amber-300">
              Alerta de contexto
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug text-white">
              {contextAlert(match)}
            </p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{contextBody(match)}</p>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">
            Sin historial cara a cara en el feed. No inventamos H2H.
          </p>
        </Accordion>
      </div>

      <footer className="shrink-0 space-y-2 border-t border-white/8 bg-[#121726] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
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
            className="h-11 w-full rounded-2xl text-sm font-black uppercase tracking-[0.16em] text-slate-400"
          >
            Cerrar
          </button>
        ) : null}
      </footer>
    </div>
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
    <section className="overflow-hidden rounded-2xl border border-white/8 bg-black/20">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-cyan-300">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
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
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
          {row.label}
        </p>
        <p className="mt-1 text-[12px] font-semibold text-slate-500">Pendiente de sincronizar</p>
      </div>
    );
  }

  const share = pairShare(row.home, row.away);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
          {row.label}
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
          {homeCode} {formatStatValue(row.home, row.format)} · {awayCode}{" "}
          {formatStatValue(row.away, row.format)}
        </p>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-black/70 ring-1 ring-white/10">
        <div
          className="h-full bg-[#00E676] transition-[width] duration-700"
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
