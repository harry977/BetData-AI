"use client";

import { useCallback, useEffect, useState } from "react";
import { readCategoriesCache, saveCategoriesCache } from "@/lib/category-cache";
import { utcDateOffset } from "@/lib/dates";
import type { FixturesPayload } from "@/lib/types";

export function useFixtures() {
  const [data, setData] = useState<FixturesPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
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
