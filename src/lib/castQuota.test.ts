import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CAST_QUOTA_KEY,
  DAILY_CAST_LIMITS,
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
  it("單人同一自然日最多 5 次", () => {
    const storage = memoryStorage();
    const now = new Date("2026-09-04T04:00:00.000Z");
    for (let i = 0; i < DAILY_CAST_LIMITS.solo; i += 1) {
      assert.equal(consumeCast("solo", now, storage), true);
    }
    assert.equal(consumeCast("solo", now, storage), false);
    assert.equal(remainingCasts("solo", now, storage), 0);
    assert.equal(remainingCasts("pair", now, storage), DAILY_CAST_LIMITS.pair);
  });

  it("雙人同一自然日最多 15 次，改生辰與換關係各算 1 次", () => {
    const storage = memoryStorage();
    const now = new Date("2026-09-04T04:00:00.000Z");
    for (let i = 0; i < DAILY_CAST_LIMITS.pair; i += 1) {
      assert.equal(consumeCast("pair", now, storage), true);
    }
    assert.equal(consumeCast("pair", now, storage), false);
    assert.equal(remainingCasts("pair", now, storage), 0);
    assert.equal(remainingCasts("solo", now, storage), DAILY_CAST_LIMITS.solo);
  });

  it("跨過台北 0 時後次數重算", () => {
    const storage = memoryStorage();
    const day1 = new Date("2026-09-04T15:59:00.000Z");
    for (let i = 0; i < DAILY_CAST_LIMITS.solo; i += 1) {
      consumeCast("solo", day1, storage);
    }
    for (let i = 0; i < DAILY_CAST_LIMITS.pair; i += 1) {
      consumeCast("pair", day1, storage);
    }
    const day2 = new Date("2026-09-04T16:00:00.000Z");
    assert.equal(remainingCasts("solo", day2, storage), DAILY_CAST_LIMITS.solo);
    assert.equal(remainingCasts("pair", day2, storage), DAILY_CAST_LIMITS.pair);
    assert.equal(consumeCast("pair", day2, storage), true);
    assert.equal(JSON.parse(storage.getItem(CAST_QUOTA_KEY) ?? "{}").pair, 1);
  });

  it("舊版共用次數資料會算進單人，不佔用雙人", () => {
    const now = new Date("2026-09-04T04:00:00.000Z");
    const storage = memoryStorage({
      [CAST_QUOTA_KEY]: JSON.stringify({ date: taipeiDateKey(now), count: 5 }),
    });
    assert.equal(remainingCasts("solo", now, storage), 0);
    assert.equal(remainingCasts("pair", now, storage), DAILY_CAST_LIMITS.pair);
    assert.equal(consumeCast("pair", now, storage), true);
  });

  it("白名單裝置編號不消耗次數、可無限排盤", () => {
    const id = "FIVE-ABCD-1234";
    const storage = memoryStorage({ [DEVICE_ID_KEY]: id });
    const now = new Date("2026-09-04T04:00:00.000Z");
    const allow = [id];
    for (let i = 0; i < DAILY_CAST_LIMITS.pair + 3; i += 1) {
      assert.equal(consumeCast("pair", now, storage, allow), true);
      assert.equal(consumeCast("solo", now, storage, allow), true);
    }
    assert.equal(remainingCasts("solo", now, storage, allow), DAILY_CAST_LIMITS.solo);
    assert.equal(remainingCasts("pair", now, storage, allow), DAILY_CAST_LIMITS.pair);
    assert.equal(storage.getItem(CAST_QUOTA_KEY), null);
  });
});
