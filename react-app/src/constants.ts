// Constants shared by the whole app. `as const` lets TypeScript derive
// exact union types from these arrays (see src/types/index.ts).

export const SORT_KEYS = ['name', 'type', 'accuracy'] as const;

/** Values of the "Last N Days" dropdown. Sent to the API as `range`. */
export const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' }
] as const;

/** Values of the revenue dropdown. Sent to the API as `months` (months of actual history). */
export const PERIOD_OPTIONS = [
  { value: '3', label: 'Last 3 Months' },
  { value: '6', label: 'Last 6 Months' },
  { value: '12', label: 'Last 12 Months' }
] as const;

export const ALL_CATEGORIES = 'all';

export const PREVIEW_ROWS = 4;

/** Page size used when loading the model registry (the contract allows at most 100). */
export const MODELS_PAGE_SIZE = 100;
/** Safety limit so a broken `total` can never cause an endless loading loop. */
export const MODELS_MAX_PAGES = 20;

/** Bar colours for the 7 demand bars, in order (matches the Figma). */
export const DEMAND_COLORS = [
  'var(--ch-mint)',
  'var(--ch-lilac)',
  'var(--ch-periwinkle)',
  'var(--ch-deep)',
  'var(--ch-slate)',
  'var(--ch-sage)',
  'var(--ch-rose)'
] as const;

/** Set VITE_REQUIRE_LOGIN=false when the API needs no token (the dashboard then opens without the login page). */
export const REQUIRE_LOGIN: boolean = import.meta.env.VITE_REQUIRE_LOGIN !== 'false';

export const STORAGE_KEYS = {
  settings: 'edabip.react.settings',
  token: 'edabip.react.token'
} as const;
