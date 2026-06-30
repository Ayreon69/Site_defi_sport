"use client";

import { useMemo } from "react";

import { buildGroupAverageSeries, getGroupKpis, listPersonSummaries } from "@/lib/evolutionStats";
import { buildGroupPredictionSummary } from "@/lib/predictions";
import type { CleanRow } from "@/lib/types";

export function useGroupMetrics(groupScopedAll: CleanRow[]) {
  const groupKpis = useMemo(() => getGroupKpis(groupScopedAll), [groupScopedAll]);
  const groupAverageSeries = useMemo(() => buildGroupAverageSeries(groupScopedAll), [groupScopedAll]);
  const personSummaries = useMemo(() => listPersonSummaries(groupScopedAll), [groupScopedAll]);
  const groupPredictionSummary = useMemo(() => buildGroupPredictionSummary(groupScopedAll), [groupScopedAll]);

  return { groupKpis, groupAverageSeries, personSummaries, groupPredictionSummary };
}
