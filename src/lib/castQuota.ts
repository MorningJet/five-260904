import { WHITELIST_DEVICE_IDS } from "./whitelist";

export const CAST_QUOTA_KEY = "five-cast-quota";
export const DEVICE_ID_KEY = "five-device-id";
export const DAILY_CAST_LIMIT = 5;

export type QuotaStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function taipeiDateKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function browserStorage(): QuotaStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readState(storage: QuotaStorage | null): { date: string; count: number } | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(CAST_QUOTA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { date?: unknown; count?: unknown };
    if (typeof parsed.date !== "string" || typeof parsed.count !== "number" || !Number.isFinite(parsed.count)) {
      return null;
    }
    return { date: parsed.date, count: parsed.count };
  } catch {
    return null;
  }
}

export function createDeviceId(): string {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `FIVE-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

export function getOrCreateDeviceId(storage: QuotaStorage | null = browserStorage()): string {
  if (!storage) return "";
  const existing = storage.getItem(DEVICE_ID_KEY)?.trim() ?? "";
  if (existing) return existing;
  const next = createDeviceId();
  storage.setItem(DEVICE_ID_KEY, next);
  return next;
}

export function isWhitelisted(
  storage: QuotaStorage | null = browserStorage(),
  allowList: readonly string[] = WHITELIST_DEVICE_IDS,
): boolean {
  if (!storage) return false;
  const id = storage.getItem(DEVICE_ID_KEY)?.trim() ?? "";
  return id.length > 0 && allowList.includes(id);
}

export function remainingCasts(
  now: Date = new Date(),
  storage: QuotaStorage | null = browserStorage(),
  allowList: readonly string[] = WHITELIST_DEVICE_IDS,
): number {
  if (isWhitelisted(storage, allowList)) return DAILY_CAST_LIMIT;
  const today = taipeiDateKey(now);
  const state = readState(storage);
  if (!state || state.date !== today) return DAILY_CAST_LIMIT;
  return Math.max(0, DAILY_CAST_LIMIT - state.count);
}

export function consumeCast(
  now: Date = new Date(),
  storage: QuotaStorage | null = browserStorage(),
  allowList: readonly string[] = WHITELIST_DEVICE_IDS,
): boolean {
  if (!storage) return false;
  if (isWhitelisted(storage, allowList)) return true;
  const today = taipeiDateKey(now);
  const state = readState(storage);
  const count = state && state.date === today ? state.count : 0;
  if (count >= DAILY_CAST_LIMIT) return false;
  storage.setItem(CAST_QUOTA_KEY, JSON.stringify({ date: today, count: count + 1 }));
  return true;
}
