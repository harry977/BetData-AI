const COUNTRIES: Record<string, string> = {
  spain: "España",
  england: "Inglaterra",
  italy: "Italia",
  germany: "Alemania",
  france: "Francia",
  europe: "Europa",
  netherlands: "Países Bajos",
  portugal: "Portugal",
  brazil: "Brasil",
  argentina: "Argentina",
  mexico: "México",
  belgium: "Bélgica",
  turkey: "Turquía",
  scotland: "Escocia",
  usa: "EE. UU.",
  "united states": "EE. UU.",
};

export function countryLabel(country: string) {
  return COUNTRIES[country.trim().toLowerCase()] ?? country;
}

export function formatGoalLine(value: number | string) {
  return String(value).replace(".", ",");
}

export function formatOverUnderPick(pick: string) {
  const over = pick.match(/^O(\d+(?:\.\d+)?)$/i);
  if (over) return `Más de ${formatGoalLine(over[1])}`;
  const under = pick.match(/^U(\d+(?:\.\d+)?)$/i);
  if (under) return `Menos de ${formatGoalLine(under[1])}`;
  return pick.replace(/\bOver\b/gi, "Más de").replace(/\bUnder\b/gi, "Menos de");
}

export function formatBttsPick(pick: string) {
  if (/^(gg|yes|sí|si)$/i.test(pick) || /btts\s*sí/i.test(pick)) return "Sí";
  if (/^(ng|no)$/i.test(pick) || /btts\s*no/i.test(pick)) return "No";
  return pick;
}
