"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TELEGRAM_BOT_ID, TELEGRAM_BOT_USERNAME, TELEGRAM_OPEN_URL } from "@/lib/constants";
import { readOrCreateBrowserIdentity } from "@/lib/storage";
import {
  hapticTap,
  identityFromTelegramUser,
  isTelegramMiniApp,
  loginWithTelegramPopup,
  openExternal,
  readTelegramInitData,
  readTelegramUser,
  type TelegramIdentity,
  type TelegramWidgetUser,
} from "@/lib/telegram";
import { cn } from "@/lib/utils";

type TelegramLoginProps = {
  onSuccess: (identity: TelegramIdentity) => void;
  busy?: boolean;
  hint?: boolean;
  showBrowserButton?: boolean;
  className?: string;
};

declare global {
  interface Window {
    onBetDataTelegramAuth?: (user: TelegramWidgetUser) => void;
  }
}

export function TelegramLogin({
  onSuccess,
  busy = false,
  hint = true,
  showBrowserButton = true,
  className,
}: TelegramLoginProps) {
  const [session, setSession] = useState<TelegramIdentity | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    const sync = () => setSession(readTelegramUser());
    sync();
    const tick = window.setInterval(sync, 300);
    const stop = window.setTimeout(() => window.clearInterval(tick), 8000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(stop);
    };
  }, []);

  useEffect(() => {
    window.onBetDataTelegramAuth = (user) => {
      void finishTelegramUser(user);
    };
    return () => {
      delete window.onBetDataTelegramAuth;
    };
  }, []);

  async function finishTelegramUser(user: TelegramWidgetUser) {
    setError("");
    setChecking(true);
    hapticTap();
    try {
      const response = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "widget", user }),
      });
      const payload = (await response.json()) as {
        identity?: { id: number; label: string };
        error?: string;
      };
      if (!response.ok || !payload.identity) {
        throw new Error(payload.error || "Telegram no confirmó la cuenta.");
      }
      onSuccessRef.current(identityFromTelegramUser(user));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No hemos podido entrar con Telegram.",
      );
    } finally {
      setChecking(false);
    }
  }

  async function enterWithMiniApp(user: TelegramIdentity) {
    setError("");
    setChecking(true);
    hapticTap();
    try {
      const initData = readTelegramInitData();
      if (initData) {
        const response = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "webapp",
            initData,
            user: {
              id: user.id,
              first_name: user.firstName ?? user.label,
              username: user.username,
              photo_url: user.photoUrl,
            },
          }),
        });
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error || "Telegram no confirmó la cuenta.");
        }
      }
      onSuccess(user);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No hemos podido entrar con Telegram.",
      );
    } finally {
      setChecking(false);
    }
  }

  function enterFromBrowser() {
    hapticTap();
    onSuccess(readOrCreateBrowserIdentity());
  }

  async function enter() {
    const live = readTelegramUser();
    if (live) {
      await enterWithMiniApp(live);
      return;
    }

    if (TELEGRAM_BOT_ID) {
      setChecking(true);
      setError("");
      try {
        const user = await loginWithTelegramPopup(TELEGRAM_BOT_ID);
        if (user) {
          await finishTelegramUser(user);
          return;
        }
        setChecking(false);
        return;
      } catch {
        setChecking(false);
      }
    }

    enterFromBrowser();
  }

  const wait = busy || checking;
  const inTelegram = Boolean(session) || isTelegramMiniApp();

  return (
    <div className={cn("space-y-3", className)}>
      <Button
        type="button"
        size="lg"
        variant="telegram"
        className="h-12 w-full rounded-full text-[15px] font-black"
        disabled={wait}
        onClick={() => void enter()}
      >
        {wait ? <Loader2 className="h-4 w-4 animate-spin" /> : <TelegramGlyph />}
        {session ? `Entra con Telegram · ${session.label}` : "Entra con Telegram"}
      </Button>

      {!inTelegram && showBrowserButton ? (
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-12 w-full rounded-full text-[14px] font-black"
          disabled={wait}
          onClick={enterFromBrowser}
        >
          Entrar desde el navegador
        </Button>
      ) : null}

      {hint ? (
        <p className="text-center text-[12px] leading-snug text-slate-400">
          {inTelegram
            ? "Un toque y entras con tu cuenta de Telegram. Sin contraseña."
            : "En Telegram entra con tu cuenta. En el navegador, el mismo acceso te deja pasar."}
          {TELEGRAM_BOT_USERNAME ? (
            <>
              {" "}
              También puedes{" "}
              <button
                type="button"
                className="font-semibold text-[#7dd3fc] underline-offset-2 hover:underline"
                onClick={() => openExternal(TELEGRAM_OPEN_URL)}
              >
                abrir la Mini App
              </button>
              .
            </>
          ) : null}
        </p>
      ) : null}

      {error ? (
        <p className="text-center text-[12px] text-rose-300">{error}</p>
      ) : null}
    </div>
  );
}

function TelegramGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.5 3.4 2.9 10.6c-1.3.5-1.3 1.2-.2 1.5l4.7 1.5 1.8 5.5c.2.6.1.8.8.8.4 0 .6-.2.8-.4l2.6-2.5 5.4 4c1 .5 1.7.2 2-.9l3.6-16.9c.4-1.5-.5-2.2-1.7-1.8Z"
      />
    </svg>
  );
}
