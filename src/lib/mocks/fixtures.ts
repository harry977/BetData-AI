import { isBanker } from "@/lib/utils";
import type {
  DayBucket,
  FixtureStatus,
  LiveMetrics,
  Markets,
  MatchInsight,
  MatchResult,
  PressurePoint,
  Team,
  XGPoint,
} from "@/lib/types";

function series(
  seedHome: number,
  seedAway: number,
  step = 5,
  max = 90,
  mode: "pressure" | "xg" = "pressure",
): PressurePoint[] | XGPoint[] {
  const points = [];
  let home = mode === "xg" ? 0.08 : seedHome;
  let away = mode === "xg" ? 0.04 : seedAway;

  for (let minute = 0; minute <= max; minute += step) {
    if (mode === "xg") {
      home += (seedHome / 18) * (0.7 + ((minute * 13) % 7) / 10);
      away += (seedAway / 18) * (0.55 + ((minute * 9) % 6) / 10);
      points.push({
        minute,
        home: Number(Math.min(home, seedHome).toFixed(2)),
        away: Number(Math.min(away, seedAway).toFixed(2)),
      });
    } else {
      const swing = Math.sin(minute / 14) * 8;
      points.push({
        minute,
        home: Math.max(18, Math.min(96, Math.round(seedHome + swing))),
        away: Math.max(12, Math.min(92, Math.round(seedAway - swing * 0.7))),
      });
    }
  }
  return points;
}

function metrics(
  pressure: number,
  xgHome: number,
  xgAway: number,
  elapsed = 90,
): LiveMetrics {
  return {
    offensivePressure: pressure,
    xG: { home: xgHome, away: xgAway },
    dangerousAttacksPerMinute: {
      home: Number((pressure / 50).toFixed(1)),
      away: Number(((100 - pressure) / 70).toFixed(1)),
    },
    shotsOnTarget: {
      home: Math.max(0, Math.round(xgHome * 3)),
      away: Math.max(0, Math.round(xgAway * 3)),
    },
    pressureHistory: series(pressure, Math.max(20, 100 - pressure)) as PressurePoint[],
    xGHistory: series(xgHome, xgAway, 5, elapsed, "xg") as XGPoint[],
  };
}

function team(
  id: number,
  name: string,
  code: string,
  colors: [string, string],
): Team {
  return {
    id,
    name,
    code,
    logo: `https://media.api-sports.io/football/teams/${id}.png`,
    colors,
  };
}

const TEAMS = {
  rma: team(541, "Real Madrid", "RMA", ["#FEBE10", "#FFFFFF"]),
  bar: team(529, "Barcelona", "BAR", ["#A50044", "#004D98"]),
  mci: team(50, "Manchester City", "MCI", ["#6CABDD", "#1C2C5B"]),
  ars: team(42, "Arsenal", "ARS", ["#EF0107", "#063672"]),
  bay: team(157, "Bayern Munich", "BAY", ["#DC052D", "#0066B2"]),
  bvb: team(165, "Borussia Dortmund", "BVB", ["#FDE100", "#000000"]),
  int: team(505, "Inter", "INT", ["#010E80", "#000000"]),
  mil: team(489, "AC Milan", "MIL", ["#FB090B", "#000000"]),
  psg: team(85, "PSG", "PSG", ["#004170", "#DA291C"]),
  om: team(81, "Marseille", "OM", ["#2FAEE0", "#FFFFFF"]),
  liv: team(40, "Liverpool", "LIV", ["#C8102E", "#00B2A9"]),
  che: team(49, "Chelsea", "CHE", ["#034694", "#FFFFFF"]),
  atl: team(530, "Atlético Madrid", "ATL", ["#CE3524", "#FFFFFF"]),
  sev: team(536, "Sevilla", "SEV", ["#FFFFFF", "#D70A0A"]),
  juve: team(496, "Juventus", "JUV", ["#000000", "#FFFFFF"]),
  nap: team(492, "Napoli", "NAP", ["#12A0D7", "#FFFFFF"]),
  ajax: team(194, "Ajax", "AJA", ["#D2122E", "#FFFFFF"]),
  psv: team(197, "PSV", "PSV", ["#E03A3E", "#FFFFFF"]),
  spo: team(228, "Sporting CP", "SCP", ["#008057", "#FFFFFF"]),
  ben: team(211, "Benfica", "BEN", ["#E03A3E", "#FFFFFF"]),
  eve: team(45, "Everton", "EVE", ["#003399", "#FFFFFF"]),
  rom: team(497, "Roma", "ROM", ["#8E1F2F", "#F0BC42"]),
  laz: team(487, "Lazio", "LAZ", ["#87D8F7", "#FFFFFF"]),
  rso: team(548, "Real Sociedad", "RSO", ["#0067B1", "#FFFFFF"]),
  por: team(212, "Porto", "POR", ["#003DA5", "#FFFFFF"]),
  cel: team(247, "Celtic", "CEL", ["#00843D", "#FFFFFF"]),
  ran: team(257, "Rangers", "RAN", ["#1B458F", "#FFFFFF"]),
};

const LEAGUES = {
  laliga: { id: 140, name: "La Liga", country: "Spain", logo: "https://media.api-sports.io/football/leagues/140.png" },
  epl: { id: 39, name: "Premier League", country: "England", logo: "https://media.api-sports.io/football/leagues/39.png" },
  bun: { id: 78, name: "Bundesliga", country: "Germany", logo: "https://media.api-sports.io/football/leagues/78.png" },
  sa: { id: 135, name: "Serie A", country: "Italy", logo: "https://media.api-sports.io/football/leagues/135.png" },
  l1: { id: 61, name: "Ligue 1", country: "France", logo: "https://media.api-sports.io/football/leagues/61.png" },
  ere: { id: 88, name: "Eredivisie", country: "Netherlands", logo: "https://media.api-sports.io/football/leagues/88.png" },
  lig: { id: 94, name: "Primeira Liga", country: "Portugal", logo: "https://media.api-sports.io/football/leagues/94.png" },
  spl: { id: 179, name: "Premiership", country: "Scotland", logo: "https://media.api-sports.io/football/leagues/179.png" },
};

type Draft = {
  id: number;
  day: DayBucket;
  league: MatchInsight["league"];
  home: Team;
  away: Team;
  kickoffIso: string;
  status: FixtureStatus;
  elapsed?: number | null;
  score?: { home: number | null; away: number | null };
  confidence: number;
  bestTip: string;
  markets: Markets;
  formNote: string;
  hitRate: number;
  odds: MatchInsight["odds"];
  live?: { pressure: number; xgHome: number; xgAway: number };
  result?: MatchResult | null;
};

function build(draft: Draft): MatchInsight {
  const elapsed = draft.elapsed ?? (draft.status === "NS" ? null : 90);
  const live = draft.live ?? { pressure: 55, xgHome: 0.4, xgAway: 0.3 };

  return {
    id: draft.id,
    day: draft.day,
    league: draft.league,
    home: draft.home,
    away: draft.away,
    kickoffIso: draft.kickoffIso,
    status: draft.status,
    elapsed: elapsed,
    score: draft.score ?? { home: null, away: null },
    odds: draft.odds,
    hitRate: draft.hitRate,
    confidence: draft.confidence,
    isBanker: isBanker(draft.confidence),
    bestTip: draft.bestTip,
    markets: draft.markets,
    formNote: draft.formNote,
    metrics: metrics(live.pressure, live.xgHome, live.xgAway, elapsed ?? 20),
    result: draft.result ?? null,
  };
}

export const MOCK_FIXTURES: MatchInsight[] = [
  build({
    id: 1201841,
    day: "today",
    league: LEAGUES.laliga,
    home: TEAMS.rma,
    away: TEAMS.bar,
    kickoffIso: "2026-09-12T19:00:00+00:00",
    status: "LIVE",
    elapsed: 34,
    score: { home: 1, away: 0 },
    confidence: 8.8,
    bestTip: "Over 0.5 1H",
    hitRate: 71.4,
    odds: { home: 2.15, draw: 3.4, away: 3.2, valueMarket: 1.95 },
    markets: {
      oneXTwo: { pick: "1", odds: 2.15 },
      overUnder: { pick: "O2.5", odds: 1.82 },
      btts: { pick: "Sí", odds: 1.7 },
    },
    formNote:
      "Análisis de forma reciente y goles esperados (xG): el Madrid llega con 1.82 xG acumulado y más ocasiones claras. El modelo BetData Engine marca Over 0.5 en la primera parte.",
    live: { pressure: 84, xgHome: 1.82, xgAway: 0.45 },
  }),
  build({
    id: 1202102,
    day: "today",
    league: LEAGUES.epl,
    home: TEAMS.mci,
    away: TEAMS.ars,
    kickoffIso: "2026-09-12T16:30:00+00:00",
    status: "LIVE",
    elapsed: 58,
    score: { home: 1, away: 1 },
    confidence: 7.6,
    bestTip: "BTTS Sí",
    hitRate: 68.2,
    odds: { home: 1.92, draw: 3.7, away: 3.85, valueMarket: 1.78 },
    markets: {
      oneXTwo: { pick: "1", odds: 1.92 },
      overUnder: { pick: "O2.5", odds: 1.74 },
      btts: { pick: "Sí", odds: 1.78 },
    },
    formNote:
      "Análisis de forma reciente y goles esperados (xG): 1.41 vs 1.18. Ambos llegan goleando y el Mejor Tip es que marquen los dos.",
    live: { pressure: 71, xgHome: 1.41, xgAway: 1.18 },
  }),
  build({
    id: 1201988,
    day: "today",
    league: LEAGUES.bun,
    home: TEAMS.bay,
    away: TEAMS.bvb,
    kickoffIso: "2026-09-12T18:30:00+00:00",
    status: "HT",
    elapsed: 45,
    score: { home: 2, away: 1 },
    confidence: 8.5,
    bestTip: "Over 2.5",
    hitRate: 74.8,
    odds: { home: 1.55, draw: 4.4, away: 5.5, valueMarket: 1.62 },
    markets: {
      oneXTwo: { pick: "1", odds: 1.55 },
      overUnder: { pick: "O2.5", odds: 1.62 },
      btts: { pick: "Sí", odds: 1.66 },
    },
    formNote:
      "Análisis de forma reciente y goles esperados (xG): 2.04 vs 0.91 al descanso. Derbi abierto y Banker Over 2.5.",
    live: { pressure: 79, xgHome: 2.04, xgAway: 0.91 },
  }),
  build({
    id: 1201766,
    day: "today",
    league: LEAGUES.sa,
    home: TEAMS.int,
    away: TEAMS.mil,
    kickoffIso: "2026-09-12T18:45:00+00:00",
    status: "LIVE",
    elapsed: 22,
    score: { home: 0, away: 0 },
    confidence: 6.9,
    bestTip: "Under 3.5",
    hitRate: 66.9,
    odds: { home: 2.05, draw: 3.25, away: 3.6, valueMarket: 2.08 },
    markets: {
      oneXTwo: { pick: "X", odds: 3.25 },
      overUnder: { pick: "U3.5", odds: 2.08 },
      btts: { pick: "No", odds: 2.15 },
    },
    formNote:
      "Análisis de forma reciente y goles esperados (xG): ritmo bajo (0.38 vs 0.29). El derby apunta a un partido cerrado.",
    live: { pressure: 58, xgHome: 0.38, xgAway: 0.29 },
  }),
  build({
    id: 1202210,
    day: "today",
    league: LEAGUES.l1,
    home: TEAMS.psg,
    away: TEAMS.om,
    kickoffIso: "2026-09-12T19:45:00+00:00",
    status: "NS",
    confidence: 8.2,
    bestTip: "1",
    hitRate: 70.1,
    odds: { home: 1.42, draw: 4.8, away: 6.8, valueMarket: 1.42 },
    markets: {
      oneXTwo: { pick: "1", odds: 1.42 },
      overUnder: { pick: "O2.5", odds: 1.7 },
      btts: { pick: "Sí", odds: 1.88 },
    },
    formNote:
      "Análisis de forma reciente y goles esperados (xG): PSG llega como claro favorito. El Mejor Tip es la victoria local.",
    live: { pressure: 62, xgHome: 0.12, xgAway: 0.04 },
  }),
  build({
    id: 1301101,
    day: "tomorrow",
    league: LEAGUES.epl,
    home: TEAMS.liv,
    away: TEAMS.che,
    kickoffIso: "2026-09-13T15:30:00+00:00",
    status: "NS",
    confidence: 8.4,
    bestTip: "Over 2.5",
    hitRate: 73.1,
    odds: { home: 1.8, draw: 3.8, away: 4.2, valueMarket: 1.72 },
    markets: {
      oneXTwo: { pick: "1", odds: 1.8 },
      overUnder: { pick: "O2.5", odds: 1.72 },
      btts: { pick: "Sí", odds: 1.65 },
    },
    formNote:
      "Análisis de forma reciente y goles esperados (xG): Anfield suele abrir el marcador pronto. Over 2.5 es el Banker de mañana.",
  }),
  build({
    id: 1301102,
    day: "tomorrow",
    league: LEAGUES.laliga,
    home: TEAMS.atl,
    away: TEAMS.sev,
    kickoffIso: "2026-09-13T17:15:00+00:00",
    status: "NS",
    confidence: 7.4,
    bestTip: "Under 2.5",
    hitRate: 69.5,
    odds: { home: 1.7, draw: 3.6, away: 5.1, valueMarket: 1.85 },
    markets: {
      oneXTwo: { pick: "1", odds: 1.7 },
      overUnder: { pick: "U2.5", odds: 1.85 },
      btts: { pick: "No", odds: 1.9 },
    },
    formNote:
      "Análisis de forma reciente y goles esperados (xG): el Atlético cierra espacios. Under 2.5 encaja con su forma reciente.",
  }),
  build({
    id: 1301103,
    day: "tomorrow",
    league: LEAGUES.sa,
    home: TEAMS.juve,
    away: TEAMS.nap,
    kickoffIso: "2026-09-13T18:45:00+00:00",
    status: "NS",
    confidence: 7.1,
    bestTip: "BTTS Sí",
    hitRate: 67.8,
    odds: { home: 2.2, draw: 3.3, away: 3.25, valueMarket: 1.74 },
    markets: {
      oneXTwo: { pick: "X", odds: 3.3 },
      overUnder: { pick: "O2.5", odds: 2.05 },
      btts: { pick: "Sí", odds: 1.74 },
    },
    formNote:
      "Análisis de forma reciente y goles esperados (xG): ambos atacan bien a campo abierto. El Mejor Tip es BTTS.",
  }),
  build({
    id: 1301104,
    day: "tomorrow",
    league: LEAGUES.ere,
    home: TEAMS.ajax,
    away: TEAMS.psv,
    kickoffIso: "2026-09-13T13:30:00+00:00",
    status: "NS",
    confidence: 7.8,
    bestTip: "Over 2.5",
    hitRate: 71.2,
    odds: { home: 2.4, draw: 3.5, away: 2.7, valueMarket: 1.58 },
    markets: {
      oneXTwo: { pick: "2", odds: 2.7 },
      overUnder: { pick: "O2.5", odds: 1.58 },
      btts: { pick: "Sí", odds: 1.55 },
    },
    formNote:
      "Análisis de forma reciente y goles esperados (xG): clásico holandés de ida y vuelta. Over 2.5 es la lectura más limpia.",
  }),
  build({
    id: 1301105,
    day: "tomorrow",
    league: LEAGUES.lig,
    home: TEAMS.spo,
    away: TEAMS.ben,
    kickoffIso: "2026-09-13T20:00:00+00:00",
    status: "NS",
    confidence: 6.8,
    bestTip: "BTTS Sí",
    hitRate: 65.4,
    odds: { home: 2.55, draw: 3.2, away: 2.75, valueMarket: 1.8 },
    markets: {
      oneXTwo: { pick: "1", odds: 2.55 },
      overUnder: { pick: "O2.5", odds: 2.0 },
      btts: { pick: "Sí", odds: 1.8 },
    },
    formNote:
      "Análisis de forma reciente y goles esperados (xG): derbi lisboeta igualado. Ambos equipos marcan es el escenario más repetido.",
  }),
  build({
    id: 1100901,
    day: "yesterday",
    league: LEAGUES.epl,
    home: TEAMS.liv,
    away: TEAMS.eve,
    kickoffIso: "2026-09-11T19:00:00+00:00",
    status: "FT",
    elapsed: 90,
    score: { home: 2, away: 1 },
    confidence: 8.3,
    bestTip: "Over 2.5",
    hitRate: 72.0,
    odds: { home: 1.45, draw: 4.4, away: 6.5, valueMarket: 1.7 },
    markets: {
      oneXTwo: { pick: "1", odds: 1.45 },
      overUnder: { pick: "O2.5", odds: 1.7 },
      btts: { pick: "Sí", odds: 1.85 },
    },
    formNote: "Pronóstico resuelto. Over 2.5 se cumplió con el 2-1 final.",
    result: { won: true, finalScore: { home: 2, away: 1 } },
    live: { pressure: 68, xgHome: 1.9, xgAway: 0.8 },
  }),
  build({
    id: 1100902,
    day: "yesterday",
    league: LEAGUES.sa,
    home: TEAMS.rom,
    away: TEAMS.laz,
    kickoffIso: "2026-09-11T18:45:00+00:00",
    status: "FT",
    elapsed: 90,
    score: { home: 1, away: 1 },
    confidence: 7.2,
    bestTip: "1",
    hitRate: 64.1,
    odds: { home: 2.1, draw: 3.2, away: 3.5, valueMarket: 2.1 },
    markets: {
      oneXTwo: { pick: "1", odds: 2.1 },
      overUnder: { pick: "U2.5", odds: 1.78 },
      btts: { pick: "Sí", odds: 1.9 },
    },
    formNote: "Pronóstico resuelto. La victoria local no se dio: acabó 1-1.",
    result: { won: false, finalScore: { home: 1, away: 1 } },
    live: { pressure: 54, xgHome: 1.1, xgAway: 1.0 },
  }),
  build({
    id: 1100903,
    day: "yesterday",
    league: LEAGUES.laliga,
    home: TEAMS.atl,
    away: TEAMS.rso,
    kickoffIso: "2026-09-11T17:00:00+00:00",
    status: "FT",
    elapsed: 90,
    score: { home: 2, away: 1 },
    confidence: 7.9,
    bestTip: "BTTS Sí",
    hitRate: 70.6,
    odds: { home: 1.85, draw: 3.4, away: 4.3, valueMarket: 1.82 },
    markets: {
      oneXTwo: { pick: "1", odds: 1.85 },
      overUnder: { pick: "O2.5", odds: 2.05 },
      btts: { pick: "Sí", odds: 1.82 },
    },
    formNote: "Pronóstico resuelto. Ambos marcaron en el 2-1.",
    result: { won: true, finalScore: { home: 2, away: 1 } },
    live: { pressure: 61, xgHome: 1.5, xgAway: 0.9 },
  }),
  build({
    id: 1100904,
    day: "yesterday",
    league: LEAGUES.lig,
    home: TEAMS.por,
    away: TEAMS.ben,
    kickoffIso: "2026-09-11T20:15:00+00:00",
    status: "FT",
    elapsed: 90,
    score: { home: 0, away: 0 },
    confidence: 8.1,
    bestTip: "Under 2.5",
    hitRate: 73.5,
    odds: { home: 2.2, draw: 3.1, away: 3.4, valueMarket: 1.68 },
    markets: {
      oneXTwo: { pick: "X", odds: 3.1 },
      overUnder: { pick: "U2.5", odds: 1.68 },
      btts: { pick: "No", odds: 1.95 },
    },
    formNote: "Pronóstico resuelto. El 0-0 confirma el Under 2.5.",
    result: { won: true, finalScore: { home: 0, away: 0 } },
    live: { pressure: 49, xgHome: 0.7, xgAway: 0.6 },
  }),
  build({
    id: 1100905,
    day: "yesterday",
    league: LEAGUES.spl,
    home: TEAMS.cel,
    away: TEAMS.ran,
    kickoffIso: "2026-09-11T14:00:00+00:00",
    status: "FT",
    elapsed: 90,
    score: { home: 1, away: 0 },
    confidence: 7.5,
    bestTip: "Over 2.5",
    hitRate: 66.0,
    odds: { home: 2.05, draw: 3.4, away: 3.5, valueMarket: 1.75 },
    markets: {
      oneXTwo: { pick: "1", odds: 2.05 },
      overUnder: { pick: "O2.5", odds: 1.75 },
      btts: { pick: "Sí", odds: 1.7 },
    },
    formNote: "Pronóstico resuelto. El 1-0 se queda por debajo de 2.5 goles.",
    result: { won: false, finalScore: { home: 1, away: 0 } },
    live: { pressure: 57, xgHome: 1.2, xgAway: 0.7 },
  }),
];
