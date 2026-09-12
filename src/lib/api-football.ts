import { RAPIDAPI_FOOTBALL } from "@/lib/constants";
import { MOCK_FIXTURES } from "@/lib/mocks/fixtures";
import type { FixturesPayload, MatchInsight } from "@/lib/types";

type ApiFootballTeam = {
  id: number;
  name: string;
  logo: string;
};

type ApiFootballFixtureRow = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
  };
  league: { id: number; name: string; country: string; logo: string };
  teams: { home: ApiFootballTeam; away: ApiFootballTeam };
  goals: { home: number | null; away: number | null };
};

function overlayAnalytics(row: ApiFootballFixtureRow, index: number): MatchInsight {
  const template = MOCK_FIXTURES[index % MOCK_FIXTURES.length];
  const status = (["NS", "LIVE", "HT", "FT"].includes(row.fixture.status.short)
    ? row.fixture.status.short
    : row.fixture.status.elapsed
      ? "LIVE"
      : "NS") as MatchInsight["status"];

  return {
    ...template,
    id: row.fixture.id,
    league: {
      id: row.league.id,
      name: row.league.name,
      country: row.league.country,
      logo: row.league.logo,
    },
    home: {
      ...template.home,
      id: row.teams.home.id,
      name: row.teams.home.name,
      logo: row.teams.home.logo,
    },
    away: {
      ...template.away,
      id: row.teams.away.id,
      name: row.teams.away.name,
      logo: row.teams.away.logo,
    },
    kickoffIso: row.fixture.date,
    status,
    elapsed: row.fixture.status.elapsed,
    score: { home: row.goals.home, away: row.goals.away },
  };
}

export async function getFixturesFeed(): Promise<FixturesPayload> {
  const key = process.env.RAPIDAPI_KEY;

  if (!key) {
    return {
      source: "mock",
      generatedAt: new Date().toISOString(),
      response: MOCK_FIXTURES,
    };
  }

  const res = await fetch(RAPIDAPI_FOOTBALL.liveFixtures, {
    headers: {
      "x-rapidapi-key": key,
      "x-rapidapi-host": RAPIDAPI_FOOTBALL.host,
    },
    next: { revalidate: 20 },
  });

  if (!res.ok) {
    return {
      source: "mock",
      generatedAt: new Date().toISOString(),
      response: MOCK_FIXTURES,
    };
  }

  const json = (await res.json()) as { response?: ApiFootballFixtureRow[] };
  const rows = json.response ?? [];

  if (rows.length === 0) {
    return {
      source: "rapidapi",
      generatedAt: new Date().toISOString(),
      response: MOCK_FIXTURES,
    };
  }

  return {
    source: "rapidapi",
    generatedAt: new Date().toISOString(),
    response: rows.slice(0, 8).map(overlayAnalytics),
  };
}
