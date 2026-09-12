import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatOdds(value: number) {
  return `@${value.toFixed(2)}`;
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function isEmailOrUserId(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 3) return false;
  if (trimmed.includes("@")) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }
  return /^[a-zA-Z0-9._-]{3,64}$/.test(trimmed);
}
