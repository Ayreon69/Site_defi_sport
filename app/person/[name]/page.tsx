import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Target, Star } from "lucide-react";

import { badgeFromProgress, progressionPct, projectNextValue } from "@/lib/analytics";
import { getAllRows, getPeople, getPersonGage } from "@/lib/data";
import { METRICS, type MetricKey } from "@/lib/types";
import { formatMetric, formatMonth, toDisplayMetricValue } from "@/lib/utils";

export function generateStaticParams() {
  const people = getPeople(getAllRows());
  return people.map((name) => ({ name }));
}

export function generateMetadata({ params }: { params: { name: string } }): Metadata {
  const name = decodeURIComponent(params.name);
  return {
    title: `${name} — Fiche athlète`,
    description: `Fiche de performance et progression de ${name} : statistiques, records personnels et projections.`,
  };
}

function ProgressArrow({ value }: { value: number | null }) {
  if (value === null) return <Minus size={14} className="text-slate-400" />;
  if (value > 0) return <TrendingUp size={14} className="text-emerald-600" />;
  if (value < 0) return <TrendingDown size={14} className="text-red-500" />;
  return <Minus size={14} className="text-slate-400" />;
}

function progressColor(value: number | null) {
  if (value === null) return "text-slate-400";
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-red-500";
  return "text-slate-500";
}

export default function PersonPage({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  const rows = getAllRows().filter((r) => r.personne === name);
  const gage = getPersonGage(name);

  if (!rows.length) notFound();

  const realRows = rows.filter((r) => r.type === "realisation").sort((a, b) => a.date.localeCompare(b.date));
  const lastMeasured =
    realRows
      .slice()
      .reverse()
      .find((row) => METRICS.some((metric) => typeof row[metric.key] === "number")) ?? null;

  const firstDate = realRows[0]?.date ?? null;

  const stats = METRICS.map((metric) => {
    const values = realRows.map((r) => r[metric.key] as number | null);
    const currentValue = values.filter((v): v is number => typeof v === "number").at(-1) ?? null;
    const progress = progressionPct(values, metric.lowerIsBetter);
    const projected = projectNextValue(realRows, metric.key as MetricKey);
    const personalBest = values.filter((v): v is number => typeof v === "number").reduce<number | null>((best, val) => {
      if (best === null) return val;
      if (metric.lowerIsBetter) return Math.min(best, val);
      return Math.max(best, val);
    }, null);

    return {
      ...metric,
      current: currentValue,
      progress,
      projected,
      personalBest,
      badge: badgeFromProgress(progress),
    };
  });

  const validProgressions = stats.map((s) => s.progress).filter((p): p is number => p !== null);
  const avgProgress = validProgressions.length
    ? validProgressions.reduce((a, b) => a + b, 0) / validProgressions.length
    : null;
  const positiveCount = validProgressions.filter((p) => p > 0).length;
  const topGain = [...stats].filter((s) => s.progress !== null).sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))[0] ?? null;

  return (
    <main className="container-shell py-8">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
        >
          <ArrowLeft size={15} />
          Retour au dashboard
        </Link>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
          {realRows.length} session{realRows.length !== 1 ? "s" : ""} enregistrée{realRows.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Hero athlète */}
      <section className="premium-card mb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Fiche athlète</p>
            <h1 className="mt-1 font-display text-4xl font-semibold text-ink">{name}</h1>
            {firstDate && lastMeasured ? (
              <p className="mt-1 text-sm text-muted">
                {formatMonth(firstDate)} → {formatMonth(lastMeasured.date)}
              </p>
            ) : null}
            {gage ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                <Target size={14} className="text-amber-600" />
                <p className="text-sm text-amber-800">{gage}</p>
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            {avgProgress !== null ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-center">
                <p className={`font-display text-3xl font-semibold ${progressColor(avgProgress)}`}>
                  {avgProgress > 0 ? "+" : ""}{avgProgress.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-muted">Progression moyenne</p>
              </div>
            ) : null}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center">
              <p className="font-display text-3xl font-semibold text-ink">{positiveCount}/{validProgressions.length}</p>
              <p className="mt-1 text-xs text-muted">Métriques en hausse</p>
            </div>
            {topGain ? (
              <div className="rounded-2xl border border-teal-100 bg-teal-50 px-5 py-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star size={14} className="text-teal-600" />
                  <p className={`font-display text-3xl font-semibold ${progressColor(topGain.progress)}`}>
                    {(topGain.progress ?? 0) > 0 ? "+" : ""}{(topGain.progress ?? 0).toFixed(0)}%
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted">Top : {topGain.label}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Grille des métriques */}
      <section className="premium-card">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">Statistiques par exercice</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.key}
              className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{s.label}</p>
              <p className="font-display text-2xl font-semibold text-ink">
                {formatMetric(toDisplayMetricValue(s.key, s.current), s.unit)}
              </p>
              <div className="flex items-center gap-1.5">
                <ProgressArrow value={s.progress} />
                <span className={`text-sm font-medium ${progressColor(s.progress)}`}>
                  {s.progress !== null ? `${s.progress > 0 ? "+" : ""}${s.progress.toFixed(1)}%` : "—"}
                </span>
                <span className="text-xs text-muted">depuis le début</span>
              </div>
              <div className="mt-1 space-y-0.5 border-t border-slate-200 pt-2">
                <p className="text-xs text-muted">
                  Record : <span className="font-medium text-ink">{formatMetric(toDisplayMetricValue(s.key, s.personalBest), s.unit)}</span>
                </p>
                <p className="text-xs text-muted">
                  Projection : <span className="font-medium text-ink">{formatMetric(toDisplayMetricValue(s.key, s.projected), s.unit)}</span>
                </p>
              </div>
              {s.badge ? (
                <span className="mt-1 self-start rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  {s.badge}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
