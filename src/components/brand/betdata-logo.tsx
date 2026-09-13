"use client";

import { useId } from "react";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  withWordmark?: boolean;
  version?: boolean;
  lockup?: boolean;
};

export function RadarMark({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const sweep = `rb-sweep-${uid}`;
  const core = `rb-core-${uid}`;
  const glow = `rb-glow-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <radialGradient id={sweep} cx="42%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#F3FF9A" stopOpacity="0.95" />
          <stop offset="38%" stopColor="#B8FF00" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#B8FF00" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={core} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F7FFD0" />
          <stop offset="55%" stopColor="#B8FF00" />
          <stop offset="100%" stopColor="#7CB000" />
        </radialGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.35" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="32" cy="32" r="30" fill="none" stroke="#B8FF00" strokeOpacity="0.12" strokeWidth="0.6" />
      <path d="M32 32 L32 4.8 A27.2 27.2 0 0 1 58.4 26.8 Z" fill={`url(#${sweep})`} opacity="0.92" />
      <circle cx="32" cy="32" r="27.2" fill="none" stroke="#B8FF00" strokeWidth="2.35" filter={`url(#${glow})`} />
      <path
        d="M32 4.8 A27.2 27.2 0 0 1 58.4 26.8"
        fill="none"
        stroke="#E8FF7A"
        strokeWidth="2.6"
        strokeLinecap="round"
        filter={`url(#${glow})`}
      />

      <circle cx="32" cy="32" r="18.6" fill="none" stroke="#B8FF00" strokeOpacity="0.28" strokeWidth="0.7" />
      <circle cx="32" cy="32" r="10.2" fill="none" stroke="#B8FF00" strokeOpacity="0.22" strokeWidth="0.7" />
      <line x1="32" y1="5.2" x2="32" y2="58.8" stroke="#B8FF00" strokeOpacity="0.32" strokeWidth="0.7" />
      <line x1="5.2" y1="32" x2="58.8" y2="32" stroke="#B8FF00" strokeOpacity="0.32" strokeWidth="0.7" />

      <circle cx="22.5" cy="20.5" r="1.55" fill="#B8FF00" />
      <circle cx="44.5" cy="21.8" r="1.55" fill="#D4FF4D" />
      <circle cx="23.2" cy="46.2" r="1.55" fill="#B8FF00" />

      <circle cx="32" cy="32" r="3.15" fill={`url(#${core})`} filter={`url(#${glow})`} />
    </svg>
  );
}

export function BetDataLogo({
  className,
  withWordmark = true,
  version = false,
  lockup = false,
}: LogoProps) {
  return (
    <div
      role="img"
      aria-label={BRAND.name}
      className={cn(
        "flex min-w-0 items-center",
        lockup ? "gap-4 sm:gap-5" : "gap-2.5 sm:gap-3",
        className,
      )}
    >
      <RadarMark
        className={cn(
          "shrink-0 drop-shadow-[0_0_16px_rgba(184,255,0,0.4)]",
          lockup ? "h-[4.25rem] w-[4.25rem] sm:h-20 sm:w-20" : "h-10 w-10 lg:h-11 lg:w-11",
        )}
      />
      {withWordmark ? (
        <div className="min-w-0">
          <p
            className={cn(
              "flex items-baseline whitespace-nowrap leading-none",
              lockup ? "gap-2.5 sm:gap-3" : "gap-2",
            )}
          >
            <span
              className={cn(
                "font-black uppercase text-white",
                lockup
                  ? "text-[1.9rem] tracking-[0.09em] sm:text-[2.35rem]"
                  : "text-[1.18rem] tracking-[0.08em] sm:text-[1.32rem] lg:text-[1.38rem]",
              )}
            >
              RadarBet
            </span>
            <span
              className={cn(
                "font-black uppercase text-neon drop-shadow-[0_0_18px_rgba(184,255,0,0.5)]",
                lockup
                  ? "text-[1.9rem] tracking-[0.12em] sm:text-[2.35rem]"
                  : "text-[1.18rem] tracking-[0.12em] sm:text-[1.32rem] lg:text-[1.38rem]",
              )}
            >
              IA
            </span>
          </p>
          {version ? (
            <span
              className={cn(
                "mt-1 block font-mono font-medium tracking-[0.18em] text-neon/80",
                lockup ? "text-[11px]" : "text-[9px]",
              )}
            >
              {BRAND.version}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
