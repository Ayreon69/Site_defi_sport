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

function buildRowsIndex(data: CleanRow[], type: "realisation" | "previsionnel"): Map<string, CleanRow[]> {
  const index = new Map<string, CleanRow[]>();

  data.forEach((row) => {
    if (row.type !== type) return;
    if (!index.has(row.personne)) index.set(row.personne, []);
    index.get(row.personne)?.push(row);
  });

  index.forEach((rows, person) => {
    index.set(
      person,
      rows.slice().sort((a, b) => a.date.localeCompare(b.date))
    );
  });

  return index;
}

function getRowsByPerson(data: CleanRow[], personne: string): CleanRow[] {
  return getRealRows(data)
    .filter((row) => row.personne === personne)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getMetricValues(rows: CleanRow[], metricKey: MetricKey): number[] {
  return rows.map((row) => row[metricKey]).filter((value): value is number => typeof value === "number");
}

function getLatestMetricValue(rows: CleanRow[], metricKey: MetricKey): number | null {
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const value = rows[i][metricKey];
    if (typeof value === "number") return value;
  }
  return null;
}

function progressionPct(first: number, last: number, lowerIsBetter: boolean): number {
  if (first === 0) return 0;
  const raw = ((last - first) / Math.abs(first)) * 100;
  return lowerIsBetter ? -raw : raw;
}

function listMetricStatsFromRows(rows: CleanRow[]): MetricStat[] {
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

function calculateGlobalEvolutionScoreFromRows(rows: CleanRow[]): number | null {
  const stats = listMetricStatsFromRows(rows);
  if (!stats.length) return null;
  const avg = stats.reduce((acc, stat) => acc + stat.progressPct, 0) / stats.length;
  return Number(clamp(avg, -100, 100).toFixed(1));
}

export function calculateGlobalEvolutionScore(data: CleanRow[], personne: string): number {
  const rows = getRowsByPerson(data, personne);
  const score = calculateGlobalEvolutionScoreFromRows(rows);
  return score ?? 0;
}

export function calculateRecentMomentum(data: CleanRow[], personne: string): number {
  const rows = getRowsByPerson(data, personne);
  return calculateRecentMomentumFromRows(rows);
}

function calculateRecentMomentumFromRows(rows: CleanRow[]): number {
  if (!rows.length) return 0;

  const latestRow = rows[rows.length - 1];
  const recentValues: number[] = [];

  (METRICS.map((metric) => metric.key) as MetricKey[]).forEach((metricKey) => {
    const metricMeta = METRIC_MAP.get(metricKey);
    if (!metricMeta) return;

    const latest = latestRow[metricKey];
    if (typeof latest !== "number") return;

    let previous: number | null = null;
    for (let i = rows.length - 2; i >= 0; i -= 1) {
      const value = rows[i][metricKey];
      if (typeof value === "number") {
        previous = value;
        break;
      }
    }

    if (previous === null) return;
    const pct = progressionPct(previous, latest, Boolean(metricMeta.lowerIsBetter));
    recentValues.push(pct);
  });

  if (!recentValues.length) return 0;
  const avg = recentValues.reduce((acc, value) => acc + value, 0) / recentValues.length;
  return Number(avg.toFixed(1));
}

export function detectImprovementZone(data: CleanRow[], personne: string): string[] {
  const rows = getRowsByPerson(data, personne);
  const stats = listMetricStatsFromRows(rows)
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
  const realIndex = buildRowsIndex(data, "realisation");
  const previsionIndex = buildRowsIndex(data, "previsionnel");

  let positiveRecentCount = 0;
  const progressions: number[] = [];
  let goalsReached = 0;

  realIndex.forEach((realRowsPerson, personne) => {
    const stats = listMetricStatsFromRows(realRowsPerson);
    stats.forEach((stat) => {
      progressions.push(stat.progressPct);
      if ((stat.recentPct ?? 0) > 0) positiveRecentCount += 1;
    });

    const previsionRowsPerson = previsionIndex.get(personne) ?? [];

    (METRICS.map((metric) => metric.key) as MetricKey[]).forEach((metricKey) => {
      const metric = METRIC_MAP.get(metricKey);
      if (!metric) return;

      const latestReal = getLatestMetricValue(realRowsPerson, metricKey);
      const target = getLatestMetricValue(previsionRowsPerson, metricKey);
      if (latestReal === null || target === null) return;

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

function buildPersonEvolutionSeriesFromRows(rows: CleanRow[]): Array<{ date: string; score: number }> {
  const dates = Array.from(new Set(rows.map((row) => row.date))).sort((a, b) => a.localeCompare(b));
  const scopedRows: CleanRow[] = [];
  const series: Array<{ date: string; score: number }> = [];
  let cursor = 0;

  dates.forEach((date) => {
    while (cursor < rows.length && rows[cursor].date <= date) {
      scopedRows.push(rows[cursor]);
      cursor += 1;
    }

    const score = calculateGlobalEvolutionScoreFromRows(scopedRows);
    if (score !== null) {
      series.push({ date, score });
    }
  });

  return series;
}

export function buildGroupAverageSeries(data: CleanRow[]): Array<{ date: string; score: number }> {
  const realRows = getRealRows(data);
  const realIndex = buildRowsIndex(data, "realisation");

  const dates = Array.from(new Set(realRows.map((row) => row.date))).sort((a, b) => a.localeCompare(b));
  const personSeries = new Map<string, Array<{ date: string; score: number }>>();
  const personCursor = new Map<string, number>();

  realIndex.forEach((rows, person) => {
    personSeries.set(person, buildPersonEvolutionSeriesFromRows(rows));
    personCursor.set(person, 0);
  });

  return dates.map((date) => {
    const scores: number[] = [];

    personSeries.forEach((series, person) => {
      let idx = personCursor.get(person) ?? 0;
      while (idx < series.length && series[idx].date <= date) {
        idx += 1;
      }
      personCursor.set(person, idx);
      if (idx > 0) scores.push(series[idx - 1].score);
    });

    const score = scores.length ? scores.reduce((acc, s) => acc + s, 0) / scores.length : 0;
    return { date, score: Number(score.toFixed(1)) };
  });
}

export function buildPersonEvolutionSeries(data: CleanRow[], personne: string): Array<{ date: string; score: number }> {
  const rows = getRowsByPerson(data, personne);
  return buildPersonEvolutionSeriesFromRows(rows);
}

export function calculatePersonalTotalVariation(data: CleanRow[], personne: string): number {
  const series = buildPersonEvolutionSeries(data, personne);
  if (series.length < 2) return 0;
  return Number((series[series.length - 1].score - series[0].score).toFixed(1));
}

export function listPersonSummaries(data: CleanRow[]): PersonEvolutionSummary[] {
  const realIndex = buildRowsIndex(data, "realisation");
  const people = Array.from(realIndex.keys()).sort((a, b) => a.localeCompare(b));

  return people.map((personne) => {
    const rows = realIndex.get(personne) ?? [];
    const score = calculateGlobalEvolutionScoreFromRows(rows) ?? 0;
    const recentMomentum = calculateRecentMomentumFromRows(rows);
    return {
      personne,
      score,
      recentMomentum,
      badge: getPersonBadge(recentMomentum),
    };
  });
}
