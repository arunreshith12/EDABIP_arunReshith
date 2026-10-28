// Data loading: fetch + async/await. Responses are cached so changing a
// dropdown does not hit the network again; `force` bypasses the cache (Refresh).

import { PATHS } from './config.js';

const cache = new Map();

export async function fetchJson(path, { force = false } = {}) {
  if (!force && cache.has(path)) return cache.get(path);

  const response = await fetch(path, { cache: force ? 'no-store' : 'default' });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);

  const data = await response.json();
  cache.set(path, data);
  return data;
}

export async function loadMetrics(opts) {
  return (await fetchJson(PATHS.metrics, opts)).metrics;
}

export async function loadRevenueSeries(range, opts) {
  return (await fetchJson(PATHS.revenue, opts)).ranges[range];
}

export async function loadDemandSeries(range, opts) {
  return (await fetchJson(PATHS.demand, opts)).ranges[range];
}

export async function loadNotifications(opts) {
  return (await fetchJson(PATHS.notifications, opts)).notifications;
}

export async function loadSeedModels(opts) {
  return (await fetchJson(PATHS.models, opts)).models;
}
