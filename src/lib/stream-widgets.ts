import type { MatchInsight, PressurePoint } from "@/lib/types";
import { isInPlayStatus } from "@/lib/utils";

export type TodayHitStats = {
  hits: number;
  total: number;
  pct: number;
  settled: boolean;
};

export function todayHitStats(matches: MatchInsight[]): TodayHitStats {
  const settled = matches.filter((match) => match.day === "today" && match.result);
  const hits = settled.filter((match) => match.result?.won).length;
  const total = settled.length;
  return {
    hits,
    total,
    pct: total ? Math.round((hits / total) * 100) : 0,
    settled: total > 0,
  };
}

export type PressureSplit = {
  homePct: number;
  awayPct: number;
  pressureIndex: number;
  dominant: "home" | "away" | "even";
  hot: boolean;
  live: boolean;
};

function averagePair(points: PressurePoint[]) {
  const home = points.reduce((sum, point) => sum + point.home, 0) / points.length;
  const away = points.reduce((sum, point) => sum + point.away, 0) / points.length;
  return { home, away };
}

export function pressureSplit(match: MatchInsight): PressureSplit {
  const history = match.metrics.pressureHistory ?? [];
  const elapsed = match.elapsed ?? history.at(-1)?.minute ?? 0;
  const windowStart = Math.max(0, elapsed - 5);
  const recent = history.filter((point) => point.minute >= windowStart);
  const sample = recent.length > 0 ? recent : history.slice(-2);

  let homeRaw: number;
  let awayRaw: number;
  if (sample.length > 0) {
    const avg = averagePair(sample);
    homeRaw = avg.home;
    awayRaw = avg.away;
  } else {
    homeRaw = match.metrics.offensivePressure;
    awayRaw = Math.max(0, 100 - match.metrics.offensivePressure);
  }

  const total = homeRaw + awayRaw;
  const homePct = total > 0 ? Math.round((homeRaw / total) * 100) : 50;
  const awayPct = 100 - homePct;
  const pressureIndex = Math.max(homePct, awayPct);
  const dominant: PressureSplit["dominant"] =
    homePct === awayPct ? "even" : homePct > awayPct ? "home" : "away";

  return {
    homePct,
    awayPct,
    pressureIndex,
    dominant,
    hot: pressureIndex > 75,
    live: isInPlayStatus(match.status),
  };
}

function clampPct(value: number) {
  return Math.max(0, Math.min(99, Math.round(value)));
}

export function liveGoalProbability(match: MatchInsight, pressureIndex: number) {
  const maxXG = Math.max(match.metrics.xG.home, match.metrics.xG.away);
  const maxSOT = Math.max(
    match.metrics.shotsOnTarget.home,
    match.metrics.shotsOnTarget.away,
  );
  const hasAttack = maxXG > 0.15 || maxSOT > 0;
  if (!hasAttack) {
    return clampPct(pressureIndex * 0.92);
  }
  return clampPct(
    pressureIndex * 0.62 + Math.min(28, maxXG * 10) + Math.min(18, maxSOT * 3.5),
  );
}

export type GoalAlertState = {
  show: boolean;
  pressureIndex: number;
  liveProbability: number;
  split: PressureSplit;
};

export function goalAlert(match: MatchInsight): GoalAlertState {
  const split = pressureSplit(match);
  const liveProbability = liveGoalProbability(match, split.pressureIndex);
  const live = isInPlayStatus(match.status);
  return {
    show: live && (split.pressureIndex > 80 || liveProbability > 85),
    pressureIndex: split.pressureIndex,
    liveProbability,
    split,
  };
}
