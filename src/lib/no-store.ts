/** Cabeceras para que Cloudflare no cachee el JSON de partidos. */
export const FEED_CACHE_CONTROL =
  "no-store, no-cache, must-revalidate, proxy-revalidate";

export const FEED_NO_STORE_HEADERS = {
  "Cache-Control": FEED_CACHE_CONTROL,
  "CDN-Cache-Control": "no-store",
  "Cloudflare-CDN-Cache-Control": "no-store",
  Pragma: "no-cache",
  Expires: "0",
} as const;
