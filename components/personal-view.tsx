"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Target, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";

import { FormulaTooltip } from "@/components/formula-tooltip";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { calculateRecentProgression, calculateTotalProgression } from "@/lib/challengeStats";
import type { PersonEvolutionSummary } from "@/lib/evolutionStats";
import type { PersonPredictionSummary, PredictionRisk } from "@/lib/predictions";
import type { CleanRow, MetricMeta } from "@/lib/types";
import { formatMetric } from "@/lib/utils";

const MetricChart = dynamic(
  () => import("@/components/metric-chart").then((m) => m.MetricChart),
  { ssr: false, loading: () => <div className="premium-card h-72 animate-pulse bg-slate-100 dark:bg-slate-800" /> }
);

const EvolutionScoreChart = dynamic(
  () => import("@/components/evolution-score-chart").then((m) => m.EvolutionScoreChart),
  { ssr: false, loading: () => <div className="premium-card h-64 animate-pulse bg-slate-100 dark:bg-slate-800" /> }
);

const EMPTY_STATE_IMG = "/images/empty-state-visual.webp";
const EMPTY_STATE_BLUR = "data:image/webp;base64,UklGRjQAAABXRUJQVlA4ICgAAABQAQCdASoQAAkABUB8JYwAAkAAAM0y62MY0CnUtce9YH3lj94uAAAA";

function formatSignedPercent(value: number): string {
  if (value > 0) return `+${value.toFixed(1)}%`;
  if (value < 0) return `${value.toFixed(1)}%`;
  return "0.0%";
}

function badgePillClass(badge: string): string {
  if (badge === "Acceleration") return "badge-pill badge-pill-emerald";
  if (badge === "Phase d'ajustement") return "badge-pill badge-pill-amber";
  return "badge-pill badge-pill-slate";
}

function statClass(value: number): string {
  if (value > 0) return "stat-positive";
  if (value < 0) return "stat-negative";
  return "stat-neutral";
}

function riskLabel(risk: PredictionRisk): string {
  if (risk === "on_track") return "Sur trajectoire";
  if (risk === "watch") return "À surveiller";
  return "Risque élevé";
}

function riskClass(risk: PredictionRisk): string {
  if (risk === "on_track") return "badge-pill badge-pill-emerald";
  if (risk === "watch") return "badge-pill badge-pill-amber";
  return "badge-pill badge-pill-red";
}

type ChartEntry = {
  metric: MetricMeta;
  data: Array<{ date: string; realisation: number | null; previsionnel: number | null }>;
};

type Props = {
  selectedPerson: string;
  selectedGage: string | null;
  personalScore: number;
  personalTotalVariation: number;
  personalMomentum: number;
  personalBadge: PersonEvolutionSummary["badge"];
  improvementZones: string[];
  personalEvolutionSeries: Array<{ date: string; score: number }>;
  predictionSummary: PersonPredictionSummary | null;
  charts: ChartEntry[];
  personalRealScope: CleanRow[];
  hasPersonalData: boolean;
};

export function PersonalView({
  selectedPerson,
  selectedGage,
  personalScore,
  personalTotalVariation,
  personalMomentum,
  personalBadge,
  improvementZones,
  personalEvolutionSeries,
  predictionSummary,
  charts,
  personalRealScope,
  hasPersonalData,
}: Props) {
  return (
    <div className="space-y-8">
      <section className="premium-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-ink">Vue Personnelle</h2>
          <FormulaTooltip />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm card-stripe-accent lg:col-span-4">
            <p className="text-xs uppercase tracking-wide text-muted">Score evolution</p>
            <motion.p
              key={personalScore}
              initial={{ opacity: 0.6, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-2 font-display text-4xl font-semibold ${statClass(personalScore)}`}
            >
              {formatSignedPercent(personalScore)}
            </motion.p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm lg:col-span-3">
            <p className="text-xs uppercase tracking-wide text-muted">Variation totale</p>
            <motion.p
              key={personalTotalVariation}
              initial={{ opacity: 0.6, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-2 font-display text-4xl font-semibold ${statClass(personalTotalVariation)}`}
            >
              {formatSignedPercent(personalTotalVariation)}
            </motion.p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm lg:col-span-3">
            <p className="text-xs uppercase tracking-wide text-muted">Variation récente</p>
            <motion.p
              key={personalMomentum}
              initial={{ opacity: 0.6, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-2 font-display text-4xl font-semibold ${statClass(personalMomentum)}`}
            >
              {formatSignedPercent(personalMomentum)}
            </motion.p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm lg:col-span-2">
            <p className="text-xs uppercase tracking-wide text-muted">Badge dynamique</p>
            <span className={`mt-3 ${badgePillClass(personalBadge)}`}>
              {personalBadge}
            </span>
          </article>
        </div>
      </section>

      {hasPersonalData ? (
        <EvolutionScoreChart title="Evolution globale personnelle" data={personalEvolutionSeries} lineColor="#0d7a5a" />
      ) : (
        <section className="premium-card">
          <h3 className="font-display text-xl font-semibold text-ink">Evolution globale personnelle</h3>
          <div className="mt-3 flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-muted">
            <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-slate-200">
              <Image src={EMPTY_STATE_IMG} alt="Illustration etat vide" fill placeholder="blur" blurDataURL={EMPTY_STATE_BLUR} className="object-cover" sizes="96px" />
            </div>
            <p>Aucune donnée personnelle disponible sur la plage sélectionnée.</p>
          </div>
        </section>
      )}

      <section className="premium-card">
        <h3 className="font-display text-lg font-semibold">Axes à renforcer en priorité</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {improvementZones.length ? (
            improvementZones.map((zone) => (
              <span key={zone} className="badge-pill badge-pill-amber">
                {zone}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted">Pas assez de données sur la période pour détecter des axes.</span>
          )}
        </div>
      </section>

      {predictionSummary && predictionSummary.predictions.length > 0 ? (
        <section className="premium-card">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BrainCircuit size={18} className="text-emerald-700" />
                <h3 className="font-display text-lg font-semibold">Module predictif explicable</h3>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-muted">
                Régression linéaire par indicateur, comparée au prévisionnel pour estimer la trajectoire du prochain cycle.
              </p>
            </div>
            <span className="badge-pill badge-pill-slate">Confiance {predictionSummary.confidence}%</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
                <Target size={15} />
                Objectifs probables
              </div>
              <p className="mt-2 font-display text-3xl font-semibold text-emerald-700">
                {predictionSummary.onTrackCount}/{predictionSummary.predictions.length}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
                <TrendingUp size={15} />
                Signaux à risque
              </div>
              <p className="mt-2 font-display text-3xl font-semibold text-amber-700">
                {predictionSummary.atRiskCount}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted">Risque prioritaire</p>
              <p className="mt-2 font-display text-xl font-semibold text-ink">
                {predictionSummary.topRisk?.metricLabel ?? "Aucun"}
              </p>
            </article>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {predictionSummary.predictions.slice(0, 4).map((prediction) => (
              <article key={prediction.metricKey} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-semibold text-ink">{prediction.metricLabel}</p>
                    <p className="mt-1 text-xs text-muted">
                      Actuel {formatMetric(prediction.currentValue, prediction.unit)} | Prediction {formatMetric(prediction.predictedNextValue, prediction.unit)}
                    </p>
                  </div>
                  <span className={riskClass(prediction.risk)}>{riskLabel(prediction.risk)}</span>
                </div>
                <p className="mt-3 text-sm text-muted">{prediction.recommendation}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="premium-card">
        <h3 className="font-display text-lg font-semibold">Gage</h3>
        <p className="mt-2 text-sm text-muted">{selectedGage ?? "Aucun gage défini pour cet athlète."}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {charts.map(({ metric, data }) => (
          <article key={metric.key} className="space-y-3">
            {data.length ? (
              <MetricChart title={metric.label} metricKey={metric.key} unit={metric.unit} data={data} />
            ) : (
              <section className="premium-card">
                <h3 className="font-display text-xl font-semibold text-ink">{metric.label}</h3>
                <div className="mt-3 flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-muted">
                  <div className="relative h-14 w-20 overflow-hidden rounded-lg border border-slate-200">
                    <Image src={EMPTY_STATE_IMG} alt="Illustration etat vide" fill placeholder="blur" blurDataURL={EMPTY_STATE_BLUR} className="object-cover" sizes="80px" />
                  </div>
                  <p>Pas assez de points pour afficher la courbe.</p>
                </div>
              </section>
            )}
            <div className="flex flex-col gap-2 md:flex-row">
              <ProgressIndicator
                value={calculateTotalProgression(personalRealScope, selectedPerson, metric.key)}
                metric={metric.key}
                label="Depuis le début"
              />
              <ProgressIndicator
                value={calculateRecentProgression(personalRealScope, selectedPerson, metric.key)}
                metric={metric.key}
                label="Depuis le dernier test"
              />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
