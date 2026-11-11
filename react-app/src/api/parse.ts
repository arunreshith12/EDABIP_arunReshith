// Small guards for checking an API response. When the API sends something the
// contract does not allow, the user sees a clear error state instead of a crash,
// and the message names the exact field so it can be reported to the backend.

import { isRecord } from '../utils/guards';
import { ApiError } from './errors';

function shapeError(path: string, expected: string): ApiError {
  return new ApiError(`Unexpected response from the API: "${path}" should be ${expected}.`, 502);
}

export function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value) || Array.isArray(value)) throw shapeError(path, 'an object');
  return value;
}

export function asArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw shapeError(path, 'a list');
  return value;
}

export function asString(value: unknown, path: string): string {
  if (typeof value !== 'string') throw shapeError(path, 'text');
  return value;
}

export function asNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw shapeError(path, 'a number');
  return value;
}

export function asNumberOrNull(value: unknown, path: string): number | null {
  return value === null || value === undefined ? null : asNumber(value, path);
}

export function asStringOrNull(value: unknown, path: string): string | null {
  return value === null || value === undefined ? null : asString(value, path);
}

export { shapeError };

/** The value must be exactly one of `options` (used for fields like "kind": "actual" | "forecast"). */
export function asOneOf<T extends string>(value: unknown, options: readonly T[], path: string): T {
  const found = options.find(option => option === value);
  if (found === undefined) throw shapeError(path, `one of: ${options.join(', ')}`);
  return found;
}
