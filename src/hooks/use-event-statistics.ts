"use client";

import { useEffect, useState } from "react";
import type { LiveMetrics } from "@/lib/types";

const memory = new Map<number, LiveMetrics>();

export function useEventStatistics(eventId: number) {
  const [metrics, setMetrics] = useState<LiveMetrics | null>(
    () => memory.get(eventId) ?? null,
  );
  const [loading, setLoading] = useState(!memory.has(eventId));

  useEffect(() => {
    const cached = memory.get(eventId);
    if (cached) {
      setMetrics(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setMetrics(null);

    fetch(`/api/event/${eventId}/statistics`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { metrics?: LiveMetrics | null } | null) => {
        if (cancelled) return;
        if (json?.metrics) {
          memory.set(eventId, json.metrics);
          setMetrics(json.metrics);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return { metrics, loading };
}
