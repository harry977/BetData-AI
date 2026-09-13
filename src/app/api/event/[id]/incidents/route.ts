import { fetchEventIncidents, hasSportApiKey } from "@/lib/sportapi";
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

  if (!hasSportApiKey() || eventId >= 910000) {
    return NextResponse.json({ eventId, incidents: [] }, { headers: NO_STORE });
  }

  try {
    const incidents = await fetchEventIncidents(eventId);
    return NextResponse.json({ eventId, incidents }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ eventId, incidents: [] }, { headers: NO_STORE });
  }
}
