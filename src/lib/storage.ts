import { STORAGE_KEYS } from "@/lib/constants";
import { shiftYmd } from "@/lib/dates";

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

type MissionState = { date: string; ids: number[] };

export function readDailyMission(date: string): MissionState {
  if (typeof window === "undefined") return { date, ids: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.mission);
    if (!raw) return { date, ids: [] };
    const parsed = JSON.parse(raw) as MissionState;
    if (parsed.date !== date || !Array.isArray(parsed.ids)) return { date, ids: [] };
    return parsed;
  } catch {
    return { date, ids: [] };
  }
}

export function recordMissionSignal(date: string, id: number) {
  if (typeof window === "undefined") return;
  const current = readDailyMission(date);
  const ids = current.ids.includes(id) ? current.ids : [...current.ids, id].slice(0, 3);
  window.localStorage.setItem(
    STORAGE_KEYS.mission,
    JSON.stringify({ date, ids }),
  );
  if (ids.length >= 3) bumpUserStreak(date);
}

type UserStreak = { count: number; lastDate: string };

export function readUserStreak(): UserStreak {
  if (typeof window === "undefined") return { count: 0, lastDate: "" };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.userStreak);
    if (!raw) return { count: 0, lastDate: "" };
    const parsed = JSON.parse(raw) as UserStreak;
    if (typeof parsed.count !== "number") return { count: 0, lastDate: "" };
    return parsed;
  } catch {
    return { count: 0, lastDate: "" };
  }
}

function bumpUserStreak(date: string) {
  const current = readUserStreak();
  if (current.lastDate === date) return;
  const yesterday = shiftYmd(date, -1);
  const count = current.lastDate === yesterday ? current.count + 1 : 1;
  window.localStorage.setItem(
    STORAGE_KEYS.userStreak,
    JSON.stringify({ count, lastDate: date }),
  );
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
