import { NextResponse } from "next/server";
import { snapshotToMetrics } from "@/lib/sport-mapper";
import { fetchEventStatistics } from "@/services/sportApi";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: { id: string } },
) {
  const eventId = Number(context.params.id);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return NextResponse.json({ metrics: null }, { status: 400 });
  }

  try {
    const snapshot = await fetchEventStatistics(eventId);
    if (!snapshot) {
      return NextResponse.json({ metrics: null });
    }
    return NextResponse.json({
      metrics: snapshotToMetrics(snapshot, 90),
      snapshot,
    });
  } catch {
    return NextResponse.json({ metrics: null });
  }
}
