import { Badge } from "@/components/ui/badge";
import { BetDataLogo } from "@/components/brand/betdata-logo";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  connected: boolean;
  version?: boolean;
};

export function AppHeader({ connected, version = false }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <BetDataLogo version={version} />
        {connected ? (
          <Badge variant="default" className="gap-1.5 px-2.5 py-1">
            <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-neon" />
            Pronósticos en vivo
          </Badge>
        ) : (
          <Badge variant="disconnected" className="gap-1.5 px-2.5 py-1">
            <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-amber-400" />
            Sistema desconectado
          </Badge>
        )}
      </div>
    </header>
  );
}

export function StatusDot({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        on ? "bg-neon shadow-neon" : "bg-amber-400",
      )}
    />
  );
}
