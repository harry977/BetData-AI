export const BRAND = {
  name: "BetData AI",
  version: "v2.4",
  tagline: "Engine de Análisis Deportivo e Inteligencia de Datos",
} as const;

export const STORAGE_KEYS = {
  unlocked: "betdata_ai_unlocked",
  partnerId: "betdata_ai_partner_id",
  registered: "betdata_ai_registered",
} as const;

export const PARTNER_AFFILIATE_URL =
  process.env.NEXT_PUBLIC_PARTNER_AFFILIATE_URL ??
  "https://www.bet365.com/#/HO/";

export const RAPIDAPI_FOOTBALL = {
  host: "api-football-v1.p.rapidapi.com",
  liveFixtures: "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
} as const;

export const VERIFY_DELAY_MS = 2000;
