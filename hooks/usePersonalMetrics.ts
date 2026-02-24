"use client";

import { useMemo } from "react";

import {
  buildPersonEvolutionSeries,
  calculateGlobalEvolutionScore,
  calculatePersonalTotalVariation,
  calculateRecentMomentum,
  detectImprovementZone,
  getPersonBadge,
} from "@/lib/evolutionStats";
import { METRICS, type CleanRow, type DataType, type MetricKey } from "@/lib/types";
import { toDisplayMetricValue } from "@/lib/utils";

function interpolateForecast(
  metricKey: MetricKey,
  date: string,
  finalPrevisionRow: CleanRow | null,
  realRows: CleanRow[]
): number | null {
  if (!finalPrevisionRow) return null;
  const endValue = toDisplayMetricValue(metricKey, finalPrevisionRow[metricKey] as number | null);
  if (endValue === null) return null;

  const firstRealRow = realRows.find((row) => typeof row[metricKey] === "number");
  if (!firstRealRow) return null;
  const startValue = toDisplayMetricValue(metricKey, firstRealRow[metricKey] as number | null);
  if (startValue === null) return null;

  const startTs = Date.parse(firstRealRow.date);
  const endTs = Date.parse(finalPrevisionRow.date);
  const currentTs = Date.parse(date);
  if (Number.isNaN(startTs) || Number.isNaN(endTs) || Number.isNaN(currentTs)) return null;
  if (endTs <= startTs) return currentTs === endTs ? endValue : null;
  if (currentTs < startTs || currentTs > endTs) return null;

  const t = (currentTs - startTs) / (endTs - startTs);
  return Number((startValue + (endValue - startValue) * t).toFixed(3));
}

export function usePersonalMetrics(
  personalRealScope: CleanRow[],
  personalAllTypes: CleanRow[],
  selectedPerson: string,
  types: DataType[]
) {
  const personalScore = useMemo(
    () => (selectedPerson ? calculateGlobalEvolutionScore(personalRealScope, selectedPerson) : 0),
    [personalRealScope, selectedPerson]
  );

  const personalTotalVariation = useMemo(
    () => (selectedPerson ? calculatePersonalTotalVariation(personalRealScope, selectedPerson) : 0),
    [personalRealScope, selectedPerson]
  );

  const personalMomentum = useMemo(
    () => (selectedPerson ? calculateRecentMomentum(personalRealScope, selectedPerson) : 0),
    [personalRealScope, selectedPerson]
  );

  const personalBadge = useMemo(() => getPersonBadge(personalMomentum), [personalMomentum]);

  const improvementZones = useMemo(
    () => (selectedPerson ? detectImprovementZone(personalRealScope, selectedPerson) : []),
    [personalRealScope, selectedPerson]
  );

  const personalEvolutionSeries = useMemo(
    () => (selectedPerson ? buildPersonEvolutionSeries(personalRealScope, selectedPerson) : []),
    [personalRealScope, selectedPerson]
  );

  const charts = useMemo(() => {
    const sortedDates = Array.from(new Set(personalAllTypes.map((row) => row.date))).sort((a, b) =>
      a.localeCompare(b)
    );

    const realRows = personalAllTypes
      .filter((row) => row.type === "realisation")
      .sort((a, b) => a.date.localeCompare(b.date));

    const previsionRows = personalAllTypes
      .filter((row) => row.type === "previsionnel")
      .sort((a, b) => a.date.localeCompare(b.date));

    const finalPrevisionRow = previsionRows.at(-1) ?? null;

    return METRICS.map((metric) => {
      const sorted = sortedDates.map((date) => {
        const realRow = realRows.find((row) => row.date === date);
        const realisation = realRow
          ? toDisplayMetricValue(metric.key, realRow[metric.key] as number | null)
          : null;
        const previsionnel = interpolateForecast(metric.key, date, finalPrevisionRow, realRows);

        return {
          date,
          realisation: types.includes("realisation") ? realisation : null,
          previsionnel: types.includes("previsionnel") ? previsionnel : null,
        };
      });

      const firstRealIndex = sorted.findIndex((point) => point.realisation !== null);
      const firstAnyIndex = sorted.findIndex(
        (point) => point.realisation !== null || point.previsionnel !== null
      );
      const firstNonEmptyIndex = firstRealIndex !== -1 ? firstRealIndex : firstAnyIndex;
      const trimmedData = firstNonEmptyIndex === -1 ? [] : sorted.slice(firstNonEmptyIndex);

      return { metric, data: trimmedData };
    });
  }, [personalAllTypes, types]);

  return {
    personalScore,
    personalTotalVariation,
    personalMomentum,
    personalBadge,
    improvementZones,
    personalEvolutionSeries,
    charts,
  };
}
