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
      };
    };
  }
}
