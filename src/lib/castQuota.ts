export const CAST_QUOTA_KEY = "five-cast-quota";
export const CAST_WHITELIST_FLAG_KEY = "five-cast-whitelist";
export const CAST_WHITELIST_TOKEN = process.env.NEXT_PUBLIC_CAST_WHITELIST || "mj-five-wl";
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

export function isWhitelisted(storage: QuotaStorage | null = browserStorage()): boolean {
  if (!storage) return false;
  return storage.getItem(CAST_WHITELIST_FLAG_KEY) === "1";
}

export function activateWhitelist(
  token: string,
  storage: QuotaStorage | null = browserStorage(),
): boolean {
  if (!storage || token !== CAST_WHITELIST_TOKEN) return false;
  storage.setItem(CAST_WHITELIST_FLAG_KEY, "1");
  return true;
}

export function applyWhitelistFromSearch(
  search: string,
  storage: QuotaStorage | null = browserStorage(),
): boolean {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const token = new URLSearchParams(raw).get("wl");
  if (!token) return false;
  return activateWhitelist(token, storage);
}

export function remainingCasts(
  now: Date = new Date(),
  storage: QuotaStorage | null = browserStorage(),
): number {
  if (isWhitelisted(storage)) return DAILY_CAST_LIMIT;
  const today = taipeiDateKey(now);
  const state = readState(storage);
  if (!state || state.date !== today) return DAILY_CAST_LIMIT;
  return Math.max(0, DAILY_CAST_LIMIT - state.count);
}

export function consumeCast(
  now: Date = new Date(),
  storage: QuotaStorage | null = browserStorage(),
): boolean {
  if (!storage) return false;
  if (isWhitelisted(storage)) return true;
  const today = taipeiDateKey(now);
  const state = readState(storage);
  const count = state && state.date === today ? state.count : 0;
  if (count >= DAILY_CAST_LIMIT) return false;
  storage.setItem(CAST_QUOTA_KEY, JSON.stringify({ date: today, count: count + 1 }));
  return true;
}
