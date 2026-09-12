"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/constants";
import type { MatchInsight } from "@/lib/types";

type XgChartProps = {
  match: MatchInsight;
};

export function XgChart({ match }: XgChartProps) {
  const data = match.metrics.xGHistory.map((point) => ({
    minute: point.minute,
    [match.home.code]: point.home,
    [match.away.code]: point.away,
  }));

  return (
    <Card className="relative overflow-hidden">
      <span className="pointer-events-none absolute bottom-3 right-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-700">
        {BRAND.name}
      </span>
      <CardHeader className="pb-2">
        <CardTitle className="text-zinc-300">Goles esperados (xG)</CardTitle>
      </CardHeader>
      <CardContent className="h-40 pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              dataKey="minute"
              tick={{ fill: "#71717a", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: "#09090b",
                border: "1px solid #27272a",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelFormatter={(minute) => `Min ${minute}`}
            />
            <Bar dataKey={match.home.code} fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey={match.away.code} fill="#06b6d4" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
