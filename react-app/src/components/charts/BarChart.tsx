import type { ReactElement } from 'react';
import { useTooltip } from '../../hooks/useTooltip';
import type { DemandPoint } from '../../types';
import { niceCeil } from '../../utils/format';
import { baselineY, createYScale } from '../../utils/chart';
import type { ChartBox } from '../../utils/chart';
import { Tooltip } from '../ui/Tooltip';
import { ChartAxes } from './ChartAxes';

const BOX: ChartBox = { width: 740, height: 340, left: 66, right: 20, top: 20, bottom: 40 };
const MAX_BAR_WIDTH = 44;

interface BarChartProps {
  items: readonly DemandPoint[];
  /** Number shown above each bar. */
  formatValue: (value: number) => string;
  /** Text for tooltips and screen readers. */
  formatDescription: (value: number) => string;
  formatTick: (value: number) => string;
}

/** Bar chart with a value label above every bar and a tooltip on hover / focus. */
export function BarChart({ items, formatValue, formatDescription, formatTick }: BarChartProps): ReactElement {
  const { tip, bind } = useTooltip();

  const yMax = niceCeil(Math.max(...items.map(item => item.value)));
  const y = createYScale(BOX, yMax);
  const baseline = baselineY(BOX);
  const slot = (BOX.width - BOX.left - BOX.right) / items.length;
  const barWidth = Math.min(MAX_BAR_WIDTH, slot * 0.6);

  return (
    <>
      <svg viewBox={`0 0 ${BOX.width} ${BOX.height}`}>
        <ChartAxes box={BOX} yMax={yMax} formatTick={formatTick} />

        {items.map((item, index) => {
          const centerX = BOX.left + slot * index + slot / 2;
          const description = `${item.caption}: ${formatDescription(item.value)}`;
          return (
            <g key={item.caption}>
              <rect
                className="bar"
                x={centerX - barWidth / 2}
                y={y(item.value)}
                width={barWidth}
                height={baseline - y(item.value)}
                rx={3}
                fill={item.color}
                tabIndex={0}
                role="img"
                aria-label={description}
                {...bind(description)}
              />
              <text className="bar-val" x={centerX} y={y(item.value) - 8}>
                {formatValue(item.value)}
              </text>
              <text x={centerX} y={baseline + 20} textAnchor="middle">
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
      <Tooltip tip={tip} />
    </>
  );
}
