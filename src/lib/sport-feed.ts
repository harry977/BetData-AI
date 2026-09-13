import { PLATFORM_STATS } from "@/lib/constants";
import {
  mergeLiveEvent,
  toLiveMatchCard,
  toMatchInsight,
} from "@/lib/sport-mapper";
import type {
  CategoriesPayload,
  FixturesPayload,
  LiveMatchesPayload,
  MatchInsight,
} from "@/lib/types";
import { isInPlayStatus } from "@/lib/utils";
import {
  fetchAllScheduledEvents,
  fetchCategories,
  fetchLiveEvents,
  hasSportApiKey,
  timezoneOffsetSeconds,
  type EventOdds,
  type SportEvent,
} from "@/lib/sportapi";

const FEED_TTL_MS = 15_000;
let feedCache: {
  savedAt: number;
  payload: FixturesPayload;
} | null = null;

function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

function payload(
  source: FixturesPayload["source"],
  response: MatchInsight[],
  options?: { connected?: boolean },
): FixturesPayload {
  return {
    source,
    connected: options?.connected ?? true,
    generatedAt: new Date().toISOString(),
    stats: {
      matchesAnalyzedToday: PLATFORM_STATS.matchesAnalyzedToday,
      bankerHitRate: PLATFORM_STATS.bankerHitRate,
      leaguesMonitored: PLATFORM_STATS.leaguesMonitored,
    },
    response,
    categories: [],
  };
}

function uniqueEvents(events: SportEvent[]) {
  const map = new Map<number, SportEvent>();
  for (const event of events) map.set(event.id, event);
  return Array.from(map.values());
}

function defaultOdds(): EventOdds {
  const implied = (odds: number) => 1 / odds;
  return {
    home: 2.1,
    draw: 3.4,
    away: 3.5,
    oneXTwo: { pick: "1", odds: 2.1, implied: implied(2.1) },
    overUnder: { pick: "O2.5", odds: 1.85, implied: implied(1.85) },
    btts: { pick: "GG", odds: 1.8, implied: implied(1.8) },
  };
}

function capMatches(matches: MatchInsight[], limit = 80) {
  return matches.slice(0, limit);
}

function capLiveMatches(matches: MatchInsight[], limit = 80) {
  return matches.slice(0, limit);
}

function mapEventsNow(events: SportEvent[], today: string) {
  const odds = defaultOdds();
  return events.map((event) => toMatchInsight(event, odds, today));
}

/**
 * One round-trip to SportAPI (live + today's schedule in parallel).
 * No odds, crests or per-category loops before we respond.
 */
export async function getFixturesFeed(_cachedCategoryIds?: number[]): Promise<FixturesPayload> {
  const today = todayIsoDate();
  if (feedCache && Date.now() - feedCache.savedAt < FEED_TTL_MS && feedCache.payload.response.length) {
    return feedCache.payload;
  }

  const disconnected = payload("sportapi", [], { connected: false });
  if (!hasSportApiKey()) {
    return disconnected;
  }

  try {
    const [liveEvents, todayScheduled] = await Promise.all([
      fetchLiveEvents().catch(() => [] as SportEvent[]),
      fetchAllScheduledEvents(today).catch(() => [] as SportEvent[]),
    ]);

    const liveById = new Map(liveEvents.map((event) => [event.id, event]));
    const merged = uniqueEvents([
      ...todayScheduled.map((event) => {
        const live = liveById.get(event.id);
        return live ? mergeLiveEvent(event, live) : event;
      }),
      ...liveEvents,
    ]);

    const mapped = capMatches(mapEventsNow(merged, today));
    const result = payload("sportapi", mapped, { connected: true });
    const hasLive = result.response.some((match) => isInPlayStatus(match.status));
    feedCache = hasLive ? null : { savedAt: Date.now(), payload: result };
    return result;
  } catch (error) {
    console.error(
      "[API FIXTURES] error",
      error instanceof Error ? error.message : error,
    );
    return disconnected;
  }
}

export async function getLiveMatchesFeed(): Promise<LiveMatchesPayload> {
  const today = todayIsoDate();
  const empty: LiveMatchesPayload = {
    source: "sportapi",
    connected: false,
    generatedAt: new Date().toISOString(),
    matches: [],
    cards: [],
  };

  if (!hasSportApiKey()) {
    return empty;
  }

  try {
    const liveEvents = await fetchLiveEvents();
    const matches = capLiveMatches(
      liveEvents.map((event) => {
        const match = toMatchInsight(event, defaultOdds(), today);
        if (match.status === "NS") return { ...match, status: "LIVE" as const };
        return match;
      }),
    );
    console.info(`[sportapi] live feed mapped ${matches.length}/${liveEvents.length}`);
    return {
      source: "sportapi",
      connected: true,
      generatedAt: new Date().toISOString(),
      matches,
      cards: matches.map(toLiveMatchCard),
    };
  } catch (error) {
    console.error(
      "[sportapi] live feed failed",
      error instanceof Error ? error.message : error,
    );
    return empty;
  }
}

export async function getFootballCategoriesFeed(
  date?: string,
  timezoneOffset?: number,
): Promise<CategoriesPayload> {
  const resolvedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayIsoDate();
  const offset = timezoneOffset ?? timezoneOffsetSeconds();
  const empty: CategoriesPayload = {
    source: "sportapi",
    connected: false,
    date: resolvedDate,
    timezoneOffset: offset,
    categories: [],
  };

  if (!hasSportApiKey()) {
    return empty;
  }

  try {
    const categories = await fetchCategories(resolvedDate, offset);
    return {
      source: "sportapi",
      connected: true,
      date: resolvedDate,
      timezoneOffset: offset,
      categories,
    };
  } catch {
    return empty;
  }
}
