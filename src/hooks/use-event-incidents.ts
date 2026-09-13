"use client";

import { useEffect, useState } from "react";
import { isDemoEventId } from "@/lib/ids";
import type { MatchIncident } from "@/lib/types";

const memory = new Map<number, MatchIncident[]>();

export function useEventIncidents(eventId: number, live: boolean) {
  const [incidents, setIncidents] = useState<MatchIncident[]>(
    () => memory.get(eventId) ?? [],
  );
  const [loading, setLoading] = useState(
    () => live && !isDemoEventId(eventId) && !memory.has(eventId),
  );

  useEffect(() => {
    if (!live || isDemoEventId(eventId)) {
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
