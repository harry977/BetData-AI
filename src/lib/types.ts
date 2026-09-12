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
export type DayBucket = "today" | "tomorrow" | "yesterday";
export type OneXTwoPick = "1" | "X" | "2";
export type BttsPick = "GG" | "NG";

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

export type Markets = {
  oneXTwo: { pick: OneXTwoPick; odds: number };
  overUnder: { pick: string; odds: number };
  btts: { pick: BttsPick; odds: number };
};

export type MatchResult = {
  won: boolean;
  finalScore: { home: number; away: number };
};

export type MatchInsight = {
  id: number;
  day: DayBucket;
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
  isBanker: boolean;
  bestTip: string;
  markets: Markets;
  formNote: string;
  metrics: LiveMetrics;
  result: MatchResult | null;
};

export type PlatformStats = {
  matchesAnalyzedToday: number;
  bankerHitRate: number;
  leaguesMonitored: number;
};

export type FixturesPayload = {
  source: "mock" | "rapidapi";
  generatedAt: string;
  stats: PlatformStats;
  response: MatchInsight[];
};
