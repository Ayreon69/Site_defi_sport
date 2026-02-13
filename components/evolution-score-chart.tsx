"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatMonth } from "@/lib/utils";

type Props = {
  title: string;
  data: Array<{ date: string; score: number }>;
  lineColor?: string;
};

export function EvolutionScoreChart({ title, data, lineColor = "#0f766e" }: Props) {
  return (
    <section className="rounded-xl2 bg-card p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        <span className="text-sm text-muted">score</span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tickFormatter={formatMonth} stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              formatter={(value: number) => (typeof value === "number" ? `${value.toFixed(1)}%` : value)}
              labelFormatter={(label) => formatMonth(String(label))}
            />
            <Line type="monotone" dataKey="score" stroke={lineColor} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
