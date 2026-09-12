"use client";

import { madridYmd } from "@/lib/dates";
import { readDailyMission } from "@/lib/storage";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

export function MissionCard({ refreshKey }: { refreshKey: number }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    setDone(readDailyMission(madridYmd()).ids.length);
  }, [refreshKey]);

  const complete = done >= 3;

  return (
    <article className="rounded-[24px] border border-white/8 bg-[#121726] p-4">
      <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
        <Trophy className="h-3.5 w-3.5" />
        Daily Mission
      </p>
      {complete ? (
        <>
          <p className="mt-3 text-lg font-black uppercase text-emerald-300">Challenge complete</p>
          <p className="mt-1 text-[13px] font-semibold text-slate-400">
            Has descubierto 3 señales high-confidence.
          </p>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm font-black uppercase leading-snug text-white">
            Discover 3 high-confidence signals
          </p>
          <p className="mt-2 text-2xl font-black tabular-nums text-cyan-300">{done} / 3</p>
        </>
      )}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{ width: `${Math.min(100, (done / 3) * 100)}%` }}
        />
      </div>
    </article>
  );
}
