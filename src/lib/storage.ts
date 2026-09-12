import { STORAGE_KEYS } from "@/lib/constants";

export function readUnlockState() {
  if (typeof window === "undefined") {
    return { unlocked: false, partnerId: "", registered: false };
  }

  return {
    unlocked: window.localStorage.getItem(STORAGE_KEYS.unlocked) === "1",
    partnerId: window.localStorage.getItem(STORAGE_KEYS.partnerId) ?? "",
    registered: window.localStorage.getItem(STORAGE_KEYS.registered) === "1",
  };
}

export function persistUnlock(partnerId: string) {
  window.localStorage.setItem(STORAGE_KEYS.unlocked, "1");
  window.localStorage.setItem(STORAGE_KEYS.partnerId, partnerId);
  window.localStorage.setItem(STORAGE_KEYS.registered, "1");
}

export function persistRegistered() {
  window.localStorage.setItem(STORAGE_KEYS.registered, "1");
}

export function clearUnlock() {
  window.localStorage.removeItem(STORAGE_KEYS.unlocked);
  window.localStorage.removeItem(STORAGE_KEYS.partnerId);
}
