// Bell icon + dropdown. The list is fetched from JSON the first time it opens.

import { $, escapeHtml } from '../utils/dom.js';
import { loadSection } from './section.js';

export function initNotifications(load) {
  const button = $('#notifBtn');
  const panel = $('#notifPanel');
  const list = $('#notifList');
  let loaded = false;

  const setOpen = open => {
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  };

  async function populate() {
    loaded = await loadSection({
      host: list,
      load,
      render: items => {
        list.innerHTML = `<ul>${items.map(n => `<li>${escapeHtml(n.text)}</li>`).join('')}</ul>`;
      },
      emptyMessage: 'You are all caught up.',
      errorMessage: 'Could not load notifications.',
      retry: populate
    });
  }

  button.addEventListener('click', async event => {
    event.stopPropagation();
    const willOpen = panel.hidden;
    setOpen(willOpen);
    if (willOpen && !loaded) await populate();
  });

  document.addEventListener('click', event => { if (!event.target.closest('.notif')) setOpen(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setOpen(false); });
}
