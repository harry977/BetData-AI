"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/constants";
import type { MatchInsight } from "@/lib/types";

type PressureChartProps = {
  match: MatchInsight;
};

export function PressureChart({ match }: PressureChartProps) {
  return (
    <Card className="relative overflow-hidden">
      <span className="pointer-events-none absolute bottom-3 right-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-700">
        {BRAND.name}
      </span>
      <CardHeader className="pb-2">
        <CardTitle className="text-zinc-300">Presión ofensiva por minuto</CardTitle>
      </CardHeader>
      <CardContent className="h-52 pr-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={match.metrics.pressureHistory}>
            <defs>
              <linearGradient id="pressureHome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pressureAway" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              dataKey="minute"
              tick={{ fill: "#71717a", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
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
            <Area
              type="monotone"
              dataKey="home"
              name={match.home.code}
              stroke="#10b981"
              fill="url(#pressureHome)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="away"
              name={match.away.code}
              stroke="#06b6d4"
              fill="url(#pressureAway)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
