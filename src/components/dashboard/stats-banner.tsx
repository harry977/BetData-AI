import { Activity, Globe, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { PlatformStats } from "@/lib/types";
import { formatPercent } from "@/lib/utils";

type StatsBannerProps = {
  stats: PlatformStats;
};

export function StatsBanner({ stats }: StatsBannerProps) {
  const items = [
    {
      icon: Activity,
      label: "Partidos analizados hoy",
      value: `+${stats.matchesAnalyzedToday}`,
    },
    {
      icon: Trophy,
      label: "Tasa de acierto Banker",
      value: formatPercent(stats.bankerHitRate, 1),
    },
    {
      icon: Globe,
      label: "Ligas monitorizadas",
      value: `+${stats.leaguesMonitored}`,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="flex items-center gap-3 px-3 py-3">
          <item.icon className="h-4 w-4 shrink-0 text-emerald-400" />
          <div>
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">{item.label}</p>
            <p className="font-mono text-lg text-zinc-50">{item.value}</p>
          </div>
        </Card>
      ))}
    </section>
  );
}
