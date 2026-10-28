// Central place for constants so nothing is hard-coded in two places.

export const PATHS = {
  metrics: 'data/metrics.json',
  revenue: 'data/revenue.json',
  demand: 'data/demand.json',
  models: 'data/models.json',
  notifications: 'data/notifications.json'
};

export const STORAGE_KEYS = {
  settings: 'edabip.settings',
  models: 'edabip.models',
  refreshed: 'edabip.lastRefreshed'
};

export const MODEL_TYPES = ['Regression', 'Forecast', 'Classification', 'Optimization'];
export const MODEL_STATUSES = ['Active', 'Training', 'Pending'];
export const PREVIEW_ROWS = 4;

export const DEFAULT_SETTINGS = {
  range: '30',        // date range select
  category: 'all',    // registry type filter
  revRange: '6',      // revenue chart dataset
  demRange: '6',      // demand chart dataset
  query: '',          // search text
  sortKey: null,      // 'name' | 'type' | 'accuracy' | null
  sortDir: 'asc',
  showAll: false      // registry "View All"
};
