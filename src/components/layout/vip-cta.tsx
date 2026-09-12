"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OFFICIAL_SERVER_URL } from "@/lib/constants";
import { hapticTap, openExternal } from "@/lib/telegram";

export function VipCta({ compact = false }: { compact?: boolean }) {
  return (
    <Button
      size={compact ? "default" : "lg"}
      variant={compact ? "outline" : "default"}
      className="w-full"
      onClick={() => {
        hapticTap();
        openExternal(OFFICIAL_SERVER_URL);
      }}
    >
      Canal VIP
      <ExternalLink className="h-4 w-4" />
    </Button>
  );
}
