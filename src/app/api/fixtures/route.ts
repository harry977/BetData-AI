import { NextResponse } from "next/server";
import { getFixturesFeed } from "@/lib/sport-feed";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  console.log("[API FIXTURES] Inicio fetch", new Date().toISOString());
  try {
    const payload = await getFixturesFeed();
    console.log(
      "[API FIXTURES] Fin fetch",
      new Date().toISOString(),
      "matches",
      payload.response.length,
      "connected",
      payload.connected,
    );
    return NextResponse.json(payload, { headers: NO_STORE });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SportAPI fixtures failed";
    console.error("[API FIXTURES] Fin fetch (error)", new Date().toISOString(), message);
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
