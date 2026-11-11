import type { Metric } from '../types';
import { fetchJson } from './client';
import type { RequestOptions } from './client';

interface MetricsResponse {
  metrics: Metric[];
}

export async function getMetrics(options?: RequestOptions): Promise<Metric[]> {
  const response = await fetchJson<MetricsResponse>('metrics.json', options);
  return response.metrics;
}
