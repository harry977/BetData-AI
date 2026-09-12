"use client";

import { useState } from "react";
import type { Team } from "@/lib/types";
import { cn } from "@/lib/utils";

type TeamCrestProps = {
  team: Team;
  size?: number;
  className?: string;
};

export function TeamCrest({ team, size = 22, className }: TeamCrestProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white",
          className,
        )}
        style={{
          width: size,
          height: size,
          background: team.colors[0],
        }}
      >
        {team.code.slice(0, 3)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={team.logo}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full bg-white object-contain p-0.5", className)}
      onError={() => setFailed(true)}
    />
  );
}
