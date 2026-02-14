import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { badgeFromProgress, progressionPct, projectNextValue } from "@/lib/analytics";
import { getAllRows, getPeople, getPersonGage } from "@/lib/data";
import { METRICS, type MetricKey } from "@/lib/types";
import { formatMetric, formatMonth, toDisplayMetricValue } from "@/lib/utils";

export function generateStaticParams() {
  const people = getPeople(getAllRows());
  return people.map((name) => ({ name }));
}

export default function PersonPage({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  const rows = getAllRows().filter((r) => r.personne === name);
  const gage = getPersonGage(name);

  if (!rows.length) notFound();

  const realRows = rows.filter((r) => r.type === "realisation").sort((a, b) => a.date.localeCompare(b.date));
  const last = realRows.at(-1);

  const stats = METRICS.map((metric) => {
    const values = realRows.map((r) => r[metric.key] as number | null);
    const currentValue = values.filter((v): v is number => typeof v === "number").at(-1) ?? null;
    const progress = progressionPct(values, metric.lowerIsBetter);
    const projected = projectNextValue(realRows, metric.key as MetricKey);
    const personalBest = values.filter((v): v is number => typeof v === "number").reduce<number | null>((best, val) => {
      if (best === null) return val;
      if (metric.lowerIsBetter) return Math.min(best, val);
      return Math.max(best, val);
    }, null);

    return {
      ...metric,
      current: currentValue,
      progress,
      projected,
      personalBest,
      badge: badgeFromProgress(progress),
    };
  });

  return (
    <main className="container-shell py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Fiche athlète</p>
          <h1 className="font-display text-3xl font-semibold">{name}</h1>
          {last ? <p className="text-sm text-muted">Dernière mesure: {formatMonth(last.date)}</p> : null}
        </div>
        <Link href="/" className="rounded-lg bg-accent px-4 py-2 text-sm text-white">
          Retour dashboard
        </Link>
      </div>

      <section className="mb-6 grid gap-4 md:grid-cols-[220px_1fr]">
        <article className="rounded-xl2 bg-card p-4 shadow-soft">
          <div className="relative h-52 w-full overflow-hidden rounded-lg bg-accentSoft">
            <Image src="/avatar-placeholder.svg" alt="Photo profil" fill className="object-cover" />
          </div>
          <p className="mt-3 text-sm text-muted">Photo placeholder</p>
        </article>

        <article className="rounded-xl2 bg-card p-4 shadow-soft">
          <h2 className="mb-3 font-display text-xl">Statistiques actuelles</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((s) => (
              <div key={s.key} className="rounded-lg border border-slate-100 p-3">
                <p className="text-xs text-muted">{s.label}</p>
                <p className="mt-1 text-lg font-semibold">{formatMetric(toDisplayMetricValue(s.key, s.current), s.unit)}</p>
                <p className="text-xs text-muted">Progression: {s.progress === null ? "-" : `${s.progress.toFixed(1)}%`}</p>
                <p className="text-xs text-muted">Record: {formatMetric(toDisplayMetricValue(s.key, s.personalBest), s.unit)}</p>
                <p className="text-xs text-muted">Projection: {formatMetric(toDisplayMetricValue(s.key, s.projected), s.unit)}</p>
                {s.badge ? <span className="mt-2 inline-block rounded-full bg-accentSoft px-2 py-1 text-[11px] font-medium text-success">{s.badge}</span> : null}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-xl2 bg-card p-4 shadow-soft">
        <h2 className="mb-2 font-display text-xl">Gage</h2>
        <p className="text-sm text-muted">{gage ?? "Aucun gage défini pour cet athlète."}</p>
      </section>
    </main>
  );
}
