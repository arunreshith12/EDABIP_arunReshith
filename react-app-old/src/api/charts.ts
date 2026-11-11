import type { DemandData, DemandPoint, PeriodKey, RevenueData, RevenueSeries } from '../types';
import { fetchJson } from './client';
import type { RequestOptions } from './client';

export const getRevenueData = (options?: RequestOptions): Promise<RevenueData> =>
  fetchJson<RevenueData>('revenue.json', options);

export const getDemandData = (options?: RequestOptions): Promise<DemandData> =>
  fetchJson<DemandData>('demand.json', options);

export async function getRevenueSeries(period: PeriodKey, options?: RequestOptions): Promise<RevenueSeries> {
  return (await getRevenueData(options)).ranges[period];
}

export async function getDemandSeries(period: PeriodKey, options?: RequestOptions): Promise<DemandPoint[]> {
  return (await getDemandData(options)).ranges[period];
}
