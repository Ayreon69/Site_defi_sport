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

  const { groupKpis, groupAverageSeries, personSummaries } = useGroupMetrics(groupScopedAll);

  const {
    personalScore,
    personalTotalVariation,
    personalMomentum,
    personalBadge,
    improvementZones,
    personalEvolutionSeries,
    charts,
  } = usePersonalMetrics(personalRealScope, personalAllTypes, selectedPerson, types);

  const hasGroupData = groupScopedAll.length > 0;
  const hasPersonalData = personalRealScope.length > 0;

  return (
    <main className="container-shell min-h-[100dvh] py-8">
      <section className="mb-8 grid gap-4 md:grid-cols-5">
        <div className="premium-card relative overflow-hidden md:col-span-3">
          <Image
            src="/images/abstrait-hero-background.jpeg"
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
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
          </div>
          <div className="mt-4 grid gap-3">
            <label className="text-sm">
              <span className="mb-1.5 block text-muted">Athlete</span>
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
                <span className="mb-1.5 block text-muted">Debut</span>
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
                    Realisation
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleType("previsionnel")}
                    aria-pressed={types.includes("previsionnel")}
                    className={`btn-toggle ${types.includes("previsionnel") ? "btn-toggle-active" : "btn-toggle-inactive"}`}
                  >
                    Previsionnel
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
