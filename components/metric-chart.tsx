"use client";

import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { computeTrendMap } from "@/lib/analytics";
import { formatMetric, formatMonth } from "@/lib/utils";

type Props = {
  title: string;
  data: Array<{ date: string; realisation: number | null; previsionnel: number | null }>;
  unit: string;
};

export function MetricChart({ title, data, unit }: Props) {
  const chartData = useMemo(() => {
    const trendByDate = computeTrendMap(
      data.map((item) => ({ date: item.date, y: item.realisation }))
    );
    return data.map((item) => ({
      ...item,
      trend: trendByDate.get(item.date) ?? null,
    }));
  }, [data]);

  return (
    <section
      className="premium-card section-fade"
      role="region"
      aria-label={`Graphique de progression : ${title}`}
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
        <span className="text-sm text-muted">{unit}</span>
      </div>
      <div
        className="h-72 w-full"
        role="img"
        aria-label={`Courbe réalisation et prévisionnel pour ${title}, unité : ${unit}`}
      >
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
            <YAxis
              tickFormatter={(value: number) => String(formatMetric(value, unit))}
              stroke="#64748b"
              fontSize={12}
              width={72}
            />
            <Tooltip
              formatter={(value: number, key: string) => {
                if (typeof value !== "number") return value;
                if (key === "trend") return [`${formatMetric(value, unit)}`, "Tendance"];
                return formatMetric(value, unit);
              }}
              labelFormatter={(label) => formatMonth(String(label))}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="realisation"
              name="Zone Réalisation"
              stroke="none"
              fill={`url(#grad-${title.replace(/\s+/g, "-")})`}
            />
            <Line
              type="monotone"
              dataKey="realisation"
              name="Réalisation"
              stroke="#0f766e"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1.4, stroke: "#0f172a", fill: "#0f766e" }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="previsionnel"
              name="Prévisionnel"
              stroke="#f59e0b"
              strokeWidth={2.6}
              dot={{ r: 3.5, strokeWidth: 1.4, stroke: "#0f172a", fill: "#f59e0b" }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="trend"
              name="Tendance"
              stroke="#475569"
              strokeDasharray="4 4"
              strokeWidth={1.6}
              dot={false}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
