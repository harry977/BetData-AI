export type TipCopy = {
  plain: string;
  market: string;
};

function lineGoals(line: number) {
  return Math.floor(line) + (line % 1 === 0 ? 0 : 1);
}

function maxGoals(line: number) {
  return Math.floor(line);
}

export function explainTip(tip: string, home: string, away: string): TipCopy {
  const compact = tip.trim().replace(/\s+/g, " ");
  const half = /1h|ht|1ª|primera parte|1a parte/i.test(compact);

  if (/btts\s*no|\bng\b/i.test(compact)) {
    return { plain: "Que no marquen los dos equipos", market: "BTTS No" };
  }
  if (/btts|ambos|\bgg\b/i.test(compact)) {
    return { plain: "Que marquen los dos equipos", market: "BTTS Sí" };
  }

  const over =
    compact.match(/\bover\s*(\d+(?:\.\d+)?)/i) ??
    compact.match(/(?:^|\s)O(\d+(?:\.\d+)?)/i);
  if (over) {
    const line = Number(over[1]);
    const goals = lineGoals(line);
    const market = half ? `Over ${line} Primera Parte` : `Over ${line}`;
    if (half) {
      return {
        plain:
          goals === 1
            ? "Que se marque al menos 1 gol antes del descanso"
            : `Que se marquen al menos ${goals} goles antes del descanso`,
        market,
      };
    }
    return {
      plain:
        goals === 1
          ? "Que se marque al menos 1 gol en el partido"
          : `Que haya ${goals} o más goles en el partido`,
      market,
    };
  }

  const under =
    compact.match(/\bunder\s*(\d+(?:\.\d+)?)/i) ??
    compact.match(/(?:^|\s)U(\d+(?:\.\d+)?)/i);
  if (under) {
    const line = Number(under[1]);
    const goals = maxGoals(line);
    const market = half ? `Under ${line} Primera Parte` : `Under ${line}`;
    if (half) {
      return {
        plain:
          goals === 0
            ? "Que no se marque ningún gol antes del descanso"
            : `Que haya como máximo ${goals} goles antes del descanso`,
        market,
      };
    }
    return {
      plain:
        goals === 0
          ? "Que no se marque ningún gol en el partido"
          : `Que haya como máximo ${goals} goles en el partido`,
      market,
    };
  }

  if (/^(1|h|home|local)$/i.test(compact)) {
    return { plain: `Que gane ${home}`, market: `Victoria ${home}` };
  }
  if (/^(x|draw|empate)$/i.test(compact)) {
    return { plain: "Que el partido acabe en empate", market: "Empate" };
  }
  if (/^(2|a|away|visitante)$/i.test(compact)) {
    return { plain: `Que gane ${away}`, market: `Victoria ${away}` };
  }

  if (/^1x$/i.test(compact)) {
    return { plain: `Que gane ${home} o empate`, market: `Doble oportunidad ${home} o X` };
  }
  if (/^x2$/i.test(compact)) {
    return { plain: `Que gane ${away} o empate`, market: `Doble oportunidad X o ${away}` };
  }
  if (/^12$/i.test(compact)) {
    return { plain: "Que no empate", market: "Doble oportunidad 12" };
  }

  return { plain: compact, market: compact };
}
