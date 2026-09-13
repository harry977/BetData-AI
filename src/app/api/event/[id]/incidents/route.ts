import { isDemoEventId } from "@/lib/ids";
import { hasSportApiKey, parseEventIncidents, sportGet } from "@/lib/sportapi";
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
    return NextResponse.json(
      { eventId, incidents: [] },
      { status: 400, headers: NO_STORE },
    );
  }

  if (!hasSportApiKey() || isDemoEventId(eventId)) {
    return NextResponse.json({ eventId, incidents: [] }, { headers: NO_STORE });
  }

  try {
    const json = await sportGet(`/api/v1/event/${eventId}/incidents`);
    return NextResponse.json(
      { eventId, incidents: parseEventIncidents(json) },
      { headers: NO_STORE },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "SportAPI incidents failed";
    console.error("[sportapi] incidents", eventId, message);
    return NextResponse.json({ eventId, incidents: [] }, { headers: NO_STORE });
  }
}
