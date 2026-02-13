"use client";

import { motion } from "framer-motion";

type StatCardType = "positive" | "negative" | "neutral";

type Props = {
  titre: string;
  personne: string;
  metrique: string;
  valeur: string;
  periode: string;
  type: StatCardType;
};

const typeStyles: Record<StatCardType, { badge: string; value: string }> = {
  positive: {
    badge: "bg-emerald-100 text-emerald-700",
    value: "text-emerald-700",
  },
  negative: {
    badge: "bg-red-100 text-red-700",
    value: "text-red-700",
  },
  neutral: {
    badge: "bg-slate-100 text-slate-700",
    value: "text-slate-700",
  },
};

export function StatCard({ titre, personne, metrique, valeur, periode, type }: Props) {
  const colors = typeStyles[type];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="rounded-2xl bg-card p-6 shadow-lg transition duration-300 hover:-translate-y-1"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-ink">{titre}</h3>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${colors.badge}`}>{type}</span>
      </div>

      <p className="text-sm text-muted">{personne}</p>
      <p className="text-sm text-muted">{metrique}</p>

      <motion.p
        key={valeur}
        initial={{ opacity: 0.6, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className={`mt-3 font-display text-3xl font-semibold ${colors.value}`}
      >
        {valeur}
      </motion.p>

      <p className="mt-2 text-xs text-muted">{periode}</p>
    </motion.article>
  );
}
