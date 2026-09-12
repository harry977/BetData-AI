import type { MatchInsight, PressurePoint, XGPoint } from "@/lib/types";

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

export const MOCK_FIXTURES: MatchInsight[] = [
  {
    id: 1201841,
    league: {
      id: 140,
      name: "La Liga",
      country: "Spain",
      logo: "https://media.api-sports.io/football/leagues/140.png",
    },
    home: {
      id: 541,
      name: "Real Madrid",
      code: "RMA",
      logo: "https://media.api-sports.io/football/teams/541.png",
      colors: ["#FEBE10", "#FFFFFF"],
    },
    away: {
      id: 529,
      name: "Barcelona",
      code: "BAR",
      logo: "https://media.api-sports.io/football/teams/529.png",
      colors: ["#A50044", "#004D98"],
    },
    kickoffIso: "2026-09-12T19:00:00+00:00",
    status: "LIVE",
    elapsed: 34,
    score: { home: 1, away: 0 },
    odds: { home: 2.15, draw: 3.4, away: 3.2, valueMarket: 1.95 },
    hitRate: 71.4,
    confidence: 88.4,
    isValueBetOfTheDay: true,
    bestTip: "Over 0.5 1H",
    metrics: {
      offensivePressure: 84,
      xG: { home: 1.82, away: 0.45 },
      dangerousAttacksPerMinute: { home: 1.7, away: 0.6 },
      shotsOnTarget: { home: 6, away: 2 },
      pressureHistory: series(78, 42) as PressurePoint[],
      xGHistory: series(1.82, 0.45, 5, 35, "xg") as XGPoint[],
    },
    alert: {
      headline: "ALERTA DETECTADA POR BETDATA AI: +0.5 Goles en 1ª Parte",
      market: "Over 0.5 1H",
      probability: 88.4,
      valueOdds: 1.95,
      rationale:
        "Presión ofensiva sostenida del Madrid (84%) y xG acumulado 1.82 antes del minuto 35. El modelo marca hueco de valor frente a la cuota 1.95.",
    },
  },
  {
    id: 1202102,
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
    },
    home: {
      id: 50,
      name: "Manchester City",
      code: "MCI",
      logo: "https://media.api-sports.io/football/teams/50.png",
      colors: ["#6CABDD", "#1C2C5B"],
    },
    away: {
      id: 42,
      name: "Arsenal",
      code: "ARS",
      logo: "https://media.api-sports.io/football/teams/42.png",
      colors: ["#EF0107", "#063672"],
    },
    kickoffIso: "2026-09-12T16:30:00+00:00",
    status: "LIVE",
    elapsed: 58,
    score: { home: 1, away: 1 },
    odds: { home: 1.92, draw: 3.7, away: 3.85, valueMarket: 1.78 },
    hitRate: 68.2,
    confidence: 76.1,
    isValueBetOfTheDay: false,
    bestTip: "BTTS Sí",
    metrics: {
      offensivePressure: 71,
      xG: { home: 1.41, away: 1.18 },
      dangerousAttacksPerMinute: { home: 1.3, away: 1.1 },
      shotsOnTarget: { home: 5, away: 4 },
      pressureHistory: series(70, 63) as PressurePoint[],
      xGHistory: series(1.41, 1.18, 5, 55, "xg") as XGPoint[],
    },
    alert: {
      headline: "ALERTA DETECTADA POR BETDATA AI: Ambos equipos marcan",
      market: "BTTS Sí",
      probability: 76.1,
      valueOdds: 1.78,
      rationale:
        "xG simétrico (1.41 vs 1.18) y ataques peligrosos equilibrados. El motor favorece BTTS con cuota residual por encima de 1.70.",
    },
  },
  {
    id: 1201988,
    league: {
      id: 78,
      name: "Bundesliga",
      country: "Germany",
      logo: "https://media.api-sports.io/football/leagues/78.png",
    },
    home: {
      id: 157,
      name: "Bayern Munich",
      code: "BAY",
      logo: "https://media.api-sports.io/football/teams/157.png",
      colors: ["#DC052D", "#0066B2"],
    },
    away: {
      id: 165,
      name: "Borussia Dortmund",
      code: "BVB",
      logo: "https://media.api-sports.io/football/teams/165.png",
      colors: ["#FDE100", "#000000"],
    },
    kickoffIso: "2026-09-12T18:30:00+00:00",
    status: "HT",
    elapsed: 45,
    score: { home: 2, away: 1 },
    odds: { home: 1.55, draw: 4.4, away: 5.5, valueMarket: 1.62 },
    hitRate: 74.8,
    confidence: 81.2,
    isValueBetOfTheDay: false,
    bestTip: "Over 2.5",
    metrics: {
      offensivePressure: 79,
      xG: { home: 2.04, away: 0.91 },
      dangerousAttacksPerMinute: { home: 1.9, away: 0.9 },
      shotsOnTarget: { home: 7, away: 3 },
      pressureHistory: series(81, 48) as PressurePoint[],
      xGHistory: series(2.04, 0.91, 5, 45, "xg") as XGPoint[],
    },
    alert: {
      headline: "ALERTA DETECTADA POR BETDATA AI: Over 2.5 goles",
      market: "Over 2.5",
      probability: 81.2,
      valueOdds: 1.62,
      rationale:
        "Derbi con 2.95 xG combinado al descanso. Historial del modelo en este mercado: 74.8% de acierto en Bundesliga.",
    },
  },
  {
    id: 1201766,
    league: {
      id: 135,
      name: "Serie A",
      country: "Italy",
      logo: "https://media.api-sports.io/football/leagues/135.png",
    },
    home: {
      id: 505,
      name: "Inter",
      code: "INT",
      logo: "https://media.api-sports.io/football/teams/505.png",
      colors: ["#010E80", "#000000"],
    },
    away: {
      id: 489,
      name: "AC Milan",
      code: "MIL",
      logo: "https://media.api-sports.io/football/teams/489.png",
      colors: ["#FB090B", "#000000"],
    },
    kickoffIso: "2026-09-12T18:45:00+00:00",
    status: "LIVE",
    elapsed: 22,
    score: { home: 0, away: 0 },
    odds: { home: 2.05, draw: 3.25, away: 3.6, valueMarket: 2.08 },
    hitRate: 66.9,
    confidence: 69.5,
    isValueBetOfTheDay: false,
    bestTip: "Under 3.5",
    metrics: {
      offensivePressure: 58,
      xG: { home: 0.38, away: 0.29 },
      dangerousAttacksPerMinute: { home: 0.8, away: 0.7 },
      shotsOnTarget: { home: 1, away: 1 },
      pressureHistory: series(57, 51) as PressurePoint[],
      xGHistory: series(0.38, 0.29, 5, 20, "xg") as XGPoint[],
    },
    alert: {
      headline: "ALERTA DETECTADA POR BETDATA AI: Under 3.5 goles",
      market: "Under 3.5",
      probability: 69.5,
      valueOdds: 2.08,
      rationale:
        "Derby della Madonnina con ritmo bajo y xG combinado 0.67 a los 22'. El modelo espera un partido cerrado.",
    },
  },
  {
    id: 1202210,
    league: {
      id: 61,
      name: "Ligue 1",
      country: "France",
      logo: "https://media.api-sports.io/football/leagues/61.png",
    },
    home: {
      id: 85,
      name: "PSG",
      code: "PSG",
      logo: "https://media.api-sports.io/football/teams/85.png",
      colors: ["#004170", "#DA291C"],
    },
    away: {
      id: 81,
      name: "Marseille",
      code: "OM",
      logo: "https://media.api-sports.io/football/teams/81.png",
      colors: ["#2FAEE0", "#FFFFFF"],
    },
    kickoffIso: "2026-09-12T19:45:00+00:00",
    status: "NS",
    elapsed: null,
    score: { home: null, away: null },
    odds: { home: 1.42, draw: 4.8, away: 6.8, valueMarket: 1.88 },
    hitRate: 70.1,
    confidence: 72.6,
    isValueBetOfTheDay: false,
    bestTip: "PSG -1 AH",
    metrics: {
      offensivePressure: 62,
      xG: { home: 0.12, away: 0.04 },
      dangerousAttacksPerMinute: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      pressureHistory: series(64, 36) as PressurePoint[],
      xGHistory: series(0.12, 0.04, 5, 5, "xg") as XGPoint[],
    },
    alert: {
      headline: "ALERTA DETECTADA POR BETDATA AI: PSG -1 hándicap asiático",
      market: "AH -1 Home",
      probability: 72.6,
      valueOdds: 1.88,
      rationale:
        "Pre-kickoff: el motor proyecta dominio territorial de PSG y un margen esperado superior a un gol en Le Classique.",
    },
  },
];
