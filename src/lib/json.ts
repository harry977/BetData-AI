export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace("%", "").replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function asInt(value: unknown): number | null {
  const parsed = asNumber(value);
  return parsed === null ? null : Math.trunc(parsed);
}
