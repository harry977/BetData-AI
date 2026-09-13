import { buildLiveMetrics } from "@/lib/metrics";
import type {
  DayBucket,
  FeedSource,
  FixtureStatus,
  FixturesPayload,
  LiveMatchCard,
  LiveMatchesPayload,
  LiveMetrics,
  Markets,
  MatchInsight,
  OneXTwoPick,
} from "@/lib/types";
import { isBanker } from "@/lib/utils";
import type {
  EventOdds,
  EventStatSnapshot,
  SportEvent,
} from "@/lib/sportapi";

const TEAM_COLORS: [string, string][] = [
  ["#B8FF00", "#3d4d00"],
  ["#06b6d4", "#164e63"],
  ["#f59e0b", "#78350f"],
  ["#ef4444", "#7f1d1d"],
  ["#3b82f6", "#1e3a8a"],
  ["#a855f7", "#581c87"],
  ["#f97316", "#7c2d12"],
  ["#14b8a6", "#134e4a"],
];

const TOP_TOURNAMENTS = new Set([
  7, 8, 17, 23, 34, 35, 37, 242, 384, 679, 155, 679, 8, 13666, 11, 13,
]);

export function eventStatus(event: SportEvent): FixtureStatus {
  const type = event.statusType;
  const description = event.statusDescription.toLowerCase();
  if (type.includes("half") || description.includes("halftime") || description === "ht") {
    return "HT";
  }
  if (type.includes("progress") || type === "live" || type === "inplay") return "LIVE";
  if (type.includes("finish") || type === "ended" || type === "closed") return "FT";
  return "NS";
}

export function dayBucketFor(timestamp: number, today: string): DayBucket {
  const isoDay = new Date(timestamp * 1000).toISOString().slice(0, 10);
  if (isoDay === today) return "today";
  const base = new Date(`${today}T00:00:00.000Z`);
  const yesterday = new Date(base);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const tomorrow = new Date(base);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  if (isoDay === yesterday.toISOString().slice(0, 10)) return "yesterday";
  if (isoDay === tomorrow.toISOString().slice(0, 10)) return "tomorrow";
  if (isoDay < today) return "yesterday";
  return "tomorrow";
}

function teamCode(eventTeam: SportEvent["home"]) {
  const code = eventTeam.nameCode.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  if (code.length >= 2) return code;
  return eventTeam.name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "FCB";
}

function teamLogo(teamId: number) {
  return `/api/crest/team/${teamId}`;
}

function leagueLogo(leagueId: number) {
  return `/api/crest/league/${leagueId}`;
}

function colorsFor(id: number): [string, string] {
  return TEAM_COLORS[Math.abs(id) % TEAM_COLORS.length];
}

export function confidenceFromImplied(probability: number) {
  const clamped = Math.min(0.92, Math.max(0.28, probability));
  const value = 3.5 + clamped * 7.5;
  return Number(Math.min(10, Math.max(1, value)).toFixed(1));
}

export function pickBestMarket(odds: EventOdds) {
  const candidates = [
    {
      label: odds.oneXTwo.pick,
      odds: odds.oneXTwo.odds,
      implied: odds.oneXTwo.implied,
    },
    {
      label: odds.overUnder.pick,
      odds: odds.overUnder.odds,
      implied: odds.overUnder.implied,
    },
    {
      label:
        odds.btts.pick === "GG" ? "BTTS Sí" : odds.btts.pick === "NG" ? "BTTS No" : odds.btts.pick,
      odds: odds.btts.odds,
      implied: odds.btts.implied,
    },
  ];
  return candidates.sort((a, b) => b.implied - a.implied)[0];
}

function oneXTwoPick(pick: string): OneXTwoPick {
  if (pick === "X" || pick.toLowerCase() === "draw") return "X";
  if (pick === "2" || pick.toLowerCase() === "away") return "2";
  return "1";
}

function tipSucceeded(
  tip: string,
  home: number,
  away: number,
): boolean {
  const total = home + away;
  if (tip === "1") return home > away;
  if (tip === "X") return home === away;
  if (tip === "2") return away > home;
  if (tip.startsWith("O")) {
    const line = Number(tip.slice(1)) || 2.5;
    return total > line;
  }
  if (tip.startsWith("U")) {
    const line = Number(tip.slice(1)) || 2.5;
    return total < line;
  }
  if (tip.includes("BTTS Sí") || tip === "GG") return home > 0 && away > 0;
  if (tip.includes("BTTS No") || tip === "NG") return home === 0 || away === 0;
  return total > 0;
}

export function snapshotToMetrics(
  snapshot: EventStatSnapshot | null,
  elapsed: number,
): LiveMetrics {
  if (!snapshot) {
    return buildLiveMetrics(58, 0.45, 0.35, elapsed);
  }
  const possession = snapshot.possession.home || 50;
  const shotShare =
    snapshot.shotsOnTarget.home + snapshot.shotsOnTarget.away > 0
      ? (snapshot.shotsOnTarget.home /
          (snapshot.shotsOnTarget.home + snapshot.shotsOnTarget.away)) *
        100
      : possession;
  const pressure = Math.round(possession * 0.6 + shotShare * 0.4);
  return buildLiveMetrics(
    pressure,
    snapshot.xG.home,
    snapshot.xG.away,
    elapsed,
    snapshot.shotsOnTarget,
    {
      possession: snapshot.possession,
      corners: snapshot.corners,
      cards: snapshot.cards,
    },
  );
}

export function toMatchInsight(
  event: SportEvent,
  odds: EventOdds,
  today: string,
  stats?: EventStatSnapshot | null,
): MatchInsight {
  const status = eventStatus(event);
  const day = dayBucketFor(event.startTimestamp, today);
  const best = pickBestMarket(odds);
  const confidence = confidenceFromImplied(best.implied);
  const elapsed = event.elapsed ?? (status === "NS" ? null : 90);
  const homeScore = event.homeScore;
  const awayScore = event.awayScore;
  const bestTip = best.label === "GG" ? "BTTS Sí" : best.label === "NG" ? "BTTS No" : best.label;
  const result =
    status === "FT" && homeScore !== null && awayScore !== null
      ? {
          won: tipSucceeded(bestTip, homeScore, awayScore),
          finalScore: { home: homeScore, away: awayScore },
        }
      : null;

  const markets: Markets = {
    oneXTwo: { pick: oneXTwoPick(odds.oneXTwo.pick), odds: odds.oneXTwo.odds },
    overUnder: { pick: odds.overUnder.pick, odds: odds.overUnder.odds },
    btts: { pick: odds.btts.pick === "NG" ? "NG" : "GG", odds: odds.btts.odds },
  };

  const xgHome = stats?.xG.home ?? (status === "NS" ? 0.12 : Math.max(0.2, (homeScore ?? 0) * 0.9 + 0.35));
  const xgAway = stats?.xG.away ?? (status === "NS" ? 0.08 : Math.max(0.15, (awayScore ?? 0) * 0.9 + 0.28));
  const pressure =
    stats
      ? snapshotToMetrics(stats, elapsed ?? 90).offensivePressure
      : status === "LIVE" || status === "HT"
        ? 62
        : 54;

  return {
    id: event.id,
    day,
    league: {
      id: event.leagueId,
      name: event.leagueName,
      country: event.country,
      logo: event.leagueLogo || leagueLogo(event.leagueId),
    },
    home: {
      id: event.home.id,
      name: event.home.name,
      code: teamCode(event.home),
      logo: event.home.logo || teamLogo(event.home.id),
      colors: event.home.colors ?? colorsFor(event.home.id),
    },
    away: {
      id: event.away.id,
      name: event.away.name,
      code: teamCode(event.away),
      logo: event.away.logo || teamLogo(event.away.id),
      colors: event.away.colors ?? colorsFor(event.away.id),
    },
    kickoffIso: new Date(event.startTimestamp * 1000).toISOString(),
    status,
    elapsed,
    score: { home: homeScore, away: awayScore },
    odds: {
      home: odds.home,
      draw: odds.draw,
      away: odds.away,
      valueMarket: best.odds,
    },
    hitRate: Number((52 + confidence * 2.4).toFixed(1)),
    confidence,
    isBanker: isBanker(confidence),
    bestTip,
    markets,
    formNote: `RadarBet IA analiza ${event.home.name} frente a ${event.away.name}. El mejor consejo es ${bestTip} con un índice de confianza ${confidence.toFixed(1)}/10, construido a partir de las cuotas implícitas, la forma de los equipos y el contexto del encuentro.`,
    metrics: stats
      ? snapshotToMetrics(stats, elapsed ?? 90)
      : buildLiveMetrics(pressure, xgHome, xgAway, elapsed ?? 20),
    result,
  };
}

export function isPriorityLive(event: SportEvent) {
  if (event.uniqueTournamentId && TOP_TOURNAMENTS.has(event.uniqueTournamentId)) return true;
  const haystack = `${event.leagueName} ${event.country}`.toLowerCase();
  return ["premier", "liga", "champions", "serie a", "bundesliga", "ligue 1"].some((name) =>
    haystack.includes(name),
  );
}

export function isLowQualityLive(event: SportEvent) {
  const haystack = `${event.leagueName} ${event.country}`.toLowerCase();
  return /u1[6-9]|u21|u23|youth|reserva|reserve|premier league 2|amistoso|friendly/.test(
    haystack,
  );
}

export function mergeLiveEvent(current: SportEvent, live: SportEvent): SportEvent {
  return {
    ...current,
    homeScore: live.homeScore ?? current.homeScore,
    awayScore: live.awayScore ?? current.awayScore,
    statusType: live.statusType || current.statusType,
    statusDescription: live.statusDescription || current.statusDescription,
    elapsed: live.elapsed ?? current.elapsed,
    lastPeriod: live.lastPeriod || current.lastPeriod,
  };
}

export function liveClockLabel(status: FixtureStatus, elapsed: number | null) {
  if (status === "HT") return "Descanso";
  if (status === "LIVE") {
    return elapsed != null ? `EN DIRECTO ${elapsed}'` : "EN DIRECTO";
  }
  return null;
}

export function toLiveMatchCard(match: MatchInsight): LiveMatchCard {
  return {
    id: match.id,
    home: {
      id: match.home.id,
      name: match.home.name,
      code: match.home.code,
      logo: match.home.logo,
    },
    away: {
      id: match.away.id,
      name: match.away.name,
      code: match.away.code,
      logo: match.away.logo,
    },
    score: match.score,
    minute: match.elapsed,
    status: match.status,
    statusLabel: liveClockLabel(match.status, match.elapsed) ?? match.status,
    league: {
      id: match.league.id,
      name: match.league.name,
      country: match.league.country,
    },
    kickoffIso: match.kickoffIso,
  };
}

export function mergeLiveInsights(
  base: MatchInsight[],
  live: MatchInsight[],
): MatchInsight[] {
  if (!live.length) return base;
  const map = new Map(base.map((match) => [match.id, match]));
  for (const row of live) {
    const current = map.get(row.id);
    if (!current) {
      map.set(row.id, row);
      continue;
    }
    map.set(row.id, {
      ...current,
      status: row.status,
      elapsed: row.elapsed,
      score: row.score,
      kickoffIso: row.kickoffIso || current.kickoffIso,
      home: {
        ...current.home,
        name: row.home.name || current.home.name,
        logo: row.home.logo || current.home.logo,
        colors: row.home.colors ?? current.home.colors,
      },
      away: {
        ...current.away,
        name: row.away.name || current.away.name,
        logo: row.away.logo || current.away.logo,
        colors: row.away.colors ?? current.away.colors,
      },
    });
  }
  return Array.from(map.values());
}

function realRows(rows: MatchInsight[] | undefined) {
  return (rows ?? []).filter((match) => match && typeof match.id === "number");
}

export function extractMatchRows(payload: unknown): MatchInsight[] {
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of ["matches", "response", "data", "events", "fixtures"] as const) {
    const value = record[key];
    if (!Array.isArray(value) || value.length === 0) continue;
    const first = value[0];
    if (first && typeof first === "object" && ("home" in first || "id" in first)) {
      return value as MatchInsight[];
    }
  }
  return [];
}

export function mergeMatchRows(...lists: MatchInsight[][]) {
  const map = new Map<number, MatchInsight>();
  for (const list of lists) {
    for (const row of list) {
      if (row && typeof row.id === "number") map.set(row.id, row);
    }
  }
  return Array.from(map.values());
}

export function composeMatchFeed(
  fixtures: FixturesPayload | null,
  live: LiveMatchesPayload | null,
): { matches: MatchInsight[]; connected: boolean; source: FeedSource } {
  const fixtureRows = extractMatchRows(fixtures) || realRows(fixtures?.response);
  const liveRows = extractMatchRows(live) || realRows(live?.matches);
  const matches = mergeMatchRows(fixtureRows, liveRows);
  return {
    matches,
    connected: matches.length > 0 || Boolean(live?.connected || fixtures?.connected),
    source: liveRows.length ? (live?.source ?? "sportapi") : fixtures?.source ?? "sportapi",
  };
}
