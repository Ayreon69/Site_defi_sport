import test from "node:test";
import assert from "node:assert/strict";

import { progressionPct, projectNextValue, computeTrendMap, linearTrend } from "../lib/analytics.ts";
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

test("progressionPct returns null with fewer than 2 valid values", () => {
  const value = progressionPct([null, null, 10], false);
  assert.equal(value, null);
});

test("projectNextValue returns linear projection", () => {
  const rows = [makeRow("2025-06-01", 10), makeRow("2025-08-01", 20), makeRow("2025-10-01", 30)];
  const projected = projectNextValue(rows, "dips");
  assert.equal(projected, 40);
});

test("projectNextValue returns null when fewer than 2 valid rows", () => {
  const rows = [makeRow("2025-06-01", 10)];
  const projected = projectNextValue(rows, "dips");
  assert.equal(projected, null);
});

test("linearTrend returns null for fewer than 2 points", () => {
  const result = linearTrend([{ x: 1, y: 10 }]);
  assert.equal(result, null);
});

test("linearTrend computes slope and intercept for linear data", () => {
  const points = [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }];
  const result = linearTrend(points);
  assert.ok(result !== null);
  assert.ok(Math.abs(result.slope - 2) < 0.001);
  assert.ok(Math.abs(result.intercept) < 0.001);
});

test("computeTrendMap returns empty map for fewer than 2 data points", () => {
  const map = computeTrendMap([{ date: "2025-01-01", y: 10 }]);
  assert.equal(map.size, 0);
});

test("computeTrendMap returns empty map for empty input", () => {
  const map = computeTrendMap([]);
  assert.equal(map.size, 0);
});

test("computeTrendMap handles null values in input", () => {
  const items = [
    { date: "2025-01-01", y: 10 },
    { date: "2025-02-01", y: null },
    { date: "2025-03-01", y: 20 },
  ];
  const map = computeTrendMap(items);
  assert.ok(map.size > 0);
  assert.ok(map.has("2025-01-01"));
  assert.ok(map.has("2025-03-01"));
});

test("computeTrendMap computes correct trend for linear data", () => {
  const items = [
    { date: "2025-01-01", y: 10 },
    { date: "2025-02-01", y: 20 },
    { date: "2025-03-01", y: 30 },
  ];
  const map = computeTrendMap(items);
  assert.equal(map.size, 3);
  assert.ok(Math.abs((map.get("2025-01-01") ?? 0) - 10) < 0.01);
  assert.ok(Math.abs((map.get("2025-02-01") ?? 0) - 20) < 0.01);
  assert.ok(Math.abs((map.get("2025-03-01") ?? 0) - 30) < 0.01);
});

test("computeTrendMap sets trend for all dates including null-value ones", () => {
  const items = [
    { date: "2025-01-01", y: 10 },
    { date: "2025-02-01", y: null },
    { date: "2025-03-01", y: 30 },
  ];
  const map = computeTrendMap(items);
  assert.ok(map.has("2025-01-01"));
  assert.ok(map.has("2025-02-01"));
  assert.ok(map.has("2025-03-01"));
});
