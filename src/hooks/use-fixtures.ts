"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readCategoriesCache, saveCategoriesCache } from "@/lib/category-cache";
import { utcDateOffset } from "@/lib/dates";
import type { FixturesPayload } from "@/lib/types";
import { isInPlayStatus } from "@/lib/utils";

const LIVE_POLL_MS = 20_000;
const FETCH_TIMEOUT_MS = 12_000;

export function useFixtures() {
  const [data, setData] = useState<FixturesPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef(data);
  dataRef.current = data;

  const reload = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent && dataRef.current);
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const today = utcDateOffset(0);
      const cached = readCategoriesCache(today);
      const params = new URLSearchParams();
      params.set("_", String(Date.now()));
      if (cached?.length) {
        params.set(
          "categoryIds",
          cached
            .slice(0, 24)
            .map((category) => category.id)
            .join(","),
        );
      }
      const res = await fetch(`/api/fixtures?${params.toString()}`, {
        cache: "no-store",
        signal: controller.signal,
        headers: { "Cache-Control": "no-store" },
      });
      if (!res.ok) {
        throw new Error("No se pudieron cargar los pronósticos.");
      }
      const json = (await res.json()) as FixturesPayload;
      const response = Array.isArray(json.response) ? json.response.slice() : [];
      if (json.categories?.length) {
        saveCategoriesCache(today, json.categories);
      }
      const next: FixturesPayload = {
        ...json,
        response,
        connected: json.connected === true || response.length > 0,
      };
      setData(next);
      if (response.length === 0 && json.error) {
        setError(json.error);
      } else {
        setError(null);
      }
    } catch (err) {
      if (!silent) {
        setError(
          err instanceof Error && err.name !== "AbortError"
            ? err.message
            : err instanceof Error && err.name === "AbortError"
              ? "SportAPI tardó demasiado. Reintenta."
              : "No se pudieron cargar los pronósticos.",
        );
      }
    } finally {
      window.clearTimeout(timer);
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const hasLive = (data?.response ?? []).some((match) => isInPlayStatus(match.status));

  useEffect(() => {
    if (!hasLive) return;
    const id = window.setInterval(() => void reload({ silent: true }), LIVE_POLL_MS);
    return () => window.clearInterval(id);
  }, [hasLive, reload]);

  return { data, error, loading, reload, hasLive };
}
