import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
        live: "border-red-500/40 bg-red-500/15 text-red-300",
        muted: "border-zinc-700 bg-zinc-800 text-zinc-300",
        signal: "border-cyan-500/40 bg-cyan-500/15 text-cyan-300",
        disconnected: "border-amber-500/40 bg-amber-500/10 text-amber-300",
        banker: "border-emerald-400/50 bg-emerald-500 text-slate-950",
        won: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
        lost: "border-red-500/30 bg-red-950/50 text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
