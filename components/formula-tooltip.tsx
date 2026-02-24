"use client";

import { Info } from "lucide-react";
import { useId } from "react";

type Props = {
  title?: string;
};

const FORMULA_TEXT =
  "Par metrique: quantite => ((dernier - premier) / |premier|) x 100. Temps (100m, 5km) => -((dernier - premier) / |premier|) x 100. Score evolution = moyenne des % de progression sur toutes les metriques.";

export function FormulaTooltip({ title = "Formule de calcul" }: Props) {
  const tooltipId = useId();

  return (
    <div className="group relative inline-flex items-center">
      <button
        type="button"
        aria-describedby={tooltipId}
        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1.5 text-xs text-slate-600 shadow-soft transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-300"
      >
        <Info size={14} aria-hidden="true" />
        <span>{title}</span>
      </button>
      <div
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700 opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      >
        {FORMULA_TEXT}
      </div>
    </div>
  );
}
