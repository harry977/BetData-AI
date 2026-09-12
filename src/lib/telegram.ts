"use client";

import {
  expandViewport,
  hapticFeedbackImpactOccurred,
  hapticFeedbackNotificationOccurred,
  init,
  isTMA,
  miniAppReady,
  mountMiniAppSync,
  mountViewport,
  openLink,
  setMiniAppBackgroundColor,
  setMiniAppHeaderColor,
} from "@telegram-apps/sdk";

let bootstrapped = false;

export function bootstrapTelegram() {
  if (bootstrapped || typeof window === "undefined") return;
  bootstrapped = true;

  try {
    if (!isTMA()) {
      const webApp = window.Telegram?.WebApp;
      if (webApp) {
        webApp.ready();
        webApp.expand();
        webApp.setHeaderColor?.("#0b0e17");
        webApp.setBackgroundColor?.("#0b0e17");
      }
      return;
    }

    init();

    if (mountMiniAppSync.isAvailable()) {
      mountMiniAppSync();
    }
    if (miniAppReady.isAvailable()) {
      miniAppReady();
    }
    if (setMiniAppBackgroundColor.isAvailable()) {
      setMiniAppBackgroundColor("#0b0e17");
    }
    if (setMiniAppHeaderColor.isAvailable()) {
      setMiniAppHeaderColor("#0b0e17");
    }
    if (mountViewport.isAvailable()) {
      void mountViewport();
    }
    if (expandViewport.isAvailable()) {
      expandViewport();
    }
  } catch {
    // Preview en navegador fuera de Telegram: la Mini App sigue operativa.
  }
}

export function openExternal(url: string) {
  try {
    if (openLink.isAvailable()) {
      openLink(url, { tryBrowser: "chrome" });
      return;
    }
  } catch {
    // fallback below
  }

  const webApp = window.Telegram?.WebApp;
  if (webApp?.openLink) {
    webApp.openLink(url);
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

export function hapticTap() {
  try {
    if (hapticFeedbackImpactOccurred.isAvailable()) {
      hapticFeedbackImpactOccurred("medium");
      return;
    }
  } catch {
    // ignore
  }
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("medium");
}

export type TelegramIdentity = {
  id: number;
  label: string;
  username?: string;
  firstName?: string;
  photoUrl?: string;
  source?: "telegram" | "browser";
};

export type TelegramWidgetUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

export function identityFromTelegramUser(user: {
  id: number;
  username?: string;
  first_name?: string;
  photo_url?: string;
}): TelegramIdentity {
  const label = user.username
    ? `@${user.username}`
    : user.first_name || `Telegram ${user.id}`;
  return {
    id: user.id,
    label,
    username: user.username,
    firstName: user.first_name,
    photoUrl: user.photo_url,
    source: "telegram",
  };
}

export function readTelegramInitData() {
  if (typeof window === "undefined") return "";
  return window.Telegram?.WebApp?.initData ?? "";
}

export function readTelegramUser(): TelegramIdentity | null {
  if (typeof window === "undefined") return null;
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!user?.id) return null;
  return identityFromTelegramUser(user);
}

export function isTelegramMiniApp() {
  if (typeof window === "undefined") return false;
  try {
    if (isTMA()) return true;
  } catch {
    // preview en navegador
  }
  return Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user || window.Telegram?.WebApp?.initData);
}

export function loadTelegramLoginApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.Telegram?.Login?.auth) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector("script[data-betdata-telegram-login]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Telegram Login no cargó")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.dataset.betdataTelegramLogin = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Telegram Login no cargó"));
    document.head.appendChild(script);
  });
}

export async function loginWithTelegramPopup(botId: string) {
  await loadTelegramLoginApi();
  const auth = window.Telegram?.Login?.auth;
  if (!auth) return null;
  return new Promise<TelegramWidgetUser | null>((resolve) => {
    auth({ bot_id: botId, request_access: "write", lang: "es" }, (user) => {
      resolve(user || null);
    });
  });
}

export function hapticSuccess() {
  try {
    if (hapticFeedbackNotificationOccurred.isAvailable()) {
      hapticFeedbackNotificationOccurred("success");
      return;
    }
  } catch {
    // ignore
  }
  window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        openLink?: (url: string) => void;
        HapticFeedback?: {
          impactOccurred: (style: "light" | "medium" | "heavy") => void;
          notificationOccurred: (type: "error" | "success" | "warning") => void;
        };
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            username?: string;
            first_name?: string;
            photo_url?: string;
          };
        };
      };
      Login?: {
        auth: (
          options: { bot_id: string; request_access?: string; lang?: string },
          callback: (user: TelegramWidgetUser | false | null) => void,
        ) => void;
      };
    };
  }
}
