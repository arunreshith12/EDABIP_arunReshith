// The four Analytics endpoints. Components call these typed functions and never
// see URLs, headers or the API's JSON format. (Contract: docs/api-contract.md)

import { MODELS_MAX_PAGES, MODELS_PAGE_SIZE } from '../constants';
import type { DemandForecast, MetricsData, MlModel, PeriodKey, RangeKey, RevenueForecast } from '../types';
import { request } from './client';
import { mapDemand, mapMetrics, mapModelsPage, mapRevenue } from './mappers';

/** Accuracy, precision, recall and F1 with the change versus the previous period. */
export async function getMetrics(range: RangeKey): Promise<MetricsData> {
  return mapMetrics(await request('/analytics/metrics', { params: { range } }));
}

/** `months` of actual revenue followed by the API's forecast months. */
export async function getRevenueForecast(months: PeriodKey): Promise<RevenueForecast> {
  return mapRevenue(await request('/analytics/revenue-forecast', { params: { months } }));
}

/** The next 7 days. The API takes no parameters for this one. */
export async function getDemandForecast(): Promise<DemandForecast> {
  return mapDemand(await request('/analytics/demand-prediction'));
}

/** The whole ML model registry. Reads every page, so filtering and sorting can happen in the browser. */
export async function getModels(): Promise<MlModel[]> {
  const models: MlModel[] = [];

  for (let page = 1; page <= MODELS_MAX_PAGES; page += 1) {
    const result = mapModelsPage(await request('/analytics/models', { params: { page, size: MODELS_PAGE_SIZE } }));
    models.push(...result.items);
    if (result.items.length === 0 || models.length >= result.total) break;
  }
  return models;
}
