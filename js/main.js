// Entry point: loads data, renders sections, and reacts to user actions.

import { MODEL_TYPES, STORAGE_KEYS } from './config.js';
import { loadMetrics, loadRevenueSeries, loadDemandSeries, loadNotifications } from './api.js';
import { loadModels, saveModels, resetModels } from './modelStore.js';
import { state, updateSettings } from './state.js';
import { readJson, writeJson } from './storage.js';
import { bindEvents } from './events.js';
import { $, fillOptions } from './utils/dom.js';
import { timeAgo, toCsvRow } from './utils/format.js';
import { loadSection } from './ui/section.js';
import { renderState } from './ui/states.js';
import { renderKpis } from './ui/kpis.js';
import { renderAreaChart, renderBarChart } from './ui/charts.js';
import { renderRegistry } from './ui/table.js';
import { showModelDetails, confirmAction } from './ui/dialogs.js';
import { initModelForm, openModelForm } from './ui/modelForm.js';
import { initNotifications } from './ui/notifications.js';
import { toast } from './ui/toast.js';

const els = {
  kpis: $('#kpiGrid'),
  revenue: $('#revenueChart'),
  demand: $('#demandChart'),
  registryState: $('#registryState'),
  registryTable: $('#registryTable'),
  refreshed: $('#lastRefreshed'),
  refreshBtn: $('#refreshBtn')
};

/* ---------------- sections (each = fetch -> loading/error/empty -> render) ---------------- */

const loadKpiSection = (force = false) => loadSection({
  host: els.kpis,
  load: () => loadMetrics({ force }),
  render: metrics => renderKpis(els.kpis, metrics, state.settings.range),
  emptyMessage: 'No metrics available yet.',
  errorMessage: 'Could not load the metric cards.',
  retry: () => loadKpiSection(force)
});

const loadRevenueSection = (force = false) => loadSection({
  host: els.revenue,
  load: () => loadRevenueSeries(state.settings.revRange, { force }),
  isEmpty: series => !series?.values?.length,
  render: series => renderAreaChart(els.revenue, series),
  emptyMessage: 'No revenue data for this period.',
  errorMessage: 'Could not load the revenue forecast.',
  retry: () => loadRevenueSection(force)
});

const loadDemandSection = (force = false) => loadSection({
  host: els.demand,
  load: () => loadDemandSeries(state.settings.demRange, { force }),
  render: items => renderBarChart(els.demand, items),
  emptyMessage: 'No demand data for this period.',
  errorMessage: 'Could not load the demand prediction.',
  retry: () => loadDemandSection(force)
});

async function loadRegistrySection() {
  els.registryTable.hidden = true;
  renderState(els.registryState, 'loading', { message: 'Loading models…' });
  try {
    state.models = await loadModels();
    drawRegistry();
  } catch (error) {
    renderState(els.registryState, 'error', {
      message: `Could not load the model registry (${error.message}).`,
      action: { label: 'Try again', onClick: loadRegistrySection }
    });
  }
}

/* ---------------- registry helpers ---------------- */

function drawRegistry() {
  renderRegistry(state.models, state.settings, { onClearFilters: clearFilters, onAdd: () => openModelForm() });
}

function commitModels(models, message) {
  state.models = models;
  if (!saveModels(models)) toast('Changes could not be saved in this browser.');
  else toast(message);
  drawRegistry();
}

function clearFilters() {
  updateSettings({ query: '', category: 'all' });
  $('#searchInput').value = '';
  $('#categorySelect').value = 'all';
  drawRegistry();
}

/* ---------------- last refreshed label ---------------- */

function stampRefreshed() {
  writeJson(STORAGE_KEYS.refreshed, Date.now());
}

function updateRefreshedLabel() {
  els.refreshed.textContent = `Last Refreshed: ${timeAgo(readJson(STORAGE_KEYS.refreshed, Date.now()))}`;
}

/* ---------------- event handlers ---------------- */

const handlers = {
  onSearch(query) { updateSettings({ query }); drawRegistry(); },
  onCategory(category) { updateSettings({ category }); drawRegistry(); },

  onRange(range) {
    updateSettings({ range });
    loadKpiSection();
    toast(`Showing metrics for the last ${range} days`);
  },
  onRevenueRange(revRange) { updateSettings({ revRange }); loadRevenueSection(); },
  onDemandRange(demRange) { updateSettings({ demRange }); loadDemandSection(); },

  onToggleAll() { updateSettings({ showAll: !state.settings.showAll }); drawRegistry(); },

  onSort(key) {
    const { sortKey, sortDir } = state.settings;
    updateSettings({ sortKey: key, sortDir: sortKey === key && sortDir === 'asc' ? 'desc' : 'asc' });
    drawRegistry();
  },

  onAddModel() { openModelForm(); },

  async onModelAction(action, id) {
    const model = state.models.find(m => m.id === id);
    if (!model) return;

    if (action === 'view') showModelDetails(model);
    if (action === 'edit') openModelForm(model);
    if (action === 'delete') {
      const confirmed = await confirmAction({
        title: 'Delete model?',
        message: `"${model.name}" will be removed from the registry.`,
        confirmLabel: 'Delete'
      });
      if (confirmed) commitModels(state.models.filter(m => m.id !== id), 'Model deleted');
    }
  },

  async onReset() {
    const confirmed = await confirmAction({
      title: 'Reset data?',
      message: 'This removes your changes and restores the original sample models.',
      confirmLabel: 'Reset'
    });
    if (!confirmed) return;
    state.models = await resetModels();
    drawRegistry();
    toast('Sample data restored');
  },

  async onRefresh() {
    els.refreshBtn.classList.add('is-loading');
    els.refreshBtn.disabled = true;
    await Promise.all([loadKpiSection(true), loadRevenueSection(true), loadDemandSection(true)]);
    stampRefreshed();
    updateRefreshedLabel();
    els.refreshBtn.classList.remove('is-loading');
    els.refreshBtn.disabled = false;
    toast('Dashboard refreshed');
  },

  onExport() {
    const rows = [
      ['Model Name', 'Type', 'Accuracy', 'Status'],
      ...state.models.map(m => [m.name, m.type, m.accuracy ?? '-', m.status])
    ];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([rows.map(toCsvRow).join('\n')], { type: 'text/csv' }));
    link.download = 'ml-model-registry.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    toast('Exported ml-model-registry.csv');
  },

  onAssistant() { toast('AI assistant coming soon'); }
};

function saveFromForm(model, isEdit) {
  const models = isEdit
    ? state.models.map(m => (m.id === model.id ? model : m))
    : [model, ...state.models];
  commitModels(models, isEdit ? 'Model updated' : 'Model added');
}

/* ---------------- start-up ---------------- */

function restoreControls() {
  const { range, category, revRange, demRange, query } = state.settings;
  $('#rangeSelect').value = range;
  $('#categorySelect').value = category;
  $('#revRange').value = revRange;
  $('#demRange').value = demRange;
  $('#searchInput').value = query;
}

function init() {
  fillOptions($('#categorySelect'), [{ value: 'all', label: 'All Categories' }, ...MODEL_TYPES]);
  restoreControls();

  bindEvents(handlers);
  initModelForm({ getModels: () => state.models, onSave: saveFromForm });
  initNotifications(loadNotifications);

  if (readJson(STORAGE_KEYS.refreshed) === null) stampRefreshed();
  updateRefreshedLabel();
  setInterval(updateRefreshedLabel, 60000);

  loadKpiSection();
  loadRevenueSection();
  loadDemandSection();
  loadRegistrySection();
}

init();
