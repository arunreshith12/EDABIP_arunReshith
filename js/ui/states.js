// One place that knows how loading / error / empty look.

import { escapeHtml } from '../utils/dom.js';

const DEFAULT_MESSAGES = {
  loading: 'Loading…',
  error: 'Something went wrong while loading this section.',
  empty: 'Nothing to show yet.'
};

/**
 * @param {HTMLElement} host
 * @param {'loading'|'error'|'empty'} kind
 * @param {{message?: string, action?: {label: string, onClick: Function}}} [options]
 */
export function renderState(host, kind, { message, action } = {}) {
  const spinner = kind === 'loading' ? '<span class="spinner" aria-hidden="true"></span>' : '';
  const button = action
    ? `<button type="button" class="btn btn--primary state__action">${escapeHtml(action.label)}</button>`
    : '';
  const role = kind === 'error' ? 'alert' : 'status';

  host.innerHTML = `
    <div class="state state--${kind}" role="${role}">
      ${spinner}<p>${escapeHtml(message ?? DEFAULT_MESSAGES[kind])}</p>${button}
    </div>`;

  if (action) host.querySelector('.state__action').addEventListener('click', action.onClick);
}

export const clearState = host => { host.innerHTML = ''; };
