import { explainTip } from "@/lib/tip-copy";
import type { MatchInsight } from "@/lib/types";
import { formatOdds } from "@/lib/utils";

export type MarketKey = "1x2" | "ou" | "btts" | "dc";

export type LegMode = "auto" | "2-3" | "4-5" | "6+";

export type ComboFilters = {
  targetOdds: number;
  legs: LegMode;
  markets: MarketKey[];
  minConfidence: number;
};

export type ComboLeg = {
  matchId: number;
  home: string;
  away: string;
  homeCode: string;
  awayCode: string;
  pick: string;
  plain: string;
  market: string;
  odds: number;
  confidence: number;
};

export type ComboTicket = {
  legs: ComboLeg[];
  totalOdds: number;
  avgConfidence: number;
  targetOdds: number;
};

export type ComboResult =
  | { ok: true; ticket: ComboTicket }
  | { ok: false; reason: string };

const MARKET_LABEL: Record<MarketKey, string> = {
  "1x2": "Resultado 1X2",
  ou: "Más/Menos goles",
  btts: "Ambos anotan",
  dc: "Doble oportunidad",
};

export function marketLabel(key: MarketKey) {
  return MARKET_LABEL[key];
}

function roundOdds(value: number) {
  return Number(Math.max(1.01, value).toFixed(2));
}

function implied(odds: number) {
  return odds > 1 ? 1 / odds : 0;
}

function combineOdds(a: number, b: number) {
  const p = implied(a) + implied(b);
  if (p <= 0 || p >= 1) return null;
  return roundOdds(1 / p);
}

export function doubleChanceFrom1x2(match: MatchInsight): ComboLeg | null {
  const { home, draw, away } = match.odds;
  if (home < 1.01 || draw < 1.01 || away < 1.01) return null;
  const pick = match.markets.oneXTwo.pick;
  let code: "1X" | "X2" | "12";
  let odds: number | null;
  if (pick === "1") {
    code = "1X";
    odds = combineOdds(home, draw);
  } else if (pick === "2") {
    code = "X2";
    odds = combineOdds(draw, away);
  } else {
    code = "12";
    odds = combineOdds(home, away);
  }
  if (odds == null) return null;
  const copy = explainTip(code, match.home.name, match.away.name);
  return {
    matchId: match.id,
    home: match.home.name,
    away: match.away.name,
    homeCode: match.home.code,
    awayCode: match.away.code,
    pick: code,
    plain: copy.plain,
    market: `${copy.market} · desde 1X2`,
    odds,
    confidence: match.confidence,
  };
}

function fromMarket(match: MatchInsight, key: Exclude<MarketKey, "dc">): ComboLeg {
  const block =
    key === "1x2"
      ? match.markets.oneXTwo
      : key === "ou"
        ? match.markets.overUnder
        : match.markets.btts;
  const copy = explainTip(block.pick, match.home.name, match.away.name);
  return {
    matchId: match.id,
    home: match.home.name,
    away: match.away.name,
    homeCode: match.home.code,
    awayCode: match.away.code,
    pick: block.pick,
    plain: copy.plain,
    market: copy.market,
    odds: roundOdds(block.odds),
    confidence: match.confidence,
  };
}

function bestTipKey(match: MatchInsight): MarketKey {
  const tip = match.bestTip.toLowerCase();
  if (/btts|gg|ng|ambos/.test(tip)) return "btts";
  if (/over|under|^o\d|^u\d/.test(tip)) return "ou";
  return "1x2";
}

export function pickMatchLeg(match: MatchInsight, markets: MarketKey[]): ComboLeg | null {
  if (markets.length === 0) return null;
  const preferred = bestTipKey(match);
  const order: MarketKey[] = [
    preferred,
    ...markets.filter((key) => key !== preferred),
  ];
  for (const key of order) {
    if (!markets.includes(key)) continue;
    if (key === "dc") {
      const dc = doubleChanceFrom1x2(match);
      if (dc) return dc;
      continue;
    }
    return fromMarket(match, key);
  }
  return null;
}

export function eligibleMatches(matches: MatchInsight[], minConfidence: number) {
  return matches.filter(
    (match) =>
      match.day === "today" &&
      match.status !== "FT" &&
      !match.result &&
      match.confidence >= minConfidence,
  );
}

export function legBounds(mode: LegMode, targetOdds: number, poolSize: number): [number, number] {
  if (mode === "2-3") return [2, Math.min(3, poolSize)];
  if (mode === "4-5") return [4, Math.min(5, poolSize)];
  if (mode === "6+") return [6, Math.min(8, poolSize)];
  const auto = targetOdds < 2.2 ? 2 : targetOdds < 3.8 ? 3 : targetOdds < 6 ? 4 : 5;
  return [Math.min(2, poolSize), Math.min(auto, poolSize)];
}

function productOf(legs: ComboLeg[]) {
  return legs.reduce((total, leg) => total * leg.odds, 1);
}

function scoreTicket(legs: ComboLeg[], target: number) {
  const total = productOf(legs);
  const avg = legs.reduce((sum, leg) => sum + leg.confidence, 0) / legs.length;
  const distance = Math.abs(Math.log(total) - Math.log(Math.max(target, 1.01)));
  const shortfall = total < target * 0.88 ? (target * 0.88 - total) / target : 0;
  return distance + shortfall * 1.4 - avg * 0.015;
}

export function buildAccumulator(
  matches: MatchInsight[],
  filters: ComboFilters,
): ComboResult {
  if (filters.markets.length === 0) {
    return { ok: false, reason: "Elige al menos un mercado para armar la combinada." };
  }

  const pool = eligibleMatches(matches, filters.minConfidence)
    .map((match) => pickMatchLeg(match, filters.markets))
    .filter((leg): leg is ComboLeg => Boolean(leg))
    .sort((a, b) => b.confidence - a.confidence || a.odds - b.odds);

  if (pool.length === 0) {
    return {
      ok: false,
      reason:
        "Sin partidos de hoy que cumplan la confianza mínima. Baja el filtro o espera a que el feed traiga la jornada.",
    };
  }

  const [minN, maxN] = legBounds(filters.legs, filters.targetOdds, pool.length);
  if (pool.length < minN) {
    return {
      ok: false,
      reason: `Hacen falta al menos ${minN} partidos y solo hay ${pool.length} con estos filtros.`,
    };
  }

  const beam = pool.slice(0, 14);
  const found: { legs: ComboLeg[]; score: number } = {
    legs: [],
    score: Number.POSITIVE_INFINITY,
  };

  function walk(start: number, chosen: ComboLeg[]) {
    if (chosen.length > maxN) return;
    if (chosen.length >= minN) {
      const score = scoreTicket(chosen, filters.targetOdds);
      if (score < found.score) {
        found.score = score;
        found.legs = chosen.slice();
      }
    }
    if (chosen.length === maxN) return;
    for (let index = start; index < beam.length; index += 1) {
      chosen.push(beam[index]);
      walk(index + 1, chosen);
      chosen.pop();
    }
  }

  walk(0, []);

  if (found.legs.length === 0) {
    return { ok: false, reason: "No se pudo armar un boleto con esos parámetros." };
  }

  const totalOdds = Number(productOf(found.legs).toFixed(2));
  const avgConfidence = Number(
    (found.legs.reduce((sum, leg) => sum + leg.confidence, 0) / found.legs.length).toFixed(1),
  );

  return {
    ok: true,
    ticket: {
      legs: found.legs,
      totalOdds,
      avgConfidence,
      targetOdds: filters.targetOdds,
    },
  };
}

export function comboShareText(ticket: ComboTicket) {
  const lines = [
    `Combinada IA · cuota total ${formatOdds(ticket.totalOdds)}`,
    `Objetivo ${formatOdds(ticket.targetOdds)} · confianza media ${ticket.avgConfidence}/10`,
    ...ticket.legs.map(
      (leg) =>
        `${leg.homeCode} – ${leg.awayCode} · ${leg.plain} ${formatOdds(leg.odds)} · ${leg.confidence.toFixed(1)}/10`,
    ),
  ];
  return lines.join("\n");
}
