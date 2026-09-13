"use client";

import { useEffect, useState } from "react";
import type { Team } from "@/lib/types";
import { cn } from "@/lib/utils";

type TeamCrestProps = {
  team: Team;
  size?: number;
  className?: string;
};

export function TeamCrest({ team, size = 22, className }: TeamCrestProps) {
  const premium = team.id > 0 ? `/api/crest/team/${team.id}` : "";
  const [src, setSrc] = useState(team.logo || premium);

  useEffect(() => {
    setSrc(team.logo || premium);
  }, [team.id, team.logo, premium]);

  if (!src) {
    return <CrestFallback team={team} size={size} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={team.name}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full bg-white object-contain p-0.5", className)}
      onError={() => {
        if (premium && src !== premium) {
          setSrc(premium);
          return;
        }
        setSrc("");
      }}
    />
  );
}

function CrestFallback({
  team,
  size,
  className,
}: {
  team: Team;
  size: number;
  className?: string;
}) {
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
