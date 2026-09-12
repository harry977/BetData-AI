"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readCategoriesCache, saveCategoriesCache } from "@/lib/category-cache";
import { utcDateOffset } from "@/lib/dates";
import type { FixturesPayload } from "@/lib/types";

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
    try {
      const today = utcDateOffset(0);
      const cached = readCategoriesCache(today);
      const query =
        cached && cached.length
          ? `?categoryIds=${cached.map((category) => category.id).join(",")}`
          : "";
      const res = await fetch(`/api/fixtures${query}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("No se pudieron cargar los pronósticos.");
      }
      const json = (await res.json()) as FixturesPayload;
      if (json.categories?.length) {
        saveCategoriesCache(today, json.categories);
      }
      setData(json);
      setError(null);
    } catch (err) {
      if (!silent) {
        setError(
          err instanceof Error ? err.message : "No se pudieron cargar los pronósticos.",
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const live = (data?.response ?? []).some(
      (match) => match.status === "LIVE" || match.status === "HT",
    );
    const ms = live ? 20_000 : 45_000;
    const id = window.setInterval(() => void reload({ silent: true }), ms);
    return () => window.clearInterval(id);
  }, [data, reload]);

  return { data, error, loading, reload };
}
