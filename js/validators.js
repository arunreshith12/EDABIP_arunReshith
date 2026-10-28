// Pure validation functions: no DOM, easy to test.
// Each returns an object of { fieldName: "message" }; an empty object means valid.

import { MODEL_TYPES, MODEL_STATUSES } from './config.js';

const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 \-&.()]*$/;

const isBlank = value => String(value ?? '').trim() === '';

function validateName(rawName, models, editingId) {
  const name = String(rawName ?? '').trim();
  if (!name) return 'Model name is required.';
  if (name.length < 3) return 'Model name must be at least 3 characters.';
  if (name.length > 40) return 'Model name must be 40 characters or fewer.';
  if (!NAME_PATTERN.test(name)) return 'Use letters, numbers, spaces and - & . ( ) only.';
  const duplicate = models.some(m => m.id !== editingId && m.name.toLowerCase() === name.toLowerCase());
  return duplicate ? 'A model with this name already exists.' : '';
}

function validateAccuracy(raw) {
  if (isBlank(raw)) return '';                       // optional field
  const value = Number(raw);
  if (Number.isNaN(value)) return 'Accuracy must be a number, for example 93.5.';
  return value < 0 || value > 100 ? 'Accuracy must be between 0 and 100.' : '';
}

function validateProgress(raw) {
  if (isBlank(raw)) return 'Enter the training progress (0 – 100).';
  const value = Number(raw);
  if (!Number.isInteger(value)) return 'Progress must be a whole number.';
  return value < 0 || value > 100 ? 'Progress must be between 0 and 100.' : '';
}

export function validateModel(values, models, editingId = null) {
  const errors = {
    name: validateName(values.name, models, editingId),
    type: MODEL_TYPES.includes(values.type) ? '' : 'Please choose a model type.',
    accuracy: validateAccuracy(values.accuracy),
    status: MODEL_STATUSES.includes(values.status) ? '' : 'Please choose a status.',
    progress: values.status === 'Training' ? validateProgress(values.progress) : ''
  };
  // keep only the fields that actually have a message
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}

export const isValid = errors => Object.keys(errors).length === 0;
