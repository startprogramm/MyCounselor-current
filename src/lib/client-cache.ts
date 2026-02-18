interface CacheEnvelope<T> {
  savedAt: number;
  data: T;
}

export interface CacheReadResult<T> {
  found: boolean;
  isStale: boolean;
  data: T | null;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function makeUserCacheKey(namespace: string, userId: string, scope?: string) {
  const normalizedScope = scope ? `::${scope}` : '';
  return `mycounselor::${namespace}::${userId}${normalizedScope}`;
}

export function readCachedData<T>(key: string, ttlMs: number): CacheReadResult<T> {
  if (!canUseStorage()) {
    return { found: false, isStale: true, data: null };
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return { found: false, isStale: true, data: null };
    }

    const parsed = JSON.parse(raw) as Partial<CacheEnvelope<T>>;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.savedAt !== 'number' ||
      !('data' in parsed)
    ) {
      window.localStorage.removeItem(key);
      return { found: false, isStale: true, data: null };
    }

    const age = Date.now() - parsed.savedAt;
    return {
      found: true,
      isStale: age > ttlMs,
      data: (parsed.data ?? null) as T | null,
    };
  } catch {
    window.localStorage.removeItem(key);
    return { found: false, isStale: true, data: null };
  }
}

export function writeCachedData<T>(key: string, data: T) {
  if (!canUseStorage()) return;

  try {
    const envelope: CacheEnvelope<T> = {
      savedAt: Date.now(),
      data,
    };

    window.localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Ignore storage write failures (quota/private mode).
  }
}

export function removeCachedData(key: string) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}
