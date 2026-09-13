import { RAPIDAPI_FOOTBALL } from "@/lib/constants";
import { asArray, asInt, asNumber, asString, isRecord } from "@/lib/json";
import https from "node:https";
import { hasSportApiKey, type SportEvent } from "@/lib/sportapi";

function footballGet(pathAndQuery: string): Promise<{ status: number; text: string }> {
  const key = process.env["RAPIDAPI_KEY"];
  if (!key) {
    throw new Error("Missing RAPIDAPI_KEY");
  }
  const url = `https://${RAPIDAPI_FOOTBALL.host}${pathAndQuery}`;
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "X-RapidAPI-Key": key,
          "X-RapidAPI-Host": RAPIDAPI_FOOTBALL.host,
        },
        timeout: 15000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk as Buffer));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            text: Buffer.concat(chunks).toString("utf8"),
          }),
        );
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`API-Football timeout ${url}`));
    });
  });
}

function statusTypeFromShort(short: string): string {
  const code = short.toUpperCase();
  if (code === "HT") return "halftime";
  if (["1H", "2H", "ET", "BT", "P", "LIVE", "INT"].includes(code)) return "inprogress";
  if (["FT", "AET", "PEN", "AWD", "WO"].includes(code)) return "finished";
  return "notstarted";
}

function parseFixture(value: unknown): SportEvent | null {
  if (!isRecord(value)) return null;
  const fixture = isRecord(value.fixture) ? value.fixture : {};
  const status = isRecord(fixture.status) ? fixture.status : {};
  const league = isRecord(value.league) ? value.league : {};
  const teams = isRecord(value.teams) ? value.teams : {};
  const home = isRecord(teams.home) ? teams.home : {};
  const away = isRecord(teams.away) ? teams.away : {};
  const goals = isRecord(value.goals) ? value.goals : {};
  const id = asInt(fixture.id);
  const homeId = asInt(home.id);
  const awayId = asInt(away.id);
  if (id === null || homeId === null || awayId === null) return null;
  const homeName = asString(home.name, "Local");
  const awayName = asString(away.name, "Visitante");
  const short = asString(status.short, "NS");
  const timestamp =
    asInt(fixture.timestamp) ??
    Math.floor(new Date(asString(fixture.date, new Date().toISOString())).getTime() / 1000);

  return {
    id,
    startTimestamp: timestamp,
    home: {
      id: homeId,
      name: homeName,
      shortName: homeName,
      nameCode: homeName.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "LOC",
      logo: asString(home.logo) || undefined,
    },
    away: {
      id: awayId,
      name: awayName,
      shortName: awayName,
      nameCode: awayName.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "VIS",
      logo: asString(away.logo) || undefined,
    },
    homeScore: asNumber(goals.home),
    awayScore: asNumber(goals.away),
    statusType: statusTypeFromShort(short),
    statusDescription: asString(status.long, short),
    elapsed: asInt(status.elapsed),
    leagueId: asInt(league.id) ?? 0,
    leagueName: asString(league.name, "Fútbol"),
    country: asString(league.country, "International"),
    leagueLogo: asString(league.logo) || undefined,
  };
}

async function fetchFootball(pathAndQuery: string): Promise<SportEvent[]> {
  if (!hasSportApiKey()) return [];
  try {
    const { status, text } = await footballGet(pathAndQuery);
    if (status < 200 || status >= 300) return [];
    const json: unknown = JSON.parse(text);
    const root = isRecord(json) ? json : {};
    if (root.errors && Object.keys(root.errors as object).length > 0) return [];
    return asArray(root.response).map(parseFixture).filter((row): row is SportEvent => Boolean(row));
  } catch {
    return [];
  }
}

export async function fetchFootballFixturesByDate(date: string): Promise<SportEvent[]> {
  return fetchFootball(
    `/v3/fixtures?date=${encodeURIComponent(date)}&timezone=${encodeURIComponent("Europe/Madrid")}`,
  );
}

export async function fetchFootballLiveFixtures(): Promise<SportEvent[]> {
  return fetchFootball("/v3/fixtures?live=all&timezone=" + encodeURIComponent("Europe/Madrid"));
}
