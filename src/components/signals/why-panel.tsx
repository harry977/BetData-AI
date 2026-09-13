"use client";

import { MatchSheet } from "@/components/signals/match-sheet";
import type { MatchInsight } from "@/lib/types";

export function WhyPanel({
  match,
  onClose,
}: {
  match: MatchInsight;
  onClose: () => void;
}) {
  return <MatchSheet match={match} onClose={onClose} />;
}
