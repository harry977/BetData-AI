import type { SportCategory } from "@/lib/types";

export const CATEGORIES_CACHE_KEY = "categories_cache";
export const CATEGORIES_CACHE_TTL_MS = 30 * 60 * 1000;

type CategoriesCacheEntry = {
  date: string;
  savedAt: number;
  categories: SportCategory[];
};

function isEntry(value: unknown): value is CategoriesCacheEntry {
  if (!value || typeof value !== "object") return false;
  const row = value as CategoriesCacheEntry;
  return (
    typeof row.date === "string" &&
    typeof row.savedAt === "number" &&
    Array.isArray(row.categories)
  );
}

export function readCategoriesCache(date: string): SportCategory[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CATEGORIES_CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isEntry(parsed)) return null;
    if (parsed.date !== date) return null;
    if (Date.now() - parsed.savedAt > CATEGORIES_CACHE_TTL_MS) return null;
    return parsed.categories.filter((item) => typeof item?.id === "number");
  } catch {
    return null;
  }
}

export function saveCategoriesCache(date: string, categories: SportCategory[]) {
  if (typeof window === "undefined") return;
  const entry: CategoriesCacheEntry = {
    date,
    savedAt: Date.now(),
    categories,
  };
  window.localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(entry));
}
