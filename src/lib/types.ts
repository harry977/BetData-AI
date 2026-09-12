export type League = {
  id: number;
  name: string;
  country: string;
  logo: string;
};

export type Team = {
  id: number;
  name: string;
  code: string;
  logo: string;
  colors: [string, string];
};

export type FixtureStatus = "NS" | "LIVE" | "HT" | "FT";

export type PressurePoint = {
  minute: number;
  home: number;
  away: number;
};

export type XGPoint = {
  minute: number;
  home: number;
  away: number;
};

export type LiveMetrics = {
  offensivePressure: number;
  xG: { home: number; away: number };
  dangerousAttacksPerMinute: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  pressureHistory: PressurePoint[];
  xGHistory: XGPoint[];
};

export type AiAlert = {
  headline: string;
  market: string;
  probability: number;
  valueOdds: number;
  rationale: string;
};

export type MatchInsight = {
  id: number;
  league: League;
  home: Team;
  away: Team;
  kickoffIso: string;
  status: FixtureStatus;
  elapsed: number | null;
  score: { home: number | null; away: number | null };
  odds: { home: number; draw: number; away: number; valueMarket: number };
  hitRate: number;
  confidence: number;
  isValueBetOfTheDay: boolean;
  bestTip: string;
  metrics: LiveMetrics;
  alert: AiAlert;
};

export type FixturesPayload = {
  source: "mock" | "rapidapi";
  generatedAt: string;
  response: MatchInsight[];
};
