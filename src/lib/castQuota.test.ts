import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CAST_QUOTA_KEY,
  DAILY_CAST_LIMIT,
  consumeCast,
  remainingCasts,
  taipeiDateKey,
  type QuotaStorage,
} from "./castQuota";

function memoryStorage(initial: Record<string, string> = {}): QuotaStorage {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe("taipeiDateKey", () => {
  it("以台北自然日切換，不是 UTC 午夜", () => {
    const lateSep4 = new Date("2026-09-04T15:59:00.000Z");
    const earlySep5 = new Date("2026-09-04T16:00:00.000Z");
    assert.equal(taipeiDateKey(lateSep4), "2026-09-04");
    assert.equal(taipeiDateKey(earlySep5), "2026-09-05");
  });
});

describe("consumeCast", () => {
  it("同一自然日最多 5 次", () => {
    const storage = memoryStorage();
    const now = new Date("2026-09-04T04:00:00.000Z");
    for (let i = 0; i < DAILY_CAST_LIMIT; i += 1) {
      assert.equal(consumeCast(now, storage), true);
    }
    assert.equal(consumeCast(now, storage), false);
    assert.equal(remainingCasts(now, storage), 0);
  });

  it("跨過台北 0 時後次數重算", () => {
    const storage = memoryStorage();
    const day1 = new Date("2026-09-04T15:59:00.000Z");
    for (let i = 0; i < DAILY_CAST_LIMIT; i += 1) {
      consumeCast(day1, storage);
    }
    const day2 = new Date("2026-09-04T16:00:00.000Z");
    assert.equal(remainingCasts(day2, storage), DAILY_CAST_LIMIT);
    assert.equal(consumeCast(day2, storage), true);
    assert.equal(JSON.parse(storage.getItem(CAST_QUOTA_KEY) ?? "{}").count, 1);
  });
});
