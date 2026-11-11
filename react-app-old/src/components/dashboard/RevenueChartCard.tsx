import { useCallback } from 'react';
import type { ReactElement } from 'react';
import { getRevenueSeries } from '../../api/charts';
import { useFetch } from '../../hooks/useFetch';
import type { PeriodKey } from '../../types';
import { AsyncContent } from '../common/AsyncContent';
import { LineChart } from '../charts/LineChart';
import { ChartCard } from './ChartCard';

const formatRevenue = (value: number): string => `$${value}K`;
const formatRevenueTick = (value: number): string => (value === 0 ? '0' : formatRevenue(value));

interface RevenueChartCardProps {
  period: PeriodKey;
  onPeriodChange: (period: PeriodKey) => void;
  refreshToken: number;
}

export function RevenueChartCard({ period, onPeriodChange, refreshToken }: RevenueChartCardProps): ReactElement {
  // a new `period` gives a new function, so useFetch loads the other dataset
  const load = useCallback(() => getRevenueSeries(period), [period]);
  const { state, reload } = useFetch(load, { reloadKey: refreshToken });

  return (
    <ChartCard
      title="Revenue Forecast"
      periodLabel="Revenue forecast period"
      chartLabel="Area chart of revenue forecast by month"
      period={period}
      onPeriodChange={onPeriodChange}
    >
      <AsyncContent
        state={state}
        onRetry={reload}
        isEmpty={series => series.values.length === 0}
        emptyMessage="No revenue data for this period."
        errorMessage="Could not load the revenue forecast."
      >
        {series => (
          <LineChart
            labels={series.labels}
            values={series.values}
            formatValue={formatRevenue}
            formatTick={formatRevenueTick}
            xTitle="Month"
            yTitle="Revenue (USD)"
          />
        )}
      </AsyncContent>
    </ChartCard>
  );
}
