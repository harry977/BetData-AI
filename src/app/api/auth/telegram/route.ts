import { NextResponse } from "next/server";
import {
  parseWebAppUser,
  verifyLoginWidget,
  verifyWebAppInitData,
  type TelegramWidgetUser,
} from "@/lib/telegram-auth";

export const dynamic = "force-dynamic";

type Body = {
  source?: "webapp" | "widget";
  initData?: string;
  user?: TelegramWidgetUser & { first_name?: string };
};

function identityFrom(user: {
  id: number;
  username?: string;
  first_name?: string;
}) {
  const label = user.username
    ? `@${user.username}`
    : user.first_name || `Telegram ${user.id}`;
  return { id: user.id, label };
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Petición no válida." }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";

  if (body.source === "widget") {
    const user = body.user;
    if (!user?.id || !user.hash) {
      return NextResponse.json(
        { error: "Telegram no envió la cuenta." },
        { status: 400 },
      );
    }
    if (token && !verifyLoginWidget(user, token)) {
      return NextResponse.json(
        { error: "No hemos podido validar tu cuenta de Telegram." },
        { status: 401 },
      );
    }
    return NextResponse.json({ ok: true, identity: identityFrom(user) });
  }

  const initData = body.initData?.trim() ?? "";
  if (token && initData && !verifyWebAppInitData(initData, token)) {
    return NextResponse.json(
      { error: "No hemos podido validar tu sesión de Telegram." },
      { status: 401 },
    );
  }

  const fromInit = initData ? parseWebAppUser(initData) : null;
  const fallback = body.user?.id ? body.user : null;
  const user = fromInit ?? fallback;
  if (!user?.id) {
    return NextResponse.json(
      { error: "Abre BetData IA desde Telegram para entrar." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    identity: identityFrom({
      id: user.id,
      username: user.username,
      first_name: user.first_name,
    }),
  });
}
