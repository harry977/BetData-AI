import { asArray, asInt, asNumber, asString, isRecord } from "@/lib/json";
import type { SportCategory } from "@/lib/types";
import fs from "node:fs";
import https from "node:https";
import path from "node:path";

function hydrateLocalEnv() {
  try {
    const file = path.join(process.cwd(), ".env.local");
    if (!fs.existsSync(file)) return;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index <= 0) continue;
      const key = trimmed.slice(0, index);
      const value = trimmed.slice(index + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* ignore missing env file */
  }
}

hydrateLocalEnv();

export const SPORTAPI_HOST =
  process.env["RAPIDAPI_SPORT_HOST"] ?? "sportapi7.p.rapidapi.com";
export const SPORTAPI_BASE =
  process.env["RAPIDAPI_SPORT_BASE"] ?? "https://sportapi7.p.rapidapi.com";
export const SPORTAPI_ODDS_PROVIDER = 1;

const CATEGORIES_TTL_MS = 30 * 60 * 1000;
const SHORT_TTL_MS = 60 * 1000;

type CacheEntry<T> = { savedAt: number; value: T };

const memoryCache = new Map<string, CacheEntry<unknown>>();

function readCache<T>(key: string, ttl: number): T | null {
  const hit = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (!hit) return null;
  if (Date.now() - hit.savedAt > ttl) return null;
  return hit.value;
}

function writeCache<T>(key: string, value: T) {
  memoryCache.set(key, { savedAt: Date.now(), value });
}

export type { SportCategory };

export type SportTeam = {
  id: number;
  name: string;
  shortName: string;
  nameCode: string;
  logo?: string;
};

export type SportEvent = {
  id: number;
  startTimestamp: number;
  home: SportTeam;
  away: SportTeam;
  homeScore: number | null;
  awayScore: number | null;
  statusType: string;
  statusDescription: string;
  elapsed: number | null;
  leagueId: number;
  leagueName: string;
  country: string;
  countryFlag?: string;
  uniqueTournamentId?: number;
  leagueLogo?: string;
};

export type MarketOdds = {
  pick: string;
  odds: number;
  implied: number;
};

export type EventOdds = {
  home: number;
  draw: number;
  away: number;
  oneXTwo: MarketOdds;
  overUnder: MarketOdds;
  btts: MarketOdds;
};

export type EventStatSnapshot = {
  xG: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  possession: { home: number; away: number };
};

function sportHeaders(): Record<string, string> {
  const key = process.env["RAPIDAPI_KEY"];
  if (!key) {
    throw new Error("Missing RAPIDAPI_KEY");
  }
  return {
    "X-RapidAPI-Key": key,
    "X-RapidAPI-Host": SPORTAPI_HOST,
  };
}

export function hasSportApiKey() {
  return Boolean(process.env["RAPIDAPI_KEY"]);
}

function httpsGet(url: string, headers: Record<string, string>): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers, timeout: 15000 }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk as Buffer));
      res.on("end", () =>
        resolve({
          status: res.statusCode ?? 0,
          text: Buffer.concat(chunks).toString("utf8"),
        }),
      );
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`SportAPI timeout ${url}`));
    });
  });
}

let requestChain = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = requestChain.then(
    () => new Promise((resolve) => setTimeout(resolve, 120)),
  ).then(task);
  requestChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function sportGet<T = unknown>(path: string, ttlMs = 0): Promise<T> {
  const cacheKey = `get:${path}`;
  if (ttlMs > 0) {
    const cached = readCache<T>(cacheKey, ttlMs);
    if (cached !== null) return cached;
  }

  const url = `${SPORTAPI_BASE}${path}`;
  const json = await enqueue(async () => {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const { status, text } = await httpsGet(url, sportHeaders());
      if (status === 429 && attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        continue;
      }
      if (status < 200 || status >= 300) {
        lastError = new Error(`SportAPI ${status} ${path} ${text.slice(0, 160)}`);
        break;
      }
      return JSON.parse(text) as T;
    }
    throw lastError ?? new Error(`SportAPI failed ${path}`);
  });

  if (ttlMs > 0) writeCache(cacheKey, json);
  return json;
}

export function timezoneOffsetSeconds(): number {
  const fromEnv = Number(process.env["SPORTAPI_TZ_OFFSET"]);
  if (Number.isFinite(fromEnv)) return fromEnv;
  return 0;
}

function teamFromUnknown(value: unknown): SportTeam {
  const row = isRecord(value) ? value : {};
  const id = asInt(row.id) ?? 0;
  const name = asString(row.name, "Equipo");
  const shortName = asString(row.shortName, name);
  const nameCode = asString(row.nameCode, shortName.slice(0, 3).toUpperCase());
  const logo = asString(row.logo) || asString(row.image) || undefined;
  return { id, name, shortName, nameCode, logo };
}

function scoreFromUnknown(value: unknown): number | null {
  if (!isRecord(value)) return asNumber(value);
  return (
    asNumber(value.current) ??
    asNumber(value.display) ??
    asNumber(value.normaltime) ??
    null
  );
}

function elapsedFromEvent(row: Record<string, unknown>, statusType: string): number | null {
  const time = isRecord(row.time) ? row.time : {};
  const played = asInt(time.played) ?? asInt(row.elapsed);
  if (played !== null) return played;
  if (statusType === "halftime") return 45;
  if (statusType === "finished") return 90;
  const periodStart = asInt(time.currentPeriodStartTimestamp);
  if (periodStart) {
    const minutes = Math.max(1, Math.round((Date.now() / 1000 - periodStart) / 60));
    return Math.min(130, minutes);
  }
  return statusType === "inprogress" ? 1 : null;
}

export function parseSportEvent(value: unknown): SportEvent | null {
  if (!isRecord(value)) return null;
  const id = asInt(value.id);
  if (id === null) return null;
  const tournament = isRecord(value.tournament) ? value.tournament : {};
  const unique = isRecord(tournament.uniqueTournament)
    ? tournament.uniqueTournament
    : isRecord(value.uniqueTournament)
      ? value.uniqueTournament
      : {};
  const category = isRecord(tournament.category)
    ? tournament.category
    : isRecord(unique.category)
      ? unique.category
      : isRecord(value.category)
        ? value.category
        : {};
  const countryObj = isRecord(category.country) ? category.country : {};
  const status = isRecord(value.status) ? value.status : {};
  const statusType = asString(status.type, asString(value.statusType)).toLowerCase();
  const startTimestamp =
    asInt(value.startTimestamp) ??
    Math.floor(new Date(asString(value.startDate, new Date().toISOString())).getTime() / 1000);

  return {
    id,
    startTimestamp: startTimestamp || Math.floor(Date.now() / 1000),
    home: teamFromUnknown(value.homeTeam ?? value.home),
    away: teamFromUnknown(value.awayTeam ?? value.away),
    homeScore: scoreFromUnknown(value.homeScore ?? value.homeGoals),
    awayScore: scoreFromUnknown(value.awayScore ?? value.awayGoals),
    statusType,
    statusDescription: asString(status.description, asString(status.code)),
    elapsed: elapsedFromEvent(value, statusType),
    leagueId: asInt(unique.id) ?? asInt(tournament.id) ?? asInt(category.id) ?? 0,
    leagueName:
      asString(unique.name) || asString(tournament.name) || asString(category.name) || "Fútbol",
    country:
      asString(countryObj.name) ||
      asString(category.name) ||
      asString(category.flag) ||
      "International",
    countryFlag: asString(category.flag) || asString(countryObj.alpha2),
    uniqueTournamentId: asInt(unique.id) ?? undefined,
  };
}

export function parseEventList(payload: unknown): SportEvent[] {
  const root = isRecord(payload) ? payload : {};
  const rows = [
    ...asArray(root.events),
    ...asArray(root.scheduledEvents),
    ...asArray(root.response),
    Array.isArray(payload) ? payload : [],
  ].flat();
  const seen = new Set<number>();
  const events: SportEvent[] = [];
  for (const row of rows) {
    const parsed = parseSportEvent(row);
    if (!parsed || seen.has(parsed.id)) continue;
    seen.add(parsed.id);
    events.push(parsed);
  }
  return events;
}

function parseCategory(value: unknown): SportCategory | null {
  const row = isRecord(value) ? value : {};
  const nested = isRecord(row.category) ? row.category : row;
  const id = asInt(nested.id);
  if (id === null) return null;
  const tournaments = asArray(row.uniqueTournaments ?? nested.uniqueTournaments);
  return {
    id,
    name: asString(nested.name, "Categoría"),
    flag: asString(nested.flag) || undefined,
    slug: asString(nested.slug) || undefined,
    eventsCount:
      asInt(row.totalEvents) ??
      asInt(row.eventsCount) ??
      asInt(nested.totalEvents) ??
      tournaments.length,
  };
}

export function parseCategories(payload: unknown): SportCategory[] {
  const root = isRecord(payload) ? payload : {};
  const rows = [
    ...asArray(root.categories),
    ...asArray(root.sportCategories),
    ...asArray(root.response),
    Array.isArray(payload) ? payload : [],
  ].flat();
  const seen = new Set<number>();
  const categories: SportCategory[] = [];
  for (const row of rows) {
    const parsed = parseCategory(row);
    if (!parsed || seen.has(parsed.id)) continue;
    seen.add(parsed.id);
    categories.push(parsed);
  }
  return categories;
}

export async function fetchCategories(
  date: string,
  timezoneOffset = timezoneOffsetSeconds(),
): Promise<SportCategory[]> {
  const path = `/api/v1/sport/football/${date}/${timezoneOffset}/categories`;
  const json = await sportGet(path, CATEGORIES_TTL_MS);
  return parseCategories(json);
}

export async function fetchScheduledEvents(
  categoryId: number,
  date: string,
): Promise<SportEvent[]> {
  const path = `/api/v1/category/${categoryId}/scheduled-events/${date}`;
  const json = await sportGet(path, SHORT_TTL_MS);
  return parseEventList(json);
}

export async function fetchAllScheduledEvents(date: string): Promise<SportEvent[]> {
  const path = `/api/v1/sport/football/scheduled-events/${date}`;
  const json = await sportGet(path, SHORT_TTL_MS);
  return parseEventList(json);
}

export async function fetchLiveEvents(): Promise<SportEvent[]> {
  const path = `/api/v1/sport/football/events/live`;
  const json = await sportGet(path, 0);
  return parseEventList(json);
}

function fractionalToDecimal(value: string): number | null {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const num = Number(match[1]);
  const den = Number(match[2]);
  if (!den) return null;
  return Number((1 + num / den).toFixed(2));
}

function decimalOdds(value: unknown): number | null {
  const direct = asNumber(value);
  if (direct && direct > 1) return Number(direct.toFixed(2));
  if (typeof value === "string" && value.includes("/")) {
    return fractionalToDecimal(value);
  }
  if (isRecord(value)) {
    return (
      decimalOdds(value.decimalValue) ??
      decimalOdds(value.decimal) ??
      decimalOdds(value.fractionalValue) ??
      decimalOdds(value.fractional) ??
      decimalOdds(value.odd) ??
      decimalOdds(value.odds)
    );
  }
  return null;
}

function choiceName(value: unknown): string {
  if (!isRecord(value)) return asString(value).toLowerCase();
  return asString(value.name ?? value.choice ?? value.label).toLowerCase();
}

function parseChoices(choices: unknown[]): { name: string; odds: number }[] {
  return choices
    .map((choice) => {
      const name = choiceName(choice);
      const odds = decimalOdds(choice);
      if (!name || odds === null) return null;
      return { name, odds };
    })
    .filter((row): row is { name: string; odds: number } => row !== null);
}

function impliedFromOdds(odds: number) {
  return odds > 1 ? 1 / odds : 0.5;
}

function bestOf(
  options: { pick: string; odds: number }[],
  fallback: { pick: string; odds: number },
): MarketOdds {
  const ranked = options
    .filter((row) => row.odds > 1)
    .map((row) => ({ ...row, implied: impliedFromOdds(row.odds) }))
    .sort((a, b) => b.implied - a.implied);
  const winner = ranked[0];
  if (!winner) {
    return { ...fallback, implied: impliedFromOdds(fallback.odds) };
  }
  return winner;
}

function emptyOdds(): EventOdds {
  const oneXTwo = bestOf(
    [
      { pick: "1", odds: 2.1 },
      { pick: "X", odds: 3.4 },
      { pick: "2", odds: 3.4 },
    ],
    { pick: "1", odds: 2.1 },
  );
  return {
    home: 2.1,
    draw: 3.4,
    away: 3.4,
    oneXTwo,
    overUnder: { pick: "O2.5", odds: 1.85, implied: impliedFromOdds(1.85) },
    btts: { pick: "GG", odds: 1.8, implied: impliedFromOdds(1.8) },
  };
}

export function parseEventOdds(payload: unknown): EventOdds {
  const markets: unknown[] = [];

  const visit = (node: unknown, depth = 0) => {
    if (depth > 8 || node === null || node === undefined) return;
    if (Array.isArray(node)) {
      node.forEach((item) => visit(item, depth + 1));
      return;
    }
    if (!isRecord(node)) return;
    if (Array.isArray(node.choices) || Array.isArray(node.marketChoices)) {
      markets.push(node);
    }
    if (Array.isArray(node.markets)) visit(node.markets, depth + 1);
    else {
      for (const value of Object.values(node)) visit(value, depth + 1);
    }
  };

  visit(payload);

  let home = 0;
  let draw = 0;
  let away = 0;
  const overUnderOptions: { pick: string; odds: number }[] = [];
  const bttsOptions: { pick: string; odds: number }[] = [];

  for (const market of markets) {
    if (!isRecord(market)) continue;
    const title = `${asString(market.marketName ?? market.name)} ${asString(market.choiceGroup)}`.toLowerCase();
    const choices = parseChoices(asArray(market.choices ?? market.marketChoices));
    const is1x2 =
      title.includes("full time") ||
      title.includes("1x2") ||
      title.includes("match winner") ||
      title.includes("winner") ||
      choices.some((choice) => choice.name === "1" || choice.name === "x" || choice.name === "2");

    if (is1x2 && !home) {
      for (const choice of choices) {
        if (choice.name === "1" || choice.name === "home") home = choice.odds;
        if (choice.name === "x" || choice.name === "draw") draw = choice.odds;
        if (choice.name === "2" || choice.name === "away") away = choice.odds;
      }
    }

    if (title.includes("over") || title.includes("under") || title.includes("total")) {
      const line = asString(market.choiceGroup, "2.5") || "2.5";
      for (const choice of choices) {
        if (choice.name.includes("over")) overUnderOptions.push({ pick: `O${line}`, odds: choice.odds });
        if (choice.name.includes("under")) overUnderOptions.push({ pick: `U${line}`, odds: choice.odds });
      }
    }

    if (title.includes("both") || title.includes("btts") || title.includes("gg")) {
      for (const choice of choices) {
        if (choice.name.includes("yes") || choice.name === "gg") {
          bttsOptions.push({ pick: "GG", odds: choice.odds });
        }
        if (choice.name.includes("no") || choice.name === "ng") {
          bttsOptions.push({ pick: "NG", odds: choice.odds });
        }
      }
    }
  }

  if (!home && !draw && !away && overUnderOptions.length === 0 && bttsOptions.length === 0) {
    return emptyOdds();
  }

  const oneXTwo = bestOf(
    [
      { pick: "1", odds: home || 2.2 },
      { pick: "X", odds: draw || 3.4 },
      { pick: "2", odds: away || 3.5 },
    ],
    { pick: "1", odds: home || 2.2 },
  );

  return {
    home: home || 2.2,
    draw: draw || 3.4,
    away: away || 3.5,
    oneXTwo,
    overUnder: bestOf(overUnderOptions, { pick: "O2.5", odds: 1.85 }),
    btts: bestOf(bttsOptions, { pick: "GG", odds: 1.8 }),
  };
}

export async function fetchEventOdds(eventId: number): Promise<EventOdds> {
  const path = `/api/v1/event/${eventId}/odds/${SPORTAPI_ODDS_PROVIDER}/all`;
  const json = await sportGet(path, 5 * 60 * 1000);
  return parseEventOdds(json);
}

export async function fetchBulkOdds(date: string): Promise<Map<number, EventOdds>> {
  const path = `/api/v1/sport/football/odds/${SPORTAPI_ODDS_PROVIDER}/${date}`;
  const json = await sportGet<unknown>(path, SHORT_TTL_MS);
  const map = new Map<number, EventOdds>();

  const visit = (node: unknown, eventId?: number, depth = 0) => {
    if (depth > 10 || node === null || node === undefined) return;
    if (Array.isArray(node)) {
      node.forEach((item) => visit(item, eventId, depth + 1));
      return;
    }
    if (!isRecord(node)) return;
    const nestedId =
      asInt(node.eventId) ??
      (isRecord(node.event) ? asInt(node.event.id) : null) ??
      eventId;
    if (Array.isArray(node.markets) || Array.isArray(node.choices)) {
      if (typeof nestedId === "number") {
        map.set(nestedId, parseEventOdds(node));
      }
    }
    for (const [key, value] of Object.entries(node)) {
      const keyId = asInt(key);
      visit(value, keyId ?? nestedId, depth + 1);
    }
  };

  visit(json);
  return map;
}

function matchStatName(name: string, aliases: string[]) {
  const normalized = name.toLowerCase();
  return aliases.some((alias) => normalized.includes(alias));
}

function pairFromItem(item: Record<string, unknown>): { home: number; away: number } | null {
  const home =
    asNumber(item.homeValue) ?? asNumber(item.home) ?? asNumber(item.homeScore);
  const away =
    asNumber(item.awayValue) ?? asNumber(item.away) ?? asNumber(item.awayScore);
  if (home === null || away === null) return null;
  return { home, away };
}

export function parseEventStatistics(payload: unknown): EventStatSnapshot | null {
  const items: Record<string, unknown>[] = [];
  const visit = (node: unknown, depth = 0) => {
    if (depth > 10 || node === null || node === undefined) return;
    if (Array.isArray(node)) {
      node.forEach((item) => visit(item, depth + 1));
      return;
    }
    if (!isRecord(node)) return;
    if ("home" in node || "homeValue" in node) items.push(node);
    for (const value of Object.values(node)) visit(value, depth + 1);
  };
  visit(payload);

  const pick = (aliases: string[]) => {
    for (const item of items) {
      const name = asString(item.name ?? item.statisticName ?? item.key);
      if (matchStatName(name, aliases)) {
        const pair = pairFromItem(item);
        if (pair) return pair;
      }
    }
    return null;
  };

  const xG = pick(["expected goals", "xgot", "xg"]);
  const shots = pick(["shots on target", "shots on goal", "on target"]);
  const corners = pick(["corner kicks", "corners"]);
  const possession = pick(["ball possession", "possession"]);

  if (!xG && !shots && !corners && !possession) return null;

  return {
    xG: xG ?? { home: 0.4, away: 0.3 },
    shotsOnTarget: shots ?? { home: 0, away: 0 },
    corners: corners ?? { home: 0, away: 0 },
    possession: possession ?? { home: 50, away: 50 },
  };
}

export async function fetchEventStatistics(
  eventId: number,
): Promise<EventStatSnapshot | null> {
  const path = `/api/v1/event/${eventId}/statistics`;
  const json = await sportGet(path, 45_000);
  return parseEventStatistics(json);
}

const PRIORITY_CATEGORY_NAMES = [
  "england",
  "spain",
  "germany",
  "italy",
  "france",
  "international",
  "europe",
  "uefa",
  "netherlands",
  "portugal",
  "brazil",
  "argentina",
  "mexico",
  "usa",
  "belgium",
  "turkey",
];

export function selectPriorityCategories(
  categories: SportCategory[],
  limit = 8,
): SportCategory[] {
  return categories
    .slice()
    .sort((a, b) => {
      const aName = `${a.slug ?? ""} ${a.name}`.toLowerCase();
      const bName = `${b.slug ?? ""} ${b.name}`.toLowerCase();
      const aRank = PRIORITY_CATEGORY_NAMES.findIndex((name) => aName.includes(name));
      const bRank = PRIORITY_CATEGORY_NAMES.findIndex((name) => bName.includes(name));
      const aScore = aRank === -1 ? 80 : aRank;
      const bScore = bRank === -1 ? 80 : bRank;
      if (aScore !== bScore) return aScore - bScore;
      return (b.eventsCount ?? 0) - (a.eventsCount ?? 0);
    })
    .slice(0, limit);
}
