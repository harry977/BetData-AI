import { STORAGE_KEYS } from "@/lib/constants";

function isTruthyFlag(value: string | null) {
  return value === "true" || value === "1";
}

export function readUnlockState() {
  if (typeof window === "undefined") {
    return { unlocked: false, accountId: "" };
  }

  const unlocked = isTruthyFlag(
    window.localStorage.getItem(STORAGE_KEYS.unlocked) ??
      window.localStorage.getItem(STORAGE_KEYS.legacyUnlocked),
  );

  const accountId =
    window.localStorage.getItem(STORAGE_KEYS.accountId) ??
    window.localStorage.getItem(STORAGE_KEYS.legacyAccountId) ??
    "";

  return { unlocked, accountId };
}

export function readViewedSignals(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.viewedSignals);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === "number");
  } catch {
    return [];
  }
}

export function recordViewedSignal(id: number) {
  if (typeof window === "undefined") return;
  const next = [id, ...readViewedSignals().filter((item) => item !== id)].slice(0, 24);
  window.localStorage.setItem(STORAGE_KEYS.viewedSignals, JSON.stringify(next));
}

export function persistUnlock(accountId: string) {
  window.localStorage.setItem(STORAGE_KEYS.unlocked, "true");
  window.localStorage.setItem(STORAGE_KEYS.accountId, accountId);
  window.localStorage.removeItem(STORAGE_KEYS.legacyUnlocked);
  window.localStorage.removeItem(STORAGE_KEYS.legacyAccountId);
}

export function clearUnlock() {
  window.localStorage.removeItem(STORAGE_KEYS.unlocked);
  window.localStorage.removeItem(STORAGE_KEYS.accountId);
  window.localStorage.removeItem(STORAGE_KEYS.legacyUnlocked);
  window.localStorage.removeItem(STORAGE_KEYS.legacyAccountId);
}
