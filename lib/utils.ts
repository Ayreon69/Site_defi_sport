import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MetricKey } from "@/lib/types";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

export function formatMetric(value: number | null, unit: string): string {
  if (value === null || Number.isNaN(value)) return "-";
  if (unit === "sec") return `${value.toFixed(1)} s`;
  if (unit === "min") {
    const totalSeconds = Math.round(value * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes <= 0) return `${seconds}s`;
    return `${minutes}m${seconds.toString().padStart(2, "0")}`;
  }
  if (unit === "kg") return `${value.toFixed(1)} kg`;
  return `${value.toFixed(0)}`;
}

export function toDisplayMetricValue(metricKey: MetricKey, value: number | null): number | null {
  if (value === null || Number.isNaN(value)) return null;
  if (metricKey === "planche_sec" || metricKey === "superman_sec") return value / 60;
  if (metricKey === "run_5km_sec") return value / 60;
  return value;
}

export function formatMonth(iso: string): string {
  const [year, month, day] = iso.split("-").map((v) => Number(v));
  const dt = new Date(Date.UTC(year, (month || 1) - 1, day || 1));
  return dt.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}
