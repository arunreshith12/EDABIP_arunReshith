import { useId } from 'react';
import type { ReactElement, ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  /** Accessible name of the chart area. */
  chartLabel: string;
  children: ReactNode;
  /** Controls on the right of the title (for example a period dropdown). */
  headerExtra?: ReactNode;
  /** Extra content placed on the card (for example the assistant button). */
  extra?: ReactNode;
}

/** Card frame shared by both charts: title, optional controls and the chart area. */
export function ChartCard({ title, chartLabel, children, headerExtra, extra }: ChartCardProps): ReactElement {
  const titleId = useId();

  return (
    <article className="card chart-card" aria-labelledby={titleId}>
      <header className="chart-card__head">
        <h2 id={titleId}>{title}</h2>
        {headerExtra}
      </header>
      <div className="chart" role="group" aria-label={chartLabel}>
        {children}
      </div>
      {extra}
    </article>
  );
}
