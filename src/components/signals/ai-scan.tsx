"use client";

import { Brain } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AiScan({
  matches,
  signals,
  onDone,
}: {
  matches: number;
  signals: number;
  onDone: () => void;
}) {
  const [progress, setProgress] = useState(8);
  const [phase, setPhase] = useState<"scan" | "found">("scan");
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + 7);
        if (next >= 100) {
          window.clearInterval(timer);
          setPhase("found");
          window.setTimeout(() => onDoneRef.current(), 1100);
        }
        return next;
      });
    }, 90);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0e17] px-6">
      <div className="w-full max-w-sm text-center">
        <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-cyan-300">
          <Brain className="h-4 w-4" />
          AI Scan
        </p>
        {phase === "scan" ? (
          <>
            <h2 className="mt-5 text-3xl font-black uppercase leading-none tracking-tight text-white">
              Scanning today&apos;s matches…
            </h2>
            <p className="mt-4 text-lg font-black tabular-nums text-slate-300">
              {matches} matches
            </p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : (
          <>
            <h2 className="mt-5 text-5xl font-black tabular-nums leading-none text-white">
              {signals}
            </h2>
            <p className="mt-3 text-sm font-black uppercase tracking-[0.22em] text-emerald-300">
              Signals found
            </p>
          </>
        )}
      </div>
    </div>
  );
}
