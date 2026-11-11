import type { ReactElement } from 'react';
import { getDemandForecast } from '../../api/analytics';
import { useFetch } from '../../hooks/useFetch';
import { assetUrl, formatAxisUsd, formatNumber } from '../../utils/format';
import { BarChart } from '../charts/BarChart';
import { ForecastNote } from '../charts/ForecastNote';
import { AsyncContent } from '../common/AsyncContent';
import { ChartCard } from './ChartCard';

interface DemandChartCardProps {
  refreshToken: number;
  onAssistant: () => void;
}

const formatDollars = (value: number): string => `$${formatNumber(value)}`;

/** The API only predicts the next 7 days, so this card has no period dropdown. */
export function DemandChartCard({ refreshToken, onAssistant }: DemandChartCardProps): ReactElement {
  const { state, reload } = useFetch(getDemandForecast, { reloadKey: refreshToken });

  const assistantButton = (
    <button type="button" className="fab" aria-label="Ask AI assistant" onClick={onAssistant}>
      <img src={assetUrl('assets/logo-light.svg')} alt="" />
    </button>
  );

  return (
    <ChartCard
      title="Demand Prediction (Next 7 Days)"
      chartLabel="Bar chart of predicted demand for the next seven days"
      extra={assistantButton}
    >
      <AsyncContent
        state={state}
        onRetry={reload}
        isEmpty={data => data.days.length === 0}
        emptyMessage="No demand prediction is available yet."
        errorMessage="Could not load the demand prediction."
      >
        {data => (
          <>
            <BarChart
              items={data.days}
              formatValue={formatNumber}
              formatDescription={formatDollars}
              formatTick={formatAxisUsd}
            />
            <ForecastNote title="Prediction method" method={data.method} />
          </>
        )}
      </AsyncContent>
    </ChartCard>
  );
}
