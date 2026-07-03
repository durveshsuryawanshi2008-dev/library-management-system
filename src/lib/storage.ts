export const readStoredValue = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    if (stored === null) return fallback;
    return stored === '' ? fallback : (JSON.parse(stored) as T);
  } catch {
    return fallback;
  }
};

export const writeStoredValue = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;

  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
  } catch {
    // Ignore storage quota or browser policy errors.
  }
};
