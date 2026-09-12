import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  className?: string;
  withWordmark?: boolean;
  version?: boolean;
};

export function BetDataLogo({
  size = 32,
  className,
  withWordmark = true,
  version = false,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bd-hex" x1="4" y1="2" x2="28" y2="30">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <path
          d="M16 2.5 28 9.2v13.6L16 29.5 4 22.8V9.2L16 2.5Z"
          stroke="url(#bd-hex)"
          strokeWidth="1.6"
          fill="rgba(16,185,129,0.08)"
        />
        <rect x="9" y="18" width="3" height="6" rx="0.6" fill="#10b981" />
        <rect x="14.5" y="13" width="3" height="11" rx="0.6" fill="#34d399" />
        <rect x="20" y="10" width="3" height="14" rx="0.6" fill="#06b6d4" />
      </svg>
      {withWordmark ? (
        <div className="leading-tight">
          <p className="font-semibold tracking-tight text-zinc-50">
            {BRAND.name}
            {version ? (
              <span className="ml-1.5 font-mono text-[11px] font-medium text-emerald-400">
                {BRAND.version}
              </span>
            ) : null}
          </p>
          <p className="max-w-[140px] truncate text-[10px] uppercase tracking-[0.12em] text-zinc-500">
            {BRAND.tagline}
          </p>
        </div>
      ) : null}
    </div>
  );
}
