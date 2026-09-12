import { getFixturesFeed as getSportFixturesFeed } from "@/lib/sport-feed";
import type { FixturesPayload } from "@/lib/types";

/** @deprecated Prefer `@/lib/sport-feed`. Kept so older imports keep working. */
export async function getFixturesFeed(): Promise<FixturesPayload> {
  return getSportFixturesFeed();
}
