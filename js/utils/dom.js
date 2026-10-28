// Small DOM helpers shared by every module.

const SVG_NS = 'http://www.w3.org/2000/svg';

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function svgEl(tag, attrs = {}, parent) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (parent) parent.appendChild(node);
  return node;
}

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Always escape user-entered text before putting it in innerHTML. */
export const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => HTML_ESCAPES[ch]);

export function fillOptions(select, options, placeholder) {
  const items = placeholder ? [{ value: '', label: placeholder }] : [];
  options.forEach(o => items.push(typeof o === 'string' ? { value: o, label: o } : o));
  select.innerHTML = items.map(o => `<option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`).join('');
}
