"use client";

import { useMemo } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { computeTrendMap } from "@/lib/analytics";
import { formatMonth } from "@/lib/utils";

type Props = {
  title: string;
  data: Array<{ date: string; score: number }>;
  lineColor?: string;
};

export function EvolutionScoreChart({ title, data, lineColor = "#0f766e" }: Props) {
  const chartData = useMemo(() => {
    const trendMap = computeTrendMap(data.map((d) => ({ date: d.date, y: d.score })));
    return data.map((d) => ({ ...d, trend: trendMap.get(d.date) ?? null }));
  }, [data]);

  return (
    <section
      className="premium-card section-fade"
      role="region"
      aria-label={`Graphique d'évolution : ${title}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
        <span className="text-sm text-muted">score</span>
      </div>
      <div
        className="h-64 w-full"
        role="img"
        aria-label={`Courbe du score d'évolution pour ${title}`}
      >
        <ResponsiveContainer>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id={`grad-score-${title.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.22} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
            <XAxis dataKey="date" tickFormatter={formatMonth} stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip formatter={(value: number) => (typeof value === "number" ? `${value.toFixed(1)}%` : value)} labelFormatter={(label) => formatMonth(String(label))} />
            <Area type="monotone" dataKey="score" stroke="none" fill={`url(#grad-score-${title.replace(/\s+/g, "-")})`} />
            <Line type="monotone" dataKey="score" stroke={lineColor} strokeWidth={3} dot={{ r: 4, stroke: "#0f172a", strokeWidth: 1.4, fill: lineColor }} connectNulls />
            <Line type="monotone" dataKey="trend" stroke="#64748b" strokeDasharray="4 4" strokeWidth={1.4} dot={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
