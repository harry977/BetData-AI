import fs from "node:fs";
import path from "node:path";

let hydrated = false;

function parseEnvLine(line: string): [string, string] | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const index = trimmed.indexOf("=");
  if (index <= 0) return null;
  let value = trimmed.slice(index + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return [trimmed.slice(0, index).trim(), value];
}

export function hydrateLocalEnv() {
  if (hydrated) return;
  hydrated = true;
  try {
    const file = path.join(process.cwd(), ".env.local");
    if (!fs.existsSync(file)) return;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const parsed = parseEnvLine(line);
      if (!parsed) continue;
      const [key, value] = parsed;
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* ignore missing env file */
  }
}

export type SportApiEnv = {
  configured: boolean;
  key: string;
  host: string;
  base: string;
  timezoneOffset: number;
};

const DEFAULT_HOST = "sportapi7.p.rapidapi.com";

function readHost() {
  return (
    process.env.RAPIDAPI_HOST?.trim() ||
    process.env.RAPIDAPI_SPORT_HOST?.trim() ||
    DEFAULT_HOST
  );
}

function readBase(host: string) {
  return (
    process.env.RAPIDAPI_SPORT_BASE?.trim().replace(/\/$/, "") ||
    `https://${host}`
  );
}

export function getSportApiEnv(): SportApiEnv {
  hydrateLocalEnv();
  const key = process.env.RAPIDAPI_KEY?.trim() ?? "";
  const host = readHost();
  const fromEnv = Number(process.env.SPORTAPI_TZ_OFFSET);
  return {
    configured: Boolean(key) && key !== "TU_API_KEY_AQUI",
    key,
    host,
    base: readBase(host),
    timezoneOffset: Number.isFinite(fromEnv) ? fromEnv : 0,
  };
}

export function assertSportApiEnv(): SportApiEnv {
  const env = getSportApiEnv();
  if (!env.configured) {
    throw new Error("Falta RAPIDAPI_KEY. Añádela en .env.local.");
  }
  return env;
}
