"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mergeLiveInsights } from "@/lib/sport-mapper";
import type { LiveMatchesPayload, MatchInsight } from "@/lib/types";

const LIVE_POLL_MS = 8_000;
const FETCH_TIMEOUT_MS = 10_000;

export function useLiveMatches(enabled = true) {
  const [data, setData] = useState<LiveMatchesPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);
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
      const res = await fetch(`/api/matches/live?_=${Date.now()}`, {
        cache: "no-store",
        signal: controller.signal,
        headers: { "Cache-Control": "no-store" },
      });
      if (!res.ok) {
        throw new Error("No se pudieron cargar los partidos en directo.");
      }
      const json = (await res.json()) as LiveMatchesPayload;
      const matches = Array.isArray(json.matches) ? json.matches.slice() : [];
      setData({
        ...json,
        matches,
        connected: json.connected === true || matches.length > 0,
      });
      setError(matches.length === 0 && json.error ? json.error : null);
    } catch (err) {
      if (!silent) {
        setError(
          err instanceof Error && err.name === "AbortError"
            ? "SportAPI tardó demasiado. Reintenta."
            : err instanceof Error
              ? err.message
              : "No se pudieron cargar los partidos en directo.",
        );
      }
    } finally {
      window.clearTimeout(timer);
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void reload();
    const id = window.setInterval(() => void reload({ silent: true }), LIVE_POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, reload]);

  return { data, error, loading, reload, matches: data?.matches ?? [] };
}

export function withLiveScores(base: MatchInsight[], live: MatchInsight[]) {
  return mergeLiveInsights(base, live);
}
