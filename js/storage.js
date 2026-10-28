// Safe wrappers around localStorage. Every call is inside try/catch because
// storage can be blocked (private mode), full, or hold corrupted JSON.

export function readJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** @returns {boolean} true when the value was saved */
export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* nothing to do – storage unavailable */
  }
}
