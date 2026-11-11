// Everything the registry does with a list of models: filter, sort, find the types, build notifications.
// Pure functions (no React), so they are easy to test.

import type { AppNotification, MlModel, SortDir, SortKey } from '../types';

export function filterModels(
  models: readonly MlModel[],
  filters: { query: string; category: string }
): MlModel[] {
  const text = filters.query.trim().toLowerCase();
  return models.filter(
    model =>
      (filters.category === 'all' || model.type === filters.category) &&
      `${model.name} ${model.type} ${model.statusLabel}`.toLowerCase().includes(text)
  );
}

/** Sorts by name, type or accuracy. Models without an accuracy always go last, in both directions. */
export function sortModels(models: readonly MlModel[], key: SortKey | null, direction: SortDir): MlModel[] {
  if (key === null) return [...models];
  const sign = direction === 'asc' ? 1 : -1;

  return [...models].sort((a, b) => {
    if (key === 'accuracy') {
      if (a.accuracy === null || b.accuracy === null) {
        return a.accuracy === b.accuracy ? 0 : a.accuracy === null ? 1 : -1;
      }
      return (a.accuracy - b.accuracy) * sign;
    }
    return a[key].localeCompare(b[key]) * sign;
  });
}

/** The distinct model types, A to Z (used for the category dropdown). */
export const modelTypes = (models: readonly MlModel[]): string[] =>
  [...new Set(models.map(model => model.type))].sort((a, b) => a.localeCompare(b));

/** The bell menu has no API of its own: it reports models that are training or waiting. */
export function modelNotifications(models: readonly MlModel[]): AppNotification[] {
  const notifications: AppNotification[] = [];
  for (const model of models) {
    if (model.state === 'training') {
      notifications.push({ id: model.id, text: `${model.name} is ${model.progress ?? 0}% through training.` });
    } else if (model.state === 'pending') {
      notifications.push({ id: model.id, text: `${model.name} is waiting for approval.` });
    }
  }
  return notifications;
}
