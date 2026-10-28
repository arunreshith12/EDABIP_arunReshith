// Models live in two places: data/models.json (the seed) and localStorage
// (the user's edits). Once the user changes anything, localStorage wins.

import { STORAGE_KEYS } from './config.js';
import { loadSeedModels } from './api.js';
import { readJson, writeJson, removeKey } from './storage.js';

export async function loadModels() {
  const saved = readJson(STORAGE_KEYS.models, null);
  return Array.isArray(saved) ? saved : loadSeedModels();
}

export const saveModels = models => writeJson(STORAGE_KEYS.models, models);

export async function resetModels() {
  removeKey(STORAGE_KEYS.models);
  return loadSeedModels();
}

export const newModelId = () => `m-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
