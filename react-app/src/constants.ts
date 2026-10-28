// Constants shared by the whole app. `as const` lets TypeScript derive
// exact union types from these arrays (see src/types/index.ts).

export const MODEL_TYPES = ['Regression', 'Forecast', 'Classification', 'Optimization'] as const;
export const MODEL_STATUSES = ['Active', 'Training', 'Pending'] as const;
export const SORT_KEYS = ['name', 'type', 'accuracy'] as const;

export const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' }
] as const;

export const PERIOD_OPTIONS = [
  { value: '3', label: 'Last 3 Months' },
  { value: '6', label: 'Last 6 Months' },
  { value: '12', label: 'Last 12 Months' }
] as const;

const ALL_CATEGORIES = { value: 'all', label: 'All Categories' } as const;

export const CATEGORY_OPTIONS = [
  ALL_CATEGORIES,
  ...MODEL_TYPES.map(type => ({ value: type, label: type }))
];

export const PREVIEW_ROWS = 4;

export const STORAGE_KEYS = {
  settings: 'edabip.react.settings',
  models: 'edabip.react.models',
  refreshed: 'edabip.react.lastRefreshed'
} as const;
