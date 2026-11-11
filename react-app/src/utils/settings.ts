import { PERIOD_OPTIONS, RANGE_OPTIONS, SORT_KEYS } from '../constants';
import type { PeriodKey, RangeKey, Settings, SortKey } from '../types';
import { isRecord } from './guards';

export const DEFAULT_SETTINGS: Settings = {
  range: '30',
  category: 'all',
  revRange: '6',
  query: '',
  sortKey: null,
  sortDir: 'asc',
  showAll: false
};

/** Returns `value` when it is one of `options`, otherwise `fallback`. */
function oneOf<T extends string>(options: readonly T[], value: unknown, fallback: T): T {
  return options.find(option => option === value) ?? fallback;
}

/** Turns whatever was in localStorage into a safe Settings object (or null). */
export function parseSettings(raw: unknown): Settings | null {
  if (!isRecord(raw)) return null;

  const sortKey: SortKey | null = SORT_KEYS.find(key => key === raw.sortKey) ?? null;

  return {
    range: oneOf<RangeKey>(RANGE_OPTIONS.map(option => option.value), raw.range, DEFAULT_SETTINGS.range),
    // model types come from the API, so any text is accepted here; the page falls back to "all" if it no longer exists
    category: typeof raw.category === 'string' && raw.category !== '' ? raw.category : DEFAULT_SETTINGS.category,
    revRange: oneOf<PeriodKey>(PERIOD_OPTIONS.map(option => option.value), raw.revRange, DEFAULT_SETTINGS.revRange),
    query: typeof raw.query === 'string' ? raw.query : '',
    sortKey,
    sortDir: raw.sortDir === 'desc' ? 'desc' : 'asc',
    showAll: raw.showAll === true
  };
}
