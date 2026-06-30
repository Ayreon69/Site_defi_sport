import type { CleanRow, MetricKey } from "@/lib/types";

export type TrendPoint = { x: number; y: number };
export type TrendGuardrails = {
  min?: number;
  max?: number;
  lowerIsBetter?: boolean;
  maxFutureImprovementPct?: number;
};

const METRIC_TREND_GUARDRAILS: Partial<Record<MetricKey, TrendGuardrails>> = {
  sprint_100m_sec: {
    min: 11.5,
    lowerIsBetter: true,
    maxFutureImprovementPct: 0.08,
  },
  run_5km_sec: {
    min: 16,
    lowerIsBetter: true,
    maxFutureImprovementPct: 0.12,
  },
};

export function getTrendGuardrails(metricKey: MetricKey): TrendGuardrails | undefined {
  return METRIC_TREND_GUARDRAILS[metricKey];
}

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

function clamp(value: number, min?: number, max?: number): number {
  const withMin = typeof min === "number" ? Math.max(value, min) : value;
  return typeof max === "number" ? Math.min(withMin, max) : withMin;
}

function applyTrendGuardrails(value: number, x: number, points: TrendPoint[], guardrails?: TrendGuardrails): number {
  if (!guardrails) return value;

  const latestPoint = points[points.length - 1];
  let guarded = clamp(value, guardrails.min, guardrails.max);

  if (latestPoint && guardrails.maxFutureImprovementPct && x > latestPoint.x) {
    const steps = x - latestPoint.x;
    const pct = guardrails.maxFutureImprovementPct;

    if (guardrails.lowerIsBetter) {
      const lowestExpected = latestPoint.y * (1 - pct) ** steps;
      guarded = Math.max(guarded, lowestExpected);
    } else {
      const highestExpected = latestPoint.y * (1 + pct) ** steps;
      guarded = Math.min(guarded, highestExpected);
    }
  }

  return clamp(guarded, guardrails.min, guardrails.max);
}

export function applyProjectionGuardrails(
  value: number,
  x: number,
  points: TrendPoint[],
  guardrails?: TrendGuardrails
): number {
  return applyTrendGuardrails(value, x, points, guardrails);
}

/**
 * Computes a linear trend for a series of dated values.
 * Null values are excluded from the regression but all dates receive a trend point.
 * Returns a Map from date string to trend value.
 */
export function computeTrendMap(
  items: Array<{ date: string; y: number | null }>,
  guardrails?: TrendGuardrails
): Map<string, number> {
  const points = items
    .map((item, index) => ({ x: index + 1, y: item.y }))
    .filter((p): p is { x: number; y: number } => typeof p.y === "number");

  if (points.length < 2) return new Map();

  const trend = linearTrend(points);
  if (!trend) return new Map();

  const { slope, intercept } = trend;
  const trendMap = new Map<string, number>();
  items.forEach((item, idx) => {
    const x = idx + 1;
    const value = slope * x + intercept;
    trendMap.set(item.date, applyTrendGuardrails(value, x, points, guardrails));
  });
  return trendMap;
}
