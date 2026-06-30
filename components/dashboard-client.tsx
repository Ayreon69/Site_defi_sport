"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

import { CollectiveView } from "@/components/collective-view";
import { PeopleTable } from "@/components/people-table";
import { PersonalView } from "@/components/personal-view";
import { useDashboardFilters } from "@/hooks/useDashboardFilters";
import { useGroupMetrics } from "@/hooks/useGroupMetrics";
import { usePersonalMetrics } from "@/hooks/usePersonalMetrics";
import type { CleanRow } from "@/lib/types";

type Props = {
  rows: CleanRow[];
  people: string[];
};

export function DashboardClient({ rows, people }: Props) {
  const {
    selectedPerson,
    setSelectedPerson,
    types,
    toggleType,
    from,
    setFrom,
    to,
    setTo,
    showPersonalView,
    selectedGage,
    groupScopedAll,
    personalAllTypes,
    personalRealScope,
  } = useDashboardFilters(rows);

  const { groupKpis, groupAverageSeries, personSummaries, groupPredictionSummary } = useGroupMetrics(groupScopedAll);

  const {
    personalScore,
    personalTotalVariation,
    personalMomentum,
    personalBadge,
    improvementZones,
    personalEvolutionSeries,
    predictionSummary,
    charts,
  } = usePersonalMetrics(personalRealScope, personalAllTypes, selectedPerson, types);

  const hasGroupData = groupScopedAll.length > 0;
  const hasPersonalData = personalRealScope.length > 0;

  return (
    <main className="container-shell min-h-[100dvh] py-8">
      <section className="mb-8 grid gap-4 md:grid-cols-5">
        <div className="premium-card relative overflow-hidden md:col-span-3">
          <Image
            src="/images/abstrait-hero-background.webp"
            alt="Fond abstrait hero"
            fill
            priority
            quality={60}
            placeholder="blur"
            blurDataURL="data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAADQAQCdASoQAAkABUB8JQAAT/wtk9SM4AD+4l2pbl9DFMWEK3rVb/0ONS/Bg+JMNBaewrsSG/R4HAAA"
            className="object-cover opacity-20"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/88 via-white/72 to-white/20 dark:from-[#0f1713]/90 dark:via-[#0f1713]/72 dark:to-transparent" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Tableau de pilotage sportif</p>
            <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold tracking-tighter text-ink md:text-5xl">
              7 amis. 8 exercices. 1 an pour s&apos;améliorer.
            </h1>
            <p className="premium-subtitle mt-4 max-w-[65ch] text-sm md:text-base">
              Chaque mois, on se teste sur les mêmes exercices. Les données sont analysées automatiquement : progression réelle, momentum, et prédiction du prochain cycle.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50/95 px-3 py-1 text-xs text-emerald-700">91 sessions enregistrées</span>
              <span className="rounded-full border border-slate-200 bg-slate-50/95 px-3 py-1 text-xs text-slate-700">Juin 2025 → Août 2026</span>
              <span className="rounded-full border border-slate-200 bg-slate-50/95 px-3 py-1 text-xs text-slate-700">
                Mode {showPersonalView ? "personnel" : "collectif"}
              </span>
            </div>
          </div>
        </div>

        <div className="premium-card md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">Filtrage actif</p>
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
          </div>
          <div className="mt-4 grid gap-3">
            <label className="text-sm">
              <span className="mb-1.5 block text-muted">Athlète</span>
              <select
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
                className="form-control"
                aria-label="Sélectionner un athlète"
              >
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
                <span className="mb-1.5 block text-muted">Début</span>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="form-control"
                  aria-label="Date de début"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block text-muted">Fin</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="form-control"
                  aria-label="Date de fin"
                />
              </label>
            </div>
            {showPersonalView ? (
              <div>
                <span className="mb-1.5 block text-sm text-muted">Type</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleType("realisation")}
                    aria-pressed={types.includes("realisation")}
                    className={`btn-toggle ${types.includes("realisation") ? "btn-toggle-active" : "btn-toggle-inactive"}`}
                  >
                    Réalisation
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleType("previsionnel")}
                    aria-pressed={types.includes("previsionnel")}
                    className={`btn-toggle ${types.includes("previsionnel") ? "btn-toggle-active" : "btn-toggle-inactive"}`}
                  >
                    Prévisionnel
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-muted">
                Mode groupe actif
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { value: "+62%", label: "Progression moyenne groupe", sub: "sur toutes les métriques" },
          { value: "100%", label: "Métriques en hausse", sub: "56 / 56 indicateurs" },
          { value: "+119%", label: "Top exercice", sub: "Tractions supination" },
          { value: "7", label: "Athlètes suivis", sub: "depuis juin 2025" },
        ].map(({ value, label, sub }) => (
          <motion.article
            key={label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="premium-card flex flex-col gap-1"
          >
            <p className="font-display text-3xl font-semibold text-accent">{value}</p>
            <p className="text-sm font-medium text-ink">{label}</p>
            <p className="text-xs text-muted">{sub}</p>
          </motion.article>
        ))}
      </section>

      <AnimatePresence mode="wait">
        {!showPersonalView ? (
          <motion.section
            key="collective"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="section-fade"
          >
            <CollectiveView
              groupKpis={groupKpis}
              groupAverageSeries={groupAverageSeries}
              personSummaries={personSummaries}
              groupPredictionSummary={groupPredictionSummary}
              hasGroupData={hasGroupData}
            />
          </motion.section>
        ) : (
          <motion.section
            key="personal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="section-fade"
          >
            <PersonalView
              selectedPerson={selectedPerson}
              selectedGage={selectedGage}
              personalScore={personalScore}
              personalTotalVariation={personalTotalVariation}
              personalMomentum={personalMomentum}
              personalBadge={personalBadge}
              improvementZones={improvementZones}
              personalEvolutionSeries={personalEvolutionSeries}
              predictionSummary={predictionSummary}
              charts={charts}
              personalRealScope={personalRealScope}
              hasPersonalData={hasPersonalData}
            />
          </motion.section>
        )}
      </AnimatePresence>

      <section className="mt-6">
        <PeopleTable rows={groupScopedAll.length ? groupScopedAll : rows} />
      </section>
    </main>
  );
}
