"use client";

import { Shield, Trophy, User, Zap } from "lucide-react";
import { FootballIcon } from "@/components/brand/football-icon";
import { cn } from "@/lib/utils";

export type AppTab = "bankers" | "partidos" | "builder" | "account" | "activar";

const ITEMS: { id: AppTab; label: string; icon: typeof Trophy | "football" }[] = [
  { id: "bankers", label: "Bankers", icon: Trophy },
  { id: "partidos", label: "Partidos", icon: "football" },
  { id: "builder", label: "Bet Builder", icon: Zap },
  { id: "account", label: "Mi Cuenta", icon: User },
  { id: "activar", label: "Activar", icon: Shield },
];

type BottomNavProps = {
  value: AppTab;
  onChange: (tab: AppTab) => void;
};

export function BottomNav({ value, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1e2538] bg-[#0b0e17]/95 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)] pt-1">
        {ITEMS.map((item) => {
          const active = item.id === value;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[9px] font-semibold leading-tight",
                active ? "text-emerald-400" : "text-zinc-500",
              )}
            >
              {item.icon === "football" ? (
                <FootballIcon className="h-5 w-5" />
              ) : (
                <item.icon className="h-5 w-5" />
              )}
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
