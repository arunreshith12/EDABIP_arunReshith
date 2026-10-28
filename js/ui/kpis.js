// Renders the four metric cards from data/metrics.json.

import { escapeHtml } from '../utils/dom.js';
import { iconSvg } from '../utils/icons.js';

const SPARK = { width: 190, height: 50, pad: 3, minSpan: 6 };

function sparkPoints(series) {
  const { width, height, pad, minSpan } = SPARK;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const middle = (max + min) / 2;
  const span = Math.max(max - min, minSpan);   // flat series stay gentle instead of being stretched
  return series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * width;
      const y = height - pad - ((v - middle) / span + 0.5) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(' L');
}

function sparkline(series, kind, uid) {
  const { width, height } = SPARK;
  const points = sparkPoints(series);
  const gradient = kind === 'line'
    ? '<stop offset="0" stop-color="#bfe6e0" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>'
    : '<stop offset="0" stop-color="#5fe0d0"/><stop offset="1" stop-color="#d4f6f1" stop-opacity=".5"/>';
  const shape = kind === 'line'
    ? `<path d="M${points} L${width},${height} L0,${height}Z" fill="url(#spark-${uid})"/>
       <path d="M${points}" fill="none" stroke="#134b4a" stroke-width="1.6" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`
    : `<path d="M0,${height} L${points} L${width},${height}Z" fill="url(#spark-${uid})" opacity=".85"/>`;

  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="spark-${uid}" x1="0" y1="0" x2="0" y2="1">${gradient}</linearGradient></defs>${shape}</svg>`;
}

function kpiCard(metric, range) {
  const value = metric.values[range] ?? Object.values(metric.values)[0];
  const { trend } = metric;
  return `
    <article class="kpi" aria-label="${escapeHtml(metric.title)}">
      <div class="kpi__top">
        <span class="kpi__icon">${iconSvg(metric.icon)}</span>
        <h3>${escapeHtml(metric.title)}</h3>
      </div>
      <div class="kpi__mid">
        <p class="kpi__value">${escapeHtml(value)}</p>
        <div class="kpi__spark">${sparkline(metric.series, metric.spark, metric.id)}</div>
      </div>
      <span class="badge badge--${trend.tone}">${trend.icon ? iconSvg(trend.icon) : ''}${escapeHtml(trend.text)}</span>
    </article>`;
}

export function renderKpis(host, metrics, range) {
  host.innerHTML = metrics.map(metric => kpiCard(metric, range)).join('');
}
