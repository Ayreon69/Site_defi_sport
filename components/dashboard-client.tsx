"use client";

import { useMemo, useState } from "react";

import { MetricChart } from "@/components/metric-chart";
import { PeopleTable } from "@/components/people-table";
import { filterRows, getPersonGage } from "@/lib/data";
import { getBestAndWorstByMetric, type StepVariation } from "@/lib/challengeStats";
import { METRICS, type CleanRow, type DataType, type MetricKey } from "@/lib/types";
import { formatMetric, formatMonth, toDisplayMetricValue } from "@/lib/utils";

type Props = {
  rows: CleanRow[];
  people: string[];
};

function formatVariationValue(variation: StepVariation | null): string {
  if (!variation) return "-";
  const fromDisplay = toDisplayMetricValue(variation.metricKey, variation.fromValue) ?? 0;
  const toDisplay = toDisplayMetricValue(variation.metricKey, variation.toValue) ?? 0;
  const rawTransitionDelta = toDisplay - fromDisplay;
  const absoluteDisplay = Math.abs(rawTransitionDelta);
  const sign = rawTransitionDelta >= 0 ? "+" : "-";
  return `${sign}${formatMetric(absoluteDisplay, variation.unit)}`;
}

function formatVariationPeriod(variation: StepVariation | null): string {
  if (!variation) return "Periode indisponible";
  return `${formatMonth(variation.fromDate)} -> ${formatMonth(variation.toDate)}`;
}

export function DashboardClient({ rows, people }: Props) {
  const [selectedPerson, setSelectedPerson] = useState<string>(people[0] ?? "");
  const [types, setTypes] = useState<DataType[]>(["realisation", "previsionnel"]);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const selectedGage = selectedPerson ? getPersonGage(selectedPerson) : null;

  const filtered = useMemo(
    () =>
      filterRows({
        rows,
        people: selectedPerson ? [selectedPerson] : [],
        types,
        from: from || undefined,
        to: to || undefined,
      }),
    [rows, selectedPerson, types, from, to]
  );

  const challengeScope = useMemo(
    () =>
      filterRows({
        rows,
        people: [],
        types: ["realisation"],
        from: from || undefined,
        to: to || undefined,
      }),
    [rows, from, to]
  );

  const progressionByMetric = useMemo(() => getBestAndWorstByMetric(challengeScope), [challengeScope]);

  const summaryRows = useMemo(() => {
    return METRICS.map((metric) => {
      const realValues = filtered
        .filter((r) => r.type === "realisation" && r[metric.key] !== null)
        .sort((a, b) => a.date.localeCompare(b.date));
      const forecastValues = filtered
        .filter((r) => r.type === "previsionnel" && r[metric.key] !== null)
        .sort((a, b) => a.date.localeCompare(b.date));

      const initialRaw = (realValues.at(0)?.[metric.key] as number | null | undefined) ?? null;
      const latestRaw = (realValues.at(-1)?.[metric.key] as number | null | undefined) ?? null;
      const objectiveRaw = (forecastValues.at(-1)?.[metric.key] as number | null | undefined) ?? null;

      return {
        key: metric.key,
        label: metric.label,
        unit: metric.unit,
        initial: toDisplayMetricValue(metric.key, initialRaw),
        latest: toDisplayMetricValue(metric.key, latestRaw),
        objective: toDisplayMetricValue(metric.key, objectiveRaw),
      };
    });
  }, [filtered]);

  const charts = useMemo(() => {
    return METRICS.map((metric) => {
      const grouped = new Map<string, { date: string; realisation: number | null; previsionnel: number | null }>();

      filtered.forEach((row) => {
        if (!grouped.has(row.date)) {
          grouped.set(row.date, { date: row.date, realisation: null, previsionnel: null });
        }
        const target = grouped.get(row.date);
        if (!target) return;
        const rawValue = row[metric.key] as number | null;
        const displayValue = toDisplayMetricValue(metric.key, rawValue);
        if (row.type === "realisation") target.realisation = displayValue;
        if (row.type === "previsionnel") target.previsionnel = displayValue;
      });

      return {
        metric,
        data: Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date)),
      };
    });
  }, [filtered]);

  const toggleType = (type: DataType) => {
    setTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  return (
    <main className="container-shell py-8">
      <section className="mb-6 rounded-xl2 bg-card p-5 shadow-soft">
        <h1 className="font-display text-2xl font-semibold">Sport Performance Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Vue par athlete avec synthese lisible et objectifs par exercice.</p>

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 block text-muted">Athlete (selection unique)</span>
            <select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
              {people.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Debut</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Fin</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
          </label>
          <div>
            <span className="mb-1 block text-sm text-muted">Type</span>
            <div className="flex gap-2">
              <button onClick={() => toggleType("realisation")} className={`rounded-lg px-3 py-2 text-sm ${types.includes("realisation") ? "bg-accent text-white" : "bg-slate-100"}`}>
                Realisation
              </button>
              <button onClick={() => toggleType("previsionnel")} className={`rounded-lg px-3 py-2 text-sm ${types.includes("previsionnel") ? "bg-accent text-white" : "bg-slate-100"}`}>
                Previsionnel
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-3">
          <h2 className="font-display text-xl font-semibold text-ink">Resume du Defi par epreuve</h2>
          <p className="text-sm text-muted">Meilleure progression et pire regression sur les transitions mensuelles consecutives.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {progressionByMetric.map((metricSummary) => (
            <article key={metricSummary.metricKey} className="rounded-2xl bg-card p-5 shadow-lg">
              <h3 className="mb-4 font-display text-lg font-semibold text-ink">{metricSummary.metricLabel}</h3>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Meilleure progression</p>
                <p className="mt-1 text-sm text-slate-800">{metricSummary.best?.personne ?? "Aucune donnee"}</p>
                <p className="text-xl font-semibold text-emerald-700">{formatVariationValue(metricSummary.best)}</p>
                <p className="text-xs text-slate-600">{formatVariationPeriod(metricSummary.best)}</p>
              </div>

              <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-red-700">Pire regression</p>
                <p className="mt-1 text-sm text-slate-800">{metricSummary.worst?.personne ?? "Aucune donnee"}</p>
                <p className="text-xl font-semibold text-red-700">{formatVariationValue(metricSummary.worst)}</p>
                <p className="text-xs text-slate-600">{formatVariationPeriod(metricSummary.worst)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-xl2 bg-card p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Synthese des exercices</h2>
          <span className="text-xs text-muted">Initial | Dernier resultat | Objectif</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4">Exercice</th>
                <th className="py-2 pr-4">Initial</th>
                <th className="py-2 pr-4">Dernier resultat</th>
                <th className="py-2 pr-4">Objectif</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((row) => (
                <tr key={row.key} className="border-b border-slate-50 last:border-b-0">
                  <td className="py-2 pr-4 font-medium text-ink">{row.label}</td>
                  <td className="py-2 pr-4 text-slate-700">{formatMetric(row.initial, row.unit)}</td>
                  <td className="py-2 pr-4 text-slate-700">{formatMetric(row.latest, row.unit)}</td>
                  <td className="py-2 pr-4 text-slate-700">{formatMetric(row.objective, row.unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-6 rounded-xl2 bg-card p-4 shadow-soft">
        <h2 className="mb-2 font-display text-lg font-semibold">Gage</h2>
        <p className="text-sm text-muted">{selectedGage ?? "Aucun gage defini pour cet athlete."}</p>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        {charts.map(({ metric, data }) => (
          <MetricChart key={metric.key as MetricKey} title={metric.label} unit={metric.unit} data={data} />
        ))}
      </section>

      <PeopleTable rows={rows} />
    </main>
  );
}
