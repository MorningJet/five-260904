import { WHITELIST_DEVICE_IDS } from "./whitelist";

export const CAST_QUOTA_KEY = "five-cast-quota";
export const DEVICE_ID_KEY = "five-device-id";

export type CastKind = "solo" | "pair";

export const DAILY_CAST_LIMITS: Record<CastKind, number> = {
  solo: 5,
  pair: 15,
};

/** @deprecated 請用 DAILY_CAST_LIMITS.solo */
export const DAILY_CAST_LIMIT = DAILY_CAST_LIMITS.solo;

export type QuotaStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

type QuotaState = { date: string; solo: number; pair: number };

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

function asCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function readState(storage: QuotaStorage | null): QuotaState | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(CAST_QUOTA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { date?: unknown; count?: unknown; solo?: unknown; pair?: unknown };
    if (typeof parsed.date !== "string") return null;
    if (typeof parsed.solo === "number" || typeof parsed.pair === "number") {
      return { date: parsed.date, solo: asCount(parsed.solo), pair: asCount(parsed.pair) };
    }
    if (typeof parsed.count === "number" && Number.isFinite(parsed.count)) {
      return { date: parsed.date, solo: asCount(parsed.count), pair: 0 };
    }
    return null;
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
  kind: CastKind,
  now: Date = new Date(),
  storage: QuotaStorage | null = browserStorage(),
  allowList: readonly string[] = WHITELIST_DEVICE_IDS,
): number {
  const limit = DAILY_CAST_LIMITS[kind];
  if (isWhitelisted(storage, allowList)) return limit;
  const today = taipeiDateKey(now);
  const state = readState(storage);
  if (!state || state.date !== today) return limit;
  return Math.max(0, limit - state[kind]);
}

export function consumeCast(
  kind: CastKind,
  now: Date = new Date(),
  storage: QuotaStorage | null = browserStorage(),
  allowList: readonly string[] = WHITELIST_DEVICE_IDS,
): boolean {
  if (!storage) return false;
  if (isWhitelisted(storage, allowList)) return true;
  const today = taipeiDateKey(now);
  const state = readState(storage);
  const base: QuotaState =
    state && state.date === today ? state : { date: today, solo: 0, pair: 0 };
  if (base[kind] >= DAILY_CAST_LIMITS[kind]) return false;
  const next: QuotaState = { ...base, date: today, [kind]: base[kind] + 1 };
  storage.setItem(CAST_QUOTA_KEY, JSON.stringify(next));
  return true;
}
