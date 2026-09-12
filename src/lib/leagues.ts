import type { MatchInsight } from "@/lib/types";

export function isLigaBbva(match: MatchInsight) {
  const haystack = `${match.league.country} ${match.league.name}`.toLowerCase();
  if (/segunda|laliga2|la liga 2|hypermotion|liga f/.test(haystack)) return false;
  return /la liga|laliga|liga bbva|primera división|primera division/.test(haystack);
}

export function uniqueLeagues(matches: MatchInsight[], limit = 10) {
  const seen = new Set<string>();
  const leagues: { name: string; country: string }[] = [];
  for (const match of matches) {
    const key = `${match.league.country}·${match.league.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    leagues.push({ name: match.league.name, country: match.league.country });
    if (leagues.length >= limit) break;
  }
  return leagues;
}
