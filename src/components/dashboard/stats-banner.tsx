import type { PlatformStats } from "@/lib/types";
import { formatPercent } from "@/lib/utils";

type StatsBannerProps = {
  stats: PlatformStats;
};

export function StatsBanner({ stats }: StatsBannerProps) {
  const items = [
    { label: "Partidos analizados hoy", value: `+${stats.matchesAnalyzedToday}` },
    { label: "Tasa de acierto Banker", value: formatPercent(stats.bankerHitRate, 1) },
    { label: "Ligas monitorizadas", value: `+${stats.leaguesMonitored}` },
  ];

  return (
    <section className="grid grid-cols-3 gap-1.5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-[#1e2538] bg-panel px-2 py-2"
        >
          <p className="text-[9px] uppercase leading-tight tracking-wide text-zinc-500">
            {item.label}
          </p>
          <p className="mt-1 font-mono text-sm text-neon">{item.value}</p>
        </div>
      ))}
    </section>
  );
}
