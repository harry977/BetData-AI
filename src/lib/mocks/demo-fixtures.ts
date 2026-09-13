import { buildLiveMetrics } from "@/lib/metrics";
import type {
  DayBucket,
  FixtureStatus,
  League,
  LiveMetrics,
  Markets,
  MatchInsight,
  MatchResult,
  OneXTwoPick,
  PressurePoint,
  Team,
} from "@/lib/types";

function league(id: number, name: string, country: string): League {
  return {
    id,
    name,
    country,
    logo: `https://img.sofascore.com/api/v1/unique-tournament/${id}/image`,
  };
}

const L = {
  laliga: league(8, "LaLiga", "Spain"),
  pl: league(17, "Premier League", "England"),
  sa: league(23, "Serie A", "Italy"),
  bl: league(35, "Bundesliga", "Germany"),
  l1: league(34, "Ligue 1", "France"),
  ucl: league(7, "UEFA Champions League", "Europe"),
  cdr: league(329, "Copa del Rey", "Spain"),
};

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
    logo: `https://img.sofascore.com/api/v1/team/${id}/image`,
    colors,
  };
}

function utcDay(offset: number, hour: number, minute = 0) {
  const now = new Date();
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute, 0),
  );
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString();
}

function kickoffFor(day: DayBucket, hour: number, minute = 0) {
  const offset = day === "tomorrow" ? 1 : day === "yesterday" ? -1 : 0;
  return utcDay(offset, hour, minute);
}

function liveKickoff(elapsed: number) {
  return new Date(Date.now() - elapsed * 60 * 1000).toISOString();
}

function fullMetrics(
  pressure: number,
  xgHome: number,
  xgAway: number,
  elapsed = 90,
  extras?: {
    shots?: { home: number; away: number };
    possession?: { home: number; away: number };
    corners?: { home: number; away: number };
    cards?: { home: number; away: number };
  },
): LiveMetrics {
  return buildLiveMetrics(pressure, xgHome, xgAway, elapsed, extras?.shots, {
    possession: extras?.possession ?? {
      home: Math.max(32, Math.min(78, pressure)),
      away: 100 - Math.max(32, Math.min(78, pressure)),
    },
    corners: extras?.corners ?? {
      home: Math.max(1, Math.round(pressure / 12)),
      away: Math.max(1, Math.round((100 - pressure) / 16)),
    },
    cards: extras?.cards ?? { home: 1, away: 2 },
  });
}

function siegeMetrics(): LiveMetrics {
  const elapsed = 74;
  const base = fullMetrics(86, 1.92, 0.28, elapsed, {
    shots: { home: 8, away: 1 },
    possession: { home: 69, away: 31 },
    corners: { home: 9, away: 2 },
    cards: { home: 1, away: 3 },
  });
  const history: PressurePoint[] = [];
  for (let minute = 0; minute <= elapsed; minute += 1) {
    const late = minute >= elapsed - 5;
    history.push({
      minute,
      home: late ? 86 : 52 + (minute % 8),
      away: late ? 14 : 48 - (minute % 8),
    });
  }
  return { ...base, offensivePressure: 86, pressureHistory: history };
}

function markets(
  pick: OneXTwoPick,
  home: number,
  draw: number,
  away: number,
  over = "O2.5",
  overOdds = 1.78,
  btts: Markets["btts"]["pick"] = "GG",
  bttsOdds = 1.72,
): Markets {
  const oneOdds = pick === "1" ? home : pick === "2" ? away : draw;
  return {
    oneXTwo: { pick, odds: oneOdds },
    overUnder: { pick: over, odds: overOdds },
    btts: { pick: btts, odds: bttsOdds },
  };
}

type Draft = {
  id: number;
  day: DayBucket;
  league: League;
  home: Team;
  away: Team;
  kickoffIso: string;
  status: FixtureStatus;
  elapsed: number | null;
  score: { home: number | null; away: number | null };
  odds: MatchInsight["odds"];
  hitRate: number;
  confidence: number;
  bestTip: string;
  markets: Markets;
  formNote: string;
  metrics: LiveMetrics;
  result: MatchResult | null;
};

function insight(draft: Draft): MatchInsight {
  return {
    ...draft,
    isBanker: draft.confidence >= 8,
  };
}

export function buildDemoFixtures(): MatchInsight[] {
  const bar = team(2817, "Barcelona", "FCB", ["#a50044", "#004d98"]);
  const get = team(2851, "Getafe", "GET", ["#0067b1", "#ffffff"]);
  const atm = team(2836, "Atlético Madrid", "ATM", ["#ce3524", "#ffffff"]);
  const rso = team(2829, "Real Sociedad", "RSO", ["#0067b1", "#ffffff"]);
  const rma = team(28291, "Real Madrid", "RMA", ["#ffffff", "#febe10"]);
  const sev = team(2833, "Sevilla", "SEV", ["#d70a0a", "#ffffff"]);
  const ath = team(2825, "Athletic Club", "ATH", ["#ee2523", "#ffffff"]);
  const bet = team(2816, "Real Betis", "BET", ["#0a6522", "#ffffff"]);
  const vil = team(2819, "Villarreal", "VIL", ["#ffe14d", "#005daa"]);
  const val = team(2828, "Valencia", "VAL", ["#ee3524", "#ffffff"]);
  const gir = team(24264, "Girona", "GIR", ["#cd2534", "#ffffff"]);
  const rva = team(2845, "Rayo Vallecano", "RAY", ["#e53027", "#ffffff"]);
  const osa = team(2820, "Osasuna", "OSA", ["#d91a2a", "#0a3161"]);
  const cel = team(2821, "Celta", "CEL", ["#8bc2ea", "#e30613"]);
  const mal = team(2823, "Mallorca", "MAL", ["#e20613", "#000000"]);
  const ala = team(2830, "Alavés", "ALA", ["#004fa3", "#ffffff"]);
  const vill2 = team(40, "Aston Villa", "AVL", ["#95bfe5", "#670e36"]);
  const bri = team(30, "Brighton", "BHA", ["#005daa", "#ffffff"]);
  const whu = team(37, "West Ham", "WHU", ["#7a263a", "#1bb1e7"]);
  const ful = team(36, "Fulham", "FUL", ["#ffffff", "#000000"]);
  const rom = team(2702, "Roma", "ROM", ["#8e1f2f", "#fbbd00"]);
  const laz = team(2699, "Lazio", "LAZ", ["#87d8f7", "#ffffff"]);
  const ata = team(2686, "Atalanta", "ATA", ["#1e71b8", "#000000"]);
  const fio = team(2693, "Fiorentina", "FIO", ["#482e92", "#ffffff"]);
  const lev = team(2681, "Leverkusen", "B04", ["#e32221", "#000000"]);
  const rbl = team(2674, "RB Leipzig", "RBL", ["#dd0741", "#ffffff"]);
  const lil = team(1646, "Lille", "LIL", ["#e01e13", "#221e1f"]);
  const lyon = team(1649, "Lyon", "OL", ["#ffffff", "#00205b"]);

  const liv = team(44, "Liverpool", "LIV", ["#c8102e", "#00b2a9"]);
  const ars = team(42, "Arsenal", "ARS", ["#ef0107", "#ffffff"]);
  const mci = team(17, "Manchester City", "MCI", ["#6cabdd", "#1c2c5b"]);
  const che = team(38, "Chelsea", "CHE", ["#034694", "#ffffff"]);
  const tot = team(33, "Tottenham", "TOT", ["#132257", "#ffffff"]);
  const newc = team(35, "Newcastle", "NEW", ["#241f20", "#ffffff"]);

  const int = team(2697, "Inter", "INT", ["#010e80", "#000000"]);
  const nap = team(2714, "Napoli", "NAP", ["#12a0d7", "#ffffff"]);
  const mil = team(2692, "Milan", "MIL", ["#fb090b", "#000000"]);
  const juv = team(2687, "Juventus", "JUV", ["#000000", "#ffffff"]);

  const bay = team(2672, "Bayern Múnich", "BAY", ["#dc052d", "#0066b2"]);
  const bvb = team(2673, "Borussia Dortmund", "BVB", ["#fde100", "#000000"]);
  const psg = team(1644, "PSG", "PSG", ["#004170", "#e30613"]);
  const mar = team(1648, "Olympique Marsella", "OM", ["#2faee0", "#ffffff"]);

  const siege = insight({
    id: 910001,
    day: "today",
    league: L.laliga,
    home: bar,
    away: get,
    kickoffIso: liveKickoff(74),
    status: "LIVE",
    elapsed: 74,
    score: { home: 1, away: 0 },
    odds: { home: 1.22, draw: 6.4, away: 13.0, valueMarket: 1.22 },
    hitRate: 81.2,
    confidence: 9.1,
    bestTip: "1",
    markets: markets("1", 1.22, 6.4, 13.0, "O2.5", 1.62, "NG", 1.88),
    formNote:
      "Barcelona asedia el área: 86% de presión en los últimos 5 minutos, 1.92 xG a 0.28 y 8 tiros a puerta. Getafe encajado y sin salida.",
    metrics: siegeMetrics(),
    result: null,
  });

  const htLive = insight({
    id: 910002,
    day: "today",
    league: L.pl,
    home: liv,
    away: tot,
    kickoffIso: liveKickoff(45),
    status: "HT",
    elapsed: 45,
    score: { home: 1, away: 1 },
    odds: { home: 1.72, draw: 3.9, away: 4.6, valueMarket: 1.72 },
    hitRate: 74.6,
    confidence: 8.2,
    bestTip: "O2.5",
    markets: markets("1", 1.72, 3.9, 4.6, "O2.5", 1.7, "GG", 1.55),
    formNote:
      "Ida y vuelta en Anfield. 1.41 xG combinado al descanso y ambos porteros ya han tenido trabajo. El over 2.5 sigue vivo.",
    metrics: fullMetrics(58, 0.92, 0.49, 45, {
      shots: { home: 4, away: 3 },
      possession: { home: 61, away: 39 },
      corners: { home: 5, away: 3 },
      cards: { home: 1, away: 1 },
    }),
    result: null,
  });

  const liveTwo = insight({
    id: 910003,
    day: "today",
    league: L.sa,
    home: int,
    away: nap,
    kickoffIso: liveKickoff(62),
    status: "LIVE",
    elapsed: 62,
    score: { home: 0, away: 0 },
    odds: { home: 1.85, draw: 3.4, away: 4.4, valueMarket: 1.85 },
    hitRate: 76.1,
    confidence: 7.8,
    bestTip: "U2.5",
    markets: markets("1", 1.85, 3.4, 4.4, "U2.5", 1.74, "NG", 1.66),
    formNote:
      "Partido trabado en San Siro. Pocas llegadas claras y un under 2.5 que se sostiene con 0.71 xG total.",
    metrics: fullMetrics(54, 0.44, 0.27, 62, {
      shots: { home: 3, away: 2 },
      possession: { home: 57, away: 43 },
      corners: { home: 4, away: 2 },
      cards: { home: 2, away: 3 },
    }),
    result: null,
  });

  const upcoming: Draft[] = [
    {
      id: 910010,
      day: "today",
      league: L.laliga,
      home: rma,
      away: sev,
      kickoffIso: kickoffFor("today", 19, 0),
      status: "NS",
      elapsed: null,
      score: { home: null, away: null },
      odds: { home: 1.33, draw: 5.4, away: 8.6, valueMarket: 1.33 },
      hitRate: 79.4,
      confidence: 8.8,
      bestTip: "1",
      markets: markets("1", 1.33, 5.4, 8.6, "O2.5", 1.64, "GG", 1.7),
      formNote:
        "Madrid llega con once de gala y Sevilla encadena visitas sin marcar. El 1 es el pick más limpio de la noche.",
      metrics: fullMetrics(64, 1.7, 0.55, 90),
      result: null,
    },
    {
      id: 910011,
      day: "today",
      league: L.pl,
      home: ars,
      away: newc,
      kickoffIso: kickoffFor("today", 16, 30),
      status: "NS",
      elapsed: null,
      score: { home: null, away: null },
      odds: { home: 1.48, draw: 4.5, away: 6.4, valueMarket: 1.48 },
      hitRate: 77.8,
      confidence: 8.5,
      bestTip: "1",
      markets: markets("1", 1.48, 4.5, 6.4, "O2.5", 1.82, "NG", 1.95),
      formNote:
        "Emirates a tope y Newcastle con tres bajas atrás. Arsenal sostiene el 1 con xG esperado 1.8–0.6.",
      metrics: fullMetrics(66, 1.82, 0.58, 90),
      result: null,
    },
    {
      id: 910012,
      day: "today",
      league: L.bl,
      home: bay,
      away: bvb,
      kickoffIso: kickoffFor("today", 18, 30),
      status: "NS",
      elapsed: null,
      score: { home: null, away: null },
      odds: { home: 1.52, draw: 4.6, away: 5.6, valueMarket: 1.52 },
      hitRate: 75.9,
      confidence: 8.3,
      bestTip: "O2.5",
      markets: markets("1", 1.52, 4.6, 5.6, "O2.5", 1.48, "GG", 1.52),
      formNote:
        "Clásico alemán con media de 3.4 goles. Bayern empuja y Dortmund no cierra atrás: over 2.5.",
      metrics: fullMetrics(62, 2.05, 1.12, 90),
      result: null,
    },
    {
      id: 910013,
      day: "today",
      league: L.l1,
      home: psg,
      away: mar,
      kickoffIso: kickoffFor("today", 20, 0),
      status: "NS",
      elapsed: null,
      score: { home: null, away: null },
      odds: { home: 1.4, draw: 4.9, away: 7.2, valueMarket: 1.4 },
      hitRate: 80.1,
      confidence: 8.6,
      bestTip: "1",
      markets: markets("1", 1.4, 4.9, 7.2, "O2.5", 1.6, "GG", 1.68),
      formNote:
        "PSG no ha perdido un clásico en casa esta temporada. Marsella llega justísimo atrás.",
      metrics: fullMetrics(67, 1.96, 0.62, 90),
      result: null,
    },
    {
      id: 910014,
      day: "today",
      league: L.laliga,
      home: ath,
      away: bet,
      kickoffIso: kickoffFor("today", 17, 15),
      status: "NS",
      elapsed: null,
      score: { home: null, away: null },
      odds: { home: 1.95, draw: 3.35, away: 4.1, valueMarket: 1.72 },
      hitRate: 73.2,
      confidence: 7.7,
      bestTip: "BTTS Sí",
      markets: markets("1", 1.95, 3.35, 4.1, "O2.5", 1.9, "GG", 1.72),
      formNote:
        "San Mamés y Betis se hacen daño: 7 de los últimos 8 cruzados acabaron con gol de ambos.",
      metrics: fullMetrics(55, 1.35, 1.18, 90),
      result: null,
    },
    {
      id: 910015,
      day: "today",
      league: L.ucl,
      home: mci,
      away: che,
      kickoffIso: kickoffFor("today", 20, 0),
      status: "NS",
      elapsed: null,
      score: { home: null, away: null },
      odds: { home: 1.61, draw: 4.2, away: 5.3, valueMarket: 1.61 },
      hitRate: 78.6,
      confidence: 8.4,
      bestTip: "1",
      markets: markets("1", 1.61, 4.2, 5.3, "O2.5", 1.66, "GG", 1.64),
      formNote:
        "City manda en casa en Champions. Chelsea llega con tres visitas europeas sin marcar.",
      metrics: fullMetrics(63, 1.88, 0.71, 90),
      result: null,
    },
    {
      id: 910016,
      day: "today",
      league: L.sa,
      home: mil,
      away: juv,
      kickoffIso: kickoffFor("today", 19, 45),
      status: "NS",
      elapsed: null,
      score: { home: null, away: null },
      odds: { home: 2.15, draw: 3.2, away: 3.55, valueMarket: 1.8 },
      hitRate: 71.4,
      confidence: 7.6,
      bestTip: "X",
      markets: markets("X", 2.15, 3.2, 3.55, "U2.5", 1.76, "NG", 1.92),
      formNote:
        "Derby d’Italia muy igualado. Los dos cierran bien y el empate es el escenario más estable.",
      metrics: fullMetrics(50, 1.12, 1.08, 90),
      result: null,
    },
    {
      id: 910017,
      day: "today",
      league: L.cdr,
      home: vil,
      away: val,
      kickoffIso: kickoffFor("today", 21, 0),
      status: "NS",
      elapsed: null,
      score: { home: null, away: null },
      odds: { home: 1.7, draw: 3.7, away: 5.1, valueMarket: 1.7 },
      hitRate: 72.8,
      confidence: 8.0,
      bestTip: "1",
      markets: markets("1", 1.7, 3.7, 5.1, "O2.5", 1.88, "GG", 1.74),
      formNote:
        "Villarreal encadena 5 victorias en Copa en casa. Valencia llega con la defensa en construcción.",
      metrics: fullMetrics(60, 1.55, 0.82, 90),
      result: null,
    },
  ];

  const settledToday: { id: number; home: Team; away: Team; league: League; won: boolean; score: [number, number]; tip: string; conf: number; pick: OneXTwoPick }[] = [
    { id: 910101, home: gir, away: rva, league: L.laliga, won: true, score: [2, 0], tip: "1", conf: 8.4, pick: "1" },
    { id: 910102, home: osa, away: cel, league: L.laliga, won: true, score: [1, 0], tip: "1", conf: 8.1, pick: "1" },
    { id: 910103, home: vill2, away: bri, league: L.pl, won: true, score: [3, 1], tip: "O2.5", conf: 8.0, pick: "1" },
    { id: 910104, home: lev, away: rbl, league: L.bl, won: true, score: [4, 1], tip: "O2.5", conf: 8.6, pick: "1" },
    { id: 910105, home: lil, away: lyon, league: L.l1, won: true, score: [2, 0], tip: "1", conf: 8.7, pick: "1" },
    { id: 910106, home: rom, away: laz, league: L.sa, won: true, score: [1, 0], tip: "U2.5", conf: 7.9, pick: "1" },
    { id: 910107, home: whu, away: ful, league: L.pl, won: true, score: [2, 1], tip: "1", conf: 8.3, pick: "1" },
    { id: 910108, home: ata, away: fio, league: L.sa, won: true, score: [2, 2], tip: "BTTS Sí", conf: 7.8, pick: "X" },
    { id: 910109, home: mal, away: ala, league: L.laliga, won: false, score: [0, 2], tip: "1", conf: 7.4, pick: "1" },
    { id: 910110, home: atm, away: rso, league: L.laliga, won: false, score: [1, 1], tip: "1", conf: 7.2, pick: "1" },
  ];

  const todayFt = settledToday.map((row, index) =>
    insight({
      id: row.id,
      day: "today",
      league: row.league,
      home: row.home,
      away: row.away,
      kickoffIso: kickoffFor("today", 11 + index, 0),
      status: "FT",
      elapsed: 90,
      score: { home: row.score[0], away: row.score[1] },
      odds: { home: 1.7, draw: 3.6, away: 4.8, valueMarket: 1.7 },
      hitRate: 74 + index,
      confidence: row.conf,
      bestTip: row.tip,
      markets: markets(row.pick, 1.7, 3.6, 4.8),
      formNote: row.won
        ? "La señal cerró a favor. El modelo sostuvo el pick hasta el 90'."
        : "El partido se torció en la segunda parte y la señal no aguantó.",
      metrics: fullMetrics(row.won ? 62 : 44, row.score[0] * 0.85 + 0.4, row.score[1] * 0.8 + 0.2, 90),
      result: {
        won: row.won,
        finalScore: { home: row.score[0], away: row.score[1] },
      },
    }),
  );

  const tomorrow: Draft[] = [
    {
      id: 910201,
      day: "tomorrow",
      league: L.laliga,
      home: bar,
      away: atm,
      kickoffIso: kickoffFor("tomorrow", 20, 0),
      status: "NS",
      elapsed: null,
      score: { home: null, away: null },
      odds: { home: 1.9, draw: 3.5, away: 4.0, valueMarket: 1.9 },
      hitRate: 76.4,
      confidence: 8.1,
      bestTip: "1",
      markets: markets("1", 1.9, 3.5, 4.0, "O2.5", 1.8, "GG", 1.66),
      formNote: "Clásico de liga en el calendario. Barcelona llega más fresco y con la portería a cero.",
      metrics: fullMetrics(59, 1.62, 1.05, 90),
      result: null,
    },
    {
      id: 910202,
      day: "tomorrow",
      league: L.pl,
      home: liv,
      away: mci,
      kickoffIso: kickoffFor("tomorrow", 17, 30),
      status: "NS",
      elapsed: null,
      score: { home: null, away: null },
      odds: { home: 2.45, draw: 3.5, away: 2.75, valueMarket: 1.85 },
      hitRate: 73.1,
      confidence: 7.6,
      bestTip: "O2.5",
      markets: markets("1", 2.45, 3.5, 2.75, "O2.5", 1.62, "GG", 1.5),
      formNote: "Choque de altos xG. Los dos atacan de primeras y el over 2.5 es el mercado más estable.",
      metrics: fullMetrics(56, 1.7, 1.55, 90),
      result: null,
    },
    {
      id: 910203,
      day: "tomorrow",
      league: L.ucl,
      home: bay,
      away: psg,
      kickoffIso: kickoffFor("tomorrow", 20, 0),
      status: "NS",
      elapsed: null,
      score: { home: null, away: null },
      odds: { home: 2.05, draw: 3.6, away: 3.4, valueMarket: 1.92 },
      hitRate: 75.0,
      confidence: 7.9,
      bestTip: "BTTS Sí",
      markets: markets("1", 2.05, 3.6, 3.4, "O2.5", 1.55, "GG", 1.48),
      formNote: "Eliminatoria abierta. Ambos llegan goleando en Europa: BTTS es el pick más sólido.",
      metrics: fullMetrics(53, 1.8, 1.66, 90),
      result: null,
    },
    {
      id: 910204,
      day: "tomorrow",
      league: L.sa,
      home: nap,
      away: int,
      kickoffIso: kickoffFor("tomorrow", 19, 45),
      status: "NS",
      elapsed: null,
      score: { home: null, away: null },
      odds: { home: 2.6, draw: 3.2, away: 2.7, valueMarket: 1.88 },
      hitRate: 70.8,
      confidence: 7.5,
      bestTip: "U2.5",
      markets: markets("X", 2.6, 3.2, 2.7, "U2.5", 1.7, "NG", 1.84),
      formNote: "Partido de ajedrez. Inter cierra y Nápoles no fuerza: under 2.5.",
      metrics: fullMetrics(48, 1.05, 1.1, 90),
      result: null,
    },
  ];

  const yesterdayRows: { id: number; home: Team; away: Team; league: League; won: boolean; score: [number, number] }[] = [
    { id: 910301, home: cel, away: osa, league: L.laliga, won: true, score: [3, 0] },
    { id: 910302, home: ala, away: mal, league: L.laliga, won: true, score: [2, 1] },
    { id: 910303, home: bri, away: whu, league: L.pl, won: true, score: [2, 0] },
    { id: 910304, home: laz, away: ata, league: L.sa, won: true, score: [1, 0] },
    { id: 910305, home: rbl, away: lev, league: L.bl, won: false, score: [1, 3] },
    { id: 910306, home: lyon, away: lil, league: L.l1, won: true, score: [2, 0] },
  ];

  const yesterday = yesterdayRows.map((row, index) =>
    insight({
      id: row.id,
      day: "yesterday",
      league: row.league,
      home: row.home,
      away: row.away,
      kickoffIso: kickoffFor("yesterday", 18, index * 10),
      status: "FT",
      elapsed: 90,
      score: { home: row.score[0], away: row.score[1] },
      odds: { home: 1.8, draw: 3.5, away: 4.4, valueMarket: 1.8 },
      hitRate: 72 + index,
      confidence: 8.0,
      bestTip: "1",
      markets: markets("1", 1.8, 3.5, 4.4),
      formNote: row.won
        ? "Señal de ayer acertada. Entra en la racha del tablero."
        : "Señal de ayer fallida. El modelo la marca y sigue.",
      metrics: fullMetrics(row.won ? 61 : 42, row.score[0] * 0.9 + 0.3, row.score[1] * 0.85 + 0.2, 90),
      result: {
        won: row.won,
        finalScore: { home: row.score[0], away: row.score[1] },
      },
    }),
  );

  return [
    siege,
    htLive,
    liveTwo,
    ...upcoming.map(insight),
    ...todayFt,
    ...tomorrow.map(insight),
    ...yesterday,
  ];
}

export function demoFeedCoversProduct(matches: MatchInsight[]) {
  const live = matches.filter(
    (match) => match.status === "LIVE" || match.status === "HT",
  ).length;
  const todayFt = matches.filter((match) => match.day === "today" && match.result).length;
  const comboPool = matches.filter(
    (match) =>
      match.day === "today" &&
      match.status !== "FT" &&
      !match.result &&
      match.confidence >= 7.5,
  ).length;
  return live >= 2 && todayFt >= 8 && comboPool >= 6;
}
