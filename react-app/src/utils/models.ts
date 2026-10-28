// Everything that knows the *shape* of a model lives here: type guards,
// filtering, sorting, label formatting, and building a model from form text.

import { MODEL_STATUSES, MODEL_TYPES } from '../constants';
import type { MlModel, ModelFormValues, Settings, SortDir, SortKey } from '../types';
import { isRecord } from './guards';

const isModelType = (value: unknown): boolean => MODEL_TYPES.some(type => type === value);
const isModelStatus = (value: unknown): boolean => MODEL_STATUSES.some(status => status === value);
const isNumberOrNull = (value: unknown): boolean => value === null || typeof value === 'number';

export function isMlModel(value: unknown): value is MlModel {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    isModelType(value.type) &&
    isNumberOrNull(value.accuracy) &&
    isModelStatus(value.status) &&
    isNumberOrNull(value.progress) &&
    typeof value.version === 'string' &&
    typeof value.updated === 'string'
  );
}

/** Validates data read from localStorage. */
export function parseModels(raw: unknown): MlModel[] | null {
  return Array.isArray(raw) && raw.every(isMlModel) ? (raw as MlModel[]) : null;
}

export const statusLabel = (model: MlModel): string =>
  model.status === 'Training' ? `Training ${model.progress ?? 0}%` : model.status;

export function filterModels(models: readonly MlModel[], filters: Pick<Settings, 'query' | 'category'>): MlModel[] {
  const text = filters.query.trim().toLowerCase();
  return models.filter(
    model =>
      (filters.category === 'all' || model.type === filters.category) &&
      `${model.name} ${model.type} ${statusLabel(model)}`.toLowerCase().includes(text)
  );
}

export function sortModels(models: readonly MlModel[], key: SortKey | null, direction: SortDir): MlModel[] {
  if (key === null) return [...models];
  const sign = direction === 'asc' ? 1 : -1;
  return [...models].sort((a, b) => {
    const left = a[key] ?? -1;
    const right = b[key] ?? -1;
    const order =
      typeof left === 'string' && typeof right === 'string' ? left.localeCompare(right) : Number(left) - Number(right);
    return order * sign;
  });
}

export const newModelId = (): string =>
  `m-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function toFormValues(model: MlModel | null): ModelFormValues {
  return {
    name: model?.name ?? '',
    type: model?.type ?? '',
    accuracy: String(model?.accuracy ?? ''),
    status: model?.status ?? 'Active',
    progress: String(model?.progress ?? '')
  };
}

/** Converts validated form text into a model. Returns null if type/status are not valid. */
export function buildModel(values: ModelFormValues, editing: MlModel | null): MlModel | null {
  const type = MODEL_TYPES.find(t => t === values.type);
  const status = MODEL_STATUSES.find(s => s === values.status);
  if (type === undefined || status === undefined) return null;

  const accuracyText = values.accuracy.trim();
  return {
    id: editing?.id ?? newModelId(),
    name: values.name.trim(),
    type,
    accuracy: accuracyText === '' ? null : Number(accuracyText),
    status,
    progress: status === 'Training' ? Number(values.progress) : null,
    version: editing?.version ?? 'v1.0',
    updated: 'Just now'
  };
}
