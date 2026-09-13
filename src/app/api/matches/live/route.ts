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
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar los partidos en directo." },
      { status: 502, headers: NO_STORE },
    );
  }
}
