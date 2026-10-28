import { $ } from '../utils/dom.js';

const toastEl = $('#toast');
let timer;

export function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(timer);
  timer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}
