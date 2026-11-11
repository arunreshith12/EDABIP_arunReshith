import { useId } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { PERIOD_OPTIONS } from '../../constants';
import type { PeriodKey } from '../../types';
import { Select } from '../ui/Select';

interface ChartCardProps {
  title: string;
  /** Accessible name of the period dropdown. */
  periodLabel: string;
  /** Accessible name of the chart area. */
  chartLabel: string;
  period: PeriodKey;
  onPeriodChange: (period: PeriodKey) => void;
  children: ReactNode;
  /** Extra content placed on the card (for example the assistant button). */
  extra?: ReactNode;
}

/** Card frame shared by both charts: title, period dropdown and the chart area. */
export function ChartCard({
  title,
  periodLabel,
  chartLabel,
  period,
  onPeriodChange,
  children,
  extra
}: ChartCardProps): ReactElement {
  const titleId = useId();

  return (
    <article className="card chart-card" aria-labelledby={titleId}>
      <header className="chart-card__head">
        <h2 id={titleId}>{title}</h2>
        <Select label={periodLabel} variant="outline" value={period} options={PERIOD_OPTIONS} onChange={onPeriodChange} />
      </header>
      <div className="chart" role="group" aria-label={chartLabel}>
        {children}
      </div>
      {extra}
    </article>
  );
}
