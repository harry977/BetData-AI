export function utcDateOffset(days = 0): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export const DISPLAY_TZ = "Europe/Madrid";

export function formatCalendarDay(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    timeZone: DISPLAY_TZ,
  });
}

export function formatKickoffLocal(iso: string) {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: DISPLAY_TZ,
  });
}

export function calendarDayFromYmd(ymd: string) {
  return formatCalendarDay(`${ymd}T12:00:00.000Z`);
}
