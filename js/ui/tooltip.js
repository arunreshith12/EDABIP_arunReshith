// Hover + keyboard-focus tooltip used by chart points and bars.

import { $ } from '../utils/dom.js';

const tip = $('#tooltip');

function show(text, x, y) {
  tip.textContent = text;
  tip.hidden = false;
  tip.style.left = `${x}px`;
  tip.style.top = `${y}px`;
}

const hide = () => { tip.hidden = true; };

export function bindTooltip(node, text) {
  node.addEventListener('mousemove', e => show(text, e.clientX, e.clientY));
  node.addEventListener('mouseleave', hide);
  node.addEventListener('focus', () => {
    const box = node.getBoundingClientRect();
    show(text, box.left + box.width / 2, box.top);
  });
  node.addEventListener('blur', hide);
}
