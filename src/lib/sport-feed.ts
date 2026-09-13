import { PLATFORM_STATS } from "@/lib/constants";
import { shiftYmd } from "@/lib/dates";
import { buildDemoFixtures, demoFeedCoversProduct } from "@/lib/mocks/demo-fixtures";
import {
  dayBucketFor,
  isLowQualityLive,
  isPriorityLive,
  mergeLiveEvent,
  toMatchInsight,
} from "@/lib/sport-mapper";
import type { FixturesPayload, MatchInsight, SportCategory } from "@/lib/types";
import { isInPlayStatus } from "@/lib/utils";
import {
  fetchFootballFixturesByDate,
  fetchFootballLiveFixtures,
} from "@/services/apiFootball";
import {
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

const FEED_TTL_MS = 15_000;
const FEED_FAIL_TTL_MS = 60_000;
let feedCache: {
  key: string;
  savedAt: number;
  ttl: number;
  payload: FixturesPayload;
} | null = null;
let categoryMemory: { date: string; savedAt: number; categories: SportCategory[] } | null =
  null;
const CATEGORY_TTL_MS = 30 * 60 * 1000;

function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

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
    /* keep going with cached ids */
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
  const selected = selectPriorityCategories(categories, 12);
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
    (isInPlayStatus(match.status) ? 20 : 0) +
    match.confidence +
    (match.isBanker ? 8 : 0);
  const take = (rows: MatchInsight[], limit: number) =>
    rows.slice().sort((a, b) => rank(b) - rank(a)).slice(0, limit);
  return [...take(byDay.today, 48), ...take(byDay.tomorrow, 32), ...take(byDay.yesterday, 16)];
}

export async function getFixturesFeed(cachedCategoryIds?: number[]): Promise<FixturesPayload> {
  const today = todayIsoDate();
  const tomorrow = shiftYmd(today, 1);
  const yesterday = shiftYmd(today, -1);
  const cacheKey = `${today}:${(cachedCategoryIds ?? []).join(",")}`;
  if (feedCache && feedCache.key === cacheKey && Date.now() - feedCache.savedAt < feedCache.ttl) {
    if (feedCache.payload.source === "mock") return feedCache.payload;
    const cachedLive = feedCache.payload.response.some((match) =>
      isInPlayStatus(match.status),
    );
    if (!cachedLive) return feedCache.payload;
  }

  const demo = payload("mock", buildDemoFixtures());

  if (!hasSportApiKey()) {
    feedCache = { key: cacheKey, savedAt: Date.now(), ttl: FEED_FAIL_TTL_MS, payload: demo };
    return demo;
  }

  const liveFeed = (async (): Promise<FixturesPayload | null> => {
    const categories = await categoriesForDate(today, cachedCategoryIds);
    const [
      footballToday,
      footballTomorrow,
      footballYesterday,
      footballLive,
      todayEvents,
      tomorrowEvents,
      yesterdayEvents,
      liveEvents,
    ] = await Promise.all([
      fetchFootballFixturesByDate(today),
      fetchFootballFixturesByDate(tomorrow).catch(() => [] as SportEvent[]),
      fetchFootballFixturesByDate(yesterday).catch(() => [] as SportEvent[]),
      fetchFootballLiveFixtures().catch(() => [] as SportEvent[]),
      eventsForDate(today, categories).catch(() => [] as SportEvent[]),
      eventsForDate(tomorrow, categories).catch(() => [] as SportEvent[]),
      eventsForDate(yesterday, categories).catch(() => [] as SportEvent[]),
      fetchLiveEvents().catch(() => [] as SportEvent[]),
    ]);

    const scheduled = uniqueEvents([
      ...footballToday,
      ...footballTomorrow,
      ...footballYesterday,
      ...todayEvents,
      ...tomorrowEvents,
      ...yesterdayEvents,
    ]);
    const liveById = new Map(
      [...footballLive, ...liveEvents].map((event) => [event.id, event]),
    );
    const merged = scheduled.map((event) => {
      const live = liveById.get(event.id);
      return live ? mergeLiveEvent(event, live) : event;
    });
    for (const live of Array.from(liveById.values())) {
      if (merged.some((event) => event.id === live.id)) continue;
      if (isLowQualityLive(live) && !isPriorityLive(live) && !live.leagueLogo) continue;
      merged.push(live);
    }

    if (merged.length === 0) return { ...demo, categories };

    const [oddsToday, oddsTomorrow] = await Promise.all([
      oddsMapFor(today),
      oddsMapFor(tomorrow).catch(() => new Map<number, EventOdds>()),
    ]);

    const mapped = merged.map((event) => {
      const day = dayBucketFor(event.startTimestamp, today);
      const odds =
        (day === "tomorrow" ? oddsTomorrow : oddsToday).get(event.id) ?? defaultOdds();
      return toMatchInsight(event, odds, today);
    });
    const source = footballToday.length || footballLive.length ? "rapidapi" : "sportapi";
    return payload(source, capMatches(mapped), categories);
  })();

  try {
    const result = await Promise.race([
      liveFeed,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4500)),
    ]);
    if (result && result.source !== "mock" && demoFeedCoversProduct(result.response)) {
      const hasLive = result.response.some((match) => isInPlayStatus(match.status));
      feedCache = hasLive
        ? null
        : { key: cacheKey, savedAt: Date.now(), ttl: FEED_TTL_MS, payload: result };
      return result;
    }
  } catch {
    /* demo fallback */
  }

  feedCache = { key: cacheKey, savedAt: Date.now(), ttl: FEED_FAIL_TTL_MS, payload: demo };
  return demo;
}
