import type { LiveMetrics, PressurePoint, XGPoint } from "@/lib/types";

export function metricSeries(
  seedHome: number,
  seedAway: number,
  step = 5,
  max = 90,
  mode: "pressure" | "xg" = "pressure",
): PressurePoint[] | XGPoint[] {
  const points = [];
  let home = mode === "xg" ? 0.08 : seedHome;
  let away = mode === "xg" ? 0.04 : seedAway;

  for (let minute = 0; minute <= max; minute += step) {
    if (mode === "xg") {
      home += (seedHome / 18) * (0.7 + ((minute * 13) % 7) / 10);
      away += (seedAway / 18) * (0.55 + ((minute * 9) % 6) / 10);
      points.push({
        minute,
        home: Number(Math.min(home, seedHome).toFixed(2)),
        away: Number(Math.min(away, seedAway).toFixed(2)),
      });
    } else {
      const swing = Math.sin(minute / 14) * 8;
      points.push({
        minute,
        home: Math.max(18, Math.min(96, Math.round(seedHome + swing))),
        away: Math.max(12, Math.min(92, Math.round(seedAway - swing * 0.7))),
      });
    }
  }
  return points;
}

export function buildLiveMetrics(
  pressure: number,
  xgHome: number,
  xgAway: number,
  elapsed = 90,
  shotsOnTarget?: { home: number; away: number },
  extras?: {
    possession?: LiveMetrics["possession"];
    corners?: LiveMetrics["corners"];
    cards?: LiveMetrics["cards"];
  },
): LiveMetrics {
  return {
    offensivePressure: pressure,
    xG: { home: xgHome, away: xgAway },
    dangerousAttacksPerMinute: {
      home: Number((pressure / 50).toFixed(1)),
      away: Number(((100 - pressure) / 70).toFixed(1)),
    },
    shotsOnTarget: shotsOnTarget ?? {
      home: Math.max(0, Math.round(xgHome * 3)),
      away: Math.max(0, Math.round(xgAway * 3)),
    },
    pressureHistory: metricSeries(pressure, Math.max(20, 100 - pressure)) as PressurePoint[],
    xGHistory: metricSeries(xgHome, xgAway, 5, elapsed, "xg") as XGPoint[],
    possession: extras?.possession ?? null,
    corners: extras?.corners ?? null,
    cards: extras?.cards ?? null,
  };
}
