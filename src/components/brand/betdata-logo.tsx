import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  withWordmark?: boolean;
  version?: boolean;
  lockup?: boolean;
};

export function BetDataLogo({
  className,
  withWordmark = true,
  version = false,
  lockup = false,
}: LogoProps) {
  void withWordmark;
  if (lockup) {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/radarbet-lockup.jpg"
          alt={BRAND.name}
          width={1080}
          height={382}
          className="h-16 w-auto max-w-[min(92vw,440px)] object-contain drop-shadow-[0_0_22px_rgba(184,255,0,0.28)] sm:h-20"
        />
        {version ? (
          <span className="font-mono text-[11px] font-medium text-neon">{BRAND.version}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/radarbet-lockup.jpg"
        alt={BRAND.name}
        width={1080}
        height={382}
        className="h-9 w-auto max-w-[min(58vw,240px)] shrink-0 object-contain object-left drop-shadow-[0_0_16px_rgba(184,255,0,0.32)] sm:h-10 lg:h-11"
      />
      {version ? (
        <span className="hidden font-mono text-[10px] font-medium tracking-normal text-neon sm:inline">
          {BRAND.version}
        </span>
      ) : null}
    </div>
  );
}
