import { buildLiveMetrics } from "@/lib/metrics";
import type { FixtureStatus, MatchInsight, Team } from "@/lib/types";
import { isRecord } from "@/lib/json";

const FALLBACK_COLORS: [string, string] = ["#B8FF00", "#3d4d00"];

function asId(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asScore(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asStatus(value: unknown): FixtureStatus {
  const raw = String(value ?? "").toLowerCase();
  if (raw === "ht" || raw.includes("half")) return "HT";
  if (raw === "ft" || raw.includes("finish") || raw === "ended" || raw === "closed") return "FT";
  if (
    raw === "live" ||
    raw === "inplay" ||
    raw === "in_play" ||
    raw.includes("progress")
  ) {
    return "LIVE";
  }
  return "NS";
}

function firstArray(...candidates: unknown[]): unknown[] | null {
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) return candidate;
  }
  return null;
}

function nestedArrays(value: unknown): unknown[] | null {
  if (!isRecord(value)) return null;
  return firstArray(
    value.data,
    value.fixtures,
    value.events,
    value.matches,
    value.response,
    value.cards,
  );
}

/**
 * Lectura universal del JSON de SportAPI / Next.
 * Orden pedido: data → fixtures → events → matches → array raíz.
 * También contempla `response` (payload de /api/fixtures) y un nivel anidado.
 * No usa `[] || siguiente`: un array vacío es truthy y cortaría la cadena.
 */
export function readRawMatches(res: unknown): unknown[] {
  if (Array.isArray(res)) return res;
  if (!isRecord(res)) {
    if (typeof window !== "undefined") {
      console.log("[DEBUG FRONTEND DATA]:", res);
    }
    return [];
  }

  const rawMatches =
    firstArray(res.data, res.fixtures, res.events, res.matches) ||
    firstArray(res.response, res.cards) ||
    nestedArrays(res.data) ||
    nestedArrays(res.payload) ||
    nestedArrays(res.result) ||
    nestedArrays(res.body) ||
    (Array.isArray(res) ? res : []);

  if (!Array.isArray(rawMatches) || rawMatches.length === 0) {
    if (typeof window !== "undefined") {
      console.log("[DEBUG FRONTEND DATA]:", res);
    }
    return [];
  }
  return rawMatches;
}

function teamFrom(raw: unknown, fallbackName: string, fallbackId: number): Team {
  const record = isRecord(raw) ? raw : {};
  const nested = isRecord(record.team) ? record.team : record;
  const id = asId(nested.id ?? record.id, fallbackId);
  const name = asText(nested.name ?? record.name ?? record.homeTeam ?? record.awayTeam, fallbackName);
  const codeSource = asText(nested.nameCode ?? nested.code ?? name, fallbackName);
  const code = codeSource.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "FCB";
  const logo = asText(nested.logo ?? record.logo, id > 0 ? `/api/crest/team/${id}` : "");
  const colors = Array.isArray(nested.colors) && nested.colors.length >= 2
    ? ([String(nested.colors[0]), String(nested.colors[1])] as [string, string])
    : FALLBACK_COLORS;
  return { id, name, code, logo, colors };
}

function pickHomeAway(row: Record<string, unknown>): { home: unknown; away: unknown } {
  if (isRecord(row.teams)) {
    return { home: row.teams.home, away: row.teams.away };
  }
  return {
    home: row.home ?? row.homeTeam ?? row.home_team,
    away: row.away ?? row.awayTeam ?? row.away_team,
  };
}

function pickScore(row: Record<string, unknown>): { home: number | null; away: number | null } {
  if (isRecord(row.score)) {
    const current = isRecord(row.score.current) ? row.score.current : null;
    return {
      home: asScore(row.score.home ?? current?.home),
      away: asScore(row.score.away ?? current?.away),
    };
  }
  if (isRecord(row.goals)) {
    return { home: asScore(row.goals.home), away: asScore(row.goals.away) };
  }
  return {
    home: asScore(row.homeScore ?? row.home_score),
    away: asScore(row.awayScore ?? row.away_score),
  };
}

function looksLikeInsight(row: Record<string, unknown>): boolean {
  return isRecord(row.home) && isRecord(row.away) && ("kickoffIso" in row || "bestTip" in row || "metrics" in row);
}

/** Nunca descarta una fila: rellena huecos para que la parrilla pueda pintar. */
export function coerceMatchInsight(raw: unknown, index = 0): MatchInsight {
  const row = isRecord(raw) ? raw : {};
  const { home: homeRaw, away: awayRaw } = pickHomeAway(row);
  const home = teamFrom(homeRaw, `Local ${index + 1}`, -(index * 2 + 1));
  const away = teamFrom(awayRaw, `Visitante ${index + 1}`, -(index * 2 + 2));
  const score = pickScore(row);
  const statusRaw = isRecord(row.status)
    ? row.status.type ?? row.status.description ?? row.status.code
    : row.status;
  const status = asStatus(statusRaw ?? row.statusType ?? row.statusDescription);
  const id = asId(row.id ?? row.eventId ?? row.fixtureId, index + 1);
  const kickoffIso =
    asText(row.kickoffIso, "") ||
    (typeof row.startTimestamp === "number"
      ? new Date(row.startTimestamp * 1000).toISOString()
      : new Date().toISOString());
  const confidence =
    typeof row.confidence === "number" && Number.isFinite(row.confidence) ? row.confidence : 6.5;
  const hitRate =
    typeof row.hitRate === "number" && Number.isFinite(row.hitRate) ? row.hitRate : 68;
  const bestTip = asText(row.bestTip, "1");
  const elapsed =
    typeof row.elapsed === "number" && Number.isFinite(row.elapsed)
      ? row.elapsed
      : typeof row.minute === "number"
        ? row.minute
        : status === "NS"
          ? null
          : 45;

  const leagueRecord = isRecord(row.league) ? row.league : {};
  const leagueId = asId(leagueRecord.id ?? row.leagueId, 0);
  const metrics = row.metrics && isRecord(row.metrics)
    ? {
        ...buildLiveMetrics(54, 0.4, 0.3, elapsed ?? 20),
        ...(row.metrics as MatchInsight["metrics"]),
      }
    : buildLiveMetrics(
        status === "LIVE" || status === "HT" ? 62 : 54,
        Math.max(0.2, (score.home ?? 0) * 0.9 + 0.35),
        Math.max(0.15, (score.away ?? 0) * 0.9 + 0.28),
        elapsed ?? 20,
      );

  const oddsRecord = isRecord(row.odds) ? row.odds : {};
  const marketsRecord = isRecord(row.markets) ? row.markets : {};

  const insight: MatchInsight = {
    id,
    day: row.day === "yesterday" || row.day === "tomorrow" || row.day === "today" ? row.day : "today",
    league: {
      id: leagueId,
      name: asText(leagueRecord.name ?? row.leagueName, "Liga"),
      country: asText(leagueRecord.country ?? row.country, ""),
      logo: asText(leagueRecord.logo ?? row.leagueLogo, leagueId > 0 ? `/api/crest/league/${leagueId}` : ""),
    },
    home,
    away,
    kickoffIso,
    status,
    elapsed,
    score,
    odds: {
      home: typeof oddsRecord.home === "number" ? oddsRecord.home : 2.1,
      draw: typeof oddsRecord.draw === "number" ? oddsRecord.draw : 3.4,
      away: typeof oddsRecord.away === "number" ? oddsRecord.away : 3.5,
      valueMarket: typeof oddsRecord.valueMarket === "number" ? oddsRecord.valueMarket : 1.85,
    },
    hitRate,
    confidence,
    isBanker: confidence >= 8,
    bestTip,
    markets: {
      oneXTwo: {
        pick:
          isRecord(marketsRecord.oneXTwo) && marketsRecord.oneXTwo.pick === "X"
            ? "X"
            : isRecord(marketsRecord.oneXTwo) && marketsRecord.oneXTwo.pick === "2"
              ? "2"
              : "1",
        odds:
          isRecord(marketsRecord.oneXTwo) && typeof marketsRecord.oneXTwo.odds === "number"
            ? marketsRecord.oneXTwo.odds
            : 2.1,
      },
      overUnder: {
        pick: asText(
          isRecord(marketsRecord.overUnder) ? marketsRecord.overUnder.pick : null,
          "O2.5",
        ),
        odds:
          isRecord(marketsRecord.overUnder) && typeof marketsRecord.overUnder.odds === "number"
            ? marketsRecord.overUnder.odds
            : 1.85,
      },
      btts: {
        pick:
          isRecord(marketsRecord.btts) && marketsRecord.btts.pick === "NG" ? "NG" : "GG",
        odds:
          isRecord(marketsRecord.btts) && typeof marketsRecord.btts.odds === "number"
            ? marketsRecord.btts.odds
            : 1.8,
      },
    },
    formNote: asText(
      row.formNote,
      `RadarBet IA analiza ${home.name} frente a ${away.name}.`,
    ),
    metrics,
    result: isRecord(row.result) && isRecord(row.result.finalScore)
      ? {
          won: Boolean(row.result.won),
          finalScore: {
            home: asScore(row.result.finalScore.home) ?? 0,
            away: asScore(row.result.finalScore.away) ?? 0,
          },
        }
      : null,
  };

  if (looksLikeInsight(row)) {
    const original = raw as MatchInsight;
    return {
      ...insight,
      ...original,
      id: asId(original.id, id),
      home: original.home?.name ? { ...insight.home, ...original.home } : insight.home,
      away: original.away?.name ? { ...insight.away, ...original.away } : insight.away,
      score: original.score ?? insight.score,
      metrics: original.metrics ?? insight.metrics,
      confidence:
        typeof original.confidence === "number" ? original.confidence : confidence,
    };
  }

  return insight;
}

export function ingestSportFeedJson(res: unknown): MatchInsight[] {
  return readRawMatches(res).map((row, index) => coerceMatchInsight(row, index));
}
