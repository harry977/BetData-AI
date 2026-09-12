import { PLATFORM_STATS } from "@/lib/constants";
import { utcDateOffset } from "@/lib/dates";
import { MOCK_FIXTURES } from "@/lib/mocks/fixtures";
import { isPriorityLive, mergeLiveEvent, toMatchInsight } from "@/lib/sport-mapper";
import type { FixturesPayload, MatchInsight, SportCategory } from "@/lib/types";
import {
  fetchAllScheduledEvents,
  fetchBulkOdds,
  fetchCategories,
  fetchLiveEvents,
  fetchScheduledEvents,
  hasSportApiKey,
  selectPriorityCategories,
  timezoneOffsetSeconds,
  type EventOdds,
  type SportEvent,
} from "@/services/sportApi";

const FEED_TTL_MS = 120_000;
let feedCache: { key: string; savedAt: number; payload: FixturesPayload } | null = null;
let categoryMemory: { date: string; savedAt: number; categories: SportCategory[] } | null =
  null;
const CATEGORY_TTL_MS = 30 * 60 * 1000;

function payload(
  source: FixturesPayload["source"],
  response: MatchInsight[],
  categories: SportCategory[] = [],
): FixturesPayload {
  return {
    source,
    generatedAt: new Date().toISOString(),
    stats: {
      matchesAnalyzedToday: PLATFORM_STATS.matchesAnalyzedToday,
      bankerHitRate: PLATFORM_STATS.bankerHitRate,
      leaguesMonitored: PLATFORM_STATS.leaguesMonitored,
    },
    response,
    categories,
  };
}

async function categoriesForDate(date: string, cachedIds?: number[]) {
  if (
    categoryMemory &&
    categoryMemory.date === date &&
    Date.now() - categoryMemory.savedAt < CATEGORY_TTL_MS
  ) {
    return categoryMemory.categories;
  }

  try {
    const categories = await fetchCategories(date, timezoneOffsetSeconds());
    if (categories.length) {
      categoryMemory = { date, savedAt: Date.now(), categories };
      return categories;
    }
  } catch {
    /* keep going with cached ids / bulk events */
  }

  if (cachedIds?.length) {
    return cachedIds.map((id) => ({ id, name: `Categoría ${id}` }));
  }

  return categoryMemory?.date === date ? categoryMemory.categories : [];
}

function uniqueEvents(events: SportEvent[]) {
  const map = new Map<number, SportEvent>();
  for (const event of events) map.set(event.id, event);
  return Array.from(map.values());
}

async function eventsForDate(date: string, categories: SportCategory[]) {
  try {
    const bulk = await fetchAllScheduledEvents(date);
    if (bulk.length) return uniqueEvents(bulk);
  } catch {
    /* category fan-out */
  }

  const selected = selectPriorityCategories(categories, 4);
  const collected: SportEvent[] = [];
  for (const category of selected) {
    try {
      collected.push(...(await fetchScheduledEvents(category.id, date)));
    } catch {
      /* skip category */
    }
  }
  return uniqueEvents(collected);
}

async function oddsMapFor(date: string) {
  try {
    return await fetchBulkOdds(date);
  } catch {
    return new Map<number, EventOdds>();
  }
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

function withMockFallback(apiMatches: MatchInsight[]): MatchInsight[] {
  if (apiMatches.length === 0) return MOCK_FIXTURES;
  const merged = [...apiMatches];
  for (const day of ["today", "tomorrow", "yesterday"] as const) {
    if (!merged.some((match) => match.day === day)) {
      merged.push(...MOCK_FIXTURES.filter((match) => match.day === day));
    }
  }
  return merged;
}

function leagueBoost(match: MatchInsight) {
  const name = `${match.league.country} ${match.league.name}`.toLowerCase();
  if (/u1[6-9]|u21|u23|youth|reserva|reserve|premier league 2/.test(name)) return -50;
  if (
    /uefa champions|premier league|la liga|serie a|bundesliga|ligue 1|europa league|copa del rey|fa cup/.test(
      name,
    )
  ) {
    return 55;
  }
  if (/england|spain|germany|italy|france|netherlands|portugal|brazil|argentina|mexico/.test(name)) {
    return 12;
  }
  return 0;
}

function capMatches(matches: MatchInsight[]) {
  const byDay = {
    today: matches.filter((match) => match.day === "today"),
    tomorrow: matches.filter((match) => match.day === "tomorrow"),
    yesterday: matches.filter((match) => match.day === "yesterday"),
  };
  const rank = (match: MatchInsight) =>
    leagueBoost(match) +
    (match.status === "LIVE" || match.status === "HT" ? 20 : 0) +
    match.confidence +
    (match.isBanker ? 8 : 0);
  const take = (rows: MatchInsight[], limit: number) =>
    rows.slice().sort((a, b) => rank(b) - rank(a)).slice(0, limit);
  return [...take(byDay.today, 48), ...take(byDay.tomorrow, 16), ...take(byDay.yesterday, 16)];
}

export async function getFixturesFeed(cachedCategoryIds?: number[]): Promise<FixturesPayload> {
  const today = utcDateOffset(0);
  const cacheKey = `${today}:${(cachedCategoryIds ?? []).join(",")}`;
  if (feedCache && feedCache.key === cacheKey && Date.now() - feedCache.savedAt < FEED_TTL_MS) {
    return feedCache.payload;
  }

  if (!hasSportApiKey()) {
    return payload("mock", MOCK_FIXTURES);
  }

  try {
    const categories = await categoriesForDate(today, cachedCategoryIds);
    const todayEvents = await eventsForDate(today, categories);
    const liveEvents = await fetchLiveEvents().catch(() => [] as SportEvent[]);

    const liveById = new Map(liveEvents.map((event) => [event.id, event]));
    const mergedToday = todayEvents.map((event) => {
      const live = liveById.get(event.id);
      return live ? mergeLiveEvent(event, live) : event;
    });
    for (const live of liveEvents) {
      if (!mergedToday.some((event) => event.id === live.id) && isPriorityLive(live)) {
        mergedToday.push(live);
      }
    }

    if (mergedToday.length === 0) {
      const fallback = payload("mock", MOCK_FIXTURES, categories);
      feedCache = { key: cacheKey, savedAt: Date.now(), payload: fallback };
      return fallback;
    }

    const oddsToday = await oddsMapFor(today);
    const mapped = mergedToday.map((event) =>
      toMatchInsight(event, oddsToday.get(event.id) ?? defaultOdds(), today),
    );
    const next = payload("sportapi", capMatches(withMockFallback(mapped)), categories);
    feedCache = { key: cacheKey, savedAt: Date.now(), payload: next };
    return next;
  } catch {
    return payload("mock", MOCK_FIXTURES, categoryMemory?.categories ?? []);
  }
}
