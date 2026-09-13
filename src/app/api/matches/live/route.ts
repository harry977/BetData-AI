import { getLiveMatchesFeed } from "@/lib/sport-feed";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  console.log("[API LIVE] Inicio fetch", new Date().toISOString());
  try {
    const payload = await getLiveMatchesFeed();
    console.log(
      "[API LIVE] Fin fetch",
      new Date().toISOString(),
      "matches",
      payload.matches.length,
      "connected",
      payload.connected,
    );
    return NextResponse.json(payload, { headers: NO_STORE });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SportAPI live failed";
    console.error("[API LIVE] Fin fetch (error)", new Date().toISOString(), message);
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
