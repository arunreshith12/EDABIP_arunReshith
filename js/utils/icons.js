export const ICONS = {
  bars: '<path d="M5 20V10M10 20V4M15 20v-7M20 20V8"/>',
  trend: '<path d="M4 18l5-6 4 3 7-9M4 20h16"/>',
  gauge: '<path d="M4 17a8 8 0 1 1 16 0M12 17l4-5"/><circle cx="12" cy="17" r="1.2" class="fill"/>',
  coin: '<circle cx="12" cy="13" r="7"/><path d="M9.5 5l2.5 2 2.5-2M12 10v6M10 11.5h3.2a1.2 1.2 0 0 1 0 2.4H10.8a1.2 1.2 0 0 0 0 2.4H14"/>',
  up: '<path d="M4 17l6-6 4 4 6-8M15 7h5v5"/>',
  down: '<path d="M4 7l6 6 4-4 6 8M15 17h5v-5"/>'
};

export const iconSvg = name =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] ?? ''}</svg>`;
