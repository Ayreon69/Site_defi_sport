"use client";

import { useMemo } from "react";
import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMetric, formatMonth } from "@/lib/utils";

type Props = {
  title: string;
  data: Array<{ date: string; realisation: number | null; previsionnel: number | null }>;
  unit: string;
};

function computeTrend(data: Array<{ date: string; realisation: number | null; previsionnel: number | null }>) {
  const points = data
    .map((item, index) => ({ x: index + 1, y: item.realisation }))
    .filter((p): p is { x: number; y: number } => typeof p.y === "number");

  if (points.length < 2) return new Map<string, number>();

  const n = points.length;
  const sumX = points.reduce((acc, p) => acc + p.x, 0);
  const sumY = points.reduce((acc, p) => acc + p.y, 0);
  const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
  const sumXX = points.reduce((acc, p) => acc + p.x * p.x, 0);
  const den = n * sumXX - sumX * sumX;
  if (den === 0) return new Map<string, number>();

  const slope = (n * sumXY - sumX * sumY) / den;
  const intercept = (sumY - slope * sumX) / n;

  const trendByDate = new Map<string, number>();
  data.forEach((item, idx) => {
    trendByDate.set(item.date, slope * (idx + 1) + intercept);
  });
  return trendByDate;
}

export function MetricChart({ title, data, unit }: Props) {
  const chartData = useMemo(() => {
    const trendByDate = computeTrend(data);
    return data.map((item) => ({
      ...item,
      trend: trendByDate.get(item.date) ?? null,
    }));
  }, [data]);

  return (
    <section className="premium-card section-fade">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
        <span className="text-sm text-muted">{unit}</span>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${title.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.24} />
                <stop offset="95%" stopColor="#0f766e" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
            <XAxis dataKey="date" tickFormatter={formatMonth} stroke="#64748b" fontSize={12} />
            <YAxis tickFormatter={(value: number) => String(formatMetric(value, unit))} stroke="#64748b" fontSize={12} width={72} />
            <Tooltip
              formatter={(value: number, key: string) => {
                if (typeof value !== "number") return value;
                if (key === "trend") return [`${formatMetric(value, unit)}`, "Tendance"];
                return formatMetric(value, unit);
              }}
              labelFormatter={(label) => formatMonth(String(label))}
            />
            <Legend />
            <Area type="monotone" dataKey="realisation" name="Zone Réalisation" stroke="none" fill={`url(#grad-${title.replace(/\s+/g, "-")})`} />
            <Line type="monotone" dataKey="realisation" name="Réalisation" stroke="#0f766e" strokeWidth={3} dot={{ r: 4, strokeWidth: 1.4, stroke: "#0f172a", fill: "#0f766e" }} connectNulls />
            <Line type="monotone" dataKey="previsionnel" name="Prévisionnel" stroke="#f59e0b" strokeWidth={2.6} dot={{ r: 3.5, strokeWidth: 1.4, stroke: "#0f172a", fill: "#f59e0b" }} connectNulls />
            <Line type="monotone" dataKey="trend" name="Tendance" stroke="#475569" strokeDasharray="4 4" strokeWidth={1.6} dot={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
