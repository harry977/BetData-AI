export const BRAND = {
  name: "BetData IA",
  version: "v2.4",
  tagline: "La IA que ve el fútbol",
} as const;

export const PLATFORM_STATS = {
  matchesAnalyzedToday: 600,
  bankerHitRate: 72.4,
  leaguesMonitored: 700,
} as const;

export const STORAGE_KEYS = {
  mission: "betdata_ai_daily_mission",
  userStreak: "betdata_ai_user_streak",
  viewedSignals: "betdata_ai_viewed_signals",
  unlocked: "isUnlocked",
  accountId: "betdata_ai_account_id",
  browserSession: "betdata_ai_browser_session",
  legacyUnlocked: "betdata_ai_unlocked",
  legacyAccountId: "betdata_ai_partner_id",
} as const;

export const OFFICIAL_SERVER_URL =
  process.env.NEXT_PUBLIC_OFFICIAL_SERVER_URL ??
  process.env.NEXT_PUBLIC_PARTNER_AFFILIATE_URL ??
  "https://www.88gallo.com";

export const BONUS_URL =
  process.env.NEXT_PUBLIC_BONUS_URL ?? "https://www.88gallo.com";

export const WELCOME_BONUS = {
  amount: "500€",
  headline: "Bono de bienvenida de hasta 500€",
  detail:
    "Actívalo con tu primer depósito y úsalo en los mercados de la Liga BBVA.",
} as const;

export const SIGNAL_CTA = {
  hint: "🎁 Promoción de bienvenida disponible para nuevos usuarios (Hasta 500€)",
  label: "VER SEÑAL Y COMPROBAR CUOTAS",
} as const;

export const RAPIDAPI_FOOTBALL = {
  host: "api-football-v1.p.rapidapi.com",
  liveFixtures: "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
} as const;

export const RAPIDAPI_SPORT = {
  host: "sportapi7.p.rapidapi.com",
  base: "https://sportapi7.p.rapidapi.com",
} as const;

export const TELEGRAM_BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "") ?? "";

export const TELEGRAM_BOT_ID = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID ?? "";

export const TELEGRAM_MINI_APP =
  process.env.NEXT_PUBLIC_TELEGRAM_MINI_APP ?? "";

export const TELEGRAM_OPEN_URL = TELEGRAM_BOT_USERNAME
  ? TELEGRAM_MINI_APP
    ? `https://t.me/${TELEGRAM_BOT_USERNAME}/${TELEGRAM_MINI_APP}`
    : `https://t.me/${TELEGRAM_BOT_USERNAME}`
  : "https://t.me";

export const ACTIVATION_STATUS = [
  "Abriendo el vestuario…",
  "La IA está calentando…",
  "¡Estás dentro!",
] as const;

export const ACTIVATION_STEP_MS = 1000;
