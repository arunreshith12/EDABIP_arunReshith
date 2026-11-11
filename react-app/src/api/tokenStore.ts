// Keeps the login token. For this practice project the token lives in memory and
// in localStorage (real systems protect it more carefully, e.g. HTTP-only cookies).
// Components read it through useSyncExternalStore (see hooks/useAuth.ts).

import { STORAGE_KEYS } from '../constants';
import { readJson, removeKey, writeJson } from '../utils/storage';

let token: string | null | undefined; // undefined = localStorage not read yet
let expired = false;
const listeners = new Set<() => void>();

const notifyListeners = (): void => listeners.forEach(listener => listener());

export function getToken(): string | null {
  if (token === undefined) {
    const saved = readJson(STORAGE_KEYS.token);
    token = typeof saved === 'string' && saved !== '' ? saved : null;
  }
  return token;
}

export function setToken(value: string): void {
  token = value;
  expired = false;
  writeJson(STORAGE_KEYS.token, value); // if storage is blocked the in-memory token still works
  notifyListeners();
}

/** `expired` is used when the API answered 401, so the login page can explain why you are back there. */
export function clearToken(reason: 'logout' | 'expired' = 'logout'): void {
  const hadToken = getToken() !== null;
  token = null;
  removeKey(STORAGE_KEYS.token);
  if (!hadToken) return; // several requests can fail with 401 at once; react only to the first
  expired = reason === 'expired';
  notifyListeners();
}

export const wasSessionExpired = (): boolean => expired;

export function subscribeToToken(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
