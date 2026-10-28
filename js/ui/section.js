// Generic "load data -> show loading -> render / empty / error" flow.
// Every section (KPIs, charts, notifications) uses this one function.

import { renderState, clearState } from './states.js';

/**
 * @returns {Promise<boolean>} true when data was rendered successfully
 */
export async function loadSection({
  host,
  load,
  render,
  isEmpty = data => !data || data.length === 0,
  emptyMessage,
  errorMessage,
  retry
}) {
  renderState(host, 'loading');
  try {
    const data = await load();
    if (isEmpty(data)) {
      renderState(host, 'empty', { message: emptyMessage });
      return false;
    }
    clearState(host);
    render(data);
    return true;
  } catch (error) {
    const reason = error instanceof Error ? ` (${error.message})` : '';
    renderState(host, 'error', {
      message: `${errorMessage ?? 'Could not load data.'}${reason}`,
      action: retry ? { label: 'Try again', onClick: retry } : undefined
    });
    return false;
  }
}
