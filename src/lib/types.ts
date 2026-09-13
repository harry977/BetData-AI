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

export type SidePair = { home: number; away: number };

export type LiveMetrics = {
  offensivePressure: number;
  xG: SidePair;
  dangerousAttacksPerMinute: SidePair;
  shotsOnTarget: SidePair;
  pressureHistory: PressurePoint[];
  xGHistory: XGPoint[];
  possession: SidePair | null;
  corners: SidePair | null;
  cards: SidePair | null;
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

export type SportCategory = {
  id: number;
  name: string;
  flag?: string;
  slug?: string;
  eventsCount?: number;
};

export type FeedSource = "rapidapi" | "sportapi";

export type FixturesPayload = {
  source: FeedSource;
  connected: boolean;
  generatedAt: string;
  stats: PlatformStats;
  response: MatchInsight[];
  categories?: SportCategory[];
  error?: string;
};

export type MatchIncidentType =
  | "goal"
  | "card"
  | "corner"
  | "substitution"
  | "var"
  | "period"
  | "other";

export type MatchIncident = {
  id: number;
  minute: number;
  addedTime: number | null;
  type: MatchIncidentType;
  subtype: string | null;
  isHome: boolean;
  player: string | null;
  assist: string | null;
  homeScore: number | null;
  awayScore: number | null;
  label: string;
};

export type LiveMatchCard = {
  id: number;
  home: { id: number; name: string; code: string; logo: string };
  away: { id: number; name: string; code: string; logo: string };
  score: { home: number | null; away: number | null };
  minute: number | null;
  status: FixtureStatus;
  statusLabel: string;
  league: { id: number; name: string; country: string };
  kickoffIso: string;
};

export type LiveMatchesPayload = {
  source: FeedSource;
  connected: boolean;
  generatedAt: string;
  matches: MatchInsight[];
  cards: LiveMatchCard[];
  error?: string;
};

export type CategoriesPayload = {
  source: FeedSource;
  connected: boolean;
  date: string;
  timezoneOffset: number;
  categories: SportCategory[];
};

export type IncidentsPayload = {
  eventId: number;
  incidents: MatchIncident[];
};
