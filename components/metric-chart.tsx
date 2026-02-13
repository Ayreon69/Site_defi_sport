"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMetric, formatMonth } from "@/lib/utils";

type Props = {
  title: string;
  data: Array<{ date: string; realisation: number | null; previsionnel: number | null }>;
  unit: string;
};

export function MetricChart({ title, data, unit }: Props) {
  return (
    <section className="rounded-xl2 bg-card p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        <span className="text-sm text-muted">{unit}</span>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tickFormatter={formatMonth} stroke="#64748b" fontSize={12} />
            <YAxis tickFormatter={(value: number) => String(formatMetric(value, unit))} stroke="#64748b" fontSize={12} />
            <Tooltip
              formatter={(value: number) => (typeof value === "number" ? formatMetric(value, unit) : value)}
              labelFormatter={(label) => formatMonth(String(label))}
            />
            <Legend />
            <Line type="monotone" dataKey="realisation" name="Réalisation" stroke="#0f766e" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="previsionnel" name="Prévisionnel" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
