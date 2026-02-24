import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { CleanRow } from "@/lib/types";

export function PeopleTable({ rows }: { rows: CleanRow[] }) {
  const people = Array.from(new Set(rows.map((r) => r.personne))).sort((a, b) => a.localeCompare(b));

  return (
    <section className="premium-card">
      <h2 className="mb-1 font-display text-lg font-semibold text-ink">Athletes</h2>
      <p className="mb-4 text-xs text-muted">{people.length} profil{people.length !== 1 ? "s" : ""} disponible{people.length !== 1 ? "s" : ""}</p>
      <div className="divide-y divide-slate-100 dark:divide-white/10">
        {people.map((person) => (
          <Link
            key={person}
            href={`/person/${encodeURIComponent(person)}`}
            className="group flex items-center justify-between py-3 text-sm text-ink transition-colors hover:text-accent"
          >
            <span className="font-medium">{person}</span>
            <ArrowRight size={15} className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
          </Link>
        ))}
      </div>
    </section>
  );
}
