// Model registry data. The seed comes from the API (public/data/models.json);
// the user's own changes are kept in localStorage. When a real backend exists,
// replace the storage parts of these functions with POST / PUT / DELETE calls.

import { STORAGE_KEYS } from '../constants';
import type { MlModel } from '../types';
import { readJson, removeKey, writeJson } from '../utils/storage';
import { parseModels } from '../utils/models';
import { fetchJson } from './client';
import type { RequestOptions } from './client';

interface ModelsResponse {
  models: MlModel[];
}

export async function getSeedModels(options?: RequestOptions): Promise<MlModel[]> {
  const response = await fetchJson<ModelsResponse>('models.json', options);
  return response.models;
}

/** The user's saved models if there are any, otherwise the seed data. */
export async function getModels(): Promise<MlModel[]> {
  const saved = parseModels(readJson(STORAGE_KEYS.models));
  return saved ?? getSeedModels();
}

/** @returns true when the models were saved */
export const saveModels = (models: readonly MlModel[]): boolean => writeJson(STORAGE_KEYS.models, models);

export async function resetModels(): Promise<MlModel[]> {
  removeKey(STORAGE_KEYS.models);
  return getSeedModels();
}
