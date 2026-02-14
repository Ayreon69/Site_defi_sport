import { METRICS, type CleanRow, type MetricKey } from "@/lib/types";

type MetricStat = {
  metricKey: MetricKey;
  first: number;
  last: number;
  previous: number | null;
  progressPct: number;
  recentPct: number | null;
};

export type PersonEvolutionSummary = {
  personne: string;
  score: number;
  recentMomentum: number;
  badge: "Acceleration" | "Stable" | "Phase d'ajustement";
};

export type GroupKpis = {
  positiveRecentCount: number;
  averageProgressionPct: number;
  goalsReached: number;
};

const METRIC_MAP = new Map(METRICS.map((metric) => [metric.key, metric]));

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getRealRows(data: CleanRow[]): CleanRow[] {
  return data.filter((row) => row.type === "realisation");
}

function getRowsByPerson(data: CleanRow[], personne: string): CleanRow[] {
  return getRealRows(data)
    .filter((row) => row.personne === personne)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getLatestRowByPerson(data: CleanRow[], personne: string): CleanRow | null {
  const rows = getRowsByPerson(data, personne);
  if (!rows.length) return null;
  return rows[rows.length - 1];
}

function getMetricValues(rows: CleanRow[], metricKey: MetricKey): number[] {
  return rows.map((row) => row[metricKey]).filter((value): value is number => typeof value === "number");
}

function progressionPct(first: number, last: number, lowerIsBetter: boolean): number {
  if (first === 0) return 0;
  const raw = ((last - first) / Math.abs(first)) * 100;
  return lowerIsBetter ? -raw : raw;
}

function listMetricStats(data: CleanRow[], personne: string): MetricStat[] {
  const rows = getRowsByPerson(data, personne);

  return (METRICS.map((metric) => metric.key) as MetricKey[])
    .map((metricKey) => {
      const metric = METRIC_MAP.get(metricKey);
      if (!metric) return null;

      const values = getMetricValues(rows, metricKey);
      if (values.length < 2) return null;

      const first = values[0];
      const last = values[values.length - 1];
      const previous = values.length > 1 ? values[values.length - 2] : null;

      return {
        metricKey,
        first,
        last,
        previous,
        progressPct: progressionPct(first, last, Boolean(metric.lowerIsBetter)),
        recentPct: previous === null ? null : progressionPct(previous, last, Boolean(metric.lowerIsBetter)),
      } satisfies MetricStat;
    })
    .filter((item): item is MetricStat => item !== null);
}

export function calculateGlobalEvolutionScore(data: CleanRow[], personne: string): number {
  const stats = listMetricStats(data, personne);
  if (!stats.length) return 0;
  const avg = stats.reduce((acc, stat) => acc + stat.progressPct, 0) / stats.length;
  return Number(clamp(avg, -100, 100).toFixed(1));
}

function calculateGlobalEvolutionScoreNullable(data: CleanRow[], personne: string): number | null {
  const stats = listMetricStats(data, personne);
  if (!stats.length) return null;
  const avg = stats.reduce((acc, stat) => acc + stat.progressPct, 0) / stats.length;
  return Number(clamp(avg, -100, 100).toFixed(1));
}

export function calculateGroupAverageScore(data: CleanRow[]): number {
  const people = Array.from(new Set(getRealRows(data).map((row) => row.personne)));
  if (!people.length) return 0;
  const scores = people.map((person) => calculateGlobalEvolutionScore(data, person));
  const avg = scores.reduce((acc, score) => acc + score, 0) / scores.length;
  return Number(avg.toFixed(1));
}

export function calculateRecentMomentum(data: CleanRow[], personne: string): number {
  const rows = getRowsByPerson(data, personne);
  const latestRow = getLatestRowByPerson(data, personne);
  if (!rows.length || !latestRow) return 0;

  const recentValues: number[] = [];

  (METRICS.map((metric) => metric.key) as MetricKey[]).forEach((metricKey) => {
    const metricMeta = METRIC_MAP.get(metricKey);
    if (!metricMeta) return;

    const latest = latestRow[metricKey];
    if (typeof latest !== "number") return;

    const previous = rows
      .filter((row) => row.date < latestRow.date)
      .map((row) => row[metricKey])
      .filter((value): value is number => typeof value === "number")
      .at(-1);

    if (typeof previous !== "number") return;
    const pct = progressionPct(previous, latest, Boolean(metricMeta.lowerIsBetter));
    recentValues.push(pct);
  });

  if (!recentValues.length) return 0;
  const avg = recentValues.reduce((acc, value) => acc + value, 0) / recentValues.length;
  return Number(avg.toFixed(1));
}

export function detectImprovementZone(data: CleanRow[], personne: string): string[] {
  const stats = listMetricStats(data, personne)
    .filter((stat) => stat.progressPct < 0)
    .sort((a, b) => a.progressPct - b.progressPct)
    .slice(0, 3);

  return stats.map((stat) => METRIC_MAP.get(stat.metricKey)?.label ?? stat.metricKey);
}

export function getPersonBadge(momentum: number): "Acceleration" | "Stable" | "Phase d'ajustement" {
  if (momentum > 2) return "Acceleration";
  if (momentum < -2) return "Phase d'ajustement";
  return "Stable";
}

export function getGroupKpis(data: CleanRow[]): GroupKpis {
  const realRows = getRealRows(data);
  const people = Array.from(new Set(realRows.map((row) => row.personne)));

  let positiveRecentCount = 0;
  let progressions: number[] = [];
  let goalsReached = 0;

  people.forEach((personne) => {
    const stats = listMetricStats(data, personne);
    stats.forEach((stat) => {
      progressions.push(stat.progressPct);
      if ((stat.recentPct ?? 0) > 0) positiveRecentCount += 1;
    });

    const realByMetric = new Map<MetricKey, number>();
    const previsionByMetric = new Map<MetricKey, number>();

    const realRowsPerson = data
      .filter((row) => row.personne === personne && row.type === "realisation")
      .sort((a, b) => a.date.localeCompare(b.date));
    const previsionRowsPerson = data
      .filter((row) => row.personne === personne && row.type === "previsionnel")
      .sort((a, b) => a.date.localeCompare(b.date));

    (METRICS.map((metric) => metric.key) as MetricKey[]).forEach((metricKey) => {
      const metric = METRIC_MAP.get(metricKey);
      if (!metric) return;

      const latestReal = realRowsPerson.map((row) => row[metricKey]).filter((v): v is number => typeof v === "number").at(-1);
      const target = previsionRowsPerson.map((row) => row[metricKey]).filter((v): v is number => typeof v === "number").at(-1);
      if (typeof latestReal !== "number" || typeof target !== "number") return;

      realByMetric.set(metricKey, latestReal);
      previsionByMetric.set(metricKey, target);
      const reached = metric.lowerIsBetter ? latestReal <= target : latestReal >= target;
      if (reached) goalsReached += 1;
    });
  });

  const averageProgressionPct = progressions.length ? progressions.reduce((acc, value) => acc + value, 0) / progressions.length : 0;

  return {
    positiveRecentCount,
    averageProgressionPct: Number(averageProgressionPct.toFixed(1)),
    goalsReached,
  };
}

export function buildGroupAverageSeries(data: CleanRow[]): Array<{ date: string; score: number }> {
  const realRows = getRealRows(data);
  const people = Array.from(new Set(realRows.map((row) => row.personne)));

  const dates = Array.from(new Set(realRows.map((row) => row.date))).sort((a, b) => a.localeCompare(b));
  return dates.map((date) => {
    const scoped = data.filter((row) => row.date <= date);
    const scores = people.map((person) => calculateGlobalEvolutionScore(scoped, person)).filter((score) => !Number.isNaN(score));
    const score = scores.length ? scores.reduce((acc, s) => acc + s, 0) / scores.length : 0;
    return { date, score: Number(score.toFixed(1)) };
  });
}

export function buildPersonEvolutionSeries(data: CleanRow[], personne: string): Array<{ date: string; score: number }> {
  const dates = Array.from(new Set(getRowsByPerson(data, personne).map((row) => row.date))).sort((a, b) => a.localeCompare(b));
  return dates
    .map((date) => {
    const scoped = data.filter((row) => row.personne === personne && row.date <= date);
    const score = calculateGlobalEvolutionScoreNullable(scoped, personne);
    return score === null ? null : { date, score };
  })
    .filter((point): point is { date: string; score: number } => point !== null);
}

export function calculatePersonalTotalVariation(data: CleanRow[], personne: string): number {
  const series = buildPersonEvolutionSeries(data, personne);
  if (series.length < 2) return 0;
  return Number((series[series.length - 1].score - series[0].score).toFixed(1));
}

export function calculatePersonalRecentVariation(data: CleanRow[], personne: string): number {
  const series = buildPersonEvolutionSeries(data, personne);
  if (series.length < 2) return 0;
  return Number((series[series.length - 1].score - series[series.length - 2].score).toFixed(1));
}

export function listPersonSummaries(data: CleanRow[]): PersonEvolutionSummary[] {
  const people = Array.from(new Set(getRealRows(data).map((row) => row.personne))).sort((a, b) => a.localeCompare(b));
  return people.map((personne) => {
    const score = calculateGlobalEvolutionScore(data, personne);
    const recentMomentum = calculateRecentMomentum(data, personne);
    return {
      personne,
      score,
      recentMomentum,
      badge: getPersonBadge(recentMomentum),
    };
  });
}
