// Native <dialog> helpers: details view and a reusable confirmation.

import { $, escapeHtml } from '../utils/dom.js';
import { formatPercent } from '../utils/format.js';
import { statusLabel } from './table.js';

export function showModelDetails(model) {
  $('#dlgTitle').textContent = model.name;
  $('#dlgBody').innerHTML = `
    <dt>Type</dt><dd>${escapeHtml(model.type)}</dd>
    <dt>Accuracy</dt><dd>${formatPercent(model.accuracy)}</dd>
    <dt>Status</dt><dd>${escapeHtml(statusLabel(model))}</dd>
    <dt>Version</dt><dd>${escapeHtml(model.version)}</dd>
    <dt>Last updated</dt><dd>${escapeHtml(model.updated)}</dd>`;
  $('#modelDialog').showModal();
}

/** @returns {Promise<boolean>} true if the user pressed the confirm button */
export function confirmAction({ title, message, confirmLabel = 'Confirm' }) {
  const dialog = $('#confirmDialog');
  $('#confirmTitle').textContent = title;
  $('#confirmText').textContent = message;
  $('#confirmOk').textContent = confirmLabel;

  return new Promise(resolve => {
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true });
    dialog.returnValue = 'cancel';
    dialog.showModal();
  });
}
