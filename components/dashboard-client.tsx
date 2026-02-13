"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

import { EvolutionScoreChart } from "@/components/evolution-score-chart";
import { FormulaTooltip } from "@/components/formula-tooltip";
import { MetricChart } from "@/components/metric-chart";
import { PeopleTable } from "@/components/people-table";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { calculateRecentProgression, calculateTotalProgression } from "@/lib/challengeStats";
import { filterRows, getPersonGage } from "@/lib/data";
import {
  buildGroupAverageSeries,
  buildPersonEvolutionSeries,
  calculateGlobalEvolutionScore,
  calculatePersonalTotalVariation,
  calculateRecentMomentum,
  detectImprovementZone,
  getGroupKpis,
  getPersonBadge,
  listPersonSummaries,
} from "@/lib/evolutionStats";
import { METRICS, type CleanRow, type DataType, type MetricKey } from "@/lib/types";

type Props = {
  rows: CleanRow[];
  people: string[];
};

function formatSignedPercent(value: number): string {
  if (value > 0) return `+${value.toFixed(1)}%`;
  if (value < 0) return `${value.toFixed(1)}%`;
  return "0.0%";
}

function badgeStyle(badge: string): string {
  if (badge === "Acceleration") return "bg-emerald-100 text-emerald-700";
  if (badge === "Phase d'ajustement") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export function DashboardClient({ rows, people }: Props) {
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [types, setTypes] = useState<DataType[]>(["realisation", "previsionnel"]);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const showPersonalView = Boolean(selectedPerson);
  const selectedGage = selectedPerson ? getPersonGage(selectedPerson) : null;

  const groupScopedAll = useMemo(
    () =>
      filterRows({
        rows,
        people: [],
        types: ["realisation", "previsionnel"],
        from: from || undefined,
        to: to || undefined,
      }),
    [rows, from, to]
  );

  const personalFiltered = useMemo(
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

  const personalRealScope = useMemo(
    () =>
      filterRows({
        rows,
        people: selectedPerson ? [selectedPerson] : [],
        types: ["realisation"],
        from: from || undefined,
        to: to || undefined,
      }),
    [rows, selectedPerson, from, to]
  );

  const groupKpis = useMemo(() => getGroupKpis(groupScopedAll), [groupScopedAll]);
  const groupAverageSeries = useMemo(() => buildGroupAverageSeries(groupScopedAll), [groupScopedAll]);
  const personSummaries = useMemo(() => listPersonSummaries(groupScopedAll), [groupScopedAll]);

  const personalScore = useMemo(
    () => (selectedPerson ? calculateGlobalEvolutionScore(personalRealScope, selectedPerson) : 0),
    [personalRealScope, selectedPerson]
  );
  const personalTotalVariation = useMemo(
    () => (selectedPerson ? calculatePersonalTotalVariation(personalRealScope, selectedPerson) : 0),
    [personalRealScope, selectedPerson]
  );
  const personalMomentum = useMemo(
    () => (selectedPerson ? calculateRecentMomentum(personalRealScope, selectedPerson) : 0),
    [personalRealScope, selectedPerson]
  );
  const personalBadge = useMemo(() => getPersonBadge(personalMomentum), [personalMomentum]);
  const improvementZones = useMemo(
    () => (selectedPerson ? detectImprovementZone(personalRealScope, selectedPerson) : []),
    [personalRealScope, selectedPerson]
  );
  const personalEvolutionSeries = useMemo(
    () => (selectedPerson ? buildPersonEvolutionSeries(personalRealScope, selectedPerson) : []),
    [personalRealScope, selectedPerson]
  );

  const charts = useMemo(() => {
    return METRICS.map((metric) => {
      const grouped = new Map<string, { date: string; realisation: number | null; previsionnel: number | null }>();

      personalFiltered.forEach((row) => {
        if (!grouped.has(row.date)) {
          grouped.set(row.date, { date: row.date, realisation: null, previsionnel: null });
        }
        const target = grouped.get(row.date);
        if (!target) return;
        const value = row[metric.key] as number | null;
        if (row.type === "realisation") target.realisation = value;
        if (row.type === "previsionnel") target.previsionnel = value;
      });

      return {
        metric,
        data: Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date)),
      };
    });
  }, [personalFiltered]);

  const toggleType = (type: DataType) => {
    setTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  return (
    <main className="container-shell py-8">
      <section className="mb-6 rounded-xl2 bg-card p-5 shadow-soft">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Sport Performance Dashboard</h1>
        <p className="premium-subtitle mt-2 text-sm">
          Basculer entre la vue collective (groupe) et la vue personnelle (athlete selectionne).
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 block text-muted">Athlete</span>
            <select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
              <option value="">Vue collective</option>
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
          {showPersonalView ? (
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
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-muted">Mode groupe actif</div>
          )}
        </div>
      </section>

      <AnimatePresence mode="wait">
        {!showPersonalView ? (
          <motion.section
            key="collective"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="section-fade space-y-8"
          >
            <section className="premium-card">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold text-ink">Progression du Groupe</h2>
                <FormulaTooltip />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <motion.article initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Progressions positives recentes</p>
                  <motion.p key={groupKpis.positiveRecentCount} initial={{ opacity: 0.6, y: 3 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl font-semibold text-emerald-700">
                    {groupKpis.positiveRecentCount}
                  </motion.p>
                </motion.article>
                <motion.article initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-slate-700">Moyenne progression %</p>
                  <motion.p key={groupKpis.averageProgressionPct} initial={{ opacity: 0.6, y: 3 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl font-semibold text-slate-700">
                    {formatSignedPercent(groupKpis.averageProgressionPct)}
                  </motion.p>
                </motion.article>
                <motion.article initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="rounded-2xl border border-teal-100 bg-teal-50 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-teal-700">Objectifs atteints</p>
                  <motion.p key={groupKpis.goalsReached} initial={{ opacity: 0.6, y: 3 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl font-semibold text-teal-700">
                    {groupKpis.goalsReached}
                  </motion.p>
                </motion.article>
              </div>
            </section>

            <EvolutionScoreChart title="Score moyen du groupe par mois" data={groupAverageSeries} />

            <section className="premium-card">
              <h3 className="font-display text-xl font-semibold text-ink">Cartes individuelles</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {personSummaries.map((person) => (
                  <article key={person.personne} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:scale-[1.01]">
                    <p className="font-display text-lg font-semibold">{person.personne}</p>
                    <p className="mt-1 text-sm text-muted">Score global: {formatSignedPercent(person.score)}</p>
                    <p className="text-sm text-muted">Variation recente: {formatSignedPercent(person.recentMomentum)}</p>
                    <span className={`mt-3 inline-block rounded-full px-2 py-1 text-xs font-medium ${badgeStyle(person.badge)}`}>{person.badge}</span>
                  </article>
                ))}
              </div>
            </section>
          </motion.section>
        ) : (
          <motion.section
            key="personal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="section-fade space-y-8"
          >
            <section className="premium-card">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold text-ink">Vue Personnelle</h2>
                <FormulaTooltip />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-muted">Score evolution</p>
                  <motion.p key={personalScore} initial={{ opacity: 0.6, y: 3 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl font-semibold">
                    {formatSignedPercent(personalScore)}
                  </motion.p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-muted">Variation totale</p>
                  <motion.p key={personalTotalVariation} initial={{ opacity: 0.6, y: 3 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl font-semibold">
                    {formatSignedPercent(personalTotalVariation)}
                  </motion.p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-muted">Variation recente</p>
                  <motion.p key={personalMomentum} initial={{ opacity: 0.6, y: 3 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl font-semibold">
                    {formatSignedPercent(personalMomentum)}
                  </motion.p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-muted">Badge dynamique</p>
                  <span className={`mt-3 inline-block rounded-full px-2 py-1 text-xs font-medium ${badgeStyle(personalBadge)}`}>{personalBadge}</span>
                </article>
              </div>
            </section>

            <EvolutionScoreChart title="Evolution globale personnelle" data={personalEvolutionSeries} lineColor="#0ea5e9" />

            <section className="premium-card">
              <h3 className="font-display text-lg font-semibold">Axes prioritaires d&apos;amelioration</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {improvementZones.length ? (
                  improvementZones.map((zone) => (
                    <span key={zone} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                      {zone}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted">Aucun axe prioritaire detecte sur la periode.</span>
                )}
              </div>
            </section>

            <section className="premium-card">
              <h3 className="font-display text-lg font-semibold">Gage</h3>
              <p className="mt-2 text-sm text-muted">{selectedGage ?? "Aucun gage defini pour cet athlete."}</p>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              {charts.map(({ metric, data }) => (
                <article key={metric.key as MetricKey} className="space-y-3">
                  <MetricChart title={metric.label} unit={metric.unit} data={data} />
                  <div className="flex flex-col gap-2 md:flex-row">
                    <ProgressIndicator value={calculateTotalProgression(personalRealScope, selectedPerson, metric.key)} metric={metric.key} label="Depuis le debut" />
                    <ProgressIndicator value={calculateRecentProgression(personalRealScope, selectedPerson, metric.key)} metric={metric.key} label="Depuis le dernier test" />
                  </div>
                </article>
              ))}
            </section>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="mt-6">
        <PeopleTable rows={groupScopedAll.length ? groupScopedAll : rows} />
      </section>
    </main>
  );
}
