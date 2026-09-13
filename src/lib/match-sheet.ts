import { formatCalendarDay, formatKickoffLocal } from "@/lib/dates";
import { countryLabel, formatBttsPick, formatOverUnderPick } from "@/lib/locale";
import { explainTip } from "@/lib/tip-copy";
import type { MatchInsight } from "@/lib/types";
import { formatOdds, isInPlayStatus, statusLabel } from "@/lib/utils";

export type MarketCell = {
  key: string;
  label: string;
  pick: string;
  odds: string | null;
  highlight: boolean;
};

export function marketCells(match: MatchInsight): MarketCell[] {
  const best = match.bestTip.toLowerCase();
  const one = match.markets.oneXTwo;
  const ou = match.markets.overUnder;
  const btts = match.markets.btts;
  const oneLabel =
    one.pick === "1"
      ? `Victoria ${match.home.code}`
      : one.pick === "2"
        ? `Victoria ${match.away.code}`
        : "Empate";
  const bttsLabel = formatBttsPick(btts.pick);
  const exact = expectedExactScore(match);

  return [
    {
      key: "1x2",
      label: "Resultado 1X2",
      pick: oneLabel,
      odds: formatOdds(one.odds),
      highlight: /^(1|2|x)$/i.test(match.bestTip.trim()),
    },
    {
      key: "ou",
      label: "Más / menos goles",
      pick: formatOverUnderPick(ou.pick),
      odds: formatOdds(ou.odds),
      highlight: /over|under|^o\d|^u\d/i.test(best),
    },
    {
      key: "btts",
      label: "Ambos anotan",
      pick: bttsLabel,
      odds: formatOdds(btts.odds),
      highlight: /btts|gg|ng|ambos/i.test(best),
    },
    {
      key: "cs",
      label: "Marcador exacto",
      pick: exact.line,
      odds: null,
      highlight: false,
    },
  ];
}

export function expectedExactScore(match: MatchInsight): {
  line: string;
  source: "xg" | "none";
} {
  const hasSnapshot = match.metrics.possession != null;
  if (!hasSnapshot) {
    return { line: "Sin dato", source: "none" };
  }
  const home = Math.round(match.metrics.xG.home);
  const away = Math.round(match.metrics.xG.away);
  return { line: `${home}–${away} · según goles esperados`, source: "xg" };
}

export type StatRow = {
  key: string;
  label: string;
  home: number | null;
  away: number | null;
  format: "xg" | "pct" | "int";
};

export function predictedStatRows(match: MatchInsight): StatRow[] {
  const { metrics } = match;
  return [
    {
      key: "xg",
      label: "Goles esperados",
      home: metrics.xG.home,
      away: metrics.xG.away,
      format: "xg",
    },
    {
      key: "poss",
      label: "Posesión",
      home: metrics.possession?.home ?? null,
      away: metrics.possession?.away ?? null,
      format: "pct",
    },
    {
      key: "shots",
      label: "Tiros a puerta",
      home: metrics.shotsOnTarget.home,
      away: metrics.shotsOnTarget.away,
      format: "int",
    },
    {
      key: "corners",
      label: "Córners",
      home: metrics.corners?.home ?? null,
      away: metrics.corners?.away ?? null,
      format: "int",
    },
    {
      key: "cards",
      label: "Tarjetas",
      home: metrics.cards?.home ?? null,
      away: metrics.cards?.away ?? null,
      format: "int",
    },
  ];
}

export function formatStatValue(value: number, format: StatRow["format"]) {
  if (format === "xg") return value.toFixed(2);
  if (format === "pct") return `${Math.round(value)}%`;
  return String(Math.round(value));
}

export function pairShare(home: number, away: number) {
  const total = home + away;
  if (total <= 0) return { homePct: 50, awayPct: 50 };
  const homePct = Math.round((home / total) * 100);
  return { homePct, awayPct: 100 - homePct };
}

export function contextAlert(match: MatchInsight) {
  if (isInPlayStatus(match.status)) {
    const score =
      match.score.home != null && match.score.away != null
        ? `${match.score.home}–${match.score.away}`
        : "sin marcador";
    const clock = match.elapsed != null ? `${match.elapsed}'` : statusLabel(match);
    return `En juego (${clock}, ${score}). Presión ofensiva ${match.metrics.offensivePressure}%.`;
  }
  const kickoff = `${formatCalendarDay(match.kickoffIso)} · ${formatKickoffLocal(match.kickoffIso)}`;
  return `${match.league.name} (${countryLabel(match.league.country)}) · ${kickoff}.`;
}

export function contextBody(match: MatchInsight) {
  const note = match.formNote.trim();
  if (note) return note;
  return "Sin historial cara a cara en el feed. Cuando lleguen esos datos, aparecerán aquí.";
}

export function matchShareText(match: MatchInsight) {
  const copy = explainTip(match.bestTip, match.home.name, match.away.name);
  const clock =
    match.score.home != null && match.score.away != null
      ? `${match.score.home}–${match.score.away}`
      : formatKickoffLocal(match.kickoffIso);
  const one = match.markets.oneXTwo;
  const ou = match.markets.overUnder;
  const btts = match.markets.btts;
  const bttsLabel = `Ambos anotan ${formatBttsPick(btts.pick)}`;
  return [
    `RadarBet IA · ${match.home.name} – ${match.away.name}`,
    `${match.league.name} · ${clock}`,
    `Mejor consejo: ${copy.plain}`,
    `${copy.market} · confianza ${match.confidence.toFixed(1)}/10`,
    `1X2 ${one.pick} ${formatOdds(one.odds)} · ${formatOverUnderPick(ou.pick)} ${formatOdds(ou.odds)} · ${bttsLabel} ${formatOdds(btts.odds)}`,
  ].join("\n");
}

export function headerClock(match: MatchInsight) {
  if (match.score.home != null && match.score.away != null) {
    return {
      score: `${match.score.home}–${match.score.away}`,
      meta: isInPlayStatus(match.status)
        ? match.elapsed != null
          ? `${match.elapsed}'`
          : statusLabel(match)
        : statusLabel(match),
    };
  }
  return {
    score: formatKickoffLocal(match.kickoffIso),
    meta: formatCalendarDay(match.kickoffIso),
  };
}
