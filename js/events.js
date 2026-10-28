// Connects DOM events to handler functions. No business logic lives here.

import { $, $$ } from './utils/dom.js';

const isTyping = el => ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);

const onChange = (selector, handler) =>
  $(selector).addEventListener('change', e => handler(e.target.value));

const onClick = (selector, handler) =>
  $(selector).addEventListener('click', handler);

export function bindEvents(handlers) {
  const search = $('#searchInput');

  search.addEventListener('input', () => handlers.onSearch(search.value.trim()));
  onClick('#searchClear', () => {
    search.value = '';
    handlers.onSearch('');
    search.focus();
  });

  // "/" jumps to search, like many dashboards
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !isTyping(e.target)) {
      e.preventDefault();
      search.focus();
    }
  });

  onChange('#categorySelect', handlers.onCategory);
  onChange('#rangeSelect', handlers.onRange);
  onChange('#revRange', handlers.onRevenueRange);
  onChange('#demRange', handlers.onDemandRange);

  onClick('#viewAllBtn', handlers.onToggleAll);
  onClick('#addModelBtn', handlers.onAddModel);
  onClick('#resetBtn', handlers.onReset);
  onClick('#refreshBtn', handlers.onRefresh);
  onClick('#exportBtn', handlers.onExport);
  onClick('#fabBtn', handlers.onAssistant);

  $$('.sort').forEach(button => button.addEventListener('click', () => handlers.onSort(button.dataset.key)));

  // one listener for every row button (event delegation)
  $('#registryBody').addEventListener('click', e => {
    const button = e.target.closest('[data-action]');
    if (button) handlers.onModelAction(button.dataset.action, button.dataset.id);
  });
}
