import { hasSportApiKey, sportGetBinary } from "@/lib/sportapi";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const memory = new Map<string, { savedAt: number; contentType: string; body: Uint8Array }>();
const TTL_MS = 12 * 60 * 60 * 1000;

type CrestImage = { contentType: string; body: Uint8Array };

function respond(image: CrestImage) {
  return new NextResponse(Buffer.from(image.body), {
    headers: {
      "Content-Type": image.contentType || "image/png",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

async function fetchSportImage(paths: string[]): Promise<CrestImage | null> {
  if (!hasSportApiKey()) return null;
  for (const path of paths) {
    try {
      return await sportGetBinary(path);
    } catch {
      /* try next path */
    }
  }
  return null;
}

async function fetchPublicImage(url: string): Promise<CrestImage | null> {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return null;
    return { contentType, body: new Uint8Array(await res.arrayBuffer()) };
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  context: { params: { type: string; id: string } },
) {
  const kind = context.params.type === "league" ? "league" : "team";
  const id = Number(context.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return new NextResponse(null, { status: 404 });
  }

  const cacheKey = `${kind}:${id}`;
  const cached = memory.get(cacheKey);
  if (cached && Date.now() - cached.savedAt < TTL_MS) {
    return respond(cached);
  }

  const premiumPaths =
    kind === "team"
      ? [`/api/v1/team/${id}/image`, `/api/v1/team/${id}/image/small`]
      : [
          `/api/v1/unique-tournament/${id}/image`,
          `/api/v1/unique-tournament/${id}/image/small`,
          `/api/v1/tournament/${id}/image`,
        ];
  const publicUrl =
    kind === "team"
      ? `https://img.sofascore.com/api/v1/team/${id}/image`
      : `https://img.sofascore.com/api/v1/unique-tournament/${id}/image`;

  const image =
    (await fetchSportImage(premiumPaths)) ?? (await fetchPublicImage(publicUrl));
  if (!image) {
    return new NextResponse(null, { status: 404 });
  }

  memory.set(cacheKey, { savedAt: Date.now(), ...image });
  return respond(image);
}
