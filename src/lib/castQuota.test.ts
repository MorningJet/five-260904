import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CAST_QUOTA_KEY,
  DAILY_CAST_LIMIT,
  DEVICE_ID_KEY,
  consumeCast,
  createDeviceId,
  getOrCreateDeviceId,
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

describe("getOrCreateDeviceId", () => {
  it("同一儲存只產生一次編號", () => {
    const storage = memoryStorage();
    const a = getOrCreateDeviceId(storage);
    const b = getOrCreateDeviceId(storage);
    assert.match(a, /^FIVE-[0-9A-F]{4}-[0-9A-F]{4}$/);
    assert.equal(a, b);
    assert.equal(createDeviceId().startsWith("FIVE-"), true);
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

  it("白名單裝置編號不消耗次數、可無限排盤", () => {
    const id = "FIVE-ABCD-1234";
    const storage = memoryStorage({ [DEVICE_ID_KEY]: id });
    const now = new Date("2026-09-04T04:00:00.000Z");
    const allow = [id];
    for (let i = 0; i < DAILY_CAST_LIMIT + 3; i += 1) {
      assert.equal(consumeCast(now, storage, allow), true);
    }
    assert.equal(remainingCasts(now, storage, allow), DAILY_CAST_LIMIT);
    assert.equal(storage.getItem(CAST_QUOTA_KEY), null);
  });
});
