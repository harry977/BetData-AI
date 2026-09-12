export function bandLabel(band: "HIGH" | "MEDIUM" | "LOW") {
  if (band === "HIGH") return "Confianza alta";
  if (band === "MEDIUM") return "Confianza media";
  return "Confianza baja";
}

export function rarityLabel(rarity: "STANDARD" | "STRONG" | "ELITE") {
  if (rarity === "ELITE") return "Señal élite";
  if (rarity === "STRONG") return "Señal fuerte";
  return "Señal estándar";
}
