import { NextResponse } from "next/server";
import { getFixturesFeed } from "@/lib/api-football";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getFixturesFeed();
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar los pronósticos." },
      { status: 502 },
    );
  }
}
