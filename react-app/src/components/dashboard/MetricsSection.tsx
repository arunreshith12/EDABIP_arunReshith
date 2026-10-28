import type { ReactElement } from 'react';
import { getMetrics } from '../../api/metrics';
import { useFetch } from '../../hooks/useFetch';
import type { RangeKey } from '../../types';
import { AsyncContent } from '../common/AsyncContent';
import { StatCard } from './StatCard';

interface MetricsSectionProps {
  range: RangeKey;
  /** Changes when the Refresh button is pressed. */
  refreshToken: number;
}

/** The four metric cards. Loads data/metrics.json through the API layer. */
export function MetricsSection({ range, refreshToken }: MetricsSectionProps): ReactElement {
  const { state, reload } = useFetch(getMetrics, { reloadKey: refreshToken });

  return (
    <section className="kpis" aria-label="Model metrics" aria-live="polite">
      <AsyncContent
        state={state}
        onRetry={reload}
        emptyMessage="No metrics available yet."
        errorMessage="Could not load the metric cards."
      >
        {metrics => metrics.map(metric => <StatCard key={metric.id} metric={metric} range={range} />)}
      </AsyncContent>
    </section>
  );
}
