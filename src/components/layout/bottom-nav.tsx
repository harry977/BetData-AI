"use client";

import { Brain, Layers, Radio, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppTab = "hoy" | "live" | "combo" | "account";

export const NAV_ITEMS: { id: AppTab; label: string; icon: typeof Brain }[] = [
  { id: "hoy", label: "Hoy", icon: Brain },
  { id: "live", label: "Directo", icon: Radio },
  { id: "combo", label: "Combo", icon: Layers },
  { id: "account", label: "Cuenta", icon: User },
];

type BottomNavProps = {
  value: AppTab;
  onChange: (tab: AppTab) => void;
};

export function HeaderNav({ value, onChange }: BottomNavProps) {
  return (
    <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex">
      {NAV_ITEMS.map((item) => {
        const active = item.id === value;
        const live = item.id === "live";
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "whitespace-nowrap rounded-full px-1.5 py-1.5 text-[10px] font-black uppercase tracking-[0.08em]",
              active
                ? live
                  ? "bg-rose-500/15 text-rose-300"
                  : "bg-emerald-500/15 text-[#00E676]"
                : "text-gray-300 hover:bg-white/5",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function BottomNav({ value, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1e2538] bg-[#0b0e17]/95 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 px-1 pb-[env(safe-area-inset-bottom)] pt-1">
        {NAV_ITEMS.map((item) => {
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
