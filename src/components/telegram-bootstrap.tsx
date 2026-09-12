"use client";

import { useEffect } from "react";
import { bootstrapTelegram } from "@/lib/telegram";

export function TelegramBootstrap() {
  useEffect(() => {
    bootstrapTelegram();
  }, []);

  return null;
}
