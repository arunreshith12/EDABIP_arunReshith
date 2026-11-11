import { useCallback } from 'react';
import type { ReactElement } from 'react';
import { getRevenueForecast } from '../../api/analytics';
import { PERIOD_OPTIONS } from '../../constants';
import { useFetch } from '../../hooks/useFetch';
import type { PeriodKey } from '../../types';
import { formatAxisUsd, formatUsdThousands } from '../../utils/format';
import { ForecastNote } from '../charts/ForecastNote';
import { LineChart } from '../charts/LineChart';
import { AsyncContent } from '../common/AsyncContent';
import { Select } from '../ui/Select';
import { ChartCard } from './ChartCard';

interface RevenueChartCardProps {
  period: PeriodKey;
  onPeriodChange: (period: PeriodKey) => void;
  refreshToken: number;
}

export function RevenueChartCard({ period, onPeriodChange, refreshToken }: RevenueChartCardProps): ReactElement {
  // a new `period` gives a new function, so useFetch asks the API again with ?months=<period>
  const load = useCallback(() => getRevenueForecast(period), [period]);
  const { state, reload } = useFetch(load, { reloadKey: refreshToken });

  return (
    <ChartCard
      title="Revenue Forecast"
      chartLabel="Area chart of monthly revenue: actual months followed by forecast months"
      headerExtra={
        <Select
          label="Revenue forecast period"
          variant="outline"
          value={period}
          options={PERIOD_OPTIONS}
          onChange={onPeriodChange}
        />
      }
    >
      <AsyncContent
        state={state}
        onRetry={reload}
        isEmpty={data => data.points.length === 0}
        emptyMessage="No revenue data for this period."
        errorMessage="Could not load the revenue forecast."
      >
        {data => (
          <>
            <LineChart
              points={data.points}
              formatValue={formatUsdThousands}
              formatTick={formatAxisUsd}
              xTitle="Month"
              yTitle="Revenue (USD)"
            />
            <ForecastNote title="Forecast method" method={data.method} showLegend />
          </>
        )}
      </AsyncContent>
    </ChartCard>
  );
}
