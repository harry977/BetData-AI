"use client";

import { useEffect, useRef, useState } from "react";

const LINES = [
  "Escaneando partidos de hoy…",
  "Filtrando por confianza mínima…",
  "Cruzando mercados permitidos…",
  "Armando la mejor combinada…",
];

export function ComboScan({ onDone }: { onDone: () => void }) {
  const [line, setLine] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const tick = window.setInterval(() => {
      setLine((current) => {
        if (current >= LINES.length - 1) {
          window.clearInterval(tick);
          window.setTimeout(() => onDoneRef.current(), 420);
          return current;
        }
        return current + 1;
      });
    }, 420);
    return () => window.clearInterval(tick);
  }, []);

  return (
    <div className="rounded-2xl border border-cyan-400/25 bg-black/50 px-4 py-4 font-mono text-[13px] text-cyan-200">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
        Terminal IA
      </p>
      <ul className="mt-3 space-y-1.5">
        {LINES.slice(0, line + 1).map((item, index) => (
          <li key={item} className={index === line ? "text-[#00E676]" : "text-slate-400"}>
            {index === line ? "▸ " : "✓ "}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
