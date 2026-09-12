import type { MatchInsight } from "@/lib/types";
import { formatKickoff, isBanker, liveMatches, statusLabel } from "@/lib/utils";

export type WhyItem = {
  key: string;
  title: string;
  body: string;
  pending?: boolean;
};

export function confidenceBand(value: number) {
  if (value >= 8) return "HIGH";
  if (value >= 6) return "MEDIUM";
  return "LOW";
}

export type SignalRarity = "STANDARD" | "STRONG" | "ELITE";

export function signalRarity(value: number): SignalRarity {
  if (value >= 9) return "ELITE";
  if (value >= 8) return "STRONG";
  return "STANDARD";
}

export function rarityTone(rarity: SignalRarity) {
  if (rarity === "ELITE") return "text-violet-300 border-violet-400/40";
  if (rarity === "STRONG") return "text-cyan-300 border-cyan-400/40";
  return "text-emerald-300 border-emerald-500/30";
}

export type WhyMeter = { key: string; label: string; value: number };

function clampMeter(value: number) {
  return Math.max(0, Math.min(10, Number(value.toFixed(1))));
}

export function whyMeters(match: MatchInsight): WhyMeter[] {
  const goals = match.metrics.xG.home + match.metrics.xG.away;
  return [
    { key: "form", label: "Forma", value: clampMeter(match.hitRate / 10) },
    {
      key: "momentum",
      label: "Ritmo",
      value: clampMeter(match.metrics.offensivePressure / 10),
    },
    { key: "goals", label: "Goles", value: clampMeter(goals * 3.2) },
  ];
}

export type ResultTick = "win" | "loss";

export type ResultBoard = {
  ticks: ResultTick[];
  streak: number;
  hits: number;
  total: number;
  pct: number;
  label: string;
  lastFailed: boolean;
};

export function resultBoard(matches: MatchInsight[]): ResultBoard {
  const todayResolved = matches
    .filter((match) => match.day === "today" && match.result)
    .slice()
    .sort((a, b) => a.kickoffIso.localeCompare(b.kickoffIso));
  const yesterday = resolvedSignals(matches)
    .slice()
    .sort((a, b) => a.kickoffIso.localeCompare(b.kickoffIso));
  const source = todayResolved.length ? todayResolved : yesterday;
  const ticks: ResultTick[] = source.map((match) =>
    match.result?.won ? "win" : "loss",
  );
  let streak = 0;
  for (let index = ticks.length - 1; index >= 0; index -= 1) {
    if (ticks[index] !== "win") break;
    streak += 1;
  }
  const hits = ticks.filter((tick) => tick === "win").length;
  const total = ticks.length;
  return {
    ticks,
    streak,
    hits,
    total,
    pct: total ? Math.round((hits / total) * 100) : 0,
    label: todayResolved.length ? "señales de hoy" : "señales de ayer",
    lastFailed: ticks.length > 0 && ticks[ticks.length - 1] === "loss",
  };
}

export function scanCounts(matches: MatchInsight[]) {
  const today = matches.filter((match) => match.day === "today");
  return {
    matches: today.length,
    signals: today.filter((match) => isBanker(match.confidence)).length,
  };
}

export function featuredSignal(
  matches: MatchInsight[],
  selectedId: number | null,
) {
  if (selectedId != null) {
    const found = matches.find(
      (match) => match.id === selectedId && match.day === "today",
    );
    if (found) return found;
  }
  const live = activeSignals(matches);
  const liveBanker = live.find((match) => isBanker(match.confidence));
  if (liveBanker) return liveBanker;
  if (live[0]) return live[0];
  return topAiSignals(matches, 1)[0] ?? null;
}

export function battlePair(matches: MatchInsight[]) {
  const top = topAiSignals(matches, 2);
  if (top.length < 2) return null;
  return {
    left: top[0],
    right: top[1],
    winner: top[0].confidence >= top[1].confidence ? top[0] : top[1],
  };
}

export function choosePool(matches: MatchInsight[], limit = 3) {
  const live = activeSignals(matches).slice(0, limit);
  if (live.length >= limit) return live;
  return topAiSignals(matches, limit);
}

export function scoreLine(match: MatchInsight) {
  if (match.score.home !== null && match.score.away !== null) {
    return `${match.score.home}–${match.score.away}`;
  }
  if (match.result) {
    return `${match.result.finalScore.home}–${match.result.finalScore.away}`;
  }
  return "vs";
}

export function clockLabel(match: MatchInsight) {
  return statusLabel(match);
}

export function topAiSignals(matches: MatchInsight[], limit = 5) {
  return matches
    .filter((match) => match.day === "today")
    .slice()
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

export function activeSignals(matches: MatchInsight[]) {
  return liveMatches(matches).sort((a, b) => b.confidence - a.confidence);
}

export function upcomingSignals(matches: MatchInsight[]) {
  return matches
    .filter(
      (match) =>
        match.day === "tomorrow" || (match.day === "today" && match.status === "NS"),
    )
    .slice()
    .sort((a, b) => a.kickoffIso.localeCompare(b.kickoffIso));
}

export function resolvedSignals(matches: MatchInsight[]) {
  return matches.filter((match) => match.day === "yesterday" && match.result);
}

export function alertPool(matches: MatchInsight[]) {
  const liveHigh = activeSignals(matches).filter((match) => isBanker(match.confidence));
  if (liveHigh.length) return liveHigh;
  const live = activeSignals(matches);
  if (live.length) return live;
  return topAiSignals(matches, 3);
}

export function livePlaylist(matches: MatchInsight[]) {
  const live = activeSignals(matches);
  if (live.length) return live;
  return upcomingSignals(matches).slice(0, 12);
}

export function whyItems(match: MatchInsight): WhyItem[] {
  const xg = `xG ${match.metrics.xG.home.toFixed(2)} / ${match.metrics.xG.away.toFixed(2)}`;
  const shots = `Tiros a puerta ${match.metrics.shotsOnTarget.home}–${match.metrics.shotsOnTarget.away}`;
  const pressure = `Presión ofensiva ${match.metrics.offensivePressure}%`;
  const live =
    match.status === "LIVE" || match.status === "HT"
      ? `${clockLabel(match)} · ${scoreLine(match)} · ${pressure}`
      : `Inicio ${formatKickoff(match.kickoffIso)} · mercado ${match.bestTip} ${match.odds.valueMarket.toFixed(2)}`;

  return [
    {
      key: "form",
      title: "Recent form",
      body: match.formNote,
    },
    {
      key: "stats",
      title: "Match statistics",
      body: `${xg} · ${shots} · ${pressure}`,
    },
    {
      key: "momentum",
      title: "Current momentum",
      body: live,
    },
    {
      key: "confidence",
      title: "AI confidence",
      body: `${match.confidence.toFixed(1)}/10 · acierto del modelo ${match.hitRate.toFixed(1)}%`,
    },
    {
      key: "lineups",
      title: "Lineups",
      body: "Pendiente de sincronizar",
      pending: true,
    },
  ];
}

export function supportStats(match: MatchInsight) {
  return [
    {
      label: "xG",
      value: `${match.metrics.xG.home.toFixed(2)}/${match.metrics.xG.away.toFixed(2)}`,
    },
    { label: "Presión", value: `${match.metrics.offensivePressure}%` },
    {
      label: "Tiros",
      value: `${match.metrics.shotsOnTarget.home}–${match.metrics.shotsOnTarget.away}`,
    },
    { label: "Acierto", value: `${match.hitRate.toFixed(1)}%` },
  ];
}
