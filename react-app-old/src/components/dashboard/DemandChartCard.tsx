import { useCallback } from 'react';
import type { ReactElement } from 'react';
import { getDemandSeries } from '../../api/charts';
import { useFetch } from '../../hooks/useFetch';
import type { PeriodKey } from '../../types';
import { assetUrl, formatNumber } from '../../utils/format';
import { AsyncContent } from '../common/AsyncContent';
import { BarChart } from '../charts/BarChart';
import { ChartCard } from './ChartCard';

const formatDemandTick = (value: number): string => (value === 0 ? '0' : `$${value / 1000}K`);

interface DemandChartCardProps {
  period: PeriodKey;
  onPeriodChange: (period: PeriodKey) => void;
  refreshToken: number;
  onAssistant: () => void;
}

export function DemandChartCard({ period, onPeriodChange, refreshToken, onAssistant }: DemandChartCardProps): ReactElement {
  const load = useCallback(() => getDemandSeries(period), [period]);
  const { state, reload } = useFetch(load, { reloadKey: refreshToken });

  const assistantButton = (
    <button type="button" className="fab" aria-label="Ask AI assistant" onClick={onAssistant}>
      <img src={assetUrl('assets/logo-light.svg')} alt="" />
    </button>
  );

  return (
    <ChartCard
      title="Demand Prediction (Next 7 Days)"
      periodLabel="Demand prediction period"
      chartLabel="Bar chart of predicted demand for the next seven days"
      period={period}
      onPeriodChange={onPeriodChange}
      extra={assistantButton}
    >
      <AsyncContent
        state={state}
        onRetry={reload}
        emptyMessage="No demand data for this period."
        errorMessage="Could not load the demand prediction."
      >
        {items => <BarChart items={items} formatValue={formatNumber} formatTick={formatDemandTick} />}
      </AsyncContent>
    </ChartCard>
  );
}
