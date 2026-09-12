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
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar los pronósticos." },
      { status: 502, headers: NO_STORE },
    );
  }
}
