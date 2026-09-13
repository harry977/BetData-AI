"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { extractMatchRows } from "@/lib/sport-mapper";
import type { FixturesPayload, MatchInsight } from "@/lib/types";

const POLL_MS = 20_000;
const CLIENT_TIMEOUT_MS = 6_000;

export function useFixtures() {
  const [matches, setMatches] = useState<MatchInsight[]>([]);
  const [data, setData] = useState<FixturesPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const matchesRef = useRef(matches);
  matchesRef.current = matches;
  const inFlightRef = useRef(false);

  const reload = useCallback(async (opts?: { silent?: boolean }) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const silent = Boolean(opts?.silent && matchesRef.current.length > 0);
    if (!silent) setLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
    try {
      const res = await fetch(`/api/fixtures?_=${Date.now()}`, {
        cache: "no-store",
        signal: controller.signal,
        headers: { "Cache-Control": "no-store" },
      });
      if (!res.ok) {
        throw new Error("No se pudieron cargar los pronósticos.");
      }
      const json = (await res.json()) as FixturesPayload;
      const rows = extractMatchRows(json);
      setMatches(rows);
      setData({
        ...json,
        response: rows,
        connected: json.connected === true || rows.length > 0,
      });
      setError(rows.length === 0 && json.error ? json.error : null);
    } catch (err) {
      setError(
        err instanceof Error && err.name === "AbortError"
          ? "SportAPI tardó demasiado. Reintenta."
          : err instanceof Error
            ? err.message
            : "No se pudieron cargar los pronósticos.",
      );
    } finally {
      window.clearTimeout(timer);
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    const id = window.setInterval(() => void reload({ silent: true }), POLL_MS);
    return () => window.clearInterval(id);
  }, [reload]);

  return { data, error, loading, reload, matches };
}
