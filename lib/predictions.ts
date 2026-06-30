import { applyProjectionGuardrails, getTrendGuardrails, linearTrend } from "./analytics.ts";
import { METRICS, type CleanRow, type MetricKey } from "./types.ts";
import { toDisplayMetricValue } from "./utils.ts";

export type PredictionRisk = "on_track" | "watch" | "at_risk";

export type MetricPrediction = {
  metricKey: MetricKey;
  metricLabel: string;
  unit: string;
  currentValue: number;
  targetValue: number | null;
  predictedNextValue: number;
  confidence: number;
  gapToTargetPct: number | null;
  risk: PredictionRisk;
  recommendation: string;
};

export type PersonPredictionSummary = {
  personne: string;
  predictions: MetricPrediction[];
  confidence: number;
  onTrackCount: number;
  atRiskCount: number;
  topRisk: MetricPrediction | null;
};

export type GroupPredictionSummary = {
  profilesAnalyzed: number;
  averageConfidence: number;
  onTrackRate: number;
  atRiskCount: number;
  topRisks: Array<MetricPrediction & { personne: string }>;
};

const MIN_POINTS = 3;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getOrderedRows(rows: CleanRow[], type: CleanRow["type"]): CleanRow[] {
  return rows.filter((row) => row.type === type).sort((a, b) => a.date.localeCompare(b.date));
}

function getDisplayValue(row: CleanRow, metricKey: MetricKey): number | null {
  return toDisplayMetricValue(metricKey, row[metricKey] as number | null);
}

function scoreDirection(metricKey: MetricKey, from: number, to: number): number {
  const metric = METRICS.find((item) => item.key === metricKey);
  return metric?.lowerIsBetter ? from - to : to - from;
}

function computeR2(points: Array<{ x: number; y: number }>, slope: number, intercept: number): number {
  const mean = points.reduce((acc, point) => acc + point.y, 0) / points.length;
  const total = points.reduce((acc, point) => acc + (point.y - mean) ** 2, 0);
  if (total === 0) return 0.85;
  const residual = points.reduce((acc, point) => {
    const predicted = slope * point.x + intercept;
    return acc + (point.y - predicted) ** 2;
  }, 0);
  return clamp(1 - residual / total, 0, 1);
}

function classifyRisk(params: {
  metricKey: MetricKey;
  currentValue: number;
  targetValue: number | null;
  predictedNextValue: number;
  confidence: number;
}): PredictionRisk {
  const { metricKey, currentValue, targetValue, predictedNextValue, confidence } = params;
  if (targetValue === null) return confidence >= 62 ? "watch" : "at_risk";

  const currentGap = scoreDirection(metricKey, currentValue, targetValue);
  const projectedGap = scoreDirection(metricKey, predictedNextValue, targetValue);
  if (projectedGap >= 0) return "on_track";
  if (projectedGap > currentGap || confidence >= 70) return "watch";
  return "at_risk";
}

function buildRecommendation(metricLabel: string, risk: PredictionRisk, confidence: number): string {
  if (risk === "on_track") {
    return `${metricLabel}: trajectoire compatible avec l'objectif, maintenir le rythme.`;
  }
  if (risk === "watch") {
    return `${metricLabel}: progression probable mais fragile, ajouter un suivi hebdomadaire.`;
  }
  if (confidence < 55) {
    return `${metricLabel}: signal instable, collecter plus de points avant decision forte.`;
  }
  return `${metricLabel}: risque de retard, prioriser cette competence au prochain cycle.`;
}

function buildMetricPrediction(
  realRows: CleanRow[],
  targetRow: CleanRow | null,
  metricKey: MetricKey
): MetricPrediction | null {
  const metric = METRICS.find((item) => item.key === metricKey);
  if (!metric) return null;

  const points = realRows
    .map((row, index) => ({ x: index + 1, y: getDisplayValue(row, metricKey) }))
    .filter((point): point is { x: number; y: number } => typeof point.y === "number");

  if (points.length < MIN_POINTS) return null;

  const trend = linearTrend(points);
  if (!trend) return null;

  const currentValue = points[points.length - 1].y;
  const targetValue = targetRow ? getDisplayValue(targetRow, metricKey) : null;
  const nextX = points.length + 1;
  const rawPredictedNextValue = trend.slope * nextX + trend.intercept;
  const predictedNextValue = Number(
    applyProjectionGuardrails(rawPredictedNextValue, nextX, points, getTrendGuardrails(metricKey)).toFixed(2)
  );
  const r2 = computeR2(points, trend.slope, trend.intercept);
  const sampleBoost = clamp(points.length / 6, 0.45, 1);
  const confidence = Math.round(clamp((r2 * 0.7 + sampleBoost * 0.3) * 100, 20, 95));
  const gapToTargetPct =
    targetValue === null || targetValue === 0
      ? null
      : Number(((scoreDirection(metricKey, targetValue, predictedNextValue) / Math.abs(targetValue)) * 100).toFixed(1));
  const risk = classifyRisk({ metricKey, currentValue, targetValue, predictedNextValue, confidence });

  return {
    metricKey,
    metricLabel: metric.label,
    unit: metric.unit,
    currentValue,
    targetValue,
    predictedNextValue,
    confidence,
    gapToTargetPct,
    risk,
    recommendation: buildRecommendation(metric.label, risk, confidence),
  };
}

export function buildPersonPredictionSummary(rows: CleanRow[], personne: string): PersonPredictionSummary {
  const personRows = rows.filter((row) => row.personne === personne);
  const realRows = getOrderedRows(personRows, "realisation");
  const targetRow = getOrderedRows(personRows, "previsionnel").at(-1) ?? null;
  const predictions = METRICS.map((metric) => buildMetricPrediction(realRows, targetRow, metric.key)).filter(
    (item): item is MetricPrediction => item !== null
  );
  const confidence = predictions.length
    ? Math.round(predictions.reduce((acc, item) => acc + item.confidence, 0) / predictions.length)
    : 0;
  const onTrackCount = predictions.filter((item) => item.risk === "on_track").length;
  const atRiskCount = predictions.filter((item) => item.risk === "at_risk").length;
  const topRisk =
    predictions
      .filter((item) => item.risk !== "on_track")
      .sort((a, b) => {
        const aGap = a.gapToTargetPct ?? -100;
        const bGap = b.gapToTargetPct ?? -100;
        return aGap - bGap;
      })[0] ?? null;

  return { personne, predictions, confidence, onTrackCount, atRiskCount, topRisk };
}

export function buildGroupPredictionSummary(rows: CleanRow[]): GroupPredictionSummary {
  const people = Array.from(new Set(rows.map((row) => row.personne))).sort((a, b) => a.localeCompare(b));
  const summaries = people.map((personne) => buildPersonPredictionSummary(rows, personne));
  const usable = summaries.filter((summary) => summary.predictions.length > 0);
  const predictions = usable.flatMap((summary) =>
    summary.predictions.map((prediction) => ({ ...prediction, personne: summary.personne }))
  );

  const averageConfidence = usable.length
    ? Math.round(usable.reduce((acc, summary) => acc + summary.confidence, 0) / usable.length)
    : 0;
  const onTrackRate = predictions.length
    ? Math.round((predictions.filter((item) => item.risk === "on_track").length / predictions.length) * 100)
    : 0;
  const atRiskCount = predictions.filter((item) => item.risk === "at_risk").length;
  const topRisks = predictions
    .filter((item) => item.risk !== "on_track")
    .sort((a, b) => (a.gapToTargetPct ?? -100) - (b.gapToTargetPct ?? -100))
    .slice(0, 4);

  return {
    profilesAnalyzed: usable.length,
    averageConfidence,
    onTrackRate,
    atRiskCount,
    topRisks,
  };
}
