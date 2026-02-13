import type { CleanRow, MetricKey } from "@/lib/types";

export type TrendPoint = { x: number; y: number };

export function progressionPct(values: Array<number | null>, lowerIsBetter = false): number | null {
  const valid = values.filter((v): v is number => typeof v === "number");
  if (valid.length < 2) return null;

  const first = valid[0];
  const last = valid[valid.length - 1];
  if (first === 0) return null;

  const raw = ((last - first) / Math.abs(first)) * 100;
  return lowerIsBetter ? -raw : raw;
}

export function linearTrend(points: TrendPoint[]): { slope: number; intercept: number } | null {
  if (points.length < 2) return null;

  const n = points.length;
  const sumX = points.reduce((acc, p) => acc + p.x, 0);
  const sumY = points.reduce((acc, p) => acc + p.y, 0);
  const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
  const sumXX = points.reduce((acc, p) => acc + p.x * p.x, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function projectNextValue(rows: CleanRow[], metric: MetricKey): number | null {
  const points = rows
    .map((row, i) => ({ x: i + 1, y: row[metric] }))
    .filter((p): p is TrendPoint => typeof p.y === "number")
    .map((p) => ({ x: p.x, y: p.y as number }));

  const trend = linearTrend(points);
  if (!trend) return null;

  return trend.slope * (points.length + 1) + trend.intercept;
}

export function badgeFromProgress(progress: number | null): string | null {
  if (progress === null) return null;
  if (progress >= 20) return "amelioration rapide";
  if (progress >= 10) return "objectif atteint";
  return null;
}
