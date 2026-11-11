// Which icon and sparkline style a metric card uses. The API only sends data;
// how a card looks is the front end's decision. Unknown metric keys get a safe default.

import type { IconName, SparkKind } from '../types';

interface MetricStyle {
  icon: IconName;
  spark: SparkKind;
}

const STYLES: Readonly<Record<string, MetricStyle>> = {
  accuracy: { icon: 'bars', spark: 'area' },
  precision: { icon: 'trend', spark: 'line' },
  recall: { icon: 'gauge', spark: 'area' },
  f1: { icon: 'coin', spark: 'area' }
};

const FALLBACK: MetricStyle = { icon: 'bars', spark: 'area' };

export const metricStyle = (key: string): MetricStyle => STYLES[key] ?? FALLBACK;
