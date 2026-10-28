// Application state. Only `settings` is persisted here; models are persisted
// by modelStore.js.

import { DEFAULT_SETTINGS, STORAGE_KEYS } from './config.js';
import { readJson, writeJson } from './storage.js';

export const state = {
  settings: { ...DEFAULT_SETTINGS, ...readJson(STORAGE_KEYS.settings, {}) },
  models: []
};

if (!['asc', 'desc'].includes(state.settings.sortDir)) state.settings.sortDir = 'asc';

export function updateSettings(patch) {
  Object.assign(state.settings, patch);
  writeJson(STORAGE_KEYS.settings, state.settings);
}
