import { getDemandData, getRevenueData } from './charts';
import { getMetrics } from './metrics';

/** Re-downloads the dashboard files, bypassing the cache (used by the Refresh button). */
export async function refreshDashboardData(): Promise<void> {
  await Promise.allSettled([
    getMetrics({ force: true }),
    getRevenueData({ force: true }),
    getDemandData({ force: true })
  ]);
}
