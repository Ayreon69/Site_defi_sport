"use client";

import { useMemo, useState } from "react";

import { filterRows, getPersonGage } from "@/lib/data";
import type { CleanRow, DataType } from "@/lib/types";

export function useDashboardFilters(rows: CleanRow[]) {
  const [selectedPerson, setSelectedPerson] = useState("");
  const [types, setTypes] = useState<DataType[]>(["realisation", "previsionnel"]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const showPersonalView = Boolean(selectedPerson);
  const selectedGage = selectedPerson ? getPersonGage(selectedPerson) : null;

  const groupScopedAll = useMemo(
    () =>
      filterRows({
        rows,
        people: [],
        types: ["realisation", "previsionnel"],
        from: from || undefined,
        to: to || undefined,
      }),
    [rows, from, to]
  );

  const personalAllTypes = useMemo(
    () =>
      filterRows({
        rows,
        people: selectedPerson ? [selectedPerson] : [],
        types: ["realisation", "previsionnel"],
        from: from || undefined,
        to: to || undefined,
      }),
    [rows, selectedPerson, from, to]
  );

  const personalRealScope = useMemo(
    () =>
      filterRows({
        rows,
        people: selectedPerson ? [selectedPerson] : [],
        types: ["realisation"],
        from: from || undefined,
        to: to || undefined,
      }),
    [rows, selectedPerson, from, to]
  );

  const toggleType = (type: DataType) => {
    setTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  return {
    selectedPerson,
    setSelectedPerson,
    types,
    toggleType,
    from,
    setFrom,
    to,
    setTo,
    showPersonalView,
    selectedGage,
    groupScopedAll,
    personalAllTypes,
    personalRealScope,
  };
}
