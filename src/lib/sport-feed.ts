import { PLATFORM_STATS } from "@/lib/constants";
import { shiftYmd } from "@/lib/dates";
import { buildDemoFixtures } from "@/lib/mocks/demo-fixtures";
import {
  dayBucketFor,
  isLowQualityLive,
  isPriorityLive,
  mergeLiveEvent,
  toLiveMatchCard,
  toMatchInsight,
} from "@/lib/sport-mapper";
import type {
  CategoriesPayload,
  FixturesPayload,
  LiveMatchesPayload,
  MatchInsight,
  SportCategory,
} from "@/lib/types";
import { isInPlayStatus } from "@/lib/utils";
import {
  fetchFootballFixturesByDate,
  fetchFootballLiveFixtures,
} from "@/services/apiFootball";
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
} from "@/lib/sportapi";

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
  const country = match.league.country.toLowerCase();
  const name = match.league.name.toLowerCase();
  const hay = `${country} ${name}`;
  if (/eccellenza|amateur|amistoso|friendly|tercera|regional/.test(hay)) return -30;
  if (/uefa champions/.test(hay)) return 90;
  if (country === "england" && name === "premier league") return 88;
  if ((country === "spain" || country === "españa") && /laliga|la liga/.test(name)) return 86;
  if (country === "italy" && name.includes("serie a")) return 84;
  if (country === "germany" && /^bundesliga$/.test(name)) return 84;
  if (country === "france" && name.includes("ligue 1")) return 82;
  if (/europa league|copa del rey|fa cup/.test(hay)) return 70;
  if (
    [
      "england",
      "spain",
      "españa",
      "germany",
      "italy",
      "france",
      "netherlands",
      "portugal",
      "brazil",
      "argentina",
      "mexico",
    ].includes(country)
  ) {
    return 16;
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

function capLiveMatches(matches: MatchInsight[], limit = 48) {
  return matches
    .slice()
    .sort((a, b) => {
      const score = (match: MatchInsight) =>
        leagueBoost(match) + (isInPlayStatus(match.status) ? 12 : 0) + (match.elapsed ?? 0) / 10;
      return score(b) - score(a);
    })
    .slice(0, limit);
}

function preselectEvents(events: SportEvent[], today: string) {
  const buckets: Record<"today" | "tomorrow" | "yesterday", SportEvent[]> = {
    today: [],
    tomorrow: [],
    yesterday: [],
  };
  for (const event of events) {
    buckets[dayBucketFor(event.startTimestamp, today)].push(event);
  }
  const rank = (event: SportEvent) => {
    const live = /progress|live|inplay|halftime/.test(event.statusType) ? 25 : 0;
    return (isPriorityLive(event) ? 55 : 0) + live - (isLowQualityLive(event) ? 40 : 0);
  };
  const take = (rows: SportEvent[], limit: number) =>
    rows.slice().sort((a, b) => rank(b) - rank(a)).slice(0, limit);
  return uniqueEvents([
    ...take(buckets.today, 64),
    ...take(buckets.tomorrow, 36),
    ...take(buckets.yesterday, 20),
  ]);
}

async function scheduledForDate(date: string, categories: SportCategory[]) {
  try {
    const all = await fetchAllScheduledEvents(date);
    if (all.length) return all;
  } catch {
    /* fall through to per-category */
  }
  return eventsForDate(date, selectPriorityCategories(categories, 4));
}

function mergeScheduledAndLive(scheduled: SportEvent[], liveEvents: SportEvent[]) {
  const liveById = new Map(liveEvents.map((event) => [event.id, event]));
  const merged = scheduled.map((event) => {
    const live = liveById.get(event.id);
    return live ? mergeLiveEvent(event, live) : event;
  });
  for (const live of Array.from(liveById.values())) {
    if (merged.some((event) => event.id === live.id)) continue;
    if (isLowQualityLive(live) && !isPriorityLive(live) && !live.leagueLogo) continue;
    merged.push(live);
  }
  return merged;
}

async function mapEvents(events: SportEvent[], today: string) {
  const tomorrow = shiftYmd(today, 1);
  const empty = new Map<number, EventOdds>();
  const odds = await Promise.race([
    Promise.all([oddsMapFor(today), oddsMapFor(tomorrow).catch(() => empty)]),
    new Promise<[Map<number, EventOdds>, Map<number, EventOdds>]>((resolve) =>
      setTimeout(() => resolve([empty, empty]), 2500),
    ),
  ]);
  const [oddsToday, oddsTomorrow] = odds;
  return events.map((event) => {
    const day = dayBucketFor(event.startTimestamp, today);
    const eventOdds =
      (day === "tomorrow" ? oddsTomorrow : oddsToday).get(event.id) ?? defaultOdds();
    return toMatchInsight(event, eventOdds, today);
  });
}

export async function getFixturesFeed(cachedCategoryIds?: number[]): Promise<FixturesPayload> {
  const today = todayIsoDate();
  const tomorrow = shiftYmd(today, 1);
  const yesterday = shiftYmd(today, -1);
  const cacheKey = `${today}:${(cachedCategoryIds ?? []).join(",")}`;
  if (feedCache && feedCache.key === cacheKey && Date.now() - feedCache.savedAt < feedCache.ttl) {
    if (feedCache.payload.source !== "mock") {
      const cachedLive = feedCache.payload.response.some((match) =>
        isInPlayStatus(match.status),
      );
      if (!cachedLive) return feedCache.payload;
    }
  }

  const demo = payload("mock", buildDemoFixtures());

  if (!hasSportApiKey()) {
    feedCache = { key: cacheKey, savedAt: Date.now(), ttl: FEED_FAIL_TTL_MS, payload: demo };
    return demo;
  }

  try {
    const categories = await categoriesForDate(today, cachedCategoryIds);
    const [todayEvents, tomorrowEvents, yesterdayEvents, liveEvents] = await Promise.all([
      scheduledForDate(today, categories).catch(() => [] as SportEvent[]),
      scheduledForDate(tomorrow, categories).catch(() => [] as SportEvent[]),
      scheduledForDate(yesterday, categories).catch(() => [] as SportEvent[]),
      fetchLiveEvents().catch(() => [] as SportEvent[]),
    ]);

    let merged = mergeScheduledAndLive(
      uniqueEvents([...todayEvents, ...tomorrowEvents, ...yesterdayEvents]),
      liveEvents,
    );
    merged = preselectEvents(merged, today);

    if (merged.length === 0) {
      const [footballToday, footballTomorrow, footballYesterday, footballLive] =
        await Promise.all([
          fetchFootballFixturesByDate(today).catch(() => [] as SportEvent[]),
          fetchFootballFixturesByDate(tomorrow).catch(() => [] as SportEvent[]),
          fetchFootballFixturesByDate(yesterday).catch(() => [] as SportEvent[]),
          fetchFootballLiveFixtures().catch(() => [] as SportEvent[]),
        ]);
      merged = preselectEvents(
        mergeScheduledAndLive(
          uniqueEvents([...footballToday, ...footballTomorrow, ...footballYesterday]),
          footballLive,
        ),
        today,
      );
      if (merged.length === 0) {
        feedCache = { key: cacheKey, savedAt: Date.now(), ttl: FEED_FAIL_TTL_MS, payload: demo };
        return { ...demo, categories };
      }
      const mappedFootball = await mapEvents(merged, today);
      const result = payload("rapidapi", capMatches(mappedFootball), categories);
      feedCache = {
        key: cacheKey,
        savedAt: Date.now(),
        ttl: result.response.some((match) => isInPlayStatus(match.status)) ? 0 : FEED_TTL_MS,
        payload: result,
      };
      return result;
    }

    const mapped = await mapEvents(merged, today);
    const result = payload("sportapi", capMatches(mapped), categories);
    const hasLive = result.response.some((match) => isInPlayStatus(match.status));
    feedCache = hasLive
      ? null
      : { key: cacheKey, savedAt: Date.now(), ttl: FEED_TTL_MS, payload: result };
    return result;
  } catch {
    feedCache = { key: cacheKey, savedAt: Date.now(), ttl: FEED_FAIL_TTL_MS, payload: demo };
    return demo;
  }
}

export async function getLiveMatchesFeed(): Promise<LiveMatchesPayload> {
  const today = todayIsoDate();
  const demoMatches = buildDemoFixtures().filter((match) => isInPlayStatus(match.status));

  if (!hasSportApiKey()) {
    return {
      source: "mock",
      generatedAt: new Date().toISOString(),
      matches: demoMatches,
      cards: demoMatches.map(toLiveMatchCard),
    };
  }

  try {
    const liveEvents = await fetchLiveEvents();
    const matches = capLiveMatches(
      liveEvents
        .map((event) => toMatchInsight(event, defaultOdds(), today))
        .filter((match) => isInPlayStatus(match.status)),
    );
    if (matches.length === 0) {
      return {
        source: "sportapi",
        generatedAt: new Date().toISOString(),
        matches: [],
        cards: [],
      };
    }
    return {
      source: "sportapi",
      generatedAt: new Date().toISOString(),
      matches,
      cards: matches.map(toLiveMatchCard),
    };
  } catch {
    return {
      source: "mock",
      generatedAt: new Date().toISOString(),
      matches: demoMatches,
      cards: demoMatches.map(toLiveMatchCard),
    };
  }
}

export async function getFootballCategoriesFeed(
  date?: string,
  timezoneOffset?: number,
): Promise<CategoriesPayload> {
  const resolvedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayIsoDate();
  const offset = timezoneOffset ?? timezoneOffsetSeconds();

  if (!hasSportApiKey()) {
    return { source: "mock", date: resolvedDate, timezoneOffset: offset, categories: [] };
  }

  try {
    const categories = await fetchCategories(resolvedDate, offset);
    return {
      source: "sportapi",
      date: resolvedDate,
      timezoneOffset: offset,
      categories,
    };
  } catch {
    return { source: "mock", date: resolvedDate, timezoneOffset: offset, categories: [] };
  }
}
