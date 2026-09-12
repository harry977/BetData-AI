import { snapshotToMetrics } from "@/lib/sport-mapper";
import { fetchEventStatistics } from "@/services/sportApi";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  const eventId = Number(context.params.id);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return NextResponse.json({ metrics: null }, { status: 400, headers: NO_STORE });
  }

  try {
    const snapshot = await fetchEventStatistics(eventId);
    if (!snapshot) {
      return NextResponse.json({ metrics: null }, { headers: NO_STORE });
    }
    return NextResponse.json(
      {
        metrics: snapshotToMetrics(snapshot, 90),
        snapshot,
      },
      { headers: NO_STORE },
    );
  } catch {
    return NextResponse.json({ metrics: null }, { headers: NO_STORE });
  }
}
