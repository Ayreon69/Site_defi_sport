import { METRICS, type CleanRow, type MetricKey } from "@/lib/types";

export type StepVariation = {
  personne: string;
  metricKey: MetricKey;
  metricLabel: string;
  unit: string;
  lowerIsBetter: boolean;
  fromDate: string;
  toDate: string;
  fromValue: number;
  toValue: number;
  delta: number;
};

export type GlobalRecord = {
  personne: string;
  metricKey: MetricKey;
  metricLabel: string;
  unit: string;
  value: number;
  date: string;
};

export type MetricProgressionSummary = {
  metricKey: MetricKey;
  metricLabel: string;
  unit: string;
  best: StepVariation | null;
  worst: StepVariation | null;
};

const METRIC_MAP = new Map(METRICS.map((metric) => [metric.key, metric]));

function getRealisationRows(data: CleanRow[]): CleanRow[] {
  return data.filter((row) => row.type === "realisation");
}

function getMetricValuesByPerson(data: CleanRow[], metricKey: MetricKey): Map<string, Array<{ date: string; value: number }>> {
  const grouped = new Map<string, Array<{ date: string; value: number }>>();
  const realRows = getRealisationRows(data);

  realRows.forEach((row) => {
    const raw = row[metricKey];
    if (typeof raw !== "number") return;
    if (!grouped.has(row.personne)) grouped.set(row.personne, []);
    grouped.get(row.personne)?.push({ date: row.date, value: raw });
  });

  grouped.forEach((values, person) => {
    grouped.set(
      person,
      values.slice().sort((a, b) => a.date.localeCompare(b.date))
    );
  });

  return grouped;
}

function normalizeMetricKey(metric: string): MetricKey | null {
  const key = metric as MetricKey;
  return METRIC_MAP.has(key) ? key : null;
}

function getValuesForPersonMetric(data: CleanRow[], personne: string, metricKey: MetricKey): number[] {
  return getRealisationRows(data)
    .filter((row) => row.personne === personne && typeof row[metricKey] === "number")
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => row[metricKey] as number);
}

function buildVariation(metricKey: MetricKey, person: string, from: { date: string; value: number }, to: { date: string; value: number }): StepVariation | null {
  const metric = METRIC_MAP.get(metricKey);
  if (!metric) return null;
  const lowerIsBetter = Boolean(metric.lowerIsBetter);
  const delta = lowerIsBetter ? from.value - to.value : to.value - from.value;

  return {
    personne: person,
    metricKey,
    metricLabel: metric.label,
    unit: metric.unit,
    lowerIsBetter,
    fromDate: from.date,
    toDate: to.date,
    fromValue: from.value,
    toValue: to.value,
    delta,
  };
}

export function getAllStepVariations(data: CleanRow[]): StepVariation[] {
  const output: StepVariation[] = [];

  (METRICS.map((metric) => metric.key) as MetricKey[]).forEach((metricKey) => {
    const byPerson = getMetricValuesByPerson(data, metricKey);
    byPerson.forEach((values, person) => {
      for (let i = 1; i < values.length; i += 1) {
        const variation = buildVariation(metricKey, person, values[i - 1], values[i]);
        if (variation) output.push(variation);
      }
    });
  });

  return output;
}

export function getLastStepVariations(data: CleanRow[]): StepVariation[] {
  const output: StepVariation[] = [];

  (METRICS.map((metric) => metric.key) as MetricKey[]).forEach((metricKey) => {
    const byPerson = getMetricValuesByPerson(data, metricKey);
    byPerson.forEach((values, person) => {
      if (values.length < 2) return;
      const from = values[values.length - 2];
      const to = values[values.length - 1];
      const variation = buildVariation(metricKey, person, from, to);
      if (variation) output.push(variation);
    });
  });

  return output;
}

export function findBestGlobalProgression(data: CleanRow[]): StepVariation | null {
  const all = getAllStepVariations(data);
  if (!all.length) return null;
  return all.reduce((best, current) => (current.delta > best.delta ? current : best));
}

export function findBestRecentProgression(data: CleanRow[]): StepVariation | null {
  const recent = getLastStepVariations(data);
  if (!recent.length) return null;
  return recent.reduce((best, current) => (current.delta > best.delta ? current : best));
}

export function findWorstRegression(data: CleanRow[]): StepVariation | null {
  const all = getAllStepVariations(data);
  if (!all.length) return null;
  return all.reduce((worst, current) => (current.delta < worst.delta ? current : worst));
}

export function findGlobalRecords(data: CleanRow[]): GlobalRecord[] {
  const records: GlobalRecord[] = [];
  const realRows = getRealisationRows(data);

  (METRICS.map((metric) => metric.key) as MetricKey[]).forEach((metricKey) => {
    const metric = METRIC_MAP.get(metricKey);
    if (!metric) return;

    const candidates = realRows.filter((row) => typeof row[metricKey] === "number");
    if (!candidates.length) return;

    const bestRow = candidates.reduce((best, row) => {
      const currentVal = row[metricKey] as number;
      const bestVal = best[metricKey] as number;
      if (metric.lowerIsBetter) return currentVal < bestVal ? row : best;
      return currentVal > bestVal ? row : best;
    });

    records.push({
      personne: bestRow.personne,
      metricKey,
      metricLabel: metric.label,
      unit: metric.unit,
      value: bestRow[metricKey] as number,
      date: bestRow.date,
    });
  });

  return records;
}

export function getBestAndWorstByMetric(data: CleanRow[]): MetricProgressionSummary[] {
  const all = getAllStepVariations(data);

  return (METRICS.map((metric) => metric.key) as MetricKey[]).map((metricKey) => {
    const metric = METRIC_MAP.get(metricKey);
    const scoped = all.filter((item) => item.metricKey === metricKey);

    if (!metric || !scoped.length) {
      return {
        metricKey,
        metricLabel: metric?.label ?? metricKey,
        unit: metric?.unit ?? "reps",
        best: null,
        worst: null,
      };
    }

    const best = scoped.reduce((acc, current) => (current.delta > acc.delta ? current : acc));
    const worst = scoped.reduce((acc, current) => (current.delta < acc.delta ? current : acc));

    return {
      metricKey,
      metricLabel: metric.label,
      unit: metric.unit,
      best,
      worst,
    };
  });
}

export function isTimeMetric(metrique: string): boolean {
  const metricKey = normalizeMetricKey(metrique);
  if (!metricKey) return false;
  if (metricKey === "planche_sec" || metricKey === "superman_sec") return false;
  return metricKey.endsWith("_sec");
}

export function getProgressionType(value: number, metrique: string): "positive" | "negative" | "neutral" {
  if (value === 0) return "neutral";
  if (isTimeMetric(metrique)) {
    return value < 0 ? "positive" : "negative";
  }
  return value > 0 ? "positive" : "negative";
}

export function calculateTotalProgression(data: CleanRow[], personne: string, metrique: string): number {
  const metricKey = normalizeMetricKey(metrique);
  if (!metricKey) return 0;
  const values = getValuesForPersonMetric(data, personne, metricKey);
  if (values.length < 2) return 0;
  return values[values.length - 1] - values[0];
}

export function calculateRecentProgression(data: CleanRow[], personne: string, metrique: string): number {
  const metricKey = normalizeMetricKey(metrique);
  if (!metricKey) return 0;
  const rows = getRealisationRows(data)
    .filter((row) => row.personne === personne)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!rows.length) return 0;

  const latestRow = rows[rows.length - 1];
  const latest = latestRow[metricKey];
  if (typeof latest !== "number") return 0;

  const previous = rows
    .filter((row) => row.date < latestRow.date)
    .map((row) => row[metricKey])
    .filter((value): value is number => typeof value === "number")
    .at(-1);

  if (typeof previous !== "number") return 0;
  return latest - previous;
}
