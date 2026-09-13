"use client";

import { motion } from "framer-motion";
import { cn, formatConfidence } from "@/lib/utils";

type ConfidenceBarProps = {
  value: number;
  max?: number;
  label?: string;
  tone?: "neon" | "signal" | "amber";
  className?: string;
};

const tones = {
  neon: "from-[#6b9900] via-neon to-cyan-400",
  signal: "from-cyan-700 via-cyan-400 to-neon",
  amber: "from-amber-600 via-amber-400 to-neon",
};

export function ConfidenceBar({
  value,
  max = 10,
  label = "Confianza (1 a 10)",
  tone = "neon",
  className,
}: ConfidenceBarProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const percent = (clamped / max) * 100;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-zinc-400">
        <span>{label}</span>
        <span className="font-mono text-zinc-100">{formatConfidence(clamped)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          className={cn("h-full rounded-full bg-gradient-to-r", tones[tone])}
        />
      </div>
    </div>
  );
}
