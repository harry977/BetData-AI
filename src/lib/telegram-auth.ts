import { createHash, createHmac, timingSafeEqual } from "crypto";

export type TelegramWidgetUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number | string;
  hash: string;
};

function sortedCheckString(fields: Record<string, string>) {
  return Object.keys(fields)
    .sort()
    .map((key) => `${key}=${fields[key]}`)
    .join("\n");
}

function hashesMatch(expected: string, received: string) {
  const left = Buffer.from(expected, "hex");
  const right = Buffer.from(received, "hex");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifyLoginWidget(user: TelegramWidgetUser, botToken: string) {
  const { hash, ...rest } = user;
  if (!hash) return false;
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined || value === null || value === "") continue;
    fields[key] = String(value);
  }
  const secret = createHash("sha256").update(botToken).digest();
  const hmac = createHmac("sha256", secret)
    .update(sortedCheckString(fields))
    .digest("hex");
  return hashesMatch(hmac, hash);
}

export function verifyWebAppInitData(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;
  params.delete("hash");
  const fields: Record<string, string> = {};
  params.forEach((value, key) => {
    fields[key] = value;
  });
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const hmac = createHmac("sha256", secret)
    .update(sortedCheckString(fields))
    .digest("hex");
  return hashesMatch(hmac, hash);
}

export function parseWebAppUser(initData: string) {
  const params = new URLSearchParams(initData);
  const raw = params.get("user");
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as {
      id?: number;
      username?: string;
      first_name?: string;
      photo_url?: string;
    };
    if (!user.id) return null;
    return {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      photo_url: user.photo_url,
    };
  } catch {
    return null;
  }
}
