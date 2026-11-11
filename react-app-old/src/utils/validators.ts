// Pure validation functions (no React, no DOM). Each field returns a message,
// or an empty string when the value is fine.

import { MODEL_STATUSES, MODEL_TYPES } from '../constants';
import type { MlModel, ModelFormErrors, ModelFormValues } from '../types';

const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 &.()-]*$/;

const isBlank = (value: string): boolean => value.trim() === '';

function validateName(rawName: string, models: readonly MlModel[], editingId: string | null): string {
  const name = rawName.trim();
  if (name === '') return 'Model name is required.';
  if (name.length < 3) return 'Model name must be at least 3 characters.';
  if (name.length > 40) return 'Model name must be 40 characters or fewer.';
  if (!NAME_PATTERN.test(name)) return 'Use letters, numbers, spaces and - & . ( ) only.';
  const duplicate = models.some(m => m.id !== editingId && m.name.toLowerCase() === name.toLowerCase());
  return duplicate ? 'A model with this name already exists.' : '';
}

function validateAccuracy(raw: string): string {
  if (isBlank(raw)) return ''; // optional field
  const value = Number(raw);
  if (Number.isNaN(value)) return 'Accuracy must be a number, for example 93.5.';
  return value < 0 || value > 100 ? 'Accuracy must be between 0 and 100.' : '';
}

function validateProgress(raw: string): string {
  if (isBlank(raw)) return 'Enter the training progress (0 – 100).';
  const value = Number(raw);
  if (!Number.isInteger(value)) return 'Progress must be a whole number.';
  return value < 0 || value > 100 ? 'Progress must be between 0 and 100.' : '';
}

export function validateModel(
  values: ModelFormValues,
  models: readonly MlModel[],
  editingId: string | null
): ModelFormErrors {
  const checks: [keyof ModelFormValues, string][] = [
    ['name', validateName(values.name, models, editingId)],
    ['type', MODEL_TYPES.some(t => t === values.type) ? '' : 'Please choose a model type.'],
    ['accuracy', validateAccuracy(values.accuracy)],
    ['status', MODEL_STATUSES.some(s => s === values.status) ? '' : 'Please choose a status.'],
    ['progress', values.status === 'Training' ? validateProgress(values.progress) : '']
  ];

  const errors: ModelFormErrors = {};
  for (const [field, message] of checks) {
    if (message !== '') errors[field] = message;
  }
  return errors;
}

export const hasErrors = (errors: ModelFormErrors): boolean => Object.keys(errors).length > 0;
