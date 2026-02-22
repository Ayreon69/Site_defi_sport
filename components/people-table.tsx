import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { CleanRow } from "@/lib/types";

export function PeopleTable({ rows }: { rows: CleanRow[] }) {
  const people = Array.from(new Set(rows.map((r) => r.personne))).sort((a, b) => a.localeCompare(b));

  return (
    <section className="rounded-xl2 bg-card p-4 shadow-soft">
      <h2 className="mb-3 font-display text-lg font-semibold">Athletes</h2>
      <div className="divide-y divide-slate-100">
        {people.map((person) => (
          <Link key={person} href={`/person/${encodeURIComponent(person)}`} className="flex items-center justify-between py-3 text-sm hover:text-accent">
            <span>{person}</span>
            <ArrowRight size={16} />
          </Link>
        ))}
      </div>
    </section>
  );
}
