"use client";

import { useCallback, useEffect, useState } from "react";
import type { FixturesPayload } from "@/lib/types";

export function useFixtures() {
  const [data, setData] = useState<FixturesPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fixtures", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("No se pudieron cargar los pronósticos.");
      }
      const json = (await res.json()) as FixturesPayload;
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los pronósticos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload };
}
