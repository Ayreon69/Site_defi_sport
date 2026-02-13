"use client";

import { Info } from "lucide-react";

type Props = {
  title?: string;
};

const FORMULA_TEXT =
  "Par metrique: quantite => ((dernier - premier) / |premier|) x 100. Temps (100m, 5km) => -((dernier - premier) / |premier|) x 100. Score evolution = moyenne des % de progression sur toutes les metriques.";

export function FormulaTooltip({ title = "Formule de calcul" }: Props) {
  return (
    <div className="group relative inline-flex items-center">
      <button type="button" className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
        <Info size={14} />
        <span>{title}</span>
      </button>
      <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
        {FORMULA_TEXT}
      </div>
    </div>
  );
}
