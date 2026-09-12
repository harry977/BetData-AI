import { cn } from "@/lib/utils";

export function LivePulse({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex h-3 w-3", className)} aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
    </span>
  );
}
