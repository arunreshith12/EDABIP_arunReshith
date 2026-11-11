import type { ReactElement } from 'react';
import type { IconName, Metric, RangeKey } from '../../types';
import { formatChange, formatMetricValue } from '../../utils/format';
import { Sparkline } from '../charts/Sparkline';
import { Icon } from '../ui/Icon';

interface StatCardProps {
  metric: Metric;
  range: RangeKey;
}

interface Badge {
  tone: 'good' | 'bad' | 'info';
  icon: IconName | null;
  text: string;
}

/** "+1.2% vs previous 30 days". Higher is better for all four metrics, so up is green and down is red. */
function changeBadge(metric: Metric, range: RangeKey): Badge | null {
  if (metric.change === null) return null;
  const text = `${formatChange(metric.change, metric.changeUnit)} vs previous ${range} days`;
  if (metric.change > 0) return { tone: 'good', icon: 'up', text };
  if (metric.change < 0) return { tone: 'bad', icon: 'down', text };
  return { tone: 'info', icon: null, text };
}

export function StatCard({ metric, range }: StatCardProps): ReactElement {
  const badge = changeBadge(metric, range);

  return (
    <article className="kpi" aria-label={metric.title}>
      <div className="kpi__top">
        <span className="kpi__icon">
          <Icon name={metric.icon} />
        </span>
        <h3>{metric.title}</h3>
      </div>

      <div className="kpi__mid">
        <p className="kpi__value">{formatMetricValue(metric.value, metric.unit)}</p>
        {metric.series !== null && (
          <div className="kpi__spark">
            <Sparkline series={metric.series} kind={metric.spark} />
          </div>
        )}
      </div>

      {badge !== null && (
        <span className={`badge badge--${badge.tone}`}>
          {badge.icon !== null && <Icon name={badge.icon} />}
          {badge.text}
        </span>
      )}
    </article>
  );
}
