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
  if (lockup) {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/betdata-lockup.png"
          alt={BRAND.name}
          width={240}
          height={222}
          className="h-24 w-auto object-contain sm:h-28"
        />
        {version ? (
          <span className="font-mono text-[11px] font-medium text-emerald-400">
            {BRAND.version}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/betdata-mark.png"
        alt=""
        width={40}
        height={26}
        className="h-8 w-auto shrink-0 object-contain object-left drop-shadow-[0_0_12px_rgba(0,230,118,0.4)] lg:h-9"
      />
      {withWordmark ? (
        <p className="whitespace-nowrap text-[12px] font-black uppercase leading-none tracking-[0.12em] text-[#7CFF9A] lg:text-[13px]">
          BetData IA
          {version ? (
            <span className="ml-1.5 font-mono text-[10px] font-medium tracking-normal text-emerald-400">
              {BRAND.version}
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
