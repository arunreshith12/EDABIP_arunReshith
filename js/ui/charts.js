// SVG charts drawn by hand. Both charts share createChart() for the grid/axes.

import { svgEl } from '../utils/dom.js';
import { formatNumber, niceCeil } from '../utils/format.js';
import { bindTooltip } from './tooltip.js';

function createChart(host, { width, height, left, right, top, bottom, yMax, formatTick }) {
  host.innerHTML = '';
  const svg = svgEl('svg', { viewBox: `0 0 ${width} ${height}` }, host);
  const y = value => top + (1 - value / yMax) * (height - top - bottom);

  for (let i = 0; i <= 4; i++) {
    const value = (yMax * i) / 4;
    svgEl('line', { x1: left, x2: width - right, y1: y(value), y2: y(value), class: 'grid' }, svg);
    svgEl('line', { x1: left - 5, x2: left, y1: y(value), y2: y(value), class: 'axis' }, svg);
    svgEl('text', { x: left - 10, y: y(value) + 4, 'text-anchor': 'end' }, svg).textContent = formatTick(value);
  }
  svgEl('line', { x1: left, x2: left, y1: top, y2: height - bottom, class: 'axis' }, svg);
  svgEl('line', { x1: left, x2: width - right, y1: height - bottom, y2: height - bottom, class: 'axis' }, svg);

  return { svg, y };
}

/** Smooth curve through the points (Catmull-Rom converted to Bezier). */
function smoothPath(points) {
  const tension = 0.18;
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) * tension},${p1[1] + (p2[1] - p0[1]) * tension}`
       + ` ${p2[0] - (p3[0] - p1[0]) * tension},${p2[1] - (p3[1] - p1[1]) * tension} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function renderAreaChart(host, { labels, values }) {
  const box = { width: 820, height: 340, left: 78, right: 28, top: 20, bottom: 52 };
  const yMax = niceCeil(Math.max(...values));
  const { svg, y } = createChart(host, { ...box, yMax, formatTick: v => (v ? `$${v}K` : '0') });
  const baseline = box.height - box.bottom;

  const x = i => box.left + (i / Math.max(labels.length - 1, 1)) * (box.width - box.left - box.right);
  const points = values.map((v, i) => [x(i), y(v)]);
  const curve = smoothPath(points);

  const defs = svgEl('defs', {}, svg);
  const gradient = svgEl('linearGradient', { id: 'revGrad', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  svgEl('stop', { offset: 0, 'stop-color': '#a8ffff' }, gradient);
  svgEl('stop', { offset: 1, 'stop-color': '#5c8a88' }, gradient);

  svgEl('path', { d: `${curve} L${points.at(-1)[0]},${baseline} L${points[0][0]},${baseline}Z`, fill: 'url(#revGrad)', opacity: 0.9 }, svg);
  svgEl('path', { d: curve, fill: 'none', stroke: '#0e3938', 'stroke-width': 2 }, svg);

  labels.forEach((label, i) => {
    svgEl('text', { x: x(i), y: baseline + 18, 'text-anchor': 'middle' }, svg).textContent = label;
    const description = `${label}: $${values[i]}K`;
    const dot = svgEl('circle', { cx: points[i][0], cy: points[i][1], r: 5, class: 'dot', tabindex: 0, role: 'img', 'aria-label': description }, svg);
    bindTooltip(dot, description);
  });

  svgEl('text', { x: (box.left + box.width - box.right) / 2, y: box.height - 8, 'text-anchor': 'middle', class: 'axis-title' }, svg).textContent = 'Month';
  svgEl('text', { transform: `translate(14 ${(box.top + baseline) / 2}) rotate(-90)`, 'text-anchor': 'middle', class: 'axis-title' }, svg).textContent = 'Revenue (USD)';
}

export function renderBarChart(host, items) {
  const box = { width: 740, height: 340, left: 66, right: 20, top: 20, bottom: 40 };
  const yMax = niceCeil(Math.max(...items.map(i => i.value)));
  const { svg, y } = createChart(host, { ...box, yMax, formatTick: v => (v ? `$${v / 1000}K` : '0') });
  const baseline = box.height - box.bottom;
  const slot = (box.width - box.left - box.right) / items.length;
  const barWidth = Math.min(44, slot * 0.6);

  items.forEach((item, i) => {
    const cx = box.left + slot * i + slot / 2;
    const description = `${item.label}: ${formatNumber(item.value)}`;
    const bar = svgEl('rect', {
      x: cx - barWidth / 2, y: y(item.value), width: barWidth, height: baseline - y(item.value),
      rx: 3, fill: item.color, class: 'bar', tabindex: 0, role: 'img', 'aria-label': description
    }, svg);
    bindTooltip(bar, description);
    svgEl('text', { x: cx, y: y(item.value) - 8, class: 'bar-val' }, svg).textContent = formatNumber(item.value);
    svgEl('text', { x: cx, y: baseline + 20, 'text-anchor': 'middle' }, svg).textContent = item.label;
  });
}
