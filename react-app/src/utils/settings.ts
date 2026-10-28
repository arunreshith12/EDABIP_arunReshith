import { CATEGORY_OPTIONS, PERIOD_OPTIONS, RANGE_OPTIONS, SORT_KEYS } from '../constants';
import type { CategoryFilter, PeriodKey, RangeKey, Settings, SortKey } from '../types';
import { isRecord } from './guards';

export const DEFAULT_SETTINGS: Settings = {
  range: '30',
  category: 'all',
  revRange: '6',
  demRange: '6',
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
    range: oneOf<RangeKey>(RANGE_OPTIONS.map(o => o.value), raw.range, DEFAULT_SETTINGS.range),
    category: oneOf<CategoryFilter>(CATEGORY_OPTIONS.map(o => o.value), raw.category, DEFAULT_SETTINGS.category),
    revRange: oneOf<PeriodKey>(PERIOD_OPTIONS.map(o => o.value), raw.revRange, DEFAULT_SETTINGS.revRange),
    demRange: oneOf<PeriodKey>(PERIOD_OPTIONS.map(o => o.value), raw.demRange, DEFAULT_SETTINGS.demRange),
    query: typeof raw.query === 'string' ? raw.query : '',
    sortKey,
    sortDir: raw.sortDir === 'desc' ? 'desc' : 'asc',
    showAll: raw.showAll === true
  };
}

export const parseTimestamp = (raw: unknown): number | null =>
  typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
