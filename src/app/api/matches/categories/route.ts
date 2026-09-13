import { getFootballCategoriesFeed } from "@/lib/sport-feed";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("date") ?? undefined;
    const rawOffset = url.searchParams.get("timezoneOffset");
    const timezoneOffset =
      rawOffset != null && rawOffset !== "" ? Number(rawOffset) : undefined;
    const payload = await getFootballCategoriesFeed(
      date,
      Number.isFinite(timezoneOffset) ? timezoneOffset : undefined,
    );
    return NextResponse.json(payload, { headers: NO_STORE });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar las categorías." },
      { status: 502, headers: NO_STORE },
    );
  }
}
