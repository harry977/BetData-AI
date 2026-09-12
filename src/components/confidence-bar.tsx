"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ConfidenceBarProps = {
  value: number;
  label?: string;
  tone?: "neon" | "signal" | "amber";
  className?: string;
};

const tones = {
  neon: "from-emerald-600 via-emerald-400 to-cyan-400",
  signal: "from-cyan-700 via-cyan-400 to-emerald-400",
  amber: "from-amber-600 via-amber-400 to-emerald-400",
};

export function ConfidenceBar({
  value,
  label = "Confianza del modelo",
  tone = "neon",
  className,
}: ConfidenceBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-zinc-400">
        <span>{label}</span>
        <span className="font-mono text-zinc-100">{clamped.toFixed(1)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          className={cn("h-full rounded-full bg-gradient-to-r", tones[tone])}
        />
      </div>
    </div>
  );
}
