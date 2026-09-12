import type { MatchInsight } from "@/lib/types";
import { formatKickoff, isBanker, liveMatches, statusLabel } from "@/lib/utils";

export type WhyItem = {
  key: string;
  title: string;
  body: string;
  pending?: boolean;
};

export function confidenceBand(value: number) {
  if (value >= 8) return "HIGH CONFIDENCE";
  if (value >= 6.5) return "MEDIUM CONFIDENCE";
  return "WATCH";
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
  return topAiSignals(matches, 8);
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
