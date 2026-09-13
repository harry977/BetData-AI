import { NextResponse } from "next/server";
import { getFixturesFeed } from "@/lib/sport-feed";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawIds = url.searchParams.get("categoryIds") ?? "";
    const cachedCategoryIds = rawIds
      .split(",")
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);
    const payload = await getFixturesFeed(
      cachedCategoryIds.length ? cachedCategoryIds : undefined,
    );
    return NextResponse.json(payload, { headers: NO_STORE });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SportAPI fixtures failed";
    console.error("[sportapi] /api/fixtures", message);
    return NextResponse.json(
      {
        source: "sportapi",
        connected: false,
        generatedAt: new Date().toISOString(),
        stats: { matchesAnalyzedToday: 0, bankerHitRate: 0, leaguesMonitored: 0 },
        response: [],
        error: message.includes("401")
          ? "SportAPI rechazó la clave (401)."
          : message.includes("429")
            ? "SportAPI limitó las peticiones (429). Reintenta en unos segundos."
            : "No se pudieron cargar los pronósticos.",
      },
      { status: 200, headers: NO_STORE },
    );
  }
}
