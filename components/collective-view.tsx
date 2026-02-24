"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";

import { FormulaTooltip } from "@/components/formula-tooltip";
import type { GroupKpis, PersonEvolutionSummary } from "@/lib/evolutionStats";

const EvolutionScoreChart = dynamic(
  () => import("@/components/evolution-score-chart").then((m) => m.EvolutionScoreChart),
  { ssr: false, loading: () => <div className="premium-card h-64 animate-pulse bg-slate-100 dark:bg-slate-800" /> }
);

const IMAGES = {
  kpiBanner: "/images/bandeau-section-kpi.jpeg",
  cardTexture: "/images/indivudal-card-background.jpeg",
  emptyState: "/images/empty-state-visual.jpeg",
};

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

function cardStripeClass(badge: string): string {
  if (badge === "Acceleration") return "card-stripe-emerald";
  if (badge === "Phase d'ajustement") return "card-stripe-amber";
  return "card-stripe-slate";
}

function scoreStatClass(value: number): string {
  if (value > 0) return "stat-positive";
  if (value < 0) return "stat-negative";
  return "stat-neutral";
}

type Props = {
  groupKpis: GroupKpis;
  groupAverageSeries: Array<{ date: string; score: number }>;
  personSummaries: PersonEvolutionSummary[];
  hasGroupData: boolean;
};

export function CollectiveView({ groupKpis, groupAverageSeries, personSummaries, hasGroupData }: Props) {
  return (
    <div className="space-y-8">
      <section className="premium-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-ink">Progression du Groupe</h2>
          <FormulaTooltip />
        </div>
        <div className="relative mt-4 h-28 overflow-hidden rounded-2xl border border-slate-200/60">
          <Image
            src={IMAGES.kpiBanner}
            alt="Bandeau abstrait section KPI"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/65 to-white/20 dark:from-[#101912]/68 dark:to-[#101912]/28" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          <motion.article
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm lg:col-span-5"
          >
            <p className="text-xs uppercase tracking-wide text-emerald-700">Progressions positives recentes</p>
            <motion.p
              key={groupKpis.positiveRecentCount}
              initial={{ opacity: 0.6, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 font-display text-4xl font-semibold text-emerald-700"
            >
              {groupKpis.positiveRecentCount}
            </motion.p>
          </motion.article>
          <motion.article
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm lg:col-span-3"
          >
            <p className="text-xs uppercase tracking-wide text-slate-700">Moyenne progression %</p>
            <motion.p
              key={groupKpis.averageProgressionPct}
              initial={{ opacity: 0.6, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 font-display text-4xl font-semibold text-slate-700"
            >
              {formatSignedPercent(groupKpis.averageProgressionPct)}
            </motion.p>
          </motion.article>
          <motion.article
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-teal-100 bg-teal-50 p-5 shadow-sm lg:col-span-4"
          >
            <p className="text-xs uppercase tracking-wide text-teal-700">Objectifs atteints</p>
            <motion.p
              key={groupKpis.goalsReached}
              initial={{ opacity: 0.6, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 font-display text-4xl font-semibold text-teal-700"
            >
              {groupKpis.goalsReached}
            </motion.p>
          </motion.article>
        </div>
      </section>

      <EvolutionScoreChart title="Score moyen du groupe par mois" data={groupAverageSeries} />

      <section className="premium-card">
        <h3 className="font-display text-xl font-semibold text-ink">Cartes individuelles</h3>
        {hasGroupData ? (
          <div className="mt-4 grid gap-3 xl:grid-cols-5">
            {personSummaries.map((person, index) => (
              <article
                key={person.personne}
                className={`relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:scale-[1.01] ${
                  index % 2 === 0 ? "xl:col-span-2" : "xl:col-span-3"
                } ${cardStripeClass(person.badge)}`}
              >
                <Image
                  src={IMAGES.cardTexture}
                  alt="Texture abstraite de carte"
                  fill
                  className="object-cover opacity-[0.11]"
                  sizes="(max-width: 1280px) 100vw, 32vw"
                />
                <div className="absolute inset-0 bg-white/82 dark:bg-[#121c17]/80" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-lg font-semibold text-ink">{person.personne}</p>
                    <span className={badgePillClass(person.badge)}>{person.badge}</span>
                  </div>
                  <p className={`mt-3 font-display text-3xl font-semibold ${scoreStatClass(person.score)}`}>
                    {formatSignedPercent(person.score)}
                  </p>
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">Score global</p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="text-xs text-muted">Recente :</span>
                    <span className={`text-sm font-medium ${scoreStatClass(person.recentMomentum)}`}>
                      {formatSignedPercent(person.recentMomentum)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-muted">
            <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-slate-200">
              <Image src={IMAGES.emptyState} alt="Illustration etat vide" fill className="object-cover" sizes="96px" />
            </div>
            <p>Aucune donnee groupe disponible pour cette periode.</p>
          </div>
        )}
      </section>
    </div>
  );
}
