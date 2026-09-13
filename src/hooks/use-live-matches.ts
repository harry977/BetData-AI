"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ingestSportFeedJson } from "@/lib/feed-rows";
import { mergeLiveInsights } from "@/lib/sport-mapper";
import type { LiveMatchesPayload, MatchInsight } from "@/lib/types";

const POLL_MS = 8_000;
const CLIENT_TIMEOUT_MS = 6_000;

export function useLiveMatches(enabled = true) {
  const [matches, setMatches] = useState<MatchInsight[]>([]);
  const [data, setData] = useState<LiveMatchesPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);

  const reload = useCallback(async () => {
    if (!enabled || inFlightRef.current) return;
    inFlightRef.current = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
    try {
      const http = await fetch(`/api/matches/live?_=${Date.now()}`, {
        cache: "no-store",
        signal: controller.signal,
        headers: { "Cache-Control": "no-store" },
      });
      const res = await http.json();
      setLoading(false);
      const rawMatches =
        res?.data ||
        res?.fixtures ||
        res?.events ||
        res?.matches ||
        (Array.isArray(res) ? res : []);
      const rows = ingestSportFeedJson(
        Array.isArray(rawMatches) && rawMatches.length > 0 ? { matches: rawMatches } : res,
      );
      if (rows.length === 0) {
        console.log("[DEBUG FRONTEND DATA]:", res);
      }
      setMatches(rows);
      setData({
        source: res?.source ?? "sportapi",
        connected: res?.connected === true || rows.length > 0,
        generatedAt: res?.generatedAt ?? new Date().toISOString(),
        matches: rows,
        data: rows,
        events: rows,
        fixtures: rows,
        response: rows,
        cards: Array.isArray(res?.cards) ? res.cards : [],
        error: rows.length === 0 ? res?.error : undefined,
      });
      setError(rows.length === 0 && res?.error ? String(res.error) : null);
    } catch (err) {
      setLoading(false);
      setError(
        err instanceof Error && err.name === "AbortError"
          ? "SportAPI tardó demasiado. Reintenta."
          : err instanceof Error
            ? err.message
            : "No se pudieron cargar los partidos en directo.",
      );
    } finally {
      window.clearTimeout(timer);
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void reload();
    const id = window.setInterval(() => void reload(), POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, reload]);

  return { data, error, loading, reload, matches };
}

export function withLiveScores(base: MatchInsight[], live: MatchInsight[]) {
  return mergeLiveInsights(base, live);
}
