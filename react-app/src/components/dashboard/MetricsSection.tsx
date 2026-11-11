import type { ReactElement } from 'react';
import type { FetchState, MetricsData, RangeKey } from '../../types';
import { AsyncContent } from '../common/AsyncContent';
import { StatCard } from './StatCard';

interface MetricsSectionProps {
  /** Loaded by the page, because the page also shows "Last Refreshed" from the same response. */
  state: FetchState<MetricsData>;
  onRetry: () => void;
  range: RangeKey;
}

/** The four metric cards. */
export function MetricsSection({ state, onRetry, range }: MetricsSectionProps): ReactElement {
  return (
    <section className="kpis" aria-label="Model metrics" aria-live="polite">
      <AsyncContent
        state={state}
        onRetry={onRetry}
        isEmpty={data => data.metrics.length === 0}
        emptyMessage="No metrics available yet."
        errorMessage="Could not load the metric cards."
      >
        {data => data.metrics.map(metric => <StatCard key={metric.key} metric={metric} range={range} />)}
      </AsyncContent>
    </section>
  );
}
