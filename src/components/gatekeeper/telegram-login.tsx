"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TELEGRAM_BOT_USERNAME,
  TELEGRAM_OPEN_URL,
} from "@/lib/constants";
import {
  hapticTap,
  identityFromTelegramUser,
  openExternal,
  readTelegramInitData,
  readTelegramUser,
  type TelegramIdentity,
} from "@/lib/telegram";
import { cn } from "@/lib/utils";

type TelegramWidgetUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

type TelegramLoginProps = {
  onSuccess: (identity: TelegramIdentity) => void;
  busy?: boolean;
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
  className,
}: TelegramLoginProps) {
  const widgetHost = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<TelegramIdentity | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    const sync = () => setSession(readTelegramUser());
    sync();
    const tick = window.setInterval(sync, 300);
    const stop = window.setTimeout(() => window.clearInterval(tick), 5000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(stop);
    };
  }, []);

  useEffect(() => {
    window.onBetDataTelegramAuth = (user) => {
      void finishWidget(user);
    };
    return () => {
      delete window.onBetDataTelegramAuth;
    };
    // The widget callback always reads the latest onSuccess via ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (session || !TELEGRAM_BOT_USERNAME || !widgetHost.current) return;
    if (widgetHost.current.querySelector("script, iframe")) return;
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", TELEGRAM_BOT_USERNAME);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "onBetDataTelegramAuth(user)");
    widgetHost.current.appendChild(script);
  }, [session]);

  async function finishWidget(user: TelegramWidgetUser) {
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

  async function enterWithMiniApp() {
    const user = readTelegramUser();
    if (!user) {
      setError("Abre BetData IA desde Telegram para entrar con un toque.");
      return;
    }
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

  const wait = busy || checking;
  const showWidget = !session && Boolean(TELEGRAM_BOT_USERNAME);

  return (
    <div className={cn("space-y-3", className)}>
      {session || !showWidget ? (
        <Button
          type="button"
          size="lg"
          variant="telegram"
          className="h-12 w-full rounded-full text-[15px] font-black"
          disabled={wait}
          onClick={() => {
            const live = readTelegramUser();
            if (live) {
              void enterWithMiniApp();
              return;
            }
            if (TELEGRAM_BOT_USERNAME) {
              openExternal(TELEGRAM_OPEN_URL);
              return;
            }
            setError("Abre BetData IA desde Telegram para entrar con un toque.");
          }}
        >
          {wait ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <TelegramGlyph />
          )}
          {session
            ? `Entra con Telegram · ${session.label}`
            : "Entra con Telegram"}
        </Button>
      ) : (
        <div className="relative h-12 overflow-hidden rounded-full bg-[#2AABEE]">
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center gap-2 text-[15px] font-black text-white">
            <TelegramGlyph />
            Entra con Telegram
          </div>
          <div
            ref={widgetHost}
            className="absolute inset-0 z-10 flex items-center justify-center opacity-0 [&>iframe]:!h-12 [&>iframe]:!min-w-full [&>iframe]:scale-x-150"
          />
        </div>
      )}

      {!session ? (
        <p className="text-center text-[12px] leading-snug text-slate-400">
          Un toque. Telegram confirma tu cuenta y entras. Sin contraseñas ni
          formularios.
          {TELEGRAM_BOT_USERNAME ? (
            <>
              {" "}
              Si no ves el botón,{" "}
              <button
                type="button"
                className="font-semibold text-[#7dd3fc] underline-offset-2 hover:underline"
                onClick={() => openExternal(TELEGRAM_OPEN_URL)}
              >
                ábrela en Telegram
              </button>
              .
            </>
          ) : (
            <> Ábrela desde Telegram para entrar al instante.</>
          )}
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
