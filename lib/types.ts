export type MetricKey =
  | "dips"
  | "pompes"
  | "traction_pro"
  | "traction_sup"
  | "planche_sec"
  | "superman_sec"
  | "sprint_100m_sec"
  | "run_5km_sec";

export type DataType = "realisation" | "previsionnel";

export type CleanRow = {
  personne: string;
  date: string;
  type: DataType;
  dips: number | null;
  pompes: number | null;
  traction_pro: number | null;
  traction_sup: number | null;
  planche_sec: number | null;
  superman_sec: number | null;
  sprint_100m_sec: number | null;
  run_5km_sec: number | null;
};

export type PersonMeta = {
  personne: string;
  gage: string | null;
};

export type MetricMeta = {
  key: MetricKey;
  label: string;
  unit: string;
  lowerIsBetter?: boolean;
};

export const METRICS: MetricMeta[] = [
  { key: "dips", label: "Dips", unit: "reps" },
  { key: "pompes", label: "Pompes", unit: "reps" },
  { key: "traction_pro", label: "Tractions pronation", unit: "reps" },
  { key: "traction_sup", label: "Tractions supination", unit: "reps" },
  { key: "planche_sec", label: "Planche", unit: "min" },
  { key: "superman_sec", label: "Superman", unit: "min" },
  { key: "sprint_100m_sec", label: "100m", unit: "sec", lowerIsBetter: true },
  { key: "run_5km_sec", label: "5km", unit: "min", lowerIsBetter: true },
];
