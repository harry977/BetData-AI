export const BRAND = {
  name: "BetData AI",
  version: "v2.4",
  tagline: "Inteligencia Predictiva con IA",
} as const;

export const PLATFORM_STATS = {
  matchesAnalyzedToday: 600,
  bankerHitRate: 72.4,
  leaguesMonitored: 700,
} as const;

export const STORAGE_KEYS = {
  unlocked: "isUnlocked",
  accountId: "betdata_ai_account_id",
  legacyUnlocked: "betdata_ai_unlocked",
  legacyAccountId: "betdata_ai_partner_id",
} as const;

export const OFFICIAL_SERVER_URL =
  process.env.NEXT_PUBLIC_OFFICIAL_SERVER_URL ??
  process.env.NEXT_PUBLIC_PARTNER_AFFILIATE_URL ??
  "https://www.bet365.com/#/HO/";

export const RAPIDAPI_FOOTBALL = {
  host: "api-football-v1.p.rapidapi.com",
  liveFixtures: "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
} as const;

export const ACTIVATION_STATUS = [
  "Conectando con servidores de BetData AI...",
  "Verificando sincronización de cuotas...",
  "¡Acceso Concedido! Redirigiendo al Dashboard...",
] as const;

export const ACTIVATION_STEP_MS = 1000;
