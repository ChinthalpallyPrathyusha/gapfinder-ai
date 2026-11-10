import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(val: number): string {
  return `${Math.round(val)}%`;
}

export function getStatusColor(status: "weak" | "medium" | "strong" | "no_data"): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  label: string;
} {
  switch (status) {
    case "weak":
      return {
        bg: "bg-red-50 dark:bg-red-950/40",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-200 dark:border-red-800/60",
        dot: "bg-red-500",
        label: "Weak Gap (<50%)",
      };
    case "medium":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/40",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-800/60",
        dot: "bg-amber-500",
        label: "Moderate (50-74%)",
      };
    case "strong":
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-800/60",
        dot: "bg-emerald-500",
        label: "Mastered (≥75%)",
      };
    case "no_data":
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-900/40",
        text: "text-gray-600 dark:text-gray-400",
        border: "border-gray-200 dark:border-gray-800",
        dot: "bg-gray-400",
        label: "Needs Data (<2 Qs)",
      };
  }
}
