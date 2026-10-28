import type { ReactElement } from 'react';
import type { Metric, RangeKey } from '../../types';
import { Sparkline } from '../charts/Sparkline';
import { Icon } from '../ui/Icon';

interface StatCardProps {
  metric: Metric;
  range: RangeKey;
}

export function StatCard({ metric, range }: StatCardProps): ReactElement {
  const { trend } = metric;

  return (
    <article className="kpi" aria-label={metric.title}>
      <div className="kpi__top">
        <span className="kpi__icon">
          <Icon name={metric.icon} />
        </span>
        <h3>{metric.title}</h3>
      </div>

      <div className="kpi__mid">
        <p className="kpi__value">{metric.values[range]}</p>
        <div className="kpi__spark">
          <Sparkline series={metric.series} kind={metric.spark} />
        </div>
      </div>

      <span className={`badge badge--${trend.tone}`}>
        {trend.icon !== null && <Icon name={trend.icon} />}
        {trend.text}
      </span>
    </article>
  );
}
