// Registry table: filtering, sorting and rendering. The filter/sort functions are
// pure (no DOM) so they can be reused or tested on their own.

import { PREVIEW_ROWS } from '../config.js';
import { $, $$, escapeHtml } from '../utils/dom.js';
import { formatPercent } from '../utils/format.js';
import { renderState, clearState } from './states.js';

export const statusLabel = model =>
  model.status === 'Training' ? `Training ${model.progress ?? 0}%` : model.status;

export function filterModels(models, { query, category }) {
  const text = query.toLowerCase();
  return models.filter(m =>
    (category === 'all' || m.type === category) &&
    `${m.name} ${m.type} ${statusLabel(m)}`.toLowerCase().includes(text)
  );
}

export function sortModels(models, key, direction) {
  if (!key) return models;
  const sign = direction === 'asc' ? 1 : -1;
  return [...models].sort((a, b) => {
    const left = a[key] ?? -1;
    const right = b[key] ?? -1;
    const order = typeof left === 'string' ? left.localeCompare(right) : left - right;
    return order * sign;
  });
}

function rowHtml(model) {
  const action = (name, cls = '') =>
    `<button type="button" class="${cls}" data-action="${name}" data-id="${escapeHtml(model.id)}" aria-label="${name} ${escapeHtml(model.name)}">${name[0].toUpperCase() + name.slice(1)}</button>`;

  return `
    <tr>
      <th scope="row" class="cell-name">${escapeHtml(model.name)}</th>
      <td>${escapeHtml(model.type)}</td>
      <td>${formatPercent(model.accuracy)}</td>
      <td><span class="status status--${model.status.toLowerCase()}">${escapeHtml(statusLabel(model))}</span></td>
      <td><div class="row-actions">${action('view')}${action('edit')}${action('delete', 'is-danger')}</div></td>
    </tr>`;
}

function updateSortIndicators({ sortKey, sortDir }) {
  $$('.sort').forEach(button => {
    const active = button.dataset.key === sortKey;
    if (active) button.dataset.dir = sortDir; else button.removeAttribute('data-dir');
    button.closest('th').setAttribute('aria-sort', active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none');
  });
}

function updateViewAll(total, showAll) {
  const button = $('#viewAllBtn');
  button.hidden = total <= PREVIEW_ROWS;
  button.setAttribute('aria-expanded', String(showAll));
  $('#viewAllLabel').textContent = showAll ? 'Show Less' : 'View All';
}

/**
 * @param {object[]} models all models
 * @param {object} settings current page settings
 * @param {{onClearFilters: Function, onAdd: Function}} actions
 */
export function renderRegistry(models, settings, { onClearFilters, onAdd }) {
  const table = $('#registryTable');
  const stateHost = $('#registryState');
  const filtered = sortModels(filterModels(models, settings), settings.sortKey, settings.sortDir);

  updateSortIndicators(settings);
  updateViewAll(filtered.length, settings.showAll);

  if (filtered.length === 0) {
    table.hidden = true;
    const hasModels = models.length > 0;
    renderState(stateHost, 'empty', hasModels
      ? { message: 'No models match your search or filter.', action: { label: 'Clear filters', onClick: onClearFilters } }
      : { message: 'No models yet. Add your first model to get started.', action: { label: 'Add Model', onClick: onAdd } });
    return;
  }

  clearState(stateHost);
  table.hidden = false;
  const visible = settings.showAll ? filtered : filtered.slice(0, PREVIEW_ROWS);
  $('#registryBody').innerHTML = visible.map(rowHtml).join('');
}
