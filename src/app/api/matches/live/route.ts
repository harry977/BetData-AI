import { getLiveMatchesFeed } from "@/lib/sport-feed";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  try {
    const payload = await getLiveMatchesFeed();
    return NextResponse.json(payload, { headers: NO_STORE });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SportAPI live failed";
    console.error("[sportapi] /api/matches/live", message);
    return NextResponse.json(
      {
        source: "sportapi",
        connected: false,
        generatedAt: new Date().toISOString(),
        matches: [],
        cards: [],
        error: message.includes("401")
          ? "SportAPI rechazó la clave (401)."
          : message.includes("429")
            ? "SportAPI limitó las peticiones (429). Reintenta en unos segundos."
            : "No se pudieron cargar los partidos en directo.",
      },
      { status: 200, headers: NO_STORE },
    );
  }
}
