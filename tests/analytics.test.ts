import test from "node:test";
import assert from "node:assert/strict";

import { progressionPct, projectNextValue } from "../lib/analytics.ts";
import type { CleanRow } from "../lib/types";

function makeRow(date: string, dips: number | null): CleanRow {
  return {
    personne: "Tester",
    date,
    type: "realisation",
    dips,
    pompes: null,
    traction_pro: null,
    traction_sup: null,
    planche_sec: null,
    superman_sec: null,
    sprint_100m_sec: null,
    run_5km_sec: null,
  };
}

test("progressionPct computes classic progression", () => {
  const value = progressionPct([10, 15, 20], false);
  assert.equal(value, 100);
});

test("progressionPct inverts sign for lower-is-better metrics", () => {
  const value = progressionPct([20, 15], true);
  assert.equal(value, 25);
});

test("progressionPct returns null when first value is zero", () => {
  const value = progressionPct([0, 10], false);
  assert.equal(value, null);
});

test("projectNextValue returns linear projection", () => {
  const rows = [makeRow("2025-06-01", 10), makeRow("2025-08-01", 20), makeRow("2025-10-01", 30)];
  const projected = projectNextValue(rows, "dips");
  assert.equal(projected, 40);
});
