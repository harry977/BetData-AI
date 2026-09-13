"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Layers, Send } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { ComboScan } from "@/components/signals/combo-scan";
import { Button } from "@/components/ui/button";
import {
  buildAccumulator,
  comboShareText,
  marketLabel,
  type ComboFilters,
  type ComboTicket,
  type LegMode,
  type MarketKey,
} from "@/lib/accumulator";
import { hapticSuccess, hapticTap, shareToTelegram } from "@/lib/telegram";
import type { MatchInsight } from "@/lib/types";
import { cn, formatOdds } from "@/lib/utils";

const MARKET_OPTIONS: MarketKey[] = ["1x2", "ou", "btts", "dc"];
const LEG_OPTIONS: { id: LegMode; label: string }[] = [
  { id: "auto", label: "Automático" },
  { id: "2-3", label: "2 a 3" },
  { id: "4-5", label: "4 a 5" },
  { id: "6+", label: "6+" },
];
const ODDS_PRESETS = [
  { label: "Cuota 2.00", value: 2 },
  { label: "Cuota 3.50", value: 3.5 },
  { label: "Cuota 5.00+", value: 5 },
];

type CombinadasViewProps = {
  matches: MatchInsight[];
};

export function CombinadasView({ matches }: CombinadasViewProps) {
  const [targetOdds, setTargetOdds] = useState(3.5);
  const [legs, setLegs] = useState<LegMode>("auto");
  const [markets, setMarkets] = useState<MarketKey[]>(["1x2", "ou", "btts"]);
  const [minConfidence, setMinConfidence] = useState(7.5);
  const [scanning, setScanning] = useState(false);
  const [ticket, setTicket] = useState<ComboTicket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filters: ComboFilters = useMemo(
    () => ({ targetOdds, legs, markets, minConfidence }),
    [targetOdds, legs, markets, minConfidence],
  );

  const finishScan = useCallback(() => {
    const result = buildAccumulator(matches, filters);
    setScanning(false);
    if (result.ok) {
      setTicket(result.ticket);
      setError(null);
    } else {
      setTicket(null);
      setError(result.reason);
    }
  }, [filters, matches]);

  function toggleMarket(key: MarketKey) {
    hapticTap();
    setMarkets((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  }

  function generate() {
    hapticTap();
    setCopied(false);
    setTicket(null);
    setError(null);
    setScanning(true);
  }

  async function copyTicket(current: ComboTicket) {
    hapticTap();
    const text = comboShareText(current);
    try {
      await navigator.clipboard.writeText(text);
      hapticSuccess();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("No se pudo copiar. Usa Ver en Telegram.");
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-neon">
          <Layers className="h-4 w-4" />
          Combinadas IA
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Selecciona tu cuota objetivo y la IA armará la mejor combinación del día
          basada en datos de rendimiento real.
        </p>
      </header>

      <section className="space-y-3 rounded-[24px] border border-white/8 bg-[#121726] p-4">
        <div>
          <div className="flex items-end justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Cuota total objetivo
            </p>
            <p className="font-mono text-2xl font-black tabular-nums text-neon">
              {targetOdds.toFixed(2)}
            </p>
          </div>
          <input
            type="range"
            min={1.5}
            max={10}
            step={0.05}
            value={targetOdds}
            onChange={(event) => setTargetOdds(Number(event.target.value))}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-neon"
            aria-label="Cuota total objetivo"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {ODDS_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  hapticTap();
                  setTargetOdds(preset.value);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em]",
                  Math.abs(targetOdds - preset.value) < 0.05
                    ? "border-neon bg-neon/15 text-neon"
                    : "border-white/10 text-slate-300",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Número de partidos
          </p>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {LEG_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  hapticTap();
                  setLegs(option.id);
                }}
                className={cn(
                  "rounded-2xl border px-1 py-2 text-[11px] font-black uppercase tracking-[0.06em]",
                  legs === option.id
                    ? "border-neon bg-neon/15 text-neon"
                    : "border-white/10 text-slate-300",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Mercados incluidos
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {MARKET_OPTIONS.map((key) => {
              const on = markets.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleMarket(key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.06em]",
                    on
                      ? "border-neon bg-neon/15 text-neon"
                      : "border-white/10 text-slate-400",
                  )}
                >
                  {on ? "✓ " : ""}
                  {marketLabel(key)}
                </button>
              );
            })}
          </div>
          {markets.includes("dc") ? (
            <p className="mt-2 text-[11px] leading-snug text-slate-500">
              Doble oportunidad se calcula desde las cuotas 1X2 del feed. No inventamos un mercado aparte.
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex items-end justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Nivel de confianza mínimo
            </p>
            <p className="font-mono text-lg font-black tabular-nums text-white">
              {minConfidence.toFixed(1)}
              <span className="text-sm text-slate-500">/10</span>
            </p>
          </div>
          <input
            type="range"
            min={5}
            max={9.5}
            step={0.1}
            value={minConfidence}
            onChange={(event) => setMinConfidence(Number(event.target.value))}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-neon"
            aria-label="Confianza mínima"
          />
        </div>
      </section>

      <Button
        type="button"
        size="lg"
        className="h-12 w-full rounded-2xl text-[15px] font-black uppercase tracking-[0.12em]"
        disabled={scanning}
        onClick={generate}
      >
        Generar combinada
      </Button>

      {scanning ? <ComboScan onDone={finishScan} /> : null}

      {error && !scanning ? (
        <p className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-100">
          {error}
        </p>
      ) : null}

      <AnimatePresence>
        {ticket && !scanning ? (
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-[28px] border border-neon/40 bg-[#121800] p-4 shadow-[0_0_28px_rgba(184,255,0,0.18)]"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neon">
              Boleto combinado IA
            </p>
            <p className="mt-2 text-4xl font-black tabular-nums text-neon">
              {formatOdds(ticket.totalOdds)}
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-neon/80">
              Objetivo {formatOdds(ticket.targetOdds)} · media {ticket.avgConfidence}/10
            </p>

            <ul className="mt-4 space-y-2">
              {ticket.legs.map((leg) => (
                <li
                  key={leg.matchId}
                  className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-black uppercase text-white">
                        {leg.home} — {leg.away}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-snug text-slate-200">
                        {leg.plain}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                        {leg.market}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-sm font-black text-white">
                        {formatOdds(leg.odds)}
                      </p>
                      <p className="mt-1 text-lg font-black tabular-nums text-neon">
                        {leg.confidence.toFixed(1)}
                        <span className="text-xs text-neon/70">/10</span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl text-[12px] font-black uppercase"
                onClick={() => void copyTicket(ticket)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiada" : "Copiar combinada"}
              </Button>
              <Button
                type="button"
                variant="telegram"
                className="h-11 rounded-2xl text-[12px] font-black uppercase"
                onClick={() => void shareToTelegram(comboShareText(ticket))}
              >
                <Send className="h-4 w-4" />
                Ver en Telegram
              </Button>
            </div>
          </motion.article>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
