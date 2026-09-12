"use client";

import { Brain, Radio, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppTab = "hoy" | "live" | "account";

const ITEMS: { id: AppTab; label: string; icon: typeof Brain }[] = [
  { id: "hoy", label: "Hoy", icon: Brain },
  { id: "live", label: "En directo", icon: Radio },
  { id: "account", label: "Mi cuenta", icon: User },
];

type BottomNavProps = {
  value: AppTab;
  onChange: (tab: AppTab) => void;
};

export function BottomNav({ value, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1e2538] bg-[#0b0e17]/95 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-3 px-1 pb-[env(safe-area-inset-bottom)] pt-1">
        {ITEMS.map((item) => {
          const active = item.id === value;
          const live = item.id === "live";
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[11px] font-semibold leading-tight",
                active ? (live ? "text-red-400" : "text-emerald-400") : "text-zinc-500",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
