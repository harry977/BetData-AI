"use client";

import { useEffect, useState } from "react";
import type { MatchIncident } from "@/lib/types";

const memory = new Map<number, MatchIncident[]>();
const DEMO_EVENT_FROM = 910000;

export function useEventIncidents(eventId: number, live: boolean) {
  const [incidents, setIncidents] = useState<MatchIncident[]>(
    () => memory.get(eventId) ?? [],
  );
  const [loading, setLoading] = useState(
    () => live && eventId < DEMO_EVENT_FROM && !memory.has(eventId),
  );

  useEffect(() => {
    if (!live || eventId >= DEMO_EVENT_FROM) {
      setIncidents(memory.get(eventId) ?? []);
      setLoading(false);
      return;
    }

    const cached = memory.get(eventId);
    if (cached) {
      setIncidents(cached);
      setLoading(false);
    } else {
      setLoading(true);
      setIncidents([]);
    }

    let cancelled = false;
    fetch(`/api/event/${eventId}/incidents`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { incidents?: MatchIncident[] } | null) => {
        if (cancelled) return;
        const rows = json?.incidents ?? [];
        memory.set(eventId, rows);
        setIncidents(rows);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, live]);

  return { incidents, loading };
}
