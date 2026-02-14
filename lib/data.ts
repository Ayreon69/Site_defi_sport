import data from "@/data/clean_data.json";
import peopleMeta from "@/data/people_meta.json";
import type { CleanRow, DataType, PersonMeta } from "@/lib/types";

export function getAllRows(): CleanRow[] {
  return (data as CleanRow[]).slice().sort((a, b) => a.date.localeCompare(b.date));
}

export function getPeople(rows: CleanRow[]): string[] {
  return Array.from(new Set(rows.map((r) => r.personne))).sort((a, b) => a.localeCompare(b));
}

export function getPeopleMeta(): PersonMeta[] {
  return (peopleMeta as PersonMeta[]).slice().sort((a, b) => a.personne.localeCompare(b.personne));
}

export function getPersonGage(personName: string): string | null {
  const target = personName.trim().toLowerCase();
  const item = getPeopleMeta().find((meta) => meta.personne.trim().toLowerCase() === target);
  return item?.gage ?? null;
}

export function filterRows(params: {
  rows: CleanRow[];
  people: string[];
  types: DataType[];
  from?: string;
  to?: string;
}): CleanRow[] {
  const { rows, people, types, from, to } = params;
  return rows.filter((row) => {
    const inPeople = people.length === 0 || people.includes(row.personne);
    const inTypes = types.includes(row.type);
    const inFrom = !from || row.date >= from;
    const inTo = !to || row.date <= to;
    return inPeople && inTypes && inFrom && inTo;
  });
}
