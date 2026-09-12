import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DayBucket, MatchInsight } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatOdds(value: number) {
  return `@${value.toFixed(2)}`;
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function isBanker(confidence: number) {
  return confidence >= 8;
}

export function formatConfidence(value: number) {
  return `${value.toFixed(1)}/10`;
}

export function formatKickoff(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

export function statusLabel(match: MatchInsight) {
  if (match.day === "yesterday" && match.result) {
    return `FT ${match.result.finalScore.home}-${match.result.finalScore.away}`;
  }
  if (match.status === "LIVE" && match.elapsed) return `${match.elapsed}'`;
  if (match.status === "HT") return "HT";
  if (match.status === "FT" && match.score.home !== null && match.score.away !== null) {
    return `FT ${match.score.home}-${match.score.away}`;
  }
  return formatKickoff(match.kickoffIso);
}

export function starBankers(matches: MatchInsight[]) {
  return matches
    .filter((match) => match.day === "today" && isBanker(match.confidence))
    .slice()
    .sort((a, b) => b.confidence - a.confidence);
}

export function bankersOfTheDay(matches: MatchInsight[]) {
  return starBankers(matches).slice(0, 3);
}

export function matchesForDay(matches: MatchInsight[], day: DayBucket) {
  return matches.filter((match) => match.day === day);
}

export function recentHits(matches: MatchInsight[]) {
  return matches.filter((match) => match.day === "yesterday" && match.result?.won);
}

export function liveMatches(matches: MatchInsight[]) {
  return matches
    .filter((match) => match.status === "LIVE" || match.status === "HT")
    .slice()
    .sort((a, b) => (b.elapsed ?? 0) - (a.elapsed ?? 0));
}

export function groupMatchesByLeague(matches: MatchInsight[]) {
  const groups: { key: string; country: string; league: string; matches: MatchInsight[] }[] = [];
  const index = new Map<string, number>();
  for (const match of matches) {
    const key = `${match.league.country} · ${match.league.name}`;
    const existing = index.get(key);
    if (existing === undefined) {
      index.set(key, groups.length);
      groups.push({
        key,
        country: match.league.country,
        league: match.league.name,
        matches: [match],
      });
    } else {
      groups[existing].matches.push(match);
    }
  }
  return groups;
}
