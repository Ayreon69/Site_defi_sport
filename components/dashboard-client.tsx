"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
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
import { toDisplayMetricValue } from "@/lib/utils";

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

  const personalAllTypes = useMemo(
    () =>
      filterRows({
        rows,
        people: selectedPerson ? [selectedPerson] : [],
        types: ["realisation", "previsionnel"],
        from: from || undefined,
        to: to || undefined,
      }),
    [rows, selectedPerson, from, to]
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
    const sortedDates = Array.from(new Set(personalAllTypes.map((row) => row.date))).sort((a, b) => a.localeCompare(b));

    const realRows = personalAllTypes.filter((row) => row.type === "realisation").sort((a, b) => a.date.localeCompare(b.date));
    const previsionRows = personalAllTypes.filter((row) => row.type === "previsionnel").sort((a, b) => a.date.localeCompare(b.date));
    const finalPrevisionRow = previsionRows.at(-1) ?? null;

    const interpolateForecast = (metricKey: MetricKey, date: string): number | null => {
      if (!finalPrevisionRow) return null;
      const endValue = toDisplayMetricValue(metricKey, finalPrevisionRow[metricKey] as number | null);
      if (endValue === null) return null;

      const firstRealRow = realRows.find((row) => typeof row[metricKey] === "number");
      if (!firstRealRow) return null;
      const startValue = toDisplayMetricValue(metricKey, firstRealRow[metricKey] as number | null);
      if (startValue === null) return null;

      const startTs = Date.parse(firstRealRow.date);
      const endTs = Date.parse(finalPrevisionRow.date);
      const currentTs = Date.parse(date);
      if (Number.isNaN(startTs) || Number.isNaN(endTs) || Number.isNaN(currentTs)) return null;
      if (endTs <= startTs) return currentTs === endTs ? endValue : null;
      if (currentTs < startTs || currentTs > endTs) return null;

      const t = (currentTs - startTs) / (endTs - startTs);
      return Number((startValue + (endValue - startValue) * t).toFixed(3));
    };

    return METRICS.map((metric) => {
      const sorted = sortedDates.map((date) => {
        const realRow = realRows.find((row) => row.date === date);
        const realisation = realRow ? toDisplayMetricValue(metric.key, realRow[metric.key] as number | null) : null;
        const previsionnel = interpolateForecast(metric.key, date);

        return {
          date,
          realisation: types.includes("realisation") ? realisation : null,
          previsionnel: types.includes("previsionnel") ? previsionnel : null,
        };
      });

      const firstRealIndex = sorted.findIndex((point) => point.realisation !== null);
      const firstAnyIndex = sorted.findIndex((point) => point.realisation !== null || point.previsionnel !== null);
      const firstNonEmptyIndex = firstRealIndex !== -1 ? firstRealIndex : firstAnyIndex;
      const trimmedData = firstNonEmptyIndex === -1 ? [] : sorted.slice(firstNonEmptyIndex);

      return { metric, data: trimmedData };
    });
  }, [personalAllTypes, types]);

  const toggleType = (type: DataType) => {
    setTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const hasGroupData = groupScopedAll.length > 0;
  const hasPersonalData = personalRealScope.length > 0;
  const images = {
    hero: "/images/abstrait-hero-background.jpeg",
    kpiBanner: "/images/bandeau-section-kpi.jpeg",
    cardTexture: "/images/indivudal-card-background.jpeg",
    emptyState: "/images/empty-state-visual.jpeg",
  };

  return (
    <main className="container-shell min-h-[100dvh] py-8">
      <section className="mb-8 grid gap-4 md:grid-cols-5">
        <div className="premium-card relative overflow-hidden md:col-span-3">
          <Image
            src={images.hero}
            alt="Fond abstrait hero"
            fill
            className="object-cover opacity-20"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/88 via-white/72 to-white/20 dark:from-[#0f1713]/90 dark:via-[#0f1713]/72 dark:to-transparent" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Tableau de pilotage sportif</p>
            <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold tracking-tighter text-ink md:text-5xl">
              Lecture collective et individuelle des tendances de progression.
            </h1>
            <p className="premium-subtitle mt-4 max-w-[65ch] text-sm md:text-base">
              Basculer entre la vue groupe et la vue athlète pour suivre les performances, la dynamique recente et les zones prioritaires.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50/95 px-3 py-1 text-xs text-slate-700">Filtres temporels</span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50/95 px-3 py-1 text-xs text-emerald-700">Accent: progression</span>
              <span className="rounded-full border border-slate-200 bg-slate-50/95 px-3 py-1 text-xs text-slate-700">
                Mode {showPersonalView ? "personnel" : "collectif"}
              </span>
            </div>
          </div>
        </div>

        <div className="premium-card md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">Filtrage actif</p>
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
          </div>
          <div className="mt-4 grid gap-3">
            <label className="text-sm">
              <span className="mb-1.5 block text-muted">Athlete</span>
              <select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <option value="">Vue collective</option>
                {people.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1.5 block text-muted">Debut</span>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block text-muted">Fin</span>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
              </label>
            </div>
            {showPersonalView ? (
              <div>
                <span className="mb-1.5 block text-sm text-muted">Type</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => toggleType("realisation")}
                    className={`rounded-xl px-3 py-2 text-sm transition active:scale-[0.98] ${types.includes("realisation") ? "bg-accent text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    Realisation
                  </button>
                  <button
                    onClick={() => toggleType("previsionnel")}
                    className={`rounded-xl px-3 py-2 text-sm transition active:scale-[0.98] ${types.includes("previsionnel") ? "bg-accent text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    Previsionnel
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-muted">Mode groupe actif</div>
            )}
          </div>
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
              <div className="relative mt-4 h-28 overflow-hidden rounded-2xl border border-slate-200/60">
                <Image
                  src={images.kpiBanner}
                  alt="Bandeau abstrait section KPI"
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/65 to-white/20 dark:from-[#101912]/68 dark:to-[#101912]/28" />
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-12">
                <motion.article initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm lg:col-span-5">
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Progressions positives recentes</p>
                  <motion.p key={groupKpis.positiveRecentCount} initial={{ opacity: 0.6, y: 3 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl font-semibold text-emerald-700">
                    {groupKpis.positiveRecentCount}
                  </motion.p>
                </motion.article>
                <motion.article initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm lg:col-span-3">
                  <p className="text-xs uppercase tracking-wide text-slate-700">Moyenne progression %</p>
                  <motion.p key={groupKpis.averageProgressionPct} initial={{ opacity: 0.6, y: 3 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl font-semibold text-slate-700">
                    {formatSignedPercent(groupKpis.averageProgressionPct)}
                  </motion.p>
                </motion.article>
                <motion.article initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="rounded-2xl border border-teal-100 bg-teal-50 p-5 shadow-sm lg:col-span-4">
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
              {hasGroupData ? (
                <div className="mt-4 grid gap-3 xl:grid-cols-5">
                  {personSummaries.map((person, index) => (
                    <article
                      key={person.personne}
                      className={`relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:scale-[1.01] ${
                        index % 2 === 0 ? "xl:col-span-2" : "xl:col-span-3"
                      }`}
                    >
                      <Image
                        src={images.cardTexture}
                        alt="Texture abstraite de carte"
                        fill
                        className="object-cover opacity-[0.11]"
                        sizes="(max-width: 1280px) 100vw, 32vw"
                      />
                      <div className="absolute inset-0 bg-white/82 dark:bg-[#121c17]/80" />
                      <div className="relative z-10">
                        <p className="font-display text-lg font-semibold">{person.personne}</p>
                        <p className="mt-1 text-sm text-muted">Score global: {formatSignedPercent(person.score)}</p>
                        <p className="text-sm text-muted">Variation recente: {formatSignedPercent(person.recentMomentum)}</p>
                        <span className={`mt-3 inline-block rounded-full px-2 py-1 text-xs font-medium ${badgeStyle(person.badge)}`}>{person.badge}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-muted">
                  <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-slate-200">
                    <Image src={images.emptyState} alt="Illustration etat vide" fill className="object-cover" sizes="96px" />
                  </div>
                  <p>Aucune donnee groupe disponible pour cette periode.</p>
                </div>
              )}
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
              <div className="mt-4 grid gap-4 lg:grid-cols-12">
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm lg:col-span-4">
                  <p className="text-xs uppercase tracking-wide text-muted">Score evolution</p>
                  <motion.p key={personalScore} initial={{ opacity: 0.6, y: 3 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl font-semibold">
                    {formatSignedPercent(personalScore)}
                  </motion.p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm lg:col-span-3">
                  <p className="text-xs uppercase tracking-wide text-muted">Variation totale</p>
                  <motion.p key={personalTotalVariation} initial={{ opacity: 0.6, y: 3 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl font-semibold">
                    {formatSignedPercent(personalTotalVariation)}
                  </motion.p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm lg:col-span-3">
                  <p className="text-xs uppercase tracking-wide text-muted">Variation recente</p>
                  <motion.p key={personalMomentum} initial={{ opacity: 0.6, y: 3 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl font-semibold">
                    {formatSignedPercent(personalMomentum)}
                  </motion.p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm lg:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted">Badge dynamique</p>
                  <span className={`mt-3 inline-block rounded-full px-2 py-1 text-xs font-medium ${badgeStyle(personalBadge)}`}>{personalBadge}</span>
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
                    <Image src={images.emptyState} alt="Illustration etat vide" fill className="object-cover" sizes="96px" />
                  </div>
                  <p>Aucune donnee personnelle disponible sur la plage selectionnee.</p>
                </div>
              </section>
            )}

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
                  {data.length ? (
                    <MetricChart title={metric.label} unit={metric.unit} data={data} />
                  ) : (
                    <section className="premium-card">
                      <h3 className="font-display text-xl font-semibold text-ink">{metric.label}</h3>
                      <div className="mt-3 flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-muted">
                        <div className="relative h-14 w-20 overflow-hidden rounded-lg border border-slate-200">
                          <Image src={images.emptyState} alt="Illustration etat vide" fill className="object-cover" sizes="80px" />
                        </div>
                        <p>Pas assez de points pour afficher la courbe.</p>
                      </div>
                    </section>
                  )}
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
